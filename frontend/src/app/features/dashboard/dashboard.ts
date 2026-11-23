import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { CourseColor } from '../../core/course-color';
import { Icon } from '../../core/icon';
import { toggleId } from '../../core/ids';
import { MultiSelect } from '../../core/multi-select';
import { CourseApi } from '../courses/course-api';
import { TableTypeApi } from '../table/table-api';
import { TagApi } from '../tags/tag-api';
import {
  ColumnStatistic,
  CourseNotDone,
  CourseStatistics,
  DashboardApi,
  DashboardFilter,
} from './dashboard-api';

/** The card of one table of a course. */
interface Card {
  title: string;
  columns: ColumnStatistic[];
  open: { id: number; title: string }[];
}

/** A course with one card per table, none if it has no tables. */
interface CourseBlock {
  id: number;
  title: string;
  cards: Card[];
}

/** The answers for one table type: an entry for every course that has it. */
interface TableData {
  statistics: CourseStatistics[];
  notDone: CourseNotDone[];
}

function card(title: string, courseId: number, data?: TableData): Card {
  return {
    title,
    columns: data?.statistics.find((entry) => entry.course_id === courseId)?.columns ?? [],
    open: data?.notDone.find((entry) => entry.course_id === courseId)?.rows ?? [],
  };
}

@Component({
  selector: 'app-dashboard',
  imports: [CourseColor, DecimalPipe, Icon, MultiSelect],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly api = inject(DashboardApi);
  private readonly courseApi = inject(CourseApi);
  private readonly tableTypes = inject(TableTypeApi).all;

  protected readonly colors = this.courseApi.colors;
  protected readonly tags = inject(TagApi).all;
  protected readonly tagOptions = computed(() =>
    this.tags().map((tag) => ({ id: tag.id, label: tag.value })),
  );
  protected readonly courseOptions = computed(() =>
    this.courseApi.all().map((course) => ({ id: course.id, label: course.title })),
  );
  protected readonly tagFilter = signal<number[]>([]);
  protected readonly courseFilter = signal<number[]>([]);
  protected readonly blocks = signal<CourseBlock[]>([]);
  protected readonly error = signal('');

  /** Every reload goes through this stream, `switchMap` drops the answers of outdated requests. */
  private readonly reload$ = new Subject<void>();

  constructor() {
    // The courses come with their table types, so a course without tables is listed too (REQ-F-91).
    this.reload$
      .pipe(
        switchMap(() => {
          const filter: DashboardFilter = {
            tagIds: this.tagFilter(),
            courseIds: this.courseFilter(),
          };
          const tableTypes = this.tableTypes();
          const tables = tableTypes.map((tableType) =>
            forkJoin({
              statistics: this.api.columnStatistics(tableType.id, filter),
              notDone: this.api.notDone(tableType.id, filter),
            }),
          );
          return forkJoin({
            courses: this.courseApi.list(filter.tagIds),
            tables: tables.length ? forkJoin(tables) : of([]),
          }).pipe(
            map(({ courses, tables }) => {
              const byType = new Map(tableTypes.map((tableType, i) => [tableType.id, tables[i]]));
              return courses
                .filter((course) => !filter.courseIds.length || filter.courseIds.includes(course.id))
                .map((course) => ({
                  id: course.id,
                  title: course.title,
                  cards: course.table_types.map((tableType) =>
                    card(tableType.name, course.id, byType.get(tableType.id)),
                  ),
                }));
            }),
            catchError((e) => {
              this.error.set(errorMessage(e));
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((blocks) => {
        this.error.set('');
        this.blocks.set(blocks);
      });

    // Loads the dashboard, and again when the tags, courses or table types change (deleted ones leave the filters).
    effect(() => {
      const tagIds = this.tags().map((tag) => tag.id);
      const courseIds = this.courseApi.all().map((course) => course.id);
      this.tableTypes();
      untracked(() => {
        this.tagFilter.update((ids) => ids.filter((id) => tagIds.includes(id)));
        this.courseFilter.update((ids) => ids.filter((id) => courseIds.includes(id)));
        this.reload$.next();
      });
    });
  }

  protected toggleTag(tagId: number) {
    this.tagFilter.update((ids) => toggleId(ids, tagId));
    this.reload$.next();
  }

  protected toggleCourse(courseId: number) {
    this.courseFilter.update((ids) => toggleId(ids, courseId));
    this.reload$.next();
  }
}

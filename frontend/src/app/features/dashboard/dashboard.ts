import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, forkJoin, switchMap } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { Icon } from '../../core/icon';
import { toggleId } from '../../core/ids';
import { MultiSelect } from '../../core/multi-select';
import { CourseApi } from '../courses/course-api';
import { TagApi } from '../tags/tag-api';
import {
  ColumnStatistic,
  CourseNotDone,
  CourseStatistics,
  DashboardApi,
  DashboardFilter,
} from './dashboard-api';

/** The card of one table (lectures or assignments) of a course. */
interface Card {
  title: string;
  columns: ColumnStatistic[];
  open: { id: number; title: string }[];
}

interface CourseBlock {
  id: number;
  title: string;
  cards: Card[];
}

function card(
  title: string,
  courseId: number,
  statistics: CourseStatistics[],
  notDone: CourseNotDone[],
): Card {
  return {
    title,
    columns: statistics.find((entry) => entry.course_id === courseId)?.columns ?? [],
    open: notDone.find((entry) => entry.course_id === courseId)?.rows ?? [],
  };
}

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, Icon, MultiSelect],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly api = inject(DashboardApi);
  private readonly courseApi = inject(CourseApi);
  private readonly tagApi = inject(TagApi);

  protected readonly tags = this.tagApi.all;
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
    this.reload$
      .pipe(
        switchMap(() => {
          const filter: DashboardFilter = {
            tagIds: this.tagFilter(),
            courseIds: this.courseFilter(),
          };
          return forkJoin({
            lectureStatistics: this.api.columnStatistics('lecture', filter),
            lectureNotDone: this.api.notDone('lecture', filter),
            assignmentStatistics: this.api.columnStatistics('assignment', filter),
            assignmentNotDone: this.api.notDone('assignment', filter),
          }).pipe(
            catchError((e) => {
              this.error.set(errorMessage(e));
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.error.set('');
        this.blocks.set(
          result.lectureStatistics.map((course) => ({
            id: course.course_id,
            title: course.title,
            cards: [
              card('Lectures', course.course_id, result.lectureStatistics, result.lectureNotDone),
              card(
                'Assignments',
                course.course_id,
                result.assignmentStatistics,
                result.assignmentNotDone,
              ),
            ],
          })),
        );
      });

    // Loads the dashboard, and again when the tags or courses change (deleted ones leave the filters).
    effect(() => {
      const tagIds = this.tags().map((tag) => tag.id);
      const courseIds = this.courseApi.all().map((course) => course.id);
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

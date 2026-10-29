import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, forkJoin, switchMap } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { toggleId } from '../../core/ids';
import { Course, CourseApi } from '../courses/course-api';
import { Tag, TagApi } from '../tags/tag-api';
import {
  ColumnStatistic,
  CourseNotDone,
  CourseStatistics,
  DashboardApi,
  DashboardFilter,
} from './dashboard-api';

interface CourseSummary {
  id: number;
  title: string;
  columns: ColumnStatistic[];
  open: { id: number; title: string }[];
}

interface Section {
  title: string;
  courses: CourseSummary[];
}

function summarize(statistics: CourseStatistics[], notDone: CourseNotDone[]): CourseSummary[] {
  return statistics.map((course) => ({
    id: course.course_id,
    title: course.title,
    columns: course.columns,
    open: notDone.find((entry) => entry.course_id === course.course_id)?.rows ?? [],
  }));
}

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly api = inject(DashboardApi);
  private readonly courseApi = inject(CourseApi);
  private readonly tagApi = inject(TagApi);

  protected readonly courses = signal<Course[]>([]);
  protected readonly tags = signal<Tag[]>([]);
  protected readonly tagFilter = signal<number[]>([]);
  protected readonly courseFilter = signal<number[]>([]);
  protected readonly sections = signal<Section[]>([]);
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
        this.sections.set([
          { title: 'Lectures', courses: summarize(result.lectureStatistics, result.lectureNotDone) },
          {
            title: 'Assignments',
            courses: summarize(result.assignmentStatistics, result.assignmentNotDone),
          },
        ]);
      });
  }

  ngOnInit() {
    this.courseApi.list().subscribe((courses) => this.courses.set(courses));
    this.tagApi.list().subscribe((tags) => this.tags.set(tags));
    this.reload$.next();
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

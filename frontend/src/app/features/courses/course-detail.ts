import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, map, merge, switchMap, tap } from 'rxjs';
import { Icon } from '../../core/icon';
import { TableApi, Tables } from '../table/table-api';
import { TableView } from '../table/table-view';
import { Course, CourseApi } from './course-api';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink, Icon, TableView],
  templateUrl: './course-detail.html',
})
export class CourseDetail {
  private readonly courseApi = inject(CourseApi);
  private readonly tableApi = inject(TableApi);
  private readonly router = inject(Router);

  /** The route reuses this component when only the id changes, so the id is a signal. */
  protected readonly courseId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => Number(params.get('id')))),
    { requireSync: true },
  );
  protected readonly course = signal<Course | null>(null);
  protected readonly tables = signal<Tables | null>(null);

  /** Every reload goes through this stream, `switchMap` drops the answers of outdated requests. */
  private readonly reload$ = new Subject<void>();

  constructor() {
    const courseId$ = toObservable(this.courseId).pipe(
      tap(() => {
        this.course.set(null);
        this.tables.set(null);
      }),
    );

    courseId$
      .pipe(
        switchMap((id) =>
          this.courseApi.get(id).pipe(
            catchError((e) => {
              this.leaveIfNotFound(e);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((course) => this.course.set(course));

    merge(courseId$, this.reload$)
      .pipe(
        switchMap(() =>
          this.tableApi.getTables(this.courseId()).pipe(
            catchError((e) => {
              this.leaveIfNotFound(e);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((tables) => this.tables.set(tables));
  }

  protected reload() {
    this.reload$.next();
  }

  /** A course that does not exist, or belongs to another user, is a 404: go back to the course list. */
  private leaveIfNotFound(error: HttpErrorResponse) {
    if (error.status === 404) {
      this.router.navigateByUrl('/courses');
    }
  }
}

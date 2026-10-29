import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, switchMap } from 'rxjs';
import { Icon } from '../../core/icon';
import { TableApi, Tables } from '../table/table-api';
import { TableView } from '../table/table-view';
import { Course, CourseApi } from './course-api';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink, Icon, TableView],
  templateUrl: './course-detail.html',
})
export class CourseDetail implements OnInit {
  private readonly courseApi = inject(CourseApi);
  private readonly tableApi = inject(TableApi);
  private readonly router = inject(Router);

  protected readonly courseId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  protected readonly course = signal<Course | null>(null);
  protected readonly tables = signal<Tables | null>(null);

  /** Every reload goes through this stream, `switchMap` drops the answers of outdated requests. */
  private readonly reload$ = new Subject<void>();

  constructor() {
    this.reload$
      .pipe(
        switchMap(() =>
          this.tableApi.getTables(this.courseId).pipe(
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

  ngOnInit() {
    this.courseApi.get(this.courseId).subscribe({
      next: (course) => this.course.set(course),
      error: (e) => this.leaveIfNotFound(e),
    });
    this.reload();
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

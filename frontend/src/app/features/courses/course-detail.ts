import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TableApi, Tables } from '../table/table-api';
import { TableView } from '../table/table-view';
import { Course, CourseApi } from './course-api';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink, TableView],
  templateUrl: './course-detail.html',
})
export class CourseDetail implements OnInit {
  private readonly courseApi = inject(CourseApi);
  private readonly tableApi = inject(TableApi);
  private readonly router = inject(Router);

  protected readonly courseId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  protected readonly course = signal<Course | null>(null);
  protected readonly tables = signal<Tables | null>(null);

  ngOnInit() {
    this.courseApi.get(this.courseId).subscribe({
      next: (course) => this.course.set(course),
      error: (e) => this.leaveIfNotFound(e),
    });
    this.reload();
  }

  protected reload() {
    this.tableApi.getTables(this.courseId).subscribe({
      next: (tables) => this.tables.set(tables),
      error: (e) => this.leaveIfNotFound(e),
    });
  }

  /** A course that does not exist, or belongs to another user, is a 404: go back to the course list. */
  private leaveIfNotFound(error: HttpErrorResponse) {
    if (error.status === 404) {
      this.router.navigateByUrl('/courses');
    }
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject, catchError, switchMap, tap } from 'rxjs';
import { TableType } from '../table/table-api';
import { Tag } from '../tags/tag-api';

export interface Course {
  id: number;
  title: string;
  description: string;
  color: string;
  hidden: boolean;
  tags: Tag[];
  table_types: TableType[];
}

/** The fields of a course besides its title, set in the add card and the course dialog. */
export interface CourseFields {
  tag_ids: number[];
  table_type_ids: number[];
  description: string;
  color: string;
  hidden: boolean;
}

/** The fields of a new course: no tags, no tables, no description, the default color, in the menu. */
export const NEW_COURSE: CourseFields = { tag_ids: [], table_type_ids: [], description: '', color: 'clay', hidden: false };

/** The add card and the course dialog both send every field at once. */
export type CourseChanges = CourseFields & { title: string };

@Injectable({ providedIn: 'root' })
export class CourseApi {
  private readonly http = inject(HttpClient);

  /** All courses of the user, for the navigation and the dashboard filter. Reloaded after every change. */
  readonly all = signal<Course[]>([]);

  /** The color of every course by its id, for the places that only know the id of a course. */
  readonly colors = computed(() => Object.fromEntries(this.all().map((course) => [course.id, course.color])));

  /** `switchMap` drops the answers of outdated requests. */
  private readonly refresh$ = new Subject<void>();

  constructor() {
    this.refresh$
      .pipe(
        switchMap(() => this.list().pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(),
      )
      .subscribe((courses) => this.all.set(courses));
  }

  refresh() {
    this.refresh$.next();
  }

  /** The courses, with tag ids only those that have at least one of the tags. */
  list(tagIds: number[] = []): Observable<Course[]> {
    const params = new HttpParams({ fromObject: { tag_id: tagIds.map(String) } });
    return this.http.get<Course[]>('/api/course', { params });
  }

  get(id: number): Observable<Course> {
    return this.http.get<Course>(`/api/course/${id}`);
  }

  create(course: CourseChanges): Observable<Course> {
    return this.http.post<Course>('/api/course', course).pipe(tap(() => this.refresh()));
  }

  update(id: number, changes: CourseChanges): Observable<Course> {
    return this.http.patch<Course>(`/api/course/${id}`, changes).pipe(tap(() => this.refresh()));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/course/${id}`).pipe(tap(() => this.refresh()));
  }
}

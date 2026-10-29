import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject, catchError, switchMap, tap } from 'rxjs';
import { Tag } from '../tags/tag-api';

export interface Course {
  id: number;
  title: string;
  tags: Tag[];
}

@Injectable({ providedIn: 'root' })
export class CourseApi {
  private readonly http = inject(HttpClient);

  /** All courses of the user, for the navigation and the dashboard filter. Reloaded after every change. */
  readonly all = signal<Course[]>([]);

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

  create(title: string): Observable<Course> {
    return this.http.post<Course>('/api/course', { title }).pipe(tap(() => this.refresh()));
  }

  update(id: number, changes: { title?: string; tag_ids?: number[] }): Observable<Course> {
    return this.http.patch<Course>(`/api/course/${id}`, changes).pipe(tap(() => this.refresh()));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/course/${id}`).pipe(tap(() => this.refresh()));
  }
}

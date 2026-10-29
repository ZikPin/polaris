import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject, catchError, switchMap, tap } from 'rxjs';

export interface Tag {
  id: number;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class TagApi {
  private readonly http = inject(HttpClient);

  /** All tags of the user, reloaded after every change. The pages that show tags react to it. */
  readonly all = signal<Tag[]>([]);

  /** `switchMap` drops the answers of outdated requests. */
  private readonly refresh$ = new Subject<void>();

  constructor() {
    this.refresh$
      .pipe(
        switchMap(() => this.list().pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(),
      )
      .subscribe((tags) => this.all.set(tags));
  }

  refresh() {
    this.refresh$.next();
  }

  list(): Observable<Tag[]> {
    return this.http.get<Tag[]>('/api/tag');
  }

  create(value: string): Observable<Tag> {
    return this.http.post<Tag>('/api/tag', { value }).pipe(tap(() => this.refresh()));
  }

  update(id: number, value: string): Observable<Tag> {
    return this.http.patch<Tag>(`/api/tag/${id}`, { value }).pipe(tap(() => this.refresh()));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/tag/${id}`).pipe(tap(() => this.refresh()));
  }
}

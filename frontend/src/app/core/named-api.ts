import { HttpClient } from '@angular/common/http';
import { computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject, catchError, switchMap, tap } from 'rxjs';

/** An item that the user names, for the dialog that edits the list. */
export interface Named {
  id: number;
  name: string;
}

/**
 * A list the user names and edits in a dialog: the tags or the table types. `all` is reloaded after every change,
 * the pages that show the items react to it. `field` is the text of an item in the API (`value` or `name`).
 */
export abstract class NamedApi<T extends { id: number }> {
  private readonly http = inject(HttpClient);

  readonly all = signal<T[]>([]);
  readonly named = computed<Named[]>(() =>
    this.all().map((item) => ({ id: item.id, name: String(item[this.field]) })),
  );

  /** `switchMap` drops the answers of outdated requests. */
  private readonly refresh$ = new Subject<void>();

  constructor(
    private readonly url: string,
    private readonly field: keyof T & string,
  ) {
    this.refresh$
      .pipe(
        switchMap(() => this.http.get<T[]>(this.url).pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(),
      )
      .subscribe((items) => this.all.set(items));
  }

  refresh() {
    this.refresh$.next();
  }

  create(text: string): Observable<T> {
    return this.http.post<T>(this.url, { [this.field]: text }).pipe(tap(() => this.refresh()));
  }

  update(id: number, text: string): Observable<T> {
    return this.http.patch<T>(`${this.url}/${id}`, { [this.field]: text }).pipe(tap(() => this.refresh()));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(tap(() => this.refresh()));
  }
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';

export interface User {
  id: number;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);

  /** The logged-in user, null if there is none. */
  readonly user = signal<User | null>(null);

  /** Asks the API for the logged-in user. No session (401) gives null, other errors are thrown. */
  me(): Observable<User | null> {
    return this.http.get<User>('/api/auth/me').pipe(
      tap((user) => this.user.set(user)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.user.set(null);
          return of(null);
        }
        return throwError(() => error);
      }),
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>('/api/auth/login', { email, password })
      .pipe(tap((user) => this.user.set(user)));
  }

  /** Registering also logs the user in. */
  register(email: string, password: string): Observable<User> {
    return this.http
      .post<User>('/api/auth/register', { email, password })
      .pipe(tap((user) => this.user.set(user)));
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(tap(() => this.user.set(null)));
  }
}

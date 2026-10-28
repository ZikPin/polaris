import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';

export interface User {
  id: number;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);

  /** The logged-in user, or null if there is no session (the API answers 401). */
  me(): Observable<User | null> {
    return this.http
      .get<User>('/api/auth/me')
      .pipe(
        catchError((error: HttpErrorResponse) =>
          error.status === 401 ? of(null) : throwError(() => error),
        ),
      );
  }
}

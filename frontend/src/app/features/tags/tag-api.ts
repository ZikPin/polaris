import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Tag {
  id: number;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class TagApi {
  private readonly http = inject(HttpClient);

  list(): Observable<Tag[]> {
    return this.http.get<Tag[]>('/api/tag');
  }

  create(value: string): Observable<Tag> {
    return this.http.post<Tag>('/api/tag', { value });
  }

  update(id: number, value: string): Observable<Tag> {
    return this.http.patch<Tag>(`/api/tag/${id}`, { value });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/tag/${id}`);
  }
}

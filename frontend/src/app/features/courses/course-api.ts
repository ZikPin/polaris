import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Tag } from '../tags/tag-api';

export interface Course {
  id: number;
  title: string;
  tags: Tag[];
}

@Injectable({ providedIn: 'root' })
export class CourseApi {
  private readonly http = inject(HttpClient);

  /** The courses, with tag ids only those that have at least one of the tags. */
  list(tagIds: number[] = []): Observable<Course[]> {
    const params = new HttpParams({ fromObject: { tag_id: tagIds.map(String) } });
    return this.http.get<Course[]>('/api/course', { params });
  }

  get(id: number): Observable<Course> {
    return this.http.get<Course>(`/api/course/${id}`);
  }

  create(title: string): Observable<Course> {
    return this.http.post<Course>('/api/course', { title });
  }

  update(id: number, changes: { title?: string; tag_ids?: number[] }): Observable<Course> {
    return this.http.patch<Course>(`/api/course/${id}`, changes);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/course/${id}`);
  }
}

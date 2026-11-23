import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardFilter {
  tagIds: number[];
  courseIds: number[];
}

/** The statistic of one custom column. Checkboxes have counts, number columns have a statistic and its value. */
export interface ColumnStatistic {
  column_id: number;
  label: string;
  column_type: 'bool' | 'number';
  checked?: number;
  unchecked?: number;
  statistic?: 'avg' | 'sum';
  /** null if the column has no values. */
  value?: number | null;
}

export interface CourseStatistics {
  course_id: number;
  title: string;
  columns: ColumnStatistic[];
}

export interface CourseNotDone {
  course_id: number;
  title: string;
  rows: { id: number; title: string }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);

  columnStatistics(tableTypeId: number, filter: DashboardFilter): Observable<CourseStatistics[]> {
    return this.http.get<CourseStatistics[]>(`/api/dashboard/${tableTypeId}/column_statistics`, {
      params: this.params(filter),
    });
  }

  notDone(tableTypeId: number, filter: DashboardFilter): Observable<CourseNotDone[]> {
    return this.http.get<CourseNotDone[]>(`/api/dashboard/${tableTypeId}/not_done`, {
      params: this.params(filter),
    });
  }

  private params(filter: DashboardFilter): HttpParams {
    return new HttpParams({
      fromObject: {
        tag_id: filter.tagIds.map(String),
        course_id: filter.courseIds.map(String),
      },
    });
  }
}

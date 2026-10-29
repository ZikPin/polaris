import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TableType } from '../table/table-api';

export interface CalendarRow {
  id: number;
  title: string;
  table_type: TableType;
  course_id: number;
}

export interface CalendarDay {
  /** YYYY-MM-DD */
  date: string;
  rows: CalendarRow[];
}

@Injectable({ providedIn: 'root' })
export class CalendarApi {
  private readonly http = inject(HttpClient);

  /** The days of a month ('YYYY-MM') that have rows. */
  month(month: string): Observable<CalendarDay[]> {
    return this.http.get<CalendarDay[]>('/api/calendar', { params: { month } });
  }

  /** Sets the rows of a day, rows that are not in the list are removed from it. */
  setDay(date: string, rowIds: number[]): Observable<CalendarDay> {
    return this.http.put<CalendarDay>(`/api/calendar/${date}`, { row_ids: rowIds });
  }
}

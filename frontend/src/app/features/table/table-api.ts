import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type TableType = 'lecture' | 'assignment';
export type Statistic = 'avg' | 'sum';
export const STATISTICS: { value: Statistic; label: string }[] = [
  { value: 'avg', label: 'Average' },
  { value: 'sum', label: 'Sum' },
];

export interface Column {
  id: number;
  label: string;
  column_type: 'bool' | 'number';
  min?: number | null;
  max?: number | null;
  preferred_statistic?: Statistic;
}

export interface Row {
  id: number;
  title: string;
  /** The cell values by column id. */
  cells: Record<string, boolean | number | null>;
}

export interface Table {
  columns: Column[];
  rows: Row[];
}

export type Tables = Record<TableType, Table>;

@Injectable({ providedIn: 'root' })
export class TableApi {
  private readonly http = inject(HttpClient);

  getTables(courseId: number): Observable<Tables> {
    return this.http.get<Tables>(`/api/table/${courseId}`);
  }

  addRow(courseId: number, tableType: TableType, title: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`/api/table/${courseId}/${tableType}/row`, { title });
  }

  renameRow(rowId: number, title: string): Observable<unknown> {
    return this.http.patch(`/api/table/row/${rowId}`, { title });
  }

  deleteRow(rowId: number): Observable<void> {
    return this.http.delete<void>(`/api/table/row/${rowId}`);
  }

  addCheckboxColumn(courseId: number, tableType: TableType, label: string): Observable<Column> {
    return this.http.post<Column>(`/api/table/${courseId}/${tableType}/column`, {
      column_type: 'bool',
      label,
    });
  }

  addNumberColumn(
    courseId: number,
    tableType: TableType,
    label: string,
    bounds: { min: number | null; max: number | null; preferred_statistic?: Statistic },
  ): Observable<Column> {
    return this.http.post<Column>(`/api/table/${courseId}/${tableType}/column`, {
      column_type: 'number',
      label,
      ...bounds,
    });
  }

  /** Changes only the sent fields. A null min or max removes the bound. */
  updateColumn(
    columnId: number,
    changes: {
      label?: string;
      min?: number | null;
      max?: number | null;
      preferred_statistic?: Statistic;
    },
  ): Observable<unknown> {
    return this.http.patch(`/api/table/column/${columnId}`, changes);
  }

  deleteColumn(columnId: number): Observable<void> {
    return this.http.delete<void>(`/api/table/column/${columnId}`);
  }

  setCell(rowId: number, columnId: number, value: boolean | number | null): Observable<unknown> {
    return this.http.put(`/api/table/cell/${rowId}/${columnId}`, { value });
  }
}

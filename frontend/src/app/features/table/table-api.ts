import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NamedApi } from '../../core/named-api';

/** A kind of table a course can have, like Lectures. */
export interface TableType {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class TableTypeApi extends NamedApi<TableType> {
  constructor() {
    super('/api/table_type', 'name');
  }
}

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
  table_type: TableType;
  columns: Column[];
  rows: Row[];
}

@Injectable({ providedIn: 'root' })
export class TableApi {
  private readonly http = inject(HttpClient);

  /** One table per table type of the course, ordered by the name of the type. */
  getTables(courseId: number): Observable<Table[]> {
    return this.http.get<Table[]>(`/api/table/${courseId}`);
  }

  addRow(courseId: number, tableTypeId: number, title: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`/api/table/${courseId}/${tableTypeId}/row`, { title });
  }

  renameRow(rowId: number, title: string): Observable<unknown> {
    return this.http.patch(`/api/table/row/${rowId}`, { title });
  }

  deleteRow(rowId: number): Observable<void> {
    return this.http.delete<void>(`/api/table/row/${rowId}`);
  }

  addCheckboxColumn(courseId: number, tableTypeId: number, label: string): Observable<Column> {
    return this.http.post<Column>(`/api/table/${courseId}/${tableTypeId}/column`, {
      column_type: 'bool',
      label,
    });
  }

  addNumberColumn(
    courseId: number,
    tableTypeId: number,
    label: string,
    bounds: { min: number | null; max: number | null; preferred_statistic?: Statistic },
  ): Observable<Column> {
    return this.http.post<Column>(`/api/table/${courseId}/${tableTypeId}/column`, {
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

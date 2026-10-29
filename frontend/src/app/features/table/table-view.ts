import { Component, inject, input, output, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { FocusSelect } from '../../core/focus-select';
import { Icon } from '../../core/icon';
import { parseNumber } from '../../core/numbers';
import { AddColumnDialog, NumberColumnOptions } from './add-column-dialog';
import { ColumnChanges, EditColumnDialog } from './edit-column-dialog';
import { Column, Row, Table, TableApi, TableType } from './table-api';

const rowKey = (row: Row) => `row:${row.id}`;
const columnKey = (columnId: number) => `column:${columnId}`;
const cellKey = (row: Row, column: Column) => `cell:${row.id}:${column.id}`;

/**
 * One table (lectures or assignments) of a course. Every change is saved at once and reported through `changed`.
 * Titles, labels and numbers are edited in place: `editing` holds the key of the one being edited, Enter or leaving
 * the field saves it, Escape drops it.
 */
@Component({
  selector: 'app-table-view',
  imports: [Icon, FocusSelect, AddColumnDialog, EditColumnDialog],
  templateUrl: './table-view.html',
})
export class TableView {
  private readonly api = inject(TableApi);

  readonly courseId = input.required<number>();
  readonly tableType = input.required<TableType>();
  readonly table = input.required<Table>();
  readonly changed = output<void>();

  protected readonly editing = signal('');
  protected readonly addingColumn = signal(false);
  protected readonly editedColumn = signal<Column | null>(null);
  protected readonly error = signal('');

  protected readonly rowKey = rowKey;
  protected readonly columnKey = columnKey;
  protected readonly cellKey = cellKey;

  protected get heading(): string {
    return this.tableType() === 'lecture' ? 'Lectures' : 'Assignments';
  }

  private fail(e: unknown) {
    this.error.set(errorMessage(e));
    this.changed.emit();
  }

  private run(request: Observable<unknown>, done: () => void = () => {}) {
    request.subscribe({
      next: () => {
        this.error.set('');
        done();
        this.changed.emit();
      },
      error: (e) => this.fail(e),
    });
  }

  protected edit(key: string) {
    this.editing.set(key);
  }

  protected cancelEdit(event: Event) {
    event.stopPropagation();
    this.editing.set('');
  }

  /** Enter and leaving the field both end up here, the second call finds nothing to do. */
  private finish(key: string): boolean {
    if (this.editing() !== key) {
      return false;
    }
    this.editing.set('');
    return true;
  }

  protected commitRow(row: Row, title: string) {
    if (this.finish(rowKey(row)) && title !== row.title) {
      this.run(this.api.renameRow(row.id, title));
    }
  }

  protected commitColumn(column: Column, label: string) {
    if (this.finish(columnKey(column.id)) && label !== column.label) {
      this.run(this.api.updateColumn(column.id, { label }));
    }
  }

  protected commitCell(row: Row, column: Column, text: string) {
    if (!this.finish(cellKey(row, column))) {
      return;
    }
    const value = parseNumber(text);
    if (value !== (row.cells[column.id] ?? null)) {
      this.run(this.api.setCell(row.id, column.id, value));
    }
  }

  /** A new row has a default title, edited in place right away. */
  protected addRow() {
    const title = `Default ${this.tableType()}.`;
    this.api.addRow(this.courseId(), this.tableType(), title).subscribe({
      next: (row) => {
        this.error.set('');
        this.editing.set(`row:${row.id}`);
        this.changed.emit();
      },
      error: (e) => this.fail(e),
    });
  }

  protected deleteRow(row: Row) {
    this.run(this.api.deleteRow(row.id));
  }

  protected createCheckboxColumn() {
    this.createColumn(this.api.addCheckboxColumn(this.courseId(), this.tableType(), 'Default bool-col.'));
  }

  protected createNumberColumn(options: NumberColumnOptions) {
    this.createColumn(this.api.addNumberColumn(this.courseId(), this.tableType(), 'Default num-col.', options));
  }

  /** The new column has a default label, edited in place right away. */
  private createColumn(request: Observable<Column>) {
    request.subscribe({
      next: (column) => {
        this.error.set('');
        this.addingColumn.set(false);
        this.editing.set(columnKey(column.id));
        this.changed.emit();
      },
      error: (e) => this.fail(e),
    });
  }

  protected saveColumn(column: Column, changes: ColumnChanges) {
    this.run(this.api.updateColumn(column.id, changes), () => this.editedColumn.set(null));
  }

  protected deleteColumn(column: Column) {
    if (confirm(`Delete the column "${column.label}" with all its values?`)) {
      this.run(this.api.deleteColumn(column.id));
    }
  }

  protected numberText(row: Row, column: Column): string {
    const value = row.cells[column.id];
    return typeof value === 'number' ? String(value) : '';
  }

  protected setChecked(row: Row, column: Column, event: Event) {
    this.run(this.api.setCell(row.id, column.id, (event.target as HTMLInputElement).checked));
  }
}

import { Component, inject, input, output, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { Column, Row, Table, TableApi, TableType } from './table-api';

/** One table (lectures or assignments) of a course. Every change is saved at once and reported through `changed`. */
@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.html',
})
export class TableView {
  private readonly api = inject(TableApi);

  readonly courseId = input.required<number>();
  readonly tableType = input.required<TableType>();
  readonly table = input.required<Table>();
  readonly changed = output<void>();

  protected readonly error = signal('');

  private run(request: Observable<unknown>, done: () => void = () => {}) {
    request.subscribe({
      next: () => {
        this.error.set('');
        done();
        this.changed.emit();
      },
      error: (e) => {
        this.error.set(errorMessage(e));
        this.changed.emit();
      },
    });
  }

  protected addRow(event: Event, input: HTMLInputElement) {
    event.preventDefault();
    this.run(this.api.addRow(this.courseId(), this.tableType(), input.value), () => (input.value = ''));
  }

  protected renameRow(row: Row) {
    const title = prompt('New title', row.title);
    if (title !== null) {
      this.run(this.api.renameRow(row.id, title));
    }
  }

  protected deleteRow(row: Row) {
    this.run(this.api.deleteRow(row.id));
  }

  protected addColumn(event: Event, input: HTMLInputElement) {
    event.preventDefault();
    this.run(
      this.api.addCheckboxColumn(this.courseId(), this.tableType(), input.value),
      () => (input.value = ''),
    );
  }

  protected renameColumn(column: Column) {
    const label = prompt('New label', column.label);
    if (label !== null) {
      this.run(this.api.renameColumn(column.id, label));
    }
  }

  protected deleteColumn(column: Column) {
    if (confirm(`Delete the column "${column.label}" with all its values?`)) {
      this.run(this.api.deleteColumn(column.id));
    }
  }

  protected setChecked(row: Row, column: Column, event: Event) {
    this.run(this.api.setCell(row.id, column.id, (event.target as HTMLInputElement).checked));
  }
}

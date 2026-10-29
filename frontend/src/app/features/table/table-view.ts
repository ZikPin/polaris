import { Component, inject, input, output, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { Column, Row, Table, TableApi, TableType } from './table-api';

/** An empty text is no number, a text that is not a number gives NaN. */
function parseNumber(text: string): number | null {
  return text.trim() === '' ? null : Number(text);
}

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

  protected addCheckboxColumn(event: Event, label: HTMLInputElement) {
    event.preventDefault();
    this.run(
      this.api.addCheckboxColumn(this.courseId(), this.tableType(), label.value),
      () => (label.value = ''),
    );
  }

  protected addNumberColumn(
    event: Event,
    label: HTMLInputElement,
    min: HTMLInputElement,
    max: HTMLInputElement,
  ) {
    event.preventDefault();
    const request = this.api.addNumberColumn(
      this.courseId(),
      this.tableType(),
      label.value,
      parseNumber(min.value),
      parseNumber(max.value),
    );
    this.run(request, () => {
      label.value = min.value = max.value = '';
    });
  }

  protected renameColumn(column: Column) {
    const label = prompt('New label', column.label);
    if (label !== null) {
      this.run(this.api.updateColumn(column.id, { label }));
    }
  }

  protected editBounds(column: Column) {
    const minText = prompt('Minimum (empty for no minimum)', column.min?.toString() ?? '');
    if (minText === null) {
      return;
    }
    const maxText = prompt('Maximum (empty for no maximum)', column.max?.toString() ?? '');
    if (maxText === null) {
      return;
    }
    const min = parseNumber(minText);
    const max = parseNumber(maxText);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      this.error.set('The bounds must be numbers.');
      return;
    }
    this.run(this.api.updateColumn(column.id, { min, max }));
  }

  protected setStatistic(column: Column, event: Event) {
    const statistic = (event.target as HTMLSelectElement).value as 'avg' | 'sum';
    this.run(this.api.updateColumn(column.id, { preferred_statistic: statistic }));
  }

  protected deleteColumn(column: Column) {
    if (confirm(`Delete the column "${column.label}" with all its values?`)) {
      this.run(this.api.deleteColumn(column.id));
    }
  }

  protected rangeText(column: Column): string {
    if (column.min == null && column.max == null) {
      return 'any number';
    }
    return `${column.min ?? 'no minimum'} to ${column.max ?? 'no maximum'}`;
  }

  protected numberText(row: Row, column: Column): string {
    const value = row.cells[column.id];
    return typeof value === 'number' ? String(value) : '';
  }

  protected setChecked(row: Row, column: Column, event: Event) {
    this.run(this.api.setCell(row.id, column.id, (event.target as HTMLInputElement).checked));
  }

  protected setNumber(row: Row, column: Column, event: Event) {
    const value = parseNumber((event.target as HTMLInputElement).value);
    this.run(this.api.setCell(row.id, column.id, value));
  }
}

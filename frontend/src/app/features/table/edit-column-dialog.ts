import { Component, input, linkedSignal, output } from '@angular/core';
import { Dialog } from '../../core/dialog';
import { Icon } from '../../core/icon';
import { parseNumber } from '../../core/numbers';
import { Select } from '../../core/select';
import { Column, STATISTICS, Statistic } from './table-api';

export interface ColumnChanges {
  min: number | null;
  max: number | null;
  preferred_statistic: Statistic;
}

/** The statistic and the bounds of a number column. The label is edited in the table. */
@Component({
  selector: 'app-edit-column-dialog',
  imports: [Dialog, Icon, Select],
  template: `
    <app-dialog class="modal-col" [heading]="'Edit column: ' + column().label" (closed)="closed.emit()">
      @if (error()) {
        <div class="banner" role="alert">
          <app-icon name="alert" />
          <span>{{ error() }}</span>
        </div>
      }
      <div class="opt">
        <div class="opt-row">
          <h3>Dashboard shows</h3>
          <app-select placeholder="Statistic" [choices]="statistics" [value]="statistic()" (picked)="statistic.set($event)" />
        </div>
        <div class="opt-fields">
          <input #min class="input" type="number" step="any" placeholder="Minimum (optional)" aria-label="Minimum" [value]="column().min ?? ''" />
          <input #max class="input" type="number" step="any" placeholder="Maximum (optional)" aria-label="Maximum" [value]="column().max ?? ''" />
        </div>
        <div class="opt-actions">
          <button class="btn btn-primary" type="button" (click)="save(min.value, max.value)">Save</button>
        </div>
      </div>
    </app-dialog>
  `,
})
export class EditColumnDialog {
  readonly column = input.required<Column>();
  readonly error = input('');
  readonly closed = output<void>();
  readonly saved = output<ColumnChanges>();

  protected readonly statistics = STATISTICS;
  protected readonly statistic = linkedSignal<Statistic>(() => this.column().preferred_statistic ?? 'avg');

  protected save(min: string, max: string) {
    this.saved.emit({
      min: parseNumber(min),
      max: parseNumber(max),
      preferred_statistic: this.statistic(),
    });
  }
}

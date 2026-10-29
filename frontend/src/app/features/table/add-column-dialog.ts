import { Component, input, output, signal } from '@angular/core';
import { Dialog } from '../../core/dialog';
import { Icon } from '../../core/icon';
import { parseNumber } from '../../core/numbers';
import { Select } from '../../core/select';
import { STATISTICS, Statistic } from './table-api';

export interface NumberColumnOptions {
  min: number | null;
  max: number | null;
  preferred_statistic?: Statistic;
}

/** Choose the type of a new column. It is created with a default label that is edited in the table. */
@Component({
  selector: 'app-add-column-dialog',
  imports: [Dialog, Icon, Select],
  template: `
    <app-dialog class="modal-col" heading="Choose a column type" (closed)="closed.emit()">
      @if (error()) {
        <div class="banner" role="alert">
          <app-icon name="alert" />
          <span>{{ error() }}</span>
        </div>
      }
      <div class="opt">
        <div class="opt-row">
          <h3>Boolean column</h3>
          <button class="btn btn-primary" type="button" (click)="createBool.emit()">Create</button>
        </div>
      </div>
      <div class="opt">
        <div class="opt-row">
          <h3>Number column</h3>
          <app-select placeholder="Statistic" [choices]="statistics" [value]="statistic()" (picked)="statistic.set($event)" />
        </div>
        <div class="opt-fields">
          <input #min class="input" type="number" step="any" placeholder="Minimum (optional)" aria-label="Minimum" />
          <input #max class="input" type="number" step="any" placeholder="Maximum (optional)" aria-label="Maximum" />
        </div>
        <div class="opt-actions">
          <button class="btn btn-primary" type="button" (click)="createNumber.emit(options(min.value, max.value))">Create</button>
        </div>
      </div>
    </app-dialog>
  `,
})
export class AddColumnDialog {
  readonly error = input('');
  readonly closed = output<void>();
  readonly createBool = output<void>();
  readonly createNumber = output<NumberColumnOptions>();

  protected readonly statistics = STATISTICS;
  protected readonly statistic = signal<Statistic | null>(null);

  protected options(min: string, max: string): NumberColumnOptions {
    const statistic = this.statistic();
    return {
      min: parseNumber(min),
      max: parseNumber(max),
      ...(statistic && { preferred_statistic: statistic }),
    };
  }
}

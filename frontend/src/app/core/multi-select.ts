import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { Icon } from './icon';

export interface Option {
  id: number;
  label: string;
}

/** A button that opens a list of checkboxes. The parent owns the selection and answers `toggled`. */
@Component({
  selector: 'app-multi-select',
  imports: [Icon],
  host: { '(document:click)': 'closeOnOutsideClick($event)' },
  template: `
    <button class="btn select" type="button" [attr.aria-expanded]="open()" (click)="open.set(!open())">
      <span>{{ label() }}@if (selected().length) { ({{ selected().length }}) }</span>
      <app-icon name="chevron-down" />
    </button>
    @if (open()) {
      <ul class="menu">
        @for (option of options(); track option.id) {
          <li>
            <label class="check">
              <input type="checkbox" [checked]="selected().includes(option.id)" (change)="toggled.emit(option.id)" />
              {{ option.label }}
            </label>
          </li>
        }
      </ul>
    }
  `,
})
export class MultiSelect {
  readonly label = input.required<string>();
  readonly options = input.required<Option[]>();
  readonly selected = input.required<number[]>();
  readonly toggled = output<number>();

  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected closeOnOutsideClick(event: Event) {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}

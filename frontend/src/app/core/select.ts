import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { Icon } from './icon';

export interface Choice<T> {
  value: T;
  label: string;
}

/** A button that opens a list of choices. The parent owns the value and answers `picked`. */
@Component({
  selector: 'app-select',
  imports: [Icon],
  host: { '(document:click)': 'closeOnOutsideClick($event)' },
  template: `
    <button class="btn select" type="button" [attr.aria-expanded]="open()" (click)="open.set(!open())">
      <span>{{ currentLabel() }}</span>
      <app-icon name="chevron-down" />
    </button>
    @if (open()) {
      <ul class="menu">
        @for (choice of choices(); track choice.value) {
          <li>
            <button class="menu-item" type="button" [class.picked]="choice.value === value()" (click)="pick(choice.value)">
              {{ choice.label }}
            </button>
          </li>
        } @empty {
          <li class="muted">Nothing to choose.</li>
        }
      </ul>
    }
  `,
})
export class Select<T extends string | number> {
  /** Shown while nothing is picked. */
  readonly placeholder = input.required<string>();
  readonly choices = input.required<Choice<T>[]>();
  readonly value = input<T | null>(null);
  readonly picked = output<T>();

  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected currentLabel(): string {
    return this.choices().find((choice) => choice.value === this.value())?.label ?? this.placeholder();
  }

  protected pick(value: T) {
    this.open.set(false);
    this.picked.emit(value);
  }

  protected closeOnOutsideClick(event: Event) {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}

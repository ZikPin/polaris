import { Component, input, output } from '@angular/core';
import { Icon } from './icon';

/** A dialog over the page. Escape, the close button and a click next to it all emit `closed`. */
@Component({
  selector: 'app-dialog',
  imports: [Icon],
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="scrim" (click)="closed.emit()">
      <section
        class="modal"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="heading()"
        (click)="$event.stopPropagation()"
      >
        <header class="modal-head">
          <h2>{{ heading() }}</h2>
          <button class="icon-btn" type="button" aria-label="Close" (click)="closed.emit()">
            <app-icon name="close" />
          </button>
        </header>
        <ng-content />
      </section>
    </div>
  `,
})
export class Dialog {
  readonly heading = input.required<string>();
  readonly closed = output<void>();
}

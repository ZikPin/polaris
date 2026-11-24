import { Component, input, output, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { errorMessage } from './api-error';
import { Dialog } from './dialog';
import { FocusSelect } from './focus-select';
import { Icon } from './icon';
import { Named, NamedApi } from './named-api';

/** Opened from the header to edit the tags or the table types. Click a name to rename it in place. */
@Component({
  selector: 'app-names-dialog',
  imports: [Dialog, Icon, FocusSelect],
  template: `
    <app-dialog [heading]="heading()" (closed)="closed.emit()">
      <form class="name-new" (submit)="add($event, name)">
        <input #name class="input grow" [placeholder]="'New ' + noun()" [attr.aria-label]="'New ' + noun()" required />
        <button class="btn btn-primary icon" type="submit" [attr.aria-label]="'Add ' + noun()"><app-icon name="plus" /></button>
      </form>

      <ng-content />

      @if (error()) {
        <div class="banner" role="alert">
          <app-icon name="alert" />
          <span>{{ error() }}</span>
        </div>
      }

      <ul class="name-list">
        @for (item of api().named(); track item.id) {
          <li>
            @if (editingId() === item.id) {
              <input
                #rename
                class="name-input"
                appFocusSelect
                [value]="item.name"
                aria-label="Name"
                (keydown.enter)="commit(item, rename.value)"
                (keydown.escape)="cancel($event)"
                (blur)="commit(item, rename.value)"
              />
            } @else {
              <button class="name-btn" type="button" (click)="editingId.set(item.id)">{{ item.name }}</button>
            }
            <button class="tool" type="button" [attr.aria-label]="'Delete ' + item.name" (click)="remove(item)">
              <app-icon name="close" />
            </button>
          </li>
        } @empty {
          <li class="muted">No {{ noun() }}s yet.</li>
        }
      </ul>
    </app-dialog>
  `,
})
export class NamesDialog<T extends { id: number }> {
  readonly heading = input.required<string>();
  /** What one item is called, for example "tag". */
  readonly noun = input.required<string>();
  readonly api = input.required<NamedApi<T>>();
  /** What else deleting an item does, added to the confirmation question. */
  readonly consequence = input.required<string>();
  readonly closed = output<void>();

  protected readonly editingId = signal<number | null>(null);
  protected readonly error = signal('');

  private run(request: Observable<unknown>, done: () => void = () => {}) {
    request.subscribe({
      next: () => {
        this.error.set('');
        done();
      },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  protected add(event: Event, field: HTMLInputElement) {
    event.preventDefault();
    this.run(this.api().create(field.value), () => (field.value = ''));
  }

  /** Enter and leaving the field both end up here, the second call finds nothing to do. */
  protected commit(item: Named, name: string) {
    if (this.editingId() !== item.id) {
      return;
    }
    this.editingId.set(null);
    if (name !== item.name) {
      this.run(this.api().update(item.id, name));
    }
  }

  protected cancel(event: Event) {
    event.stopPropagation();
    this.editingId.set(null);
  }

  protected remove(item: Named) {
    if (confirm(`Delete the ${this.noun()} "${item.name}"? ${this.consequence()}`)) {
      this.run(this.api().remove(item.id));
    }
  }
}

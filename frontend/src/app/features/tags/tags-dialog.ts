import { Component, inject, output, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { Dialog } from '../../core/dialog';
import { FocusSelect } from '../../core/focus-select';
import { Icon } from '../../core/icon';
import { Tag, TagApi } from './tag-api';

/** Opened from the header. Click a tag to rename it in place. */
@Component({
  selector: 'app-tags-dialog',
  imports: [Dialog, Icon, FocusSelect],
  templateUrl: './tags-dialog.html',
})
export class TagsDialog {
  protected readonly api = inject(TagApi);

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

  protected add(event: Event, input: HTMLInputElement) {
    event.preventDefault();
    this.run(this.api.create(input.value), () => (input.value = ''));
  }

  protected edit(tag: Tag) {
    this.editingId.set(tag.id);
  }

  /** Enter and leaving the field both end up here, the second call finds nothing to do. */
  protected commit(tag: Tag, value: string) {
    if (this.editingId() !== tag.id) {
      return;
    }
    this.editingId.set(null);
    if (value !== tag.value) {
      this.run(this.api.update(tag.id, value));
    }
  }

  protected cancel(event: Event) {
    event.stopPropagation();
    this.editingId.set(null);
  }

  protected remove(tag: Tag) {
    if (confirm(`Delete the tag "${tag.value}"? Its courses are kept.`)) {
      this.run(this.api.remove(tag.id));
    }
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { Tag, TagApi } from './tag-api';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.html',
})
export class Tags implements OnInit {
  private readonly api = inject(TagApi);

  protected readonly tags = signal<Tag[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly error = signal('');

  ngOnInit() {
    this.load();
  }

  private load() {
    this.api.list().subscribe((tags) => this.tags.set(tags));
  }

  private run(request: Observable<unknown>, done: () => void = () => {}) {
    request.subscribe({
      next: () => {
        this.error.set('');
        done();
        this.load();
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

  protected save(event: Event, tag: Tag, value: string) {
    event.preventDefault();
    this.run(this.api.update(tag.id, value), () => this.editingId.set(null));
  }

  protected cancel() {
    this.editingId.set(null);
  }

  protected remove(tag: Tag) {
    if (confirm(`Delete the tag "${tag.value}"? Its courses are kept.`)) {
      this.run(this.api.remove(tag.id));
    }
  }
}

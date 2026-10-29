import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, Observable, Subject, catchError, switchMap } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { Icon } from '../../core/icon';
import { toggleId } from '../../core/ids';
import { MultiSelect } from '../../core/multi-select';
import { TagApi } from '../tags/tag-api';
import { Course, CourseApi } from './course-api';

@Component({
  selector: 'app-courses',
  imports: [RouterLink, Icon, MultiSelect],
  templateUrl: './courses.html',
})
export class Courses {
  private readonly courseApi = inject(CourseApi);
  private readonly tagApi = inject(TagApi);

  protected readonly courses = signal<Course[]>([]);
  protected readonly tags = this.tagApi.all;
  protected readonly tagOptions = computed(() =>
    this.tags().map((tag) => ({ id: tag.id, label: tag.value })),
  );
  protected readonly filter = signal<number[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly editTagIds = signal<number[]>([]);
  protected readonly error = signal('');

  /** Every reload goes through this stream, `switchMap` drops the answers of outdated requests. */
  private readonly load$ = new Subject<void>();

  constructor() {
    this.load$
      .pipe(
        switchMap(() =>
          this.courseApi.list(this.filter()).pipe(
            catchError((e) => {
              this.error.set(errorMessage(e));
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((courses) => this.courses.set(courses));

    // Loads the courses, and again whenever the tags change (a renamed tag shows on the cards, a deleted one leaves the filter).
    effect(() => {
      const tagIds = this.tags().map((tag) => tag.id);
      untracked(() => {
        this.filter.update((ids) => ids.filter((id) => tagIds.includes(id)));
        this.load$.next();
      });
    });
  }

  private run(request: Observable<unknown>, done: () => void = () => {}) {
    request.subscribe({
      next: () => {
        this.error.set('');
        done();
        this.load$.next();
      },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  protected toggleFilter(tagId: number) {
    this.filter.update((ids) => toggleId(ids, tagId));
    this.load$.next();
  }

  protected add(event: Event, input: HTMLInputElement) {
    event.preventDefault();
    this.run(this.courseApi.create(input.value), () => (input.value = ''));
  }

  protected edit(course: Course) {
    this.editingId.set(course.id);
    this.editTagIds.set(course.tags.map((tag) => tag.id));
  }

  protected toggleEditTag(tagId: number) {
    this.editTagIds.update((ids) => toggleId(ids, tagId));
  }

  protected save(event: Event, course: Course, title: string) {
    event.preventDefault();
    this.run(this.courseApi.update(course.id, { title, tag_ids: this.editTagIds() }), () =>
      this.editingId.set(null),
    );
  }

  protected cancel() {
    this.editingId.set(null);
  }

  protected remove(course: Course) {
    if (confirm(`Delete "${course.title}" with all its lectures and assignments?`)) {
      this.run(this.courseApi.remove(course.id));
    }
  }
}

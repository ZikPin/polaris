import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { toggleId } from '../../core/ids';
import { Tag, TagApi } from '../tags/tag-api';
import { Course, CourseApi } from './course-api';

@Component({
  selector: 'app-courses',
  imports: [RouterLink],
  templateUrl: './courses.html',
})
export class Courses implements OnInit {
  private readonly courseApi = inject(CourseApi);
  private readonly tagApi = inject(TagApi);

  protected readonly courses = signal<Course[]>([]);
  protected readonly tags = signal<Tag[]>([]);
  protected readonly filter = signal<number[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly editTagIds = signal<number[]>([]);
  protected readonly error = signal('');

  ngOnInit() {
    this.tagApi.list().subscribe((tags) => this.tags.set(tags));
    this.load();
  }

  private load() {
    this.courseApi.list(this.filter()).subscribe((courses) => this.courses.set(courses));
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

  protected tagNames(course: Course): string {
    return course.tags.map((tag) => tag.value).join(', ');
  }

  protected toggleFilter(tagId: number) {
    this.filter.update((ids) => toggleId(ids, tagId));
    this.load();
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

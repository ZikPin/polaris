import { Component, input, linkedSignal, output } from '@angular/core';
import { Dialog } from '../../core/dialog';
import { Icon } from '../../core/icon';
import { Course, CourseChanges, CourseFields } from './course-api';
import { CourseFieldset } from './course-fieldset';

/** Edit all fields of a course, they are saved together. */
@Component({
  selector: 'app-edit-course-dialog',
  imports: [Dialog, Icon, CourseFieldset],
  template: `
    <app-dialog class="modal-course" heading="Edit the course" (closed)="closed.emit()">
      @if (error()) {
        <div class="banner" role="alert">
          <app-icon name="alert" />
          <span>{{ error() }}</span>
        </div>
      }
      <form (submit)="save($event, title.value)">
        <div class="opt">
          <label class="opt-label" for="course-title">Title</label>
          <input #title class="input" id="course-title" [value]="course().title" required />
        </div>
        <app-course-fieldset [(fields)]="fields" [danger]="true" />
        <div class="opt-actions">
          <button class="btn" type="button" (click)="closed.emit()">Cancel</button>
          <button class="btn btn-primary" type="submit">Save</button>
        </div>
      </form>
    </app-dialog>
  `,
})
export class EditCourseDialog {
  readonly course = input.required<Course>();
  readonly error = input('');
  readonly closed = output<void>();
  readonly saved = output<CourseChanges>();

  protected readonly fields = linkedSignal<CourseFields>(() => ({
    tag_ids: this.course().tags.map((tag) => tag.id),
    table_type_ids: this.course().table_types.map((tableType) => tableType.id),
    description: this.course().description,
    color: this.course().color,
    hidden: this.course().hidden,
  }));

  protected save(event: Event, title: string) {
    event.preventDefault();
    this.saved.emit({ title, ...this.fields() });
  }
}

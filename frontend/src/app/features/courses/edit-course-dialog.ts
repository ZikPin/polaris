import { Component, inject, input, linkedSignal, output } from '@angular/core';
import { COLORS, CourseColor } from '../../core/course-color';
import { Dialog } from '../../core/dialog';
import { Icon } from '../../core/icon';
import { toggleId } from '../../core/ids';
import { TagApi } from '../tags/tag-api';
import { Course, CourseChanges } from './course-api';

/** Edit all fields of a course, they are saved together. */
@Component({
  selector: 'app-edit-course-dialog',
  imports: [Dialog, Icon, CourseColor],
  template: `
    <app-dialog class="modal-course" heading="Edit the course" (closed)="closed.emit()">
      @if (error()) {
        <div class="banner" role="alert">
          <app-icon name="alert" />
          <span>{{ error() }}</span>
        </div>
      }
      <form (submit)="save($event, title.value, description.value)">
        <div class="opt">
          <label class="opt-label" for="course-title">Title</label>
          <input #title class="input" id="course-title" [value]="course().title" required />
        </div>
        @if (tags().length) {
          <div class="opt" role="group" aria-labelledby="course-tags">
            <span class="opt-label" id="course-tags">Tags</span>
            <ul class="opt-tags">
              @for (tag of tags(); track tag.id) {
                <li>
                  <label class="check">
                    <input type="checkbox" [checked]="tagIds().includes(tag.id)" (change)="tagIds.set(toggle(tagIds(), tag.id))" />
                    {{ tag.value }}
                  </label>
                </li>
              }
            </ul>
          </div>
        }
        <div class="opt">
          <label class="opt-label" for="course-description">Description</label>
          <textarea #description class="input" id="course-description" rows="3" maxlength="1000" [value]="course().description"></textarea>
        </div>
        <div class="opt" role="group" aria-labelledby="course-color">
          <span class="opt-label" id="course-color">Color</span>
          <div class="swatches">
            @for (name of colors; track name) {
              <label class="color-option" [appCourseColor]="name">
                <input type="radio" name="color" [attr.aria-label]="name" [checked]="color() === name" (change)="color.set(name)" />
                <span></span>
              </label>
            }
          </div>
        </div>
        <label class="check opt-hide">
          <input type="checkbox" [checked]="hidden()" (change)="hidden.set(!hidden())" />
          Hide from the menu
        </label>
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

  protected readonly tags = inject(TagApi).all;
  protected readonly colors = COLORS;
  protected readonly toggle = toggleId;
  protected readonly tagIds = linkedSignal(() => this.course().tags.map((tag) => tag.id));
  protected readonly color = linkedSignal(() => this.course().color);
  protected readonly hidden = linkedSignal(() => this.course().hidden);

  protected save(event: Event, title: string, description: string) {
    event.preventDefault();
    this.saved.emit({ title, description, tag_ids: this.tagIds(), color: this.color(), hidden: this.hidden() });
  }
}

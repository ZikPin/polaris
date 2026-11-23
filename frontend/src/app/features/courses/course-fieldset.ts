import { Component, inject, input, model } from '@angular/core';
import { COLORS, CourseColor } from '../../core/course-color';
import { Icon } from '../../core/icon';
import { toggleId } from '../../core/ids';
import { TableTypeApi } from '../table/table-api';
import { TagApi } from '../tags/tag-api';
import { CourseFields } from './course-api';

let instances = 0;

/** The fields of a course besides its title, shared by the add card and the course dialog. */
@Component({
  selector: 'app-course-fieldset',
  imports: [CourseColor, Icon],
  host: { class: 'course-fieldset' },
  template: `
    @if (tags().length) {
      <div class="opt" role="group" [attr.aria-labelledby]="id + '-tags'">
        <span class="opt-label" [id]="id + '-tags'">Tags</span>
        <ul class="opt-tags">
          @for (tag of tags(); track tag.id) {
            <li>
              <label class="check">
                <input type="checkbox" [checked]="fields().tag_ids.includes(tag.id)" (change)="toggle('tag_ids', tag.id)" />
                {{ tag.value }}
              </label>
            </li>
          }
        </ul>
      </div>
    }
    @if (tableTypes().length) {
      <div class="opt" role="group" [attr.aria-labelledby]="id + '-tables'">
        <span class="opt-label" [id]="id + '-tables'">Tables</span>
        <ul class="opt-tags">
          @for (tableType of tableTypes(); track tableType.id) {
            <li>
              <label class="check">
                <input
                  type="checkbox"
                  [checked]="fields().table_type_ids.includes(tableType.id)"
                  (change)="toggle('table_type_ids', tableType.id)"
                />
                {{ tableType.name }}
              </label>
            </li>
          }
        </ul>
        @if (danger()) {
          <p class="danger-mark"><app-icon name="alert" />Unticking a table deletes its rows, columns and values in this course.</p>
        }
      </div>
    }
    <div class="opt">
      <label class="opt-label" [for]="id + '-description'">Description</label>
      <textarea
        #description
        class="input"
        rows="3"
        maxlength="1000"
        [id]="id + '-description'"
        [value]="fields().description"
        (input)="set('description', description.value)"
      ></textarea>
    </div>
    <div class="opt" role="group" [attr.aria-labelledby]="id + '-color'">
      <span class="opt-label" [id]="id + '-color'">Color</span>
      <div class="swatches">
        @for (name of colors; track name) {
          <label class="color-option" [appCourseColor]="name">
            <input type="radio" [name]="id + '-color'" [attr.aria-label]="name" [checked]="fields().color === name" (change)="set('color', name)" />
            <span></span>
          </label>
        }
      </div>
    </div>
    <label class="check opt-hide">
      <input type="checkbox" [checked]="fields().hidden" (change)="set('hidden', !fields().hidden)" />
      Hide from the menu
    </label>
  `,
})
export class CourseFieldset {
  readonly fields = model.required<CourseFields>();
  /** The course dialog warns that unticking a table deletes it. The add card does not, nothing can be lost there. */
  readonly danger = input(false);

  protected readonly tags = inject(TagApi).all;
  protected readonly tableTypes = inject(TableTypeApi).all;
  protected readonly colors = COLORS;
  /** The add card and the dialog can be open together, so the ids of the labels differ. */
  protected readonly id = `course-fields-${++instances}`;

  protected set<K extends keyof CourseFields>(key: K, value: CourseFields[K]) {
    this.fields.update((fields) => ({ ...fields, [key]: value }));
  }

  protected toggle(key: 'tag_ids' | 'table_type_ids', id: number) {
    this.set(key, toggleId(this.fields()[key], id));
  }
}

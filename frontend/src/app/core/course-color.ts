import { Directive, input } from '@angular/core';

/** The accent palette of the design brief. */
export const COLORS = ['clay', 'mustard', 'olive', 'sage', 'teal', 'blue', 'periwinkle', 'plum', 'rose', 'stone'];

/** Sets the course color of the element, everything inside it reads `--course-color`. Without a color it is the default. */
@Directive({
  selector: '[appCourseColor]',
  host: { '[style.--course-color]': '"var(--accent-" + (appCourseColor() ?? "default") + ")"' },
})
export class CourseColor {
  readonly appCourseColor = input<string>();
}

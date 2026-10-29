import { Component, input } from '@angular/core';

export type IconName =
  | 'alert'
  | 'arrow-left'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'courses'
  | 'dashboard'
  | 'edit'
  | 'logout'
  | 'plus'
  | 'star'
  | 'tag';

/** An outline icon (24px grid, drawn in the current text color). The star is filled. */
@Component({
  selector: 'app-icon',
  template: `
    <svg class="ico" [class.ico-fill]="name() === 'star'" viewBox="0 0 24 24" aria-hidden="true">
      @switch (name()) {
        @case ('alert') {
          <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16v.5" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5M11 6l-6 6 6 6" />
        }
        @case ('calendar') {
          <rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" />
        }
        @case ('check') {
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        }
        @case ('chevron-down') {
          <path d="M6 9l6 6 6-6" />
        }
        @case ('chevron-left') {
          <path d="M15 6l-6 6 6 6" />
        }
        @case ('chevron-right') {
          <path d="M9 6l6 6-6 6" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6L6 18" />
        }
        @case ('courses') {
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v14H5.5A1.5 1.5 0 0 0 4 19.5z" />
          <path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19" />
        }
        @case ('dashboard') {
          <rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" />
        }
        @case ('edit') {
          <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" />
        }
        @case ('logout') {
          <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('star') {
          <path d="M12 2c.6 4.6 2.8 8 10 10-7.2 2-9.4 5.4-10 10-.6-4.6-2.8-8-10-10 7.2-2 9.4-5.4 10-10z" />
        }
        @case ('tag') {
          <path d="M3.5 12.5V4.5h8l9 9-8 8z" /><circle cx="8" cy="9" r="1" />
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
}

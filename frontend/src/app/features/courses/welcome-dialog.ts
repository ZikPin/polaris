import { Component, output } from '@angular/core';
import { CourseColor } from '../../core/course-color';
import { Dialog } from '../../core/dialog';

/** Shown once after registering: a page of the navigation per panel, each with a rough drawing of it. */
@Component({
  selector: 'app-welcome-dialog',
  imports: [Dialog, CourseColor],
  template: `
    <app-dialog class="modal-welcome" heading="Welcome to Polaris" subtitle="Your guiding star through the semester" (closed)="closed.emit()">
      <section class="opt welcome-item">
        <div class="hint hint-courses" aria-hidden="true">
          @for (color of courseColors; track color) {
            <i [appCourseColor]="color"></i>
          }
        </div>
        <div class="hint fine fine-courses" aria-hidden="true">
          <div class="add"><u></u><u></u></div>
          <div class="cards">
            @for (color of courseColors; track color) {
              <i [appCourseColor]="color"><u class="t"></u><u class="tags"><s></s><s></s></u><u class="ln"></u><u class="ln short"></u></i>
            }
          </div>
        </div>
        <div>
          <h3>Courses</h3>
          <p>Add a card for every course and give it a color and tags. Open one to track its lectures and assignments in simple tables.</p>
        </div>
      </section>
      <section class="opt welcome-item">
        <div class="hint hint-dash" aria-hidden="true">
          @for (color of dashboardColors; track color) {
            <b [appCourseColor]="color"><i class="bar"></i><i></i><i class="light"></i></b>
          }
        </div>
        <div class="hint fine fine-dash" aria-hidden="true">
          @for (color of dashboardColors; track color) {
            <div class="group" [appCourseColor]="color">
              <u class="head"><s></s><s></s></u>
              <i><u class="t"></u><u class="row"><s></s><s></s></u><u class="row"><s></s><s></s></u></i>
              <i class="light"><u class="t"></u><u class="box"><s></s><s></s></u></i>
            </div>
          }
        </div>
        <div>
          <h3>Dashboard</h3>
          <p>See how far you are in every course, with the numbers and everything still open. Filter by tag to focus on what matters now.</p>
        </div>
      </section>
      <section class="opt welcome-item">
        <div class="hint hint-cal" aria-hidden="true">
          @for (day of smallMonth; track $index) {
            @if (day === 'today') {
              <i class="today"></i>
            } @else if (day) {
              <i class="on" [appCourseColor]="day"></i>
            } @else {
              <i></i>
            }
          }
        </div>
        <div class="hint fine fine-cal" aria-hidden="true">
          <div class="mhead"><u></u><u class="title"></u><u></u></div>
          <div class="days">
            @for (day of days; track day) {
              <i [class.today]="day === today" [class.sel]="day === selected">
                <s></s>
                @for (color of entries[day]; track $index) {
                  <u [appCourseColor]="color"></u>
                }
              </i>
            }
          </div>
        </div>
        <div>
          <h3>Calendar</h3>
          <p>Plan your study days. Add lectures and assignments to a day and see everything in your course colors.</p>
        </div>
      </section>
    </app-dialog>
  `,
})
export class WelcomeDialog {
  readonly closed = output<void>();

  protected readonly courseColors = ['clay', 'mustard', 'sage', 'blue'];
  protected readonly dashboardColors = ['sage', 'blue'];
  /** The drawing of the month beside the text on narrow screens: the color of an entry, today, or an empty day. */
  protected readonly smallMonth = [null, 'clay', null, null, 'sage', null, null, 'today', null, 'mustard', 'blue', null, null, 'clay', null];
  /** The detailed drawing on wide screens: four weeks, the colors of the entries by day, today and a selected day. */
  protected readonly days = Array.from({ length: 28 }, (_, i) => i + 1);
  protected readonly entries: Record<number, string[]> = {
    2: ['clay'],
    5: ['sage', 'sage'],
    10: ['mustard'],
    12: ['blue'],
    15: ['mustard'],
    17: ['blue', 'sage'],
    20: ['clay', 'clay'],
    23: ['sage'],
    27: ['mustard'],
  };
  protected readonly today = 10;
  protected readonly selected = 17;
}

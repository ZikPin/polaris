import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, switchMap } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { Icon } from '../../core/icon';
import { Select } from '../../core/select';
import { CourseApi } from '../courses/course-api';
import { TableApi, Tables } from '../table/table-api';
import { CalendarApi, CalendarRow } from './calendar-api';
import { buildWeeks, dateKey, monthKey } from './month-grid';

@Component({
  selector: 'app-calendar',
  imports: [Icon, Select],
  templateUrl: './calendar.html',
})
export class Calendar implements OnInit {
  private readonly api = inject(CalendarApi);
  private readonly courseApi = inject(CourseApi);
  private readonly tableApi = inject(TableApi);

  protected readonly today = dateKey(new Date());
  protected readonly view = signal({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  protected readonly weeks = computed(() => buildWeeks(this.view().year, this.view().month));
  protected readonly monthLabel = computed(() => monthKey(this.view().year, this.view().month));
  protected readonly monthTitle = computed(() =>
    new Date(this.view().year, this.view().month - 1, 1).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    }),
  );

  /** The rows of the days of the shown month, by date. */
  protected readonly days = signal<Record<string, CalendarRow[]>>({});
  protected readonly selected = signal<string | null>(this.today);
  protected readonly selectedRows = computed(() => this.days()[this.selected() ?? ''] ?? []);
  protected readonly selectedTitle = computed(() => {
    const [year, month, day] = (this.selected() ?? '').split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  protected readonly courseChoices = computed(() =>
    this.courseApi.all().map((course) => ({ value: course.id, label: course.title })),
  );
  protected readonly chosenCourse = signal<number | null>(null);
  /** The tables of the chosen course, to pick the row to add from. */
  private readonly tables = signal<Tables | null>(null);
  protected readonly rowChoices = computed(() => {
    const tables = this.tables();
    if (!tables) {
      return [];
    }
    return [
      ...tables.lecture.rows.map((row) => ({ value: row.id, label: `${row.title}, lecture` })),
      ...tables.assignment.rows.map((row) => ({ value: row.id, label: `${row.title}, assignment` })),
    ];
  });
  protected readonly chosenRow = signal<number | null>(null);
  protected readonly error = signal('');

  /** Every reload goes through this stream, `switchMap` drops the answers of outdated requests. */
  private readonly load$ = new Subject<void>();

  constructor() {
    this.load$
      .pipe(
        switchMap(() =>
          this.api.month(this.monthLabel()).pipe(
            catchError((e) => {
              this.error.set(errorMessage(e));
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((days) => {
        this.days.set(Object.fromEntries(days.map((day) => [day.date, day.rows])));
      });
  }

  ngOnInit() {
    this.load$.next();
  }

  protected shift(months: number) {
    const { year, month } = this.view();
    const moved = new Date(year, month - 1 + months, 1);
    this.view.set({ year: moved.getFullYear(), month: moved.getMonth() + 1 });
    this.selected.set(this.today.startsWith(this.monthLabel()) ? this.today : null);
    this.load$.next();
  }

  protected select(date: string) {
    this.selected.set(date);
  }

  protected courseTitle(courseId: number): string {
    return this.courseApi.all().find((course) => course.id === courseId)?.title ?? '';
  }

  protected chooseCourse(courseId: number) {
    this.chosenCourse.set(courseId);
    this.chosenRow.set(null);
    this.tables.set(null);
    this.tableApi.getTables(courseId).subscribe((tables) => {
      if (this.chosenCourse() === courseId) {
        this.tables.set(tables);
      }
    });
  }

  protected add() {
    const rowId = this.chosenRow();
    const ids = this.selectedRows().map((row) => row.id);
    if (rowId !== null && !ids.includes(rowId)) {
      this.save([...ids, rowId]);
    }
    this.chosenRow.set(null);
  }

  protected remove(row: CalendarRow) {
    this.save(this.selectedRows().filter((entry) => entry.id !== row.id).map((entry) => entry.id));
  }

  private save(rowIds: number[]) {
    const date = this.selected();
    if (!date) {
      return;
    }
    this.api.setDay(date, rowIds).subscribe({
      next: () => {
        this.error.set('');
        this.load$.next();
      },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }
}

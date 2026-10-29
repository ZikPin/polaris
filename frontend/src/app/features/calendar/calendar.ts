import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, switchMap } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { Course, CourseApi } from '../courses/course-api';
import { TableApi, Tables } from '../table/table-api';
import { CalendarApi, CalendarRow } from './calendar-api';
import { buildWeeks, monthKey } from './month-grid';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.html',
  styles: `
    .layout {
      display: flex;
      gap: 2em;
      align-items: flex-start;
    }
  `,
})
export class Calendar implements OnInit {
  private readonly api = inject(CalendarApi);
  private readonly courseApi = inject(CourseApi);
  private readonly tableApi = inject(TableApi);

  protected readonly view = signal({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  protected readonly weeks = computed(() => buildWeeks(this.view().year, this.view().month));
  protected readonly monthLabel = computed(() => monthKey(this.view().year, this.view().month));

  /** The rows of the days of the shown month, by date. */
  protected readonly days = signal<Record<string, CalendarRow[]>>({});
  protected readonly selected = signal<string | null>(null);
  protected readonly selectedRows = computed(() => this.days()[this.selected() ?? ''] ?? []);

  protected readonly courses = signal<Course[]>([]);
  /** The tables of the course chosen to add rows from. */
  protected readonly tables = signal<Tables | null>(null);
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
    this.courseApi.list().subscribe((courses) => this.courses.set(courses));
    this.load$.next();
  }

  protected shift(months: number) {
    const { year, month } = this.view();
    const moved = new Date(year, month - 1 + months, 1);
    this.view.set({ year: moved.getFullYear(), month: moved.getMonth() + 1 });
    this.selected.set(null);
    this.load$.next();
  }

  protected select(date: string) {
    this.selected.set(date);
  }

  protected courseTitle(courseId: number): string {
    return this.courses().find((course) => course.id === courseId)?.title ?? '';
  }

  protected chooseCourse(courseId: number) {
    if (!courseId) {
      this.tables.set(null);
      return;
    }
    this.tableApi.getTables(courseId).subscribe((tables) => this.tables.set(tables));
  }

  protected add(rowId: number) {
    const ids = this.selectedRows().map((row) => row.id);
    if (rowId && !ids.includes(rowId)) {
      this.save([...ids, rowId]);
    }
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

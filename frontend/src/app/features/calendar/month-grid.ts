export interface GridDay {
  /** YYYY-MM-DD */
  date: string;
  day: number;
  inMonth: boolean;
}

function pad(number: number): string {
  return String(number).padStart(2, '0');
}

/** 'YYYY-MM-DD' of a date, in local time. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 'YYYY-MM' of a month (1 to 12). */
export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

/** The weeks (Monday first) that cover a month (1 to 12). Days of the neighbour months are marked. */
export function buildWeeks(year: number, month: number): GridDay[][] {
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const weekCount = Math.ceil((offset + daysInMonth) / 7);

  const weeks: GridDay[][] = [];
  for (let week = 0; week < weekCount; week++) {
    const days: GridDay[] = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      const date = new Date(year, month - 1, 1 - offset + week * 7 + weekday);
      days.push({
        date: dateKey(date),
        day: date.getDate(),
        inMonth: date.getMonth() === month - 1,
      });
    }
    weeks.push(days);
  }
  return weeks;
}

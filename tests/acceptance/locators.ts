import { expect, Locator, Page } from '@playwright/test';

/** A regular expression that matches exactly this text (surrounding whitespace is ignored). */
export function exactly(text: string): RegExp {
  return new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
}

/** "lecture", "lectures", "assignment" or "assignments": the heading of a table on the course page. */
export function heading(kind: string): 'Lectures' | 'Assignments' {
  return kind.startsWith('lecture') ? 'Lectures' : 'Assignments';
}

/** One of the two tables on the course page. */
export function table(page: Page, kind: string): Locator {
  return page.locator('app-table-view').filter({ has: page.getByRole('heading', { name: heading(kind), exact: true }) });
}

/** The row of a table with this title. */
export function row(page: Page, kind: string, title: string): Locator {
  return table(page, kind)
    .locator('tbody tr')
    .filter({ has: page.locator('th.t-row', { hasText: exactly(title) }) });
}

/** The cell of a row in a custom column: the position of the column is read from the header. */
export async function cell(page: Page, kind: string, title: string, column: string): Promise<Locator> {
  const headers = table(page, kind).locator('thead th.t-head');
  let position = -1;
  // The table may still be loading.
  await expect
    .poll(async () => {
      position = (await headers.allTextContents()).findIndex((label) => exactly(column).test(label));
      return position;
    }, { message: `No column "${column}" in the ${kind} table` })
    .toBeGreaterThan(0);
  return row(page, kind, title).locator('td').nth(position - 1);
}

/** A course on the dashboard (its heading and the two cards below it). */
export function courseBlock(page: Page, course: string): Locator {
  return page
    .locator('section.course-block')
    .filter({ has: page.getByRole('heading', { level: 2, name: course, exact: true }) });
}

/** The lectures or the assignments card of a course on the dashboard. */
export function card(page: Page, course: string, kind: string): Locator {
  return courseBlock(page, course)
    .locator('article.card')
    .filter({ has: page.getByRole('heading', { level: 3, name: heading(kind), exact: true }) });
}

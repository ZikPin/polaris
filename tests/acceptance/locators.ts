import { expect, Locator, Page } from '@playwright/test';

/** A regular expression that matches exactly this text (surrounding whitespace is ignored). */
export function exactly(text: string): RegExp {
  return new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
}

/** A link of the main navigation. On a phone it is inside the menu, which is opened first. */
export async function navLink(page: Page, name: string): Promise<Locator> {
  const burger = page.getByRole('button', { name: 'Open the menu' });
  if (await burger.isVisible()) {
    await burger.click();
  }
  return page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true });
}

/** The card of a course on the courses page. */
export function courseCard(page: Page, title: string): Locator {
  return page.locator('article.card').filter({ has: page.getByRole('heading', { level: 3, name: title, exact: true }) });
}

/** The color the browser resolves for an accent of the palette, to compare with a computed style. */
export function accent(page: Page, name: string): Promise<string> {
  return page.evaluate((accentName) => {
    const probe = document.createElement('i');
    probe.style.color = `var(--accent-${accentName})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, name);
}

/** The edit dialog of a course, opened from its card. */
export async function openEditDialog(page: Page, title: string): Promise<Locator> {
  await page.getByRole('button', { name: `Edit ${title}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit the course' });
  await expect(dialog).toBeVisible();
  return dialog;
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

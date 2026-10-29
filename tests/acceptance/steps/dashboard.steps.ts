import { expect, Page } from '@playwright/test';
import { Then, When } from '../fixtures';
import { card, table } from '../locators';

/** The menu of one of the dashboard filters ("Tags" or "Courses"), opened. */
const openFilter = async (page: Page, name: string) => {
  await page.locator('.filters').getByRole('button', { name: new RegExp(`^${name}`) }).click();
  return page.locator('.filters .menu');
};

When('I open the dashboard', async ({ page }) => {
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  await expect(page.locator('section.course-block').first()).toBeVisible();
});

When('I show only the tag {string} on the dashboard', async ({ page }, tag: string) => {
  const menu = await openFilter(page, 'Tags');
  await menu.getByLabel(tag, { exact: true }).check();
  await page.getByRole('heading', { level: 1 }).click();
});

When('I show only the course {string} on the dashboard', async ({ page }, course: string) => {
  const menu = await openFilter(page, 'Courses');
  await menu.getByLabel(course, { exact: true }).check();
  await page.getByRole('heading', { level: 1 }).click();
});

When('I remove the dashboard filters', async ({ page }) => {
  for (const name of ['Tags', 'Courses']) {
    const menu = await openFilter(page, name);
    for (const box of await menu.getByRole('checkbox').all()) {
      await box.uncheck();
    }
    await page.getByRole('heading', { level: 1 }).click();
  }
});

When('I set the statistic of the column {string} in the {word} table to {string}', async ({ page }, label: string, kind: string, statistic: string) => {
  const header = table(page, kind).locator('thead th.t-head', { hasText: label });
  await header.hover();
  await header.getByRole('button', { name: 'Edit column' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('app-select button').click();
  await dialog.getByRole('button', { name: statistic, exact: true }).click();
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toHaveCount(0);
});

Then('the dashboard shows the courses {string}', async ({ page }, titles: string) => {
  await expect(page.locator('section.course-block h2')).toHaveText(titles.split(', '));
});

Then('the dashboard shows {string} as {string} for the {word} of {string}', async ({ page }, label: string, value: string, kind: string, course: string) => {
  const line = card(page, course, kind).locator('.stats > div').filter({ has: page.locator('dt', { hasText: label }) });
  await expect(line.locator('dd')).toHaveText(value);
});

Then('the dashboard has no {string} for the {word} of {string}', async ({ page }, label: string, kind: string, course: string) => {
  await expect(card(page, course, kind)).toBeVisible();
  await expect(card(page, course, kind).locator('.stats dt', { hasText: label })).toHaveCount(0);
});

Then('the not-done list for the {word} of {string} is {string}', async ({ page }, kind: string, course: string, titles: string) => {
  await expect(card(page, course, kind).locator('.todo li')).toHaveText(titles.split(', '));
});

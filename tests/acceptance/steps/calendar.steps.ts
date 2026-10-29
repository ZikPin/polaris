import { expect, Page } from '@playwright/test';
import { Then, When } from '../fixtures';

const panel = (page: Page) => page.locator('.day-panel');

const choose = async (page: Page, placeholder: string, choice: string) => {
  await panel(page).locator('app-select').filter({ has: page.locator('button.select') }).nth(placeholder === 'Course' ? 0 : 1).locator('button.select').click();
  await panel(page).locator('.menu').getByRole('button', { name: choice, exact: true }).click();
};

When('I open the calendar', async ({ page }) => {
  await page.getByRole('link', { name: 'Calendar' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Calendar' })).toBeVisible();
});

When('I select a day without entries', async ({ page }) => {
  await page.locator('button.day').filter({ hasNot: page.locator('.ev > span') }).last().click();
});

When('I add {string} of {string} to the selected day', async ({ page }, row: string, course: string) => {
  await choose(page, 'Course', course);
  await choose(page, 'Row', row);
  await panel(page).getByRole('button', { name: 'Add entry' }).click();
  await expect(panel(page).locator('.entries li', { hasText: row })).toBeVisible();
});

When('I remove {string} from the selected day', async ({ page }, entry: string) => {
  await panel(page).locator('.entries li', { hasText: entry }).getByRole('button', { name: 'Remove entry' }).click();
  await expect(panel(page).locator('.entries li', { hasText: entry })).toHaveCount(0);
});

Then('the selected day lists the entry {string}', async ({ page }, entry: string) => {
  await expect(panel(page).locator('.entries li', { hasText: entry })).toHaveCount(1);
});

Then('the selected day is empty', async ({ page }) => {
  await expect(panel(page).getByText('Nothing planned.')).toBeVisible();
  await expect(panel(page).locator('.entries li:not(.muted)')).toHaveCount(0);
});

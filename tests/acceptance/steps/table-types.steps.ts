import { expect, Page } from '@playwright/test';
import { Then, When } from '../fixtures';
import { courseBlock, exactly, openEditDialog } from '../locators';

const tablesDialog = (page: Page) => page.getByRole('dialog', { name: 'Tables' });

When('I open the tables dialog', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Account' }).getByRole('button', { name: 'Tables' }).click();
  await expect(tablesDialog(page)).toBeVisible();
});

When('I close the tables dialog', async ({ page }) => {
  await tablesDialog(page).getByRole('button', { name: 'Close' }).click();
  await expect(tablesDialog(page)).toHaveCount(0);
});

When('I add the table types {string}', async ({ page }, names: string) => {
  for (const name of names.split(', ')) {
    await tablesDialog(page).getByLabel('New table type').fill(name);
    await tablesDialog(page).getByRole('button', { name: 'Add table type' }).click();
  }
});

When('I rename the table type {string} to {string}', async ({ page }, name: string, newName: string) => {
  await tablesDialog(page).locator('.name-btn', { hasText: exactly(name) }).click();
  const input = tablesDialog(page).getByLabel('Name', { exact: true });
  await input.fill(newName);
  await input.press('Enter');
});

When('I delete the table type {string} and {word} the confirmation', async ({ page }, name: string, answer: string) => {
  page.once('dialog', (dialog) => (answer === 'accept' ? dialog.accept() : dialog.dismiss()));
  await tablesDialog(page).getByRole('button', { name: `Delete ${name}`, exact: true }).click();
});

When('I set the tables of the course {string} to {string}', async ({ page }, title: string, names: string) => {
  const dialog = await openEditDialog(page, title);
  for (const name of names.split(', ')) {
    await dialog.getByRole('group', { name: 'Tables' }).getByLabel(name, { exact: true }).check();
  }
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toHaveCount(0);
});

When('I untick the table {string} of the course {string} after seeing the warning', async ({ page }, name: string, title: string) => {
  const dialog = await openEditDialog(page, title);
  const tables = dialog.getByRole('group', { name: 'Tables' });
  // The warning is there before anything is unticked
  await expect(tables.locator('.danger-mark')).toContainText('deletes its rows, columns and values');
  await tables.getByLabel(name, { exact: true }).uncheck();
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toHaveCount(0);
});

Then('the tables dialog warns that deleting a table type deletes its data', async ({ page }) => {
  await expect(tablesDialog(page).locator('.danger-mark')).toContainText('removes its table from every course');
});

Then('the table types are listed as {string}', async ({ page }, names: string) => {
  await expect(tablesDialog(page).locator('.name-list .name-btn')).toHaveText(names.split(', '));
});

Then('the course has no tables', async ({ page }) => {
  await expect(page.getByText('This course has no tables yet.')).toBeVisible();
  await expect(page.locator('app-table-view')).toHaveCount(0);
});

Then('the course shows the tables {string}', async ({ page }, names: string) => {
  const tables = page.locator('app-table-view');
  await expect(tables.getByRole('heading', { level: 2 })).toHaveText(names.split(', '));
  // Every table has the default title column
  await expect(tables.locator('thead th.t-title')).toHaveCount(names.split(', ').length);
});

Then('the dashboard notes that {string} has no tables', async ({ page }, course: string) => {
  await expect(courseBlock(page, course).getByText('No tables.')).toBeVisible();
  await expect(courseBlock(page, course).locator('article.card')).toHaveCount(0);
});

Then('the dashboard shows the tables {string} for {string}', async ({ page }, names: string, course: string) => {
  await expect(courseBlock(page, course).locator('article.card h3')).toHaveText(names.split(', '));
});

Then('every course on the dashboard has only the tables {string}', async ({ page }, names: string) => {
  const blocks = page.locator('section.course-block');
  await expect(blocks.first()).toBeVisible();
  for (const block of await blocks.all()) {
    await expect(block.locator('article.card h3')).toHaveText(names.split(', '));
  }
});

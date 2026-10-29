import { expect } from '@playwright/test';
import { When, Then } from '../fixtures';
import { cell, row, table } from '../locators';

When('I add the row {string} to the {word} table', async ({ page }, title: string, kind: string) => {
  await table(page, kind).getByRole('button', { name: 'Add row' }).click();
  // A new row has a default title that is edited in place.
  const input = table(page, kind).getByLabel('Title', { exact: true });
  await input.fill(title);
  await input.press('Enter');
  await expect(row(page, kind, title)).toBeVisible();
});

When('I rename the row {string} to {string} in the {word} table', async ({ page }, title: string, newTitle: string, kind: string) => {
  await row(page, kind, title).locator('th.t-row').click();
  const input = table(page, kind).getByLabel('Title', { exact: true });
  await input.fill(newTitle);
  await input.press('Enter');
  await expect(row(page, kind, newTitle)).toBeVisible();
});

When('I delete the row {string} from the {word} table', async ({ page }, title: string, kind: string) => {
  await row(page, kind, title).locator('th.t-row').hover();
  await row(page, kind, title).getByRole('button', { name: 'Delete row' }).click();
  await expect(row(page, kind, title)).toHaveCount(0);
});

When('I add the checkbox column {string} to the {word} table', async ({ page }, label: string, kind: string) => {
  await table(page, kind).getByRole('button', { name: 'Add column' }).click();
  await page.locator('.opt').filter({ hasText: 'Boolean column' }).getByRole('button', { name: 'Create' }).click();
  // A new column has a default label that is edited in place.
  const input = table(page, kind).getByLabel('Column label');
  await input.fill(label);
  await input.press('Enter');
  await expect(table(page, kind).locator('thead th.t-head', { hasText: label })).toBeVisible();
});

When('I add the number column {string} to the {word} table', async ({ page }, label: string, kind: string) => {
  await table(page, kind).getByRole('button', { name: 'Add column' }).click();
  await page.locator('.opt').filter({ hasText: 'Number column' }).getByRole('button', { name: 'Create' }).click();
  const input = table(page, kind).getByLabel('Column label');
  await input.fill(label);
  await input.press('Enter');
  await expect(table(page, kind).locator('thead th.t-head', { hasText: label })).toBeVisible();
});

When('I delete the column {string} from the {word} table', async ({ page }, label: string, kind: string) => {
  const header = table(page, kind).locator('thead th.t-head', { hasText: label });
  page.once('dialog', (dialog) => dialog.accept());
  await header.hover();
  await header.getByRole('button', { name: 'Delete column' }).click();
  await expect(header).toHaveCount(0);
});

When('I check the box {string} of the row {string} in the {word} table', async ({ page }, column: string, title: string, kind: string) => {
  await (await cell(page, kind, title, column)).getByRole('checkbox').check();
});

When('I uncheck the box {string} of the row {string} in the {word} table', async ({ page }, column: string, title: string, kind: string) => {
  await (await cell(page, kind, title, column)).getByRole('checkbox').uncheck();
});

When(
  'I enter {string} in the column {string} of the row {string} in the {word} table',
  async ({ page }, value: string, column: string, title: string, kind: string) => {
    const target = await cell(page, kind, title, column);
    await target.click();
    // Typing, not filling: a number field refuses letters, and that is what is checked.
    await expect(target.getByRole('spinbutton')).toBeFocused();
    await page.keyboard.type(value);
    await page.keyboard.press('Enter');
    await expect(target.getByRole('spinbutton')).toHaveCount(0);
  },
);

Then('the {word} table lists the rows {string}', async ({ page }, kind: string, titles: string) => {
  await expect(table(page, kind).locator('tbody th.t-row')).toHaveText(titles.split(', '));
});

Then('the {word} table has no rows', async ({ page }, kind: string) => {
  await expect(table(page, kind).getByRole('heading')).toBeVisible();
  await expect(table(page, kind).locator('tbody tr')).toHaveCount(0);
});

Then('the {word} table has the column {string}', async ({ page }, kind: string, label: string) => {
  await expect(table(page, kind).locator('thead th.t-head', { hasText: label })).toHaveCount(1);
});

Then('the {word} table has no column {string}', async ({ page }, kind: string, label: string) => {
  await expect(table(page, kind).locator('thead th.t-head', { hasText: label })).toHaveCount(0);
});

Then('the box {string} of the row {string} in the {word} table is checked', async ({ page }, column: string, title: string, kind: string) => {
  await expect((await cell(page, kind, title, column)).getByRole('checkbox')).toBeChecked();
});

Then('the box {string} of the row {string} in the {word} table is unchecked', async ({ page }, column: string, title: string, kind: string) => {
  await expect((await cell(page, kind, title, column)).getByRole('checkbox')).not.toBeChecked();
});

Then('every box {string} in the {word} table is unchecked', async ({ page }, column: string, kind: string) => {
  const titles = await table(page, kind).locator('tbody th.t-row').allTextContents();
  expect(titles.length).toBeGreaterThan(0);
  for (const title of titles) {
    await expect((await cell(page, kind, title.trim(), column)).getByRole('checkbox')).not.toBeChecked();
  }
});

Then('the column {string} of the row {string} in the {word} table shows {string}', async ({ page }, column: string, title: string, kind: string, value: string) => {
  await expect(await cell(page, kind, title, column)).toHaveText(value);
});

import { expect, Page } from '@playwright/test';
import { Then, When } from '../fixtures';

const openTagsDialog = async (page: Page) => {
  await page.getByRole('navigation', { name: 'Account' }).getByRole('button', { name: 'Tags' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
};

const closeDialog = async (page: Page) => {
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
};

/** The menu of the tags filter in the page head, opened. */
const openFilter = async (page: Page) => {
  await page.locator('.filters').getByRole('button', { name: /^Tags/ }).click();
  return page.locator('.filters .menu');
};

When('I create the tags {string}', async ({ page }, names: string) => {
  await openTagsDialog(page);
  for (const name of names.split(', ')) {
    await page.getByLabel('New tag').fill(name);
    await page.getByRole('button', { name: 'Add tag' }).click();
    await expect(page.locator('.tag-name', { hasText: name })).toBeVisible();
  }
  await closeDialog(page);
});

When('I tag the course {string} with {string}', async ({ page }, title: string, names: string) => {
  await page.getByRole('button', { name: `Edit ${title}`, exact: true }).click();
  for (const name of names.split(', ')) {
    await page.locator('article.editing').getByLabel(name, { exact: true }).check();
  }
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('article.editing')).toHaveCount(0);
});

When('I filter the courses by the tags {string}', async ({ page }, names: string) => {
  const menu = await openFilter(page);
  for (const name of names.split(', ')) {
    await menu.getByLabel(name, { exact: true }).check();
  }
  await page.getByRole('heading', { level: 1 }).click();
});

When('I remove the course filter', async ({ page }) => {
  const menu = await openFilter(page);
  for (const box of await menu.getByRole('checkbox').all()) {
    await box.uncheck();
  }
  await page.getByRole('heading', { level: 1 }).click();
});

Then('the tags are listed as {string}', async ({ page }, names: string) => {
  await openTagsDialog(page);
  await expect(page.locator('.tag-list .tag-name')).toHaveText(names.split(', '));
  await closeDialog(page);
});

Then('the course {string} shows the tags {string}', async ({ page }, title: string, names: string) => {
  const card = page.locator('article.card').filter({ has: page.getByRole('heading', { level: 3, name: title, exact: true }) });
  await expect(card.locator('.tag')).toHaveText(names.split(', '));
});

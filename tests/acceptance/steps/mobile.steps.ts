import { expect, Locator, Page } from '@playwright/test';
import { Given, Then, When } from '../fixtures';
import { courseBlock } from '../locators';

const PHONE_HEIGHT = 844;

const box = async (locator: Locator) => (await locator.boundingBox())!;

/** The items are on top of each other, with the same left edge. */
async function expectOnePerRow(items: Locator) {
  const boxes = await Promise.all((await items.all()).map(box));
  expect(boxes.length).toBeGreaterThan(1);
  boxes.forEach((current, i) => {
    expect(current.x).toBe(boxes[0].x);
    if (i) {
      expect(current.y).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height - 1);
    }
  });
}

Given('I use a phone {int} pixels wide', async ({ page }, width: number) => {
  await page.setViewportSize({ width, height: PHONE_HEIGHT });
});

When('I open the menu', async ({ page }) => {
  await page.getByRole('button', { name: 'Open the menu' }).click();
});

When('I choose {string} in the menu', async ({ page }, name: string) => {
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true }).click();
});

Then('the header shows only the brand, the tags button and the burger button', async ({ page }) => {
  const header = page.locator('header.topbar');
  await expect(header.getByRole('link', { name: 'Polaris' })).toBeVisible();
  await expect(header.getByRole('button', { name: 'Tags' })).toBeVisible();
  await expect(header.getByRole('button', { name: 'Open the menu' })).toBeVisible();
  await expect(header.getByRole('button', { name: 'Log out' })).toHaveCount(0);
  await expect(header.locator('.user')).toBeHidden();
});

Then('the menu opens below the header and lists {string} and the course {string}', async ({ page }, pages: string, course: string) => {
  const menu = page.getByRole('navigation', { name: 'Main' });
  for (const name of [...pages.split(', '), course]) {
    await expect(menu.getByRole('link', { name, exact: true })).toBeVisible();
  }
  const header = await box(page.locator('header.topbar'));
  const sidebar = await box(page.locator('.sidebar'));
  expect(sidebar.y).toBeGreaterThanOrEqual(header.y + header.height);
  expect(sidebar.y + sidebar.height).toBe(PHONE_HEIGHT);
});

Then('the last entry of the menu is {string}', async ({ page }, name: string) => {
  await expect(page.getByRole('navigation', { name: 'Main' }).locator(':scope > :last-child')).toHaveText(name);
});

Then('I see the calendar', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Calendar' })).toBeVisible();
});

Then('the menu is closed', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
});

Then('the filters are directly under the title', async ({ page }) => {
  await expectUnderTitle(page.locator('.filters'), page);
});

Then('the back button is directly under the title', async ({ page }) => {
  await expectUnderTitle(page.getByRole('link', { name: 'Back to courses' }), page);
});

async function expectUnderTitle(item: Locator, page: Page) {
  const title = await box(page.getByRole('heading', { level: 1 }));
  const below = await box(item);
  expect(below.x).toBe(title.x);
  expect(below.y).toBeGreaterThanOrEqual(title.y + title.height);
  expect(below.y - (title.y + title.height)).toBeLessThan(40);
}

Then('the courses are shown one per row', async ({ page }) => {
  await expectOnePerRow(page.locator('article.card'));
});

Then('the lecture table is above the assignment table', async ({ page }) => {
  await expectOnePerRow(page.locator('app-table-view'));
});

Then('the dashboard cards of {string} are shown one per row', async ({ page }, course: string) => {
  await expectOnePerRow(courseBlock(page, course).locator('article.card'));
});

Then('the calendar grid is above the list of the day', async ({ page }) => {
  const grid = await box(page.locator('.cal-grid'));
  const list = await box(page.locator('.day-panel'));
  expect(list.y).toBeGreaterThanOrEqual(grid.y + grid.height);
});

Then('the page does not scroll sideways', async ({ page }) => {
  const scrolls = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(scrolls).toBe(false);
});

Then('the header shows the Log out button and no burger button', async ({ page }) => {
  const header = page.locator('header.topbar');
  await expect(header.getByRole('button', { name: 'Log out' })).toBeVisible();
  await expect(header.getByRole('button', { name: 'Open the menu' })).toBeHidden();
});

Then('the first {int} courses share a row', async ({ page }, count: number) => {
  const cards = (await page.locator('article.card').all()).slice(0, count);
  const tops = await Promise.all(cards.map(async (card) => (await box(card)).y));
  expect(new Set(tops).size).toBe(1);
});

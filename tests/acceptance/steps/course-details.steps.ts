import { expect } from '@playwright/test';
import { Given, Then, When } from '../fixtures';
import { accent, courseCard, openEditDialog } from '../locators';

const DESCRIPTION = 'abcdefghij'.repeat(20);

type Row = { id: number };

When(
  'I edit the course {string} to the tag {string}, a description of 200 characters and the color {string}',
  async ({ page }, title: string, tag: string, color: string) => {
    const dialog = await openEditDialog(page, title);
    await dialog.getByLabel(tag, { exact: true }).check();
    await dialog.getByLabel('Description', { exact: true }).fill(DESCRIPTION);
    await dialog.getByLabel(color, { exact: true }).check();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toHaveCount(0);
  },
);

When('I click the card of {string}', async ({ page }, title: string) => {
  await courseCard(page, title).click({ position: { x: 12, y: 120 } });
});

// The courses and their rows are created through the API, the planned rows are noted for the step that plans them.
Given(
  'I have the course {string} in the color {string} with a lecture and an assignment',
  async ({ page, notes }, title: string, color: string) => {
    const course = await (await page.request.post('/api/course', { data: { title, color } })).json();
    for (const kind of ['lecture', 'assignment']) {
      const row: Row = await (await page.request.post(`/api/table/${course.id}/${kind}/row`, { data: { title: `${title} ${kind}` } })).json();
      notes['rows'] = [notes['rows'], row.id].filter(Boolean).join(',');
    }
  },
);

Given('all the lectures and assignments are planned for today', async ({ page, notes }) => {
  const today = new Date().toLocaleDateString('en-CA');
  const response = await page.request.put(`/api/calendar/${today}`, { data: { row_ids: notes['rows'].split(',').map(Number) } });
  expect(response.ok()).toBeTruthy();
});

Then(
  'the card of {string} shows the tag {string} and the first 150 characters of the description with an ellipsis',
  async ({ page }, title: string, tag: string) => {
    await expect(courseCard(page, title).locator('.tag')).toHaveText([tag]);
    await expect(courseCard(page, title).locator('.card-desc')).toHaveText(`${DESCRIPTION.slice(0, 150)}…`);
  },
);

Then('the card of {string} shows no description and has the color {string}', async ({ page }, title: string, color: string) => {
  await expect(courseCard(page, title).locator('.card-desc')).toHaveCount(0);
  await expect(courseCard(page, title)).toHaveCSS('background-color', await accent(page, color));
});

Then('the card of {string} has the color {string}', async ({ page }, title: string, color: string) => {
  await expect(courseCard(page, title)).toHaveCSS('background-color', await accent(page, color));
});

Then('the course page shows the tag {string} and the whole description', async ({ page }, tag: string) => {
  await expect(page.locator('.course-intro .tag')).toHaveText([tag]);
  await expect(page.locator('.course-desc')).toHaveText(DESCRIPTION);
});

Then('the navigation dot of {string} has the color {string}', async ({ page }, title: string, color: string) => {
  await expect(page.locator('.nav-sub li').filter({ hasText: title }).locator('.dot')).toHaveCSS('background-color', await accent(page, color));
});

Then('the dashboard cards of {string} have the color {string}', async ({ page }, title: string, color: string) => {
  const block = page.locator('section.course-block').filter({ has: page.getByRole('heading', { level: 2, name: title, exact: true }) });
  await expect(block.locator('h2 .dot')).toHaveCSS('background-color', await accent(page, color));
  await expect(block.locator('article.card').first()).toHaveCSS('background-color', await accent(page, color));
});

Then('the calendar entries of {string} have the color {string}', async ({ page }, title: string, color: string) => {
  const expected = await accent(page, color);
  await expect(page.locator('.ev > span', { hasText: title }).first()).toHaveCSS('background-color', expected);
  await expect(page.locator('.entries li', { hasText: title }).first().locator('.dot')).toHaveCSS('background-color', expected);
});

Then('the table headers have the color {string}', async ({ page }, color: string) => {
  await expect(page.locator('thead th.t-head').first()).toHaveCSS('background-color', await accent(page, color));
});

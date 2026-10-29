import { expect, Locator } from '@playwright/test';
import { Then } from '../fixtures';
import { cell, row, table } from '../locators';

/** Runs the action and waits for the feedback to show. Returns the milliseconds from the action until then. */
async function timeUntil(action: () => Promise<unknown>, feedback: Locator, state: 'visible' | 'detached' = 'visible') {
  const start = Date.now();
  await action();
  await feedback.waitFor({ state, timeout: 5000 });
  return Date.now() - start;
}

function within(elapsed: number, limit: number) {
  expect(elapsed, `the feedback took ${elapsed} ms`).toBeLessThan(limit);
}

Then('adding the row {string} to the {word} table gives feedback within {int} ms', async ({ page }, title: string, kind: string, limit: number) => {
  // The new row shows up with its default title in edit mode.
  const input = table(page, kind).getByLabel('Title', { exact: true });
  within(await timeUntil(() => table(page, kind).getByRole('button', { name: 'Add row' }).click(), input), limit);
  await input.fill(title);
  await input.press('Enter');
  await expect(row(page, kind, title)).toBeVisible();
});

Then('renaming the row {string} to {string} in the {word} table gives feedback within {int} ms', async ({ page }, title: string, newTitle: string, kind: string, limit: number) => {
  await row(page, kind, title).locator('th.t-row').click();
  const input = table(page, kind).getByLabel('Title', { exact: true });
  await input.fill(newTitle);
  within(await timeUntil(() => input.press('Enter'), row(page, kind, newTitle)), limit);
});

Then('checking the box {string} of the row {string} in the {word} table gives feedback within {int} ms', async ({ page }, column: string, title: string, kind: string, limit: number) => {
  const box = (await cell(page, kind, title, column)).getByRole('checkbox');
  within(await timeUntil(() => box.check(), box), limit);
});

Then('deleting the row {string} from the {word} table gives feedback within {int} ms', async ({ page }, title: string, kind: string, limit: number) => {
  await row(page, kind, title).locator('th.t-row').hover();
  const button = row(page, kind, title).getByRole('button', { name: 'Delete row' });
  within(await timeUntil(() => button.click(), row(page, kind, title), 'detached'), limit);
});

Then('opening the dashboard gives feedback within {int} ms', async ({ page }, limit: number) => {
  const blocks = page.locator('section.course-block').first();
  within(await timeUntil(() => page.getByRole('link', { name: 'Dashboard' }).click(), blocks), limit);
});

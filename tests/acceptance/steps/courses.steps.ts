import { expect } from '@playwright/test';
import { Given, Then, When } from '../fixtures';

Given('I am logged in as {string}', async ({ loginAs }, user: string) => {
  await loginAs(user);
});

When('I open the courses page', async ({ page }) => {
  await page.goto('/courses');
});

When('I add the course {string}', async ({ page }, title: string) => {
  await page.getByLabel('Title of a new course').fill(title);
  await page.getByRole('button', { name: 'Add course' }).click();
});

Then('I see the main page', async ({ page }) => {
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.getByRole('heading', { name: 'Courses', level: 1 })).toBeVisible();
});

Then('I see the courses {string}', async ({ page }, titles: string) => {
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(titles.split(', '));
});

Then('I see no courses', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Courses', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(0);
});

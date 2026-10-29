import { expect } from '@playwright/test';
import { Given, Then, When } from '../fixtures';

Given('I am logged in as {string}', async ({ loginAs }, user: string) => {
  await loginAs(user);
});

Given('I note the address of the course {string} of {string}', async ({ page, loginAs, notes }, title: string, user: string) => {
  await loginAs(user);
  const courses: { id: number; title: string }[] = await (await page.request.get('/api/course')).json();
  const course = courses.find((entry) => entry.title === title);
  expect(course).toBeDefined();
  notes['address'] = `/courses/${course!.id}`;
});

When('I open the courses page', async ({ page }) => {
  await page.goto('/courses');
});

When('I open the noted address', async ({ page, notes }) => {
  await page.goto(notes['address']);
});

When('I reload the page', async ({ page }) => {
  await page.reload();
});

When('I add the course {string}', async ({ page }, title: string) => {
  await page.getByLabel('Title of a new course').fill(title);
  await page.getByRole('button', { name: 'Add course' }).click();
  await expect(page.getByRole('heading', { level: 3, name: title, exact: true })).toBeVisible();
});

When('I rename the course {string} to {string}', async ({ page }, title: string, newTitle: string) => {
  await page.getByRole('button', { name: `Edit ${title}`, exact: true }).click();
  await page.getByLabel('Course title').fill(newTitle);
  await page.getByRole('button', { name: 'Save' }).click();
});

When('I delete the course {string} and {word} the confirmation', async ({ page }, title: string, answer: string) => {
  page.once('dialog', (dialog) => (answer === 'accept' ? dialog.accept() : dialog.dismiss()));
  await page.getByRole('button', { name: `Delete ${title}`, exact: true }).click();
});

When('I open the course {string}', async ({ page }, title: string) => {
  await page.locator('.nav-sub').getByRole('link', { name: title, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
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

Then('I am sent back to the courses page and see nothing of {string}', async ({ page }, title: string) => {
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.getByText(title)).toHaveCount(0);
});

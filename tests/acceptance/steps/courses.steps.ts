import { expect, Page } from '@playwright/test';
import { Given, Then, When } from '../fixtures';
import { accent, addCard, courseCard, navLink, openEditDialog } from '../locators';

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

const addCourse = async (page: Page, title: string) => {
  await page.getByLabel('Title of a new course').fill(title);
  await page.getByRole('button', { name: 'Add course' }).click();
  await expect(page.getByRole('heading', { level: 3, name: title, exact: true })).toBeVisible();
};

When('I add the course {string}', async ({ page }, title: string) => {
  await addCourse(page, title);
});

When('I add the course {string} with the tables {string}', async ({ page }, title: string, tables: string) => {
  const toggle = addCard(page).getByRole('button', { name: 'More fields' });
  if ((await toggle.getAttribute('aria-expanded')) === 'false') {
    await toggle.click();
  }
  for (const name of tables.split(', ')) {
    await addCard(page).getByLabel(name, { exact: true }).check();
  }
  await addCourse(page, title);
});

When('I expand the add card', async ({ page }) => {
  await addCard(page).getByRole('button', { name: 'More fields', expanded: false }).click();
});

When('I collapse the add card', async ({ page }) => {
  await addCard(page).getByRole('button', { name: 'More fields', expanded: true }).click();
});

When(
  'I fill the add card with {string}, the tag {string}, the description {string}, the color {string} and the hide option',
  async ({ page }, title: string, tag: string, description: string, color: string) => {
    const card = addCard(page);
    await card.getByLabel('Title of a new course').fill(title);
    await card.getByLabel(tag, { exact: true }).check();
    await card.getByLabel('Description', { exact: true }).fill(description);
    await card.getByLabel(color, { exact: true }).check();
    await card.getByLabel('Hide from the menu').check();
  },
);

When('I click the add button of the add card', async ({ page }) => {
  await addCard(page).getByRole('button', { name: 'Add course' }).click();
});

When('I add a course with a title of only spaces', async ({ page }) => {
  await page.getByLabel('Title of a new course').fill('   ');
  await page.getByRole('button', { name: 'Add course' }).click();
});

Then('the add card is collapsed', async ({ page }) => {
  await expect(addCard(page).getByRole('button', { name: 'More fields' })).toHaveAttribute('aria-expanded', 'false');
  await expect(addCard(page).getByLabel('Description', { exact: true })).toHaveCount(0);
});

Then('the add card shows the tags, the table types, the description, the color and the hide option', async ({ page }) => {
  const card = addCard(page);
  await expect(card.getByRole('group', { name: 'Tags' })).toBeVisible();
  await expect(card.getByRole('group', { name: 'Tables' })).toBeVisible();
  await expect(card.getByLabel('Description', { exact: true })).toBeVisible();
  await expect(card.getByRole('group', { name: 'Color' })).toBeVisible();
  await expect(card.getByLabel('Hide from the menu')).toBeVisible();
  // Nothing can be lost when adding, so there is no warning
  await expect(card.locator('.danger-mark')).toHaveCount(0);
});

Then(
  'the add card still has {string}, the tag {string}, the description {string}, the color {string} and the hide option',
  async ({ page }, title: string, tag: string, description: string, color: string) => {
    const card = addCard(page);
    await expect(card.getByLabel('Title of a new course')).toHaveValue(title);
    await expect(card.getByLabel(tag, { exact: true })).toBeChecked();
    await expect(card.getByLabel('Description', { exact: true })).toHaveValue(description);
    await expect(card.getByLabel(color, { exact: true })).toBeChecked();
    await expect(card.getByLabel('Hide from the menu')).toBeChecked();
  },
);

Then('the add card is expanded and empty', async ({ page }) => {
  const card = addCard(page);
  await expect(card.getByRole('button', { name: 'More fields' })).toHaveAttribute('aria-expanded', 'true');
  await expect(card.getByLabel('Title of a new course')).toHaveValue('');
  for (const box of await card.getByRole('checkbox').all()) {
    await expect(box).not.toBeChecked();
  }
  await expect(card.getByLabel('Description', { exact: true })).toHaveValue('');
  await expect(card.getByLabel('clay', { exact: true })).toBeChecked();
});

Then('the title of the add card is still {string}', async ({ page }, title: string) => {
  await expect(page.getByLabel('Title of a new course')).toHaveValue(title);
});

Then('the card of {string} shows the description {string}', async ({ page }, title: string, description: string) => {
  await expect(courseCard(page, title).locator('.card-desc')).toHaveText(description);
});

Then('the card of {string} shows no tags and has the color {string}', async ({ page }, title: string, color: string) => {
  await expect(courseCard(page, title).locator('.tag')).toHaveCount(0);
  await expect(courseCard(page, title)).toHaveCSS('background-color', await accent(page, color));
});

When('I rename the course {string} to {string}', async ({ page }, title: string, newTitle: string) => {
  const dialog = await openEditDialog(page, title);
  await dialog.getByLabel('Title', { exact: true }).fill(newTitle);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toHaveCount(0);
});

When('I rename the course {string} to {string} and cancel', async ({ page }, title: string, newTitle: string) => {
  const dialog = await openEditDialog(page, title);
  await expect(dialog.getByLabel('Description', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('group', { name: 'Color' })).toBeVisible();
  await dialog.getByLabel('Title', { exact: true }).fill(newTitle);
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
});

When('I delete the course {string} and {word} the confirmation', async ({ page }, title: string, answer: string) => {
  page.once('dialog', (dialog) => (answer === 'accept' ? dialog.accept() : dialog.dismiss()));
  await page.getByRole('button', { name: `Delete ${title}`, exact: true }).click();
});

When('I open the course {string}', async ({ page }, title: string) => {
  await (await navLink(page, title)).click();
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

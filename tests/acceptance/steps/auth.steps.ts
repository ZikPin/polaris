import { expect } from '@playwright/test';
import { Given, Then, When } from '../fixtures';

Given('I open the register page', async ({ page }) => {
  await page.goto('/register');
});

When('I register as {string} with the password {string}', async ({ page }, email: string, password: string) => {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
});

When('I log in as {string} with the password {string}', async ({ page }, email: string, password: string) => {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
});

When('I log out', async ({ page }) => {
  await page.getByRole('button', { name: 'Log out' }).click();
});

Then('I see the welcome dialog', async ({ page }) => {
  await expect(page.getByRole('dialog', { name: 'Welcome to Polaris' })).toBeVisible();
});

When('I close the welcome dialog', async ({ page }) => {
  const dialog = page.getByRole('dialog', { name: 'Welcome to Polaris' });
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toHaveCount(0);
});

Then('I see no welcome dialog', async ({ page }) => {
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

Then('I am on the login page', async ({ page }) => {
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

Then('I see an error', async ({ page }) => {
  await expect(page.getByRole('alert')).toBeVisible();
});

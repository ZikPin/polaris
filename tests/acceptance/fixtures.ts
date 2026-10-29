import { expect } from '@playwright/test';
import { createBdd, test as base } from 'playwright-bdd';
import { copyFileSync, renameSync } from 'node:fs';
import path from 'node:path';

const instance = path.resolve(__dirname, '../../instance');
const pristine = path.join(instance, 'acceptance.pristine.db');
const live = path.join(instance, 'acceptance.db');

/** The password of every seed user (backend/app/seed.py). */
export const SEED_PASSWORD = 'polaris-demo';

type Fixtures = {
  /** Puts the pristine seeded database in place before every test, so no test depends on another. */
  restoreDatabase: void;
  /** Logs in as a seed user (alice, bob or carol) without the login page. The browser keeps the session cookie. */
  loginAs: (user: string) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  restoreDatabase: [
    async ({}, use) => {
      // Copy next to the live file, then rename: the server never sees a half-written file.
      copyFileSync(pristine, `${live}.restoring`);
      renameSync(`${live}.restoring`, live);
      await use();
    },
    { auto: true },
  ],
  loginAs: async ({ page }, use) => {
    await use(async (user) => {
      const response = await page.request.post('/api/auth/login', {
        data: { email: `${user}@example.com`, password: SEED_PASSWORD },
      });
      expect(response.ok()).toBeTruthy();
    });
  },
});

export const { Given, When, Then } = createBdd(test);

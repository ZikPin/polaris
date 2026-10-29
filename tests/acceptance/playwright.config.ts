import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');

// Generates the Playwright tests from features/*.feature (`npm run acceptance` does it first).
const testDir = defineBddConfig({
  features: path.join(__dirname, 'features/*.feature'),
  steps: [path.join(__dirname, 'fixtures.ts'), path.join(__dirname, 'steps/*.ts')],
  outputDir: path.join(__dirname, '.features-gen'),
});

export default defineConfig({
  testDir,
  outputDir: path.join(__dirname, 'test-results'),
  // All tests share one database file, so they run one after the other.
  workers: 1,
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4300',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: '.venv/bin/python -m tests.acceptance.server',
      cwd: root,
      // Answers 401 without a login, which counts as started.
      url: 'http://localhost:5050/api/auth/me',
      reuseExistingServer: false,
    },
    {
      // Its own dev server on 4300, proxying /api to the acceptance backend (not to the development one).
      command: 'npx ng serve --port 4300 --proxy-config tests/acceptance/proxy.conf.json',
      cwd: root,
      url: 'http://localhost:4300',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});

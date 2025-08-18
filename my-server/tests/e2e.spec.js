// Playwright E2E tests for frontend (http://192.168.100.45:3001)
// How to run these tests:
//   1. Make sure your frontend is running and accessible at http://192.168.100.45:3001
//   2. Run the tests with:
//        npx playwright test tests/e2e.spec.js  --repeat-each=25
//      (Do NOT use just 'playwright test ...' unless Playwright is installed globally.)
//      If you see "'playwright' is not recognized", always use 'npx playwright ...'

import { test, expect } from '@playwright/test';

// Helper for login
async function doLogin(page) {
  // Go to the frontend page and perform login
  await page.goto('http://192.168.100.45:3001');
  await page.getByPlaceholder('Email').fill('admin@mybank.com');
  await page.getByPlaceholder('Password').fill('123456');
  await page.getByRole('button', { name: /Login/i }).click();
  // Wait for the login overlay to disappear
  await expect(page.locator('#auth-overlay')).toHaveCSS('display', 'none');
}

// Test: overlay hides and logout button is visible after login
test('Login hides overlay and shows logout button', async ({ page }) => {
  await doLogin(page);
  await expect(page.locator('#logout-btn')).toBeVisible();
});

// Test: main page shows correct user and bank info
test('Main page shows correct user and bank info', async ({ page }) => {
  await doLogin(page);
  await expect(page.locator('#bank-name')).toHaveText(/Bank: MyBank/);
  await expect(page.locator('#owner-name')).toHaveText(/Oleksandr/);
  await expect(page.locator('#country')).toHaveText(/Poland/);
  await expect(page.locator('#balance')).toHaveText(/[-+$]\d+/);
});

// Test: welcome message is visible
test('Welcome message is visible', async ({ page }) => {
  await doLogin(page);
  await expect(page.locator('#welcome-msg')).toContainText('Welcome to MyBank');
});

// Test: time widget displays time
test('Time widget displays time', async ({ page }) => {
  await doLogin(page);
  await expect(page.locator('#local-time')).not.toHaveText('--:--:--');
});

// Test: weather widget is visible and contains forecast link
test('Weather widget is visible and contains forecast link', async ({ page }) => {
  await doLogin(page);
  await expect(page.locator('.weather-widget-container')).toBeVisible();
  await expect(page.locator('.weather-widget-container')).toContainText('Weather forecast Warsaw 30 days');
});

// Test: currency widget is visible and contains CurrencyRate
test('Currency widget is visible and contains CurrencyRate', async ({ page }) => {
  await doLogin(page);
  await expect(page.locator('.currency-widget-container')).toBeVisible();
  await expect(page.locator('.currency-widget-container')).toContainText('CurrencyRate');
});

// Test: transaction table is not empty and has correct headers
test('Transaction table is not empty and has correct headers', async ({ page }) => {
  await doLogin(page);
  const rows = page.locator('#table tbody tr');
  // Wait for at least one row to appear (max 5s)
  await expect(rows.first()).toBeVisible({ timeout: 5000 });

  const headers = page.locator('#table thead th');
  await expect(await headers.nth(0)).toHaveText('ID');
  await expect(await headers.nth(1)).toHaveText('Type');
  await expect(await headers.nth(2)).toHaveText('Amount');
  await expect(await headers.nth(3)).toHaveText('Date');
  await expect(await headers.nth(4)).toHaveText('Time');
  await expect(await headers.nth(5)).toHaveText('Location');
});

// Test: first transaction row contains valid data
test('First transaction row contains valid data', async ({ page }) => {
  await doLogin(page);
  const rows = page.locator('#table tbody tr');
  const firstRow = rows.first();
  await expect(firstRow.locator('td').nth(0)).not.toBeEmpty(); // ID
  await expect(firstRow.locator('td').nth(1)).not.toBeEmpty(); // Type
  await expect(firstRow.locator('td').nth(2)).toHaveText(/[-+$]\d+/); // Amount with currency
  await expect(firstRow.locator('td').nth(3)).toHaveText(/\d{4}-\d{2}-\d{2}/); // Date YYYY-MM-DD
  await expect(firstRow.locator('td').nth(4)).toHaveText(/\d{2}:\d{2}:\d{2}/); // Time HH:MM:SS
  await expect(firstRow.locator('td').nth(5)).not.toBeEmpty(); // Location
});

// Test: no login error is shown after successful login
test('No login error is shown after successful login', async ({ page }) => {
  await doLogin(page);
  const error = page.locator('#login-error');
  await expect(error).toBeHidden();
});

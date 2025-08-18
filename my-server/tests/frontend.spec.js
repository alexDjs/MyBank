/**
 * Playwright Frontend UI Tests
 *
 * How to run this test:
 * 1. Make sure your frontend server is running at http://192.168.100.45:3001.
 * 2. Run the test with:
 *      npx playwright test tests/frontend.spec.js
 */

import { test, expect } from '@playwright/test';

// Helper for login on the frontend
async function doFrontendLogin(page) {
  // Open the frontend (static) server
  await page.goto('http://192.168.100.45:3001');
  await page.getByPlaceholder('Email').fill('admin@mybank.com');
  await page.getByPlaceholder('Password').fill('123456');
  await page.getByRole('button', { name: /Login/i }).click();
  await expect(page.locator('#auth-overlay')).toHaveCSS('display', 'none');
}

// Test: login form is visible and can be interacted with
test('Login form is visible and works', async ({ page }) => {
  await page.goto('http://192.168.100.45:3001');
  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
});

// Test: successful login hides overlay and shows welcome message
test('Successful login hides overlay and shows welcome', async ({ page }) => {
  await doFrontendLogin(page);
  await expect(page.locator('#welcome-msg')).toBeVisible();
  await expect(page.locator('#logout-btn')).toBeVisible();
});

// Test: after login, account info is shown
test('Account info is visible after login', async ({ page }) => {
  await doFrontendLogin(page);
  await expect(page.locator('#bank-name')).toHaveText(/Bank:/);
  await expect(page.locator('#owner-name')).toHaveText(/Owner:/);
  await expect(page.locator('#country')).toHaveText(/Country:/);
  await expect(page.locator('#balance')).toHaveText(/Balance:/);
});

// Test: widgets are visible after login
test('Widgets are visible after login', async ({ page }) => {
  await doFrontendLogin(page);
  await expect(page.locator('.weather-widget-container')).toBeVisible();
  await expect(page.locator('.currency-widget-container')).toBeVisible();
  await expect(page.locator('#local-time')).not.toHaveText('--:--:--');
});

// Test: transaction table is visible and not empty
test('Transaction table is visible and not empty', async ({ page }) => {
  await doFrontendLogin(page);
  const rows = page.locator('#table tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 5000 });
});

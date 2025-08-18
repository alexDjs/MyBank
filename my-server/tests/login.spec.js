/*
 * PLAYWRIGHT TESTS FOR MYBANK LOGIN - HOW TO RUN
 * ===============================================
 * 
 * PREREQUISITES:
 * 1. Install Node.js (if not already installed)
 * 2. Install Playwright:
 *    npm init playwright@latest
 *    OR
 *    npm install -D @playwright/test
 *    npx playwright install
 * 
 * PROJECT SETUP:
 * 1. Make sure your servers are running:
 *    - Navigate to: cd c:\Users\alexs\Desktop\TestFolder\my-server
 *    - Start servers: node start-both-servers.js
 *    - Backend should be on: http://192.168.100.45:3000
 *    - Frontend should be on: http://192.168.100.45:3001
 * 
 * HOW TO RUN TESTS:
 * 
 * 1. Run ALL tests:
 *    npx playwright test
 * 
 * 2. Run only this login test file:
 *    npx playwright test tests/login.spec.js
 * 
 * 3. Run tests with UI (visual mode):
 *    npx playwright test --ui
 * 
 * 4. Run tests in headed mode (see browser):
 *    npx playwright test --headed
 * 
 * 5. Run specific test:
 *    npx playwright test --grep "Login with correct credentials"
 * 
 * 6. Run tests and generate report:
 *    npx playwright test --reporter=html
 * 
 * 7. Debug mode:
 *    npx playwright test --debug
 * 
 * WHAT THESE TESTS CHECK:
 * - Page title loads correctly
 * - Login form elements are visible
 * - Successful login with correct credentials
 * - Error handling for wrong password
 * 
 * TROUBLESHOOTING:
 * - Make sure servers are running on correct ports
 * - Check that your computer's IP (192.168.100.45) is accessible
 * - Ensure firewall allows connections on ports 3000 and 3001
 * - Verify login credentials: admin@mybank.com / 123456
 */

// tests/login.spec.js
// Playwright tests for MyBank login page UI and authentication
import { test, expect } from '@playwright/test';

// Main page loads with correct title
test('Main page loads with correct title', async ({ page }) => {
  await page.goto('http://192.168.100.45:3001');
  await expect(page).toHaveTitle(/MyBank/i);
});

// Login form is displayed correctly
test('Login form is displayed correctly', async ({ page }) => {
  await page.goto('http://192.168.100.45:3001');
  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
});

// Login with correct credentials
test('Login with correct credentials', async ({ page }) => {
  await page.goto('http://192.168.100.45:3001');
  await page.getByPlaceholder('Email').fill('admin@mybank.com');
  await page.getByPlaceholder('Password').fill('123456');
  await page.getByRole('button', { name: /Login/i }).click();

  await expect(page.locator('#welcome-msg')).toBeVisible();
  await expect(page.locator('#welcome-msg')).toHaveText(/Welcome to MyBank!/);
  await expect(page.getByRole('heading', { name: /Balance:/i })).toBeVisible();
});

// Login with wrong password shows error
test('Login with wrong password shows error', async ({ page }) => {
  await page.goto('http://192.168.100.45:3001');
  await page.getByPlaceholder('Email').fill('admin@mybank.com');
  await page.getByPlaceholder('Password').fill('wrongpassword');
  await page.getByRole('button', { name: /Login/i }).click();

  await expect(page.getByText(/Login error: Invalid password/i)).toBeVisible();
});



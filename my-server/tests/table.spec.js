/**
 * Playwright Test: Table Row Data Verification
 *
 * ## Overview
 * This test automates the process of logging into a web application, locating a specific row in a table by its ID,
 * and verifying that all cell values in that row match the expected data. It uses Playwright for browser automation.
 *
 * ## How It Works
 * 1. **Login Automation**: The `doLogin` helper function navigates to the login page, fills in the email and password fields,
 *    clicks the login button, and waits for the authentication overlay to disappear, indicating a successful login.
 * 2. **Table Row Selection**: After logging in, the test waits for the table to be visible. It then searches for a table row (`<tr>`)
 *    in the table body (`<tbody>`) that contains a cell (`<td>`) with the text '92' (the target row ID).
 * 3. **Data Verification**: The test asserts that the row is visible, then checks each cell in the row to ensure its text matches
 *    the expected values: ID, name, amount, date, time, and country.
 *
 * ## Methods Used
 * - `doLogin(page)`: Automates the login process.
 * - `page.goto(url)`: Navigates to the specified URL.
 * - `page.getByPlaceholder()`, `page.getByRole()`: Selects input fields and buttons for interaction.
 * - `expect(locator).toHaveCSS()`: Waits for the login overlay to disappear.
 * - `page.waitForSelector()`: Waits for the table to be present in the DOM.
 * - `page.locator().filter()`: Finds the specific table row by cell content.
 * - `expect(locator).toBeVisible()`: Asserts that the row is visible.
 * - `locator.nth(index).toHaveText()`: Checks the text content of each cell.
 *
 * ## How to Run
 * 1. Install Playwright: `npm install -D @playwright/test`
 * 2. Ensure the frontend server is running at http://192.168.100.45:3001
 * 3. Run the test: `npx playwright test tests/table.spec.js`
 */

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

test('should find row with ID 92 and verify all its data', async ({ page }) => {
  await doLogin(page);

  // Wait for the table to be visible
  await page.waitForSelector('#table');

  // Find the row with ID 92
  const row = await page.locator('#table tbody tr').filter({
    has: page.locator('td', { hasText: '92' })
  }).first();

  // Assert the row is visible
  await expect(row).toBeVisible();

  // Get all cell values in the row
  const cells = row.locator('td');
  await expect(cells.nth(0)).toHaveText('92');
  await expect(cells.nth(1)).toHaveText('Updated_Monaco');
  await expect(cells.nth(2)).toHaveText('-$45');
  await expect(cells.nth(3)).toHaveText('2025-05-23');
  await expect(cells.nth(4)).toHaveText('20:48:22');
  await expect(cells.nth(5)).toHaveText('Monaco');
});

/**
 * Playwright API Test: Update Expense City
 *
 * This test fetches all expenses, selects the last one, and updates its city to "London" using a PUT request.
 * It then verifies that the update was successful.
 *
 * How to run this test:
 * 1. Make sure your backend server is running at http://localhost:3000.
 * 2. Set the TEST_TOKEN environment variable if authentication is required.
 * 3. Run the test with:
 *      npx playwright test tests/api-put.spec.js
 */

import { test, expect, request } from '@playwright/test';

// Example PUT test: update last expense's city to London
test('PUT /expenses/:id updates last expense city to London', async ({ request }) => {
  // Create a new API request context with base URL and headers
  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}`,
      'Content-Type': 'application/json'
    }
  });
  // Get all expenses
  const getRes = await context.get('/expenses');
  const expenses = await getRes.json();
  expect(Array.isArray(expenses)).toBe(true);
  const last = expenses[expenses.length - 1];
  expect(last).toBeTruthy();

  // Update city to London
  const putRes = await context.put(`/expenses/${last.id}`, {
    data: { city: 'London' }
  });
  expect(putRes.status()).toBe(200);
  const updated = await putRes.json();
  expect(updated.city).toBe('London');
  await context.dispose();
});

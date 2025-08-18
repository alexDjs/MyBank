import { test, expect, request as baseRequest } from '@playwright/test';

// Example: Playwright API DELETE test for /expenses/:id
// This test deletes the last expense in the list (if any exist).
// It registers/logins a user, but does NOT add new expenses.
//npx playwright test tests/api-delete.spec.js --repeat-each=50
//npx playwright test tests/api-delete.spec.js

const email = `user${Date.now()}@test.com`;
const password = 'pass1234';

let token = '';
let request;

test.beforeAll(async () => {
  // Create base context
  const base = await baseRequest.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  });

  // Register user
  await base.post('/register', {
    data: { email, password }
  });

  // Login user
  const loginRes = await base.post('/login', {
    data: { email, password }
  });
  const loginBody = await loginRes.json();
  token = loginBody.token || loginBody.accessToken;
  expect(token).toBeTruthy();

  // Create authorized context for tests
  request = await baseRequest.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  await base.dispose();
});

// DELETE test: delete the last expense in the list (do not add new expenses)
test('DELETE /expenses/:id deletes the last expense', async () => {
  // Get all expenses
  const getRes = await request.get('/expenses');
  expect(getRes.status()).toBe(200);
  const expenses = await getRes.json();
  // If there are no expenses, skip the test
  if (!Array.isArray(expenses) || expenses.length === 0) {
    test.skip(true, 'No expenses to delete');
    return;
  }
  // Always select the last element
  const last = expenses[expenses.length - 1];
  expect(last).toBeTruthy();

  // Delete the last expense
  const delRes = await request.delete(`/expenses/${last.id}`);
  expect([200, 204]).toContain(delRes.status());

  // Check it's gone (should not be found in the list)
  const afterRes = await request.get('/expenses');
  const afterExpenses = await afterRes.json();
  expect(afterExpenses.some(e => e.id === last.id)).toBe(false);
});

// Dispose request context after all tests
test.afterAll(async () => {
  if (request) await request.dispose();
});

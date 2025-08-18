// Playwright API integration test for /expenses
// How to run this test:
//   1. Make sure your server is running on http://localhost:3000
//   2. Run the test with:
//        npx playwright test tests/Api.spec.js
//      (Do NOT use just 'playwright test ...' unless Playwright is installed globally.)
//      If you see "'playwright' is not recognized", always use 'npx playwright ...'

import { test, expect, request } from '@playwright/test';

const email = `user${Date.now()}@test.com`;
const password = 'pass1234';

let token = '';
let context;
let authContext;

// Create a new API request context before all tests
test.beforeAll(async () => {
  context = await request.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  });
});

// Dispose API request contexts after all tests
test.afterAll(async () => {
  await context.dispose();
  if (authContext) await authContext.dispose();
});

// Test user registration (expect 201 for RESTful API)
test('Register user', async () => {
  const res = await context.post('/register', {
    data: { email, password }
  });
  expect([200, 201]).toContain(res.status());
  const body = await res.json();
  expect(body).toHaveProperty('message');
});

// Test user login and get token
test('Login user and get token', async () => {
  const res = await context.post('/login', {
    data: { email, password }
  });
  const body = await res.json();
  expect(res.status(), `Login failed: ${JSON.stringify(body)}`).toBe(200);

  token = body.accessToken || body.token;
  expect(token, 'Token should be received').toBeTruthy();

  // Create authorized context for next tests
  authContext = await request.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
});

// Test adding and reading expenses
test('Add and read expenses', async () => {
  test.skip(!token, 'No token, skipping test');

  // Add an expense (POST)
  const add = await authContext.post('/expenses', {
    data: {
      city: 'Istanbul',
      amount: 100,
      product: 'Tea',
      currency: 'TRY'
    }
  });

  expect(add.status(), 'Adding expense should return 201').toBe(201);
  const expense = await add.json();
  expect(expense).toMatchObject({
    city: 'Istanbul',
    amount: 100,
    product: 'Tea',
    currency: 'TRY'
  });
  expect(expense).toHaveProperty('id');

  // Get list of expenses (GET)
  const list = await authContext.get('/expenses');
  expect(list.status(), 'Getting expenses should return 200').toBe(200);
  const expenses = await list.json();
  expect(Array.isArray(expenses)).toBe(true);
  expect(expenses.some(e => e.id === expense.id)).toBeTruthy();

  // Optionally: Delete the expense (DELETE)
  const del = await authContext.delete(`/expenses/${expense.id}`);
  expect([200, 204]).toContain(del.status());
});

// Test that expenses endpoint requires authentication
test('Expenses endpoint requires auth', async () => {
  const res = await context.get('/expenses');
  expect([401, 403]).toContain(res.status());
});

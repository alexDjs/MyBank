import { test, expect, request as baseRequest } from '@playwright/test';

// Self-contained GET test: registers, logs in, and uses a fresh token for auth
const email = `user${Date.now()}@test.com`;
const password = 'pass1234';

let token = '';
let context;

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
  context = await baseRequest.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  await base.dispose();
});

// Example GET test: get all expenses
test('GET /expenses returns array', async () => {
  const res = await context.get('/expenses');
  expect(res.status()).toBe(200);
  const data = await res.json();
  console.log('Server response:', data); // <-- Add this line to see the server response
  expect(Array.isArray(data)).toBe(true);
});

// Dispose context after all tests
test.afterAll(async () => {
  if (context) await context.dispose();
});

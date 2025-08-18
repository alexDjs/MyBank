// Playwright test for POST /expenses (adds a new expense)
// Usage:
//   1. Set TEST_TOKEN environment variable to a valid JWT token for your API.
//      Example (Linux/macOS):
//        TEST_TOKEN=your_token npx playwright test tests/api-post.spec.js
//      Example (Windows CMD):
//        set TEST_TOKEN=your_token && npx playwright test tests/api-post.spec.js
//      Example (Windows PowerShell):
//        $env:TEST_TOKEN="your_token"; npx playwright test tests/api-post.spec.js
//   2. Make sure your server is running on http://localhost:3000

import { test, expect, request as baseRequest } from '@playwright/test';


const email = `user${Date.now()}@test.com`;
const password = 'pass1234';

let token = '';
let request;

// Example POST test: add an expense
test('POST /expenses adds new expense', async ({ playwright }) => {
  // Automatically register and login to get a valid token
  const tempContext = await playwright.request.newContext({ baseURL: 'http://localhost:3000' });
  const email = `user${Date.now()}@test.com`;
  const password = 'pass1234';
  await tempContext.post('/register', { data: { email, password } });
  const loginRes = await tempContext.post('/login', { data: { email, password } });
  const loginData = await loginRes.json();
  const token = loginData.token || loginData.accessToken;
  if (!token) throw new Error('Failed to get token via /login');

  const context = await playwright.request.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const res = await context.post('/expenses', {
    data: {
      city: 'Berlin',
      amount: 10,
      product: 'Coffee',
      currency: 'EUR'
    }
  });
  if (res.status() !== 201) {
    console.error('POST /expenses failed:', res.status());
    console.error('Response body:', await res.text());
    throw new Error('POST /expenses did not return 201. See error above.');
  }
  const data = await res.json();
  expect(data).toHaveProperty('id');
  expect(data.city).toBe('Berlin');
  await context.dispose();
  await tempContext.dispose();
});

  // If you want to automate token retrieval, you can register and login here:
  // const context = await playwright.request.newContext({ baseURL: 'http://localhost:3000' });
  // const email = `user${Date.now()}@test.com`;
  // const password = 'pass1234';
  // await context.post('/register', { data: { email, password } });
  // const loginRes = await context.post('/login', { data: { email, password } });
  // const loginData = await loginRes.json();
  // const token = loginData.token || loginData.accessToken;
  // Then use this token in extraHTTPHeaders below.

  // const context = await playwright.request.newContext({
  //   baseURL: 'http://localhost:3000',
  //   extraHTTPHeaders: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   }
  // });

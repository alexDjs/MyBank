// Playwright API integration test for /expenses
// How to run this test:
//   1. Make sure your server is running on http://localhost:3000
//   2. Run the test with:
//        npx playwright test tests/test.api.spec.js
//      (Do NOT use just 'playwright test ...' unless Playwright is installed globally.)
//      If you see "'playwright' is not recognized", always use 'npx playwright ...'

import { test, expect, request } from '@playwright/test';

const email = `user${Date.now()}@test.com`;
const password = 'pass1234';

let token = '';
let apiContext;
let expensesCreated = [];

test.beforeAll(async () => {
  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: { 'Content-Type': 'application/json' }
  });

  // Регистрация
  let res = await context.post('/register', { data: { email, password } });
  expect(res.ok()).toBeTruthy();

  // Логин
  res = await context.post('/login', { data: { email, password } });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  token = body.accessToken || body.token;
  expect(token).toBeTruthy();

  // Авторизованный контекст с токеном
  apiContext = await request.newContext({
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
});

// 1. GET - Get current expenses
test('GET current expenses', async () => {
  // Make sure apiContext is initialized
  expect(apiContext).toBeTruthy();
  const res = await apiContext.get('/expenses');
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(Array.isArray(data)).toBe(true);
});

// 2. POST - Пополнить баланс direction: in
test('Top up balance with Salary', async () => {
  const res = await apiContext.post('/expenses', {
    data: {
      type: 'Salary',
      amount: 1000,
      direction: 'in',
      location: 'Stambul'
    }
  });
  expect(res.status()).toBe(201);
  const expense = await res.json();
  expect(expense.direction).toBe('in');
  expect(expense.amount).toBe(1000);
  expect(expense.location).toBe('Stambul');
});

// 3. POST - Покупки direction: out в 4 городах по 4 покупки
test('Spend in 4 Turkish cities, 4 purchases each with amount multiples of 15..150', async () => {
  const cities = ['Istanbul', 'Ankara', 'Izmir', 'Antalya'];
  expensesCreated = [];

  for (const city of cities) {
    for (let i = 1; i <= 4; i++) {
      const baseMultiplier = Math.floor(Math.random() * 10) + 1; // 1..10
      let amount = 15 * i * baseMultiplier;
      if (amount > 150) amount = 150;

      const res = await apiContext.post('/expenses', {
        data: {
          type: `Purchase_${city}_${i}`,
          amount,
          direction: 'out',
          location: city
        }
      });

      expect(res.status()).toBe(201);
      const expense = await res.json();
      expect(expense.direction).toBe('out');
      expect(expense.location).toBe(city);
      expect(expense.amount).toBe(amount);
      expensesCreated.push(expense);
    }
  }
});

// 4. PUT - Обновить первые 5 расходов, изменить location на Monaco
test('Update first 5 expenses to Monaco', async () => {
  expect(expensesCreated.length).toBeGreaterThanOrEqual(5);

  for (let i = 0; i < 5; i++) {
    const expense = expensesCreated[i];
    const res = await apiContext.put(`/expenses/${expense.id}`, {
      data: {
        ...expense,
        location: 'Monaco',
        type: expense.type.replace(/Purchase_.*/, 'Updated_Monaco')
      }
    });
    expect(res.ok()).toBeTruthy();
    const updated = await res.json();
    expect(updated.location).toBe('Monaco');
  }
});

// 5. DELETE - Удалить последние 5 расходов
test('Delete last 5 expenses', async () => {
  expect(expensesCreated.length).toBeGreaterThanOrEqual(5);

  const toDelete = expensesCreated.slice(-5);
  for (const expense of toDelete) {
    const res = await apiContext.delete(`/expenses/${expense.id}`);
    expect([200, 204]).toContain(res.status());
  }
});

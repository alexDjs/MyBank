/*
 * K6 PERFORMANCE TEST: EXPENSE DELETE OPERATIONS
 * ==============================================
 * 
 * WHAT THIS TEST DOES:
 * Tests expense deletion functionality by creating users, adding expenses, and deleting them.
 * 
 * HOW TO RUN:
 * 1. Install k6: Download from https://k6.io/docs/get-started/installation/
 * 2. Start your server: node start-both-servers.js (in my-server folder)
 * 3. Run test: k6 run k6\delete-expense-k6.js (from my-server folder)
 *    OR: k6 run delete-expense-k6.js (from k6 folder)
 * 
 * TROUBLESHOOTING:
 * - "moduleSpecifier not found": Use k6 run k6\delete-expense-k6.js from my-server folder
 * - "k6 not recognized": Install k6 as standalone binary, not npm package
 * - "connection refused": Make sure server runs on http://localhost:3000
 */

// k6 script: adds and then deletes the last expense for a test user, 2 times in a row.
// Usage: k6 run k6\delete-expense-k6.js (from my-server folder)

import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  vus: 1,           // 1 virtual user (concurrent users)
  iterations: 2,    // repeat 2 times total
};

export default function () {
  // Generate unique user credentials for each test iteration
  // Use __VU (Virtual User ID) and __ITER (Iteration number) only inside default function!
  const EMAIL = `user${Date.now()}_${__VU}_${__ITER}@test.com`;
  const BASE_URL = 'http://localhost:3000';
  const PASSWORD = 'pass1234';

  // Step 1: Register a new test user (ignore errors if user already exists)
  const regRes = http.post(`${BASE_URL}/register`, JSON.stringify({ email: EMAIL, password: PASSWORD }), {
    headers: { 'Content-Type': 'application/json' },
  });
  console.log('Register status:', regRes.status); // Log registration result
  check(regRes, { 'register status 201 or 400': (r) => r.status === 201 || r.status === 400 });

  // Step 2: Login user and obtain authentication token
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({ email: EMAIL, password: PASSWORD }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(loginRes, { 'login status 200': (r) => r.status === 200 });
  const token = loginRes.json('token');
  if (!token) {
    console.error('No token received - cannot proceed with test');
    return;
  }

  // Step 3: Add a new expense entry to test deletion
  const addRes = http.post(`${BASE_URL}/expenses`, JSON.stringify({
    type: 'test',
    amount: 1,
    date: new Date().toISOString()
  }), {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  check(addRes, { 'add expense 201': (r) => r.status === 201 });

  // Step 4: Retrieve all expenses for the user
  const getRes = http.get(`${BASE_URL}/expenses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  check(getRes, { 'get expenses 200': (r) => r.status === 200 });
  const expenses = getRes.json();
  if (!Array.isArray(expenses) || expenses.length === 0) {
    console.log('No expenses found to delete');
    return;
  }

  // Step 5: Delete the most recently added expense
  const last = expenses[expenses.length - 1];
  const delRes = http.del(`${BASE_URL}/expenses/${last.id}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  check(delRes, { 'delete status 204 or 200': (r) => r.status === 204 || r.status === 200 });

  // Wait 1 second between iterations to avoid overwhelming the server
  sleep(1);
}
 
// k6 script: adds and then deletes the last expense for a test user, 2 times in a row.
// Usage: 
// - From my-server folder: k6 run k6\delete-expense-k6.js
// - From k6 folder: k6 run delete-expense-k6.js
// Make sure your server is running on http://localhost:3000

import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  vus: 1,           // 1 virtual user (concurrent users)
  iterations: 2,    // repeat 2 times total
};

export default function () {
  // Generate unique user credentials for each test iteration
  // Use __VU (Virtual User ID) and __ITER (Iteration number) only inside default function!
  const EMAIL = `user${Date.now()}_${__VU}_${__ITER}@test.com`;
  const BASE_URL = 'http://localhost:3000';
  const PASSWORD = 'pass1234';

  // Step 1: Register a new test user (ignore errors if user already exists)
  const regRes = http.post(`${BASE_URL}/register`, JSON.stringify({ email: EMAIL, password: PASSWORD }), {
    headers: { 'Content-Type': 'application/json' },
  });
  console.log('Register status:', regRes.status); // Log registration result
  check(regRes, { 'register status 201 or 400': (r) => r.status === 201 || r.status === 400 });

  // Step 2: Login user and obtain authentication token
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({ email: EMAIL, password: PASSWORD }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(loginRes, { 'login status 200': (r) => r.status === 200 });
  const token = loginRes.json('token');
  if (!token) {
    console.error('No token received - cannot proceed with test');
    return;
  }

  // Step 3: Add a new expense entry to test deletion
  const addRes = http.post(`${BASE_URL}/expenses`, JSON.stringify({
    type: 'test',
    amount: 1,
    date: new Date().toISOString()
  }), {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  check(addRes, { 'add expense 201': (r) => r.status === 201 });

  // Step 4: Retrieve all expenses for the user
  const getRes = http.get(`${BASE_URL}/expenses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  check(getRes, { 'get expenses 200': (r) => r.status === 200 });
  const expenses = getRes.json();
  if (!Array.isArray(expenses) || expenses.length === 0) {
    console.log('No expenses found to delete');
    return;
  }

  // Step 5: Delete the most recently added expense
  const last = expenses[expenses.length - 1];
  const delRes = http.del(`${BASE_URL}/expenses/${last.id}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  check(delRes, { 'delete status 204 or 200': (r) => r.status === 204 || r.status === 200 });

  // Wait 1 second between iterations to avoid overwhelming the server
  sleep(1);
}

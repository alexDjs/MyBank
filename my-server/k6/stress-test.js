// k6 stress test script for /register, /login, /expenses
// Usage (run test and see output in console):
//   k6 run k6/stress-test.js
// Usage (run test and save JSON report for HTML analysis):
//   k6 run --out json=stress-result.json k6/stress-test.js
// Then open the HTML report viewer and upload stress-result.json

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 10 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 },
    { duration: '10s', target: 5 },

  ],
};

export default function () {
  const unique = `${__VU}_${Math.floor(Math.random() * 1000000)}`;
  const email = `user${unique}@test.com`;
  const password = 'pass1234';

  const registerRes = http.post('http://localhost:3000/register', JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  });

  console.log(`🟢 REGISTER status: ${registerRes.status} — ${email}`);
  console.log(`🟡 Register body: ${registerRes.body}`);

  if (registerRes.status !== 201 && registerRes.status !== 200) {
    console.error(`❌ Registration failed [${registerRes.status}] for ${email}`);
    return;
  }

  // ⏳ небольшая пауза
  sleep(0.3);

  const loginRes = http.post('http://localhost:3000/login', JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  });

  console.log(`🔵 LOGIN status: ${loginRes.status} — ${email}`);
  console.log(`🟡 Login body: ${loginRes.body}`);

  if (loginRes.status !== 200) {
    console.error(`❌ Login failed [${loginRes.status}] for ${email}`);
    return;
  }

  const token = loginRes.json().token || loginRes.json().accessToken;

  if (!token) {
    console.error(`❌ No token received for ${email}`);
    return;
  }

  const res = http.get('http://localhost:3000/expenses', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(res, {
    '✅ status is 200': (r) => r.status === 200,
  });

  if (res.status !== 200) {
    console.error(`❌ /expenses failed [${res.status}] for ${email}`);
  }
}

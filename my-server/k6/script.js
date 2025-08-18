import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
};

export default function () {
  const unique = `${__VU}_${Math.floor(Math.random() * 1000000)}`;
  const email = `user${unique}@test.com`;
  const password = 'pass1234';

  // HTTP Requests: Registration
  const registerRes = http.post('http://localhost:3000/register', JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  });

  // Checks
  check(registerRes, {
    'register status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500, // Latency
    'has user id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!body.id || !!body.userId;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}

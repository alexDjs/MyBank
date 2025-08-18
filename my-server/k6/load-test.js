// k6 load test for GET /
// Usage (run test and see output in console):
//   k6 run k6/load-test.js
// Usage (run test and save JSON report for HTML analysis):
//   k6 run --out json=load-result.json k6/load-test.js
// Then open the HTML report viewer and upload load-result.json

import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 20, // 20 virtual users
  duration: "1m", // 1 minute
};

export default function () {
  const res = http.get("http://localhost:3000/");
  check(res, {
    "status is 200": (r) => r.status === 200,
  });
  if (res.status !== 200) {
    console.error(`❌ GET / failed with status ${res.status}`);
    // Most likely cause: there is no route "/" defined in your server.
    // Solution: add a route for "/" in your Express server.js:
    // app.get('/', (req, res) => res.send('OK'));
  }
}

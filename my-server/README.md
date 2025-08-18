# MyBank Project

This project is a full-stack demo banking application with automated testing and load testing. It includes a backend server, a frontend client, and a comprehensive suite of tests using Playwright and K6.

---

## Project Structure

- **Backend:** Node.js + Express REST API (`server.js`)
- **Frontend:** Static HTML/CSS/JS (served from the `public` folder)
- **Testing:**
  - **Playwright:** End-to-end (E2E), API, and frontend stress tests
  - **K6:** Load and stress testing scripts, HTML report viewer

---

## Backend

- **Tech Stack:** Node.js, Express, JWT, bcrypt, dotenv, body-parser, cors, file-based storage
- **Main File:** `server.js`
- **Features:**
  - User registration and authentication (JWT-based, password hashing with bcrypt)
  - Account and expense management (CRUD operations)
  - Data persistence in `data.json` (simple file storage, no database)
  - CORS enabled for frontend-backend communication
  - RESTful API endpoints:
    - `POST /register` — Register a new user (returns success message)
    - `POST /login` — Authenticate and get JWT token (returns `{ token }`)
    - `GET /account` — Get account info (requires Authorization header)
    - `GET /expenses` — Get all expenses (requires Authorization header)
    - `POST /expenses` — Add expense (requires Authorization header)
    - `PUT /expenses/:id` — Update expense by ID (requires Authorization header)
    - `DELETE /expenses/:id` — Delete expense by ID (requires Authorization header)
- **Security:**
  - Passwords are hashed before storage
  - JWT tokens are used for authentication and must be sent in the `Authorization` header as `Bearer <token>`
  - All sensitive configuration (like JWT secret) is managed via `.env` or environment variables

---

## Frontend

- **Tech Stack:** Static HTML, CSS, JavaScript (no frameworks)
- **Main Folder:** `public/`
- **Features:**
  - Login form with overlay and error handling
  - Account info display (bank name, owner, country, balance)
  - Transaction history table (populated from backend)
  - Real-time clock widget (Warsaw timezone)
  - Weather widget (Warsaw, via external service)
  - Currency rates widget (PLN to EUR, USD, RUB, CNY)
  - Responsive and user-friendly layout
  - Logout button and session management via `localStorage`
  - All frontend logic in `main.js` and `login.js`

---

## Automated Testing

### Playwright

- **Location:** `tests/`
- **Types of tests:**
  - **E2E tests:** Simulate real user flows (login, UI checks, transaction table, widgets, logout)
  - **API tests:** Directly test backend endpoints (register, login, expenses CRUD, auth checks)
  - **Frontend stress test:** Simulate multiple users logging in and using the frontend in parallel (using Playwright's parallel mode)
- **Example test files:**
  - `e2e.spec.js` — Main user journey and UI checks
  - `login.spec.js` — Login form and authentication scenarios
  - `Api.spec.js` — Direct API endpoint testing
  - `frontend-stress.spec.js` — Parallel login and UI checks for stress simulation
- **How to run:**
  ```sh
  npx playwright test
  # Or run a specific test file:
  npx playwright test tests/e2e.spec.js
  # For stress: (run with more workers)
  npx playwright test tests/frontend-stress.spec.js --workers=10
  ```

### K6

- **Location:** `k6/`
- **Types of tests:**
  - **Load test:** Simulate constant load on backend or frontend (`load-test.js`)
  - **Stress test:** Gradually increase load to find breaking points (`stress-test.js`)
  - **Frontend HTTP test:** Check frontend availability and content under load (by checking HTML, not JS execution)
  - **HTML report viewer:** `load-test.html` for viewing K6 JSON/NDJSON reports in browser
- **How to run:**
  ```sh
  k6 run k6/load-test.js
  k6 run k6/stress-test.js
  # Save report as JSON for later analysis:
  k6 run k6/stress-test.js --out json=stress-report.json
  # Save summary only:
  k6 run k6/stress-test.js --summary-export=summary.json
  ```
- **How to view K6 report:**
  - Open `k6/load-test.html` in your browser and upload your K6 JSON report file.

---

## How to Start

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start both backend and frontend servers with one command:**
   ```sh
   node start-both-servers.js
   ```
   - This script will start the backend on port 3000 and, after a short delay, the frontend on port 3001.
   - The terminal will display the address to open the application in your browser (usually [http://localhost:3001](http://localhost:3001) or your local network IP).

3. **(If needed) Change addresses in test files:**
   - Some Playwright and K6 test files may have hardcoded URLs (e.g., `http://localhost:3001` or your network IP).
   - If you run the servers on a different address or port, update the URLs in the test files in the `tests/` and `k6/` folders accordingly.

4. **Run tests as described above.**

---

## Project Groups

- **Backend:**  
  - `server.js` — Main backend server
  - `data.json` — Data storage (users, expenses, account)
- **Frontend:**  
  - `public/` — All static files (HTML, CSS, JS, favicon, widgets)
- **Playwright Tests:**  
  - `tests/` — All E2E, API, and stress test scripts
- **K6 Load Tests:**  
  - `k6/` — All K6 scripts and HTML report viewer
- **Utilities:**  
  - `start-both-servers.js` — Node.js script to start backend and frontend together

---

## Notes & Recommendations

- **Security:** This project is for demo/testing purposes. Do not use file-based storage or hardcoded secrets in production.
- **Data:** All data is stored in `data.json` and will persist between runs unless deleted.
- **Testing:** Playwright tests require the servers to be running and accessible at the configured addresses.
- **K6 Reports:** K6 by default outputs NDJSON (one JSON object per line). For summary, use `--summary-export`.
- **HTML Reports:** Use `k6/load-test.html` to view K6 JSON/NDJSON reports visually in your browser.
- **Customization:** You can change ports, endpoints, and test parameters as needed for your environment.

---

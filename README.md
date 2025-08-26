# MyBank — Demo Banking App

This repository contains a lightweight full‑stack demo application (Node/Express backend + static frontend) intended for API testing and UI demonstration on desktop and mobile devices.

Live demo (no download required)
- Deployed (public): https://mybank-8s6n.onrender.com

You can test the application directly using the live URL above — there is no need to clone or run the project locally unless you want to develop or run it offline. Simply send requests to the deployed URL from Postman, curl or your browser.

Repository
- Source code and history: https://github.com/alexDjs/MyBank

Purpose
- This project is a prototype for testing: it demonstrates JWT auth, CRUD operations for transactions, server logging, and a responsive UI (desktop table + mobile card layout). Data is persisted in a local JSON file (`data.json`) and is not suitable for production.

Quick start (local, optional)
Prerequisites:
- Node.js (LTS) and npm installed

If you prefer to run the app locally for development, follow these steps. Otherwise, use the live demo link above.

1. Clone the repo

```bash
git clone https://github.com/alexDjs/MyBank.git
cd MyBank
```

2. Install dependencies and start

```bash
npm install
npm start
```

3. Open the app

- In a browser go to: http://localhost:3000 (or the port printed by the server)

How to use the live demo
- Open the deployed URL: https://mybank-8s6n.onrender.com
- Register a user (or use Postman) then login to get a token used for protected API routes.

Where data is stored
- The server stores data in `data.json` at the project root. This file contains `users`, `account`, and `expenses` objects and is modified when you POST/PUT/DELETE via the API.

API endpoints (overview)
- POST /register — create a new user
- POST /login — authenticate and return a JWT token
- GET /expenses — list transactions (requires Authorization header)
- POST /expenses — create a transaction (server assigns sequential id when omitted)
- PUT /expenses/:id — update an expense
- DELETE /expenses/:id — delete an expense
- GET /account — get account summary

Authentication
- After `POST /login` you will receive a JSON response with a `token` field. Use this token in an Authorization header for protected endpoints:

```
Authorization: Bearer <token>
```

Postman / CLI examples

Register (JSON body):

```json
POST https://mybank-8s6n.onrender.com/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "secret123",
  "name": "Test User"
}
```

Login (get token):

```json
POST https://mybank-8s6n.onrender.com/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "secret123"
}
```

PowerShell example (login):

```powershell
$body = @{ email='test@example.com'; password='secret123' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'https://mybank-8s6n.onrender.com/login' -Method Post -Body $body -ContentType 'application/json'
$token = $response.token
Write-Host "Token: $token"
```

curl example (create expense):

```bash
curl -X POST "https://mybank-8s6n.onrender.com/expenses" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"Coffee","amount":-4.5,"date":"2025-08-26","time":"14:30","location":"Cafe"}'
```

Postman notes
- Create a new request collection and save the base URL `https://mybank-8s6n.onrender.com` as an environment variable.
- For protected requests, add an `Authorization` header with value `Bearer {{token}}` (store the token in an environment variable after login).

Important notes
- This project is intended for testing and demos only. Passwords are hashed, but `data.json` is not a production datastore. For production use migrate to a proper database and secure environment variables.
- If you run locally and the port is different, update the URLs accordingly.

Contact
- Repo: https://github.com/alexDjs/MyBank
- LinkedIn: https://www.linkedin.com/in/oleksandr-shchehlov/

---
This README gives a concise guide to run, test and demo the application. If you want, I can also add a ready-made Postman Collection JSON to the repo and a short `README-deploy.md` with Render deployment notes.

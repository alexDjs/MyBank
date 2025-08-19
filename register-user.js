<<<<<<< HEAD
const http = require('http');

const [,, email, password] = process.argv;

if (!email || !password) {
  console.log('Usage: node register-user.js <email> <password>');
  process.exit(1);
}

const data = JSON.stringify({ email, password });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();


// node register-user.js user2@example.com mypassword
=======
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, 'users.json');

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA, 'utf8') || '{}'); }
  catch (e) { return { users: [] }; }
}
function writeData(d) { fs.writeFileSync(DATA, JSON.stringify(d, null, 2)); }

function findUserByEmail(email) {
  const d = readData();
  return (d.users || []).find(u => u.email === email);
}

function createUser(email, password, opts = {}) {
  const d = readData();
  if (!d.users) d.users = [];
  if (findUserByEmail(email)) throw new Error('User exists');
  const user = {
    id: Date.now(),
    email,
    password, // demo only — hash passwords in production
    name: opts.name || email.split('@')[0],
    bank: opts.bank || 'MyBank',
    balance: opts.balance || 0,
    createdAt: Date.now(),
    tokens: []
  };
  d.users.push(user);
  writeData(d);
  return user;
}

function authenticate(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) return null;
  const token = require('crypto').randomUUID();
  const ts = Date.now();
  user.tokens = user.tokens || [];
  user.tokens.push({ token, createdAt: ts });
  const d = readData();
  d.users = d.users.map(u => u.email === user.email ? user : u);
  writeData(d);
  return { token, user };
}

function getUserByToken(token) {
  if (!token) return null;
  const d = readData();
  const u = (d.users || []).find(user => (user.tokens || []).some(t => t.token === token));
  if (!u) return null;
  return u;
}

function cleanup(maxAgeMs = 7 * 24 * 3600 * 1000) {
  const d = readData();
  const now = Date.now();
  if (!d.users) return;
  d.users.forEach(u => {
    if (!u.tokens) return;
    u.tokens = u.tokens.filter(t => (now - (t.createdAt || 0)) < maxAgeMs);
  });
  writeData(d);
}

module.exports = { createUser, authenticate, getUserByToken, cleanup, findUserByEmail };
>>>>>>> 5f1913e5ab8256d146bb1ead7784611a303847f4

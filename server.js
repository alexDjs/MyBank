const express = require('express');
const path = require('path');
const fs = require('fs');
const { createUser, authenticate, getUserByToken, cleanup, findUserByEmail } = require('./register-user');

const app = express();
const PORT = process.env.PORT || process.env.port || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create demo user if not exists
try {
  if (!findUserByEmail('demo@local')) {
    createUser('demo@local', 'demo123', { name: 'Oleksandr R.', balance: 78160 });
    console.log('Demo user created: demo@local / demo123');
  }
} catch (e) { console.warn(e.message); }

app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const u = createUser(email, password, { name, balance: 0 });
    res.json({ ok: true, id: u.id });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const auth = authenticate(email, password);
  if (!auth) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: auth.token });
});

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ message: 'No token' });
  const user = getUserByToken(m[1]);
  if (!user) return res.status(401).json({ message: 'Invalid token' });
  req.user = user;
  next();
}

app.get('/api/profile', requireAuth, (req, res) => {
  const u = req.user;
  res.json({ email: u.email, name: u.name, bank: u.bank, balance: u.balance });
});

app.get('/api/transactions', requireAuth, (req, res) => {
  const dataPath = path.join(__dirname, 'data.json');
  let data = { transactions: {} };
  try {
    const raw = fs.readFileSync(dataPath, 'utf8') || '{}';
    data = JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read data.json, returning empty transactions', e.message);
  }
  const txs = (data.transactions && data.transactions[req.user.email]) || [];
  res.json(txs);
});

app.post('/api/cleanup', (req, res) => {
  cleanup();
  res.json({ ok: true });
});

// periodic cleanup
setInterval(() => {
  try { cleanup(); console.log('Periodic cleanup done'); } catch (e) { console.warn(e); }
}, 6 * 3600 * 1000);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

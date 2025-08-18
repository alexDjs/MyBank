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
  console.log(`Server listening at http://0.0.0.0:${PORT}`);
});
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const data = loadData();
  const user = data.users.find(user => user.email === email);

  if (!user) return res.status(401).json({ message: 'User not found' });

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return res.status(401).json({ message: 'Invalid password' });

  // Обновляем lastActive при входе
  user.lastActive = Date.now();
  saveData(data);

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '24h' });
  res.json({ token });
});

// Middleware to check token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Received token:', token);

  if (!token) return res.status(403).json({ message: 'Access Denied' });

  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

// GET account data
app.get('/account', authenticate, (req, res) => {
  const data = loadData();
  res.json(data.account);
});

// GET all expenses
app.get('/expenses', authenticate, (req, res) => {
  const data = loadData();
  res.json(data.expenses);
});

// POST - add expense
app.post('/expenses', authenticate, (req, res) => {
  const data = loadData();
  const newExpense = {
    id: nextId.toString(),
    date: req.body.date || new Date().toISOString(),
    ...req.body
  };
  delete newExpense.date;
  newExpense.date = req.body.date || new Date().toISOString();

  nextId++;

  data.expenses.push(newExpense);
  saveData(data);
  res.status(201).json(newExpense);
});

// PUT - update expense by ID
app.put('/expenses/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const updatedExpenseData = req.body;

    const data = loadData();
    const expenseIndex = data.expenses.findIndex(exp => exp.id === id);

    if (expenseIndex === -1) {
        return res.status(404).json({ message: 'Expense not found' });
    }

    data.expenses[expenseIndex] = {
        ...data.expenses[expenseIndex],
        ...updatedExpenseData,
    };

    saveData(data);
    res.json(data.expenses[expenseIndex]);
});

// DELETE - remove expense by ID
app.delete('/expenses/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const data = loadData();
    const initialLength = data.expenses.length;
    data.expenses = data.expenses.filter(exp => exp.id !== id);

    if (data.expenses.length === initialLength) {
        return res.status(404).json({ message: 'Expense not found' });
    }

    saveData(data);
    res.status(204).send();
});

// Вспомогательные функции для temp-store
const loadTempStore = () => {
  if (!fs.existsSync(TEMP_STORE_FILE)) {
    fs.writeFileSync(TEMP_STORE_FILE, JSON.stringify({ temp: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(TEMP_STORE_FILE, 'utf8'));
};
const saveTempStore = (data) => {
  fs.writeFileSync(TEMP_STORE_FILE, JSON.stringify(data, null, 2));
};

// API: сохранить временные данные
app.post('/temp', (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ message: 'Key is required' });

  const tempData = loadTempStore();
  tempData.temp[key] = { value, timestamp: Date.now() };
  saveTempStore(tempData);

  res.json({ message: 'Temp data saved', key });
});

// API: получить временные данные по ключу
app.get('/temp/:key', (req, res) => {
  const { key } = req.params;
  const tempData = loadTempStore();
  const entry = tempData.temp[key];
  if (!entry) return res.status(404).json({ message: 'Not found' });
  res.json(entry);
});

// Получить количество пользователей (без авторизации)
app.get('/users/count', (req, res) => {
  const data = loadData();
  res.json({ count: data.users.length });
});

// Функция для очистки старых пользователей (неактивных более года)
function cleanOldUsers() {
  const data = loadData();
  const now = Date.now();
  const FIVE_DAYS_MS = 1000 * 60 * 60 * 24 * 5;
  const initialLength = data.users.length;
  data.users = data.users.filter(user => {
    // Удаляем если нет lastActive или lastActive слишком старый
    return user.lastActive && (now - user.lastActive <= FIVE_DAYS_MS);
  });
  if (data.users.length !== initialLength) {
    saveData(data);
  }
}
// cleanOldUsers(); // <-- закомментируйте или удалите эту строку

setInterval(() => {
  require('./temp-cleaner')();
  cleanOldUsers();
}, 60 * 60 * 1000); // запуск каждый час

// Add this route before app.listen(...)
app.get('/', (req, res) => {
  res.send('OK');
});

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
  // Read transactions from data.json and return transactions for the authenticated user (by email)
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

// endpoint to trigger cleanup manually (optional)
app.post('/api/cleanup', (req, res) => {
  cleanup();
  res.json({ ok: true });
});

// start periodic cleanup every 6 hours
setInterval(() => {
  try { cleanup(); console.log('Periodic cleanup done'); } catch (e) { console.warn(e); }
}, 6 * 3600 * 1000);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const SECRET_KEY = process.env.SECRET_KEY || 'secret';
const DATA_PATH = './data.json';

// ===== Helpers for working with data.json =====
function loadData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
// Эта строка была в первом коде и нужна, чтобы отдавать HTML
app.use(express.static('public'));

// ===== Register =====
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const data = loadData();

  const userExists = data.users.find(u => u.email === email);
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: String(Date.now()), email, password: hashedPassword };
  data.users.push(newUser);

  saveData(data);
  res.status(201).json({ message: 'User registered successfully' });
});

// ===== Login =====
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const data = loadData();
  const user = data.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// ===== Middleware for token verification =====
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
}

// ===== Expenses CRUD =====
app.get('/expenses', authMiddleware, (req, res) => {
  const data = loadData();
  res.json(data.expenses);
});

app.post('/expenses', authMiddleware, (req, res) => {
  const { type, amount, location, direction } = req.body;
  const data = loadData();
  const now = new Date();

  const expense = {
    id: String(Date.now()),
    type,
    amount,
    direction: direction || 'out',
    location,
    date: now.toISOString()
  };

  data.expenses.push(expense);
  if (expense.direction === 'out') data.account.balance -= Number(amount) || 0;
  else data.account.balance += Number(amount) || 0;

  saveData(data);
  res.json(expense);
});

app.put('/expenses/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const data = loadData();
  const expense = data.expenses.find(e => e.id === id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });

  Object.assign(expense, req.body);

  saveData(data);
  res.json(expense);
});

app.delete('/expenses/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const data = loadData();
  const index = data.expenses.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ message: 'Expense not found' });

  const deleted = data.expenses.splice(index, 1);
  if (deleted[0]) {
    if (deleted[0].direction === 'out') data.account.balance += Number(deleted[0].amount) || 0;
    else data.account.balance -= Number(deleted[0].amount) || 0;
  }

  saveData(data);
  res.json(deleted[0]);
});

// ===== Account =====
app.get('/account', authMiddleware, (req, res) => {
  const data = loadData();
  res.json(data.account);
});

// ===== Health-check =====
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

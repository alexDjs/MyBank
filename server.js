import fs from 'fs';
// ===== Работа с data.json =====
const DATA_PATH = './data.json';
function loadData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}
function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const SECRET_KEY = process.env.SECRET_KEY || 'secret';


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ===== Имитируем базу данных =====

let balance = 78160; // стартовый баланс

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

// ===== Middleware для проверки токена =====
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

// ===== Expenses =====

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
    date: now.toISOString() // сохраняем ISO, фронт покажет HH:mm
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
  const { type, amount, location, date, direction } = req.body;
  if (type) expense.type = type;
  if (amount) expense.amount = amount;
  if (location) expense.location = location;
  if (date) expense.date = date;
  if (direction) expense.direction = direction;
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


// ===== Баланс =====

app.get('/account', authMiddleware, (req, res) => {
  const data = loadData();
  res.json(data.account);
});

// ===== Старт сервера =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

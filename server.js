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
let users = [
  {
    email: 'admin@mybank.com',
    passwordHash: await bcrypt.hash('123456', 10) // хеш пароля
  }
];

let expenses = []; // массив расходов

// ===== Login =====
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const match = await bcrypt.compare(password, user.passwordHash);
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
  res.json(expenses);
});

app.post('/expenses', authMiddleware, (req, res) => {
  const { title, amount, city } = req.body;
  const expense = { id: expenses.length + 1, title, amount, city };
  expenses.push(expense);
  res.json(expense);
});

app.put('/expenses/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const expense = expenses.find(e => e.id === id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });

  const { title, amount, city } = req.body;
  if (title) expense.title = title;
  if (amount) expense.amount = amount;
  if (city) expense.city = city;

  res.json(expense);
});

app.delete('/expenses/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ message: 'Expense not found' });

  const deleted = expenses.splice(index, 1);
  res.json(deleted[0]);
});

// ===== Старт сервера =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

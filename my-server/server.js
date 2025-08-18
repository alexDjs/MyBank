import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import fs from 'fs';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json());

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
const DATA_FILE = 'data.json';
const TEMP_STORE_FILE = 'temp-store.json';

// Variable to store the next available ID
let nextId = 1;

// Function to load data from file
const loadData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], expenses: [], account: {} }, null, 2));
  }
  const fileData = fs.readFileSync(DATA_FILE);
  const data = JSON.parse(fileData);

  // Initialize nextId to be greater than the max ID among users and expenses
  let maxExpenseId = 0;
  if (data.expenses && data.expenses.length > 0) {
      maxExpenseId = Math.max(...data.expenses.map(exp => parseInt(exp.id)).filter(id => !isNaN(id)));
  }

  let maxUserId = 0;
  if (data.users && data.users.length > 0) {
      maxUserId = Math.max(...data.users.map(user => parseInt(user.id)).filter(id => !isNaN(id)));
  }

  nextId = Math.max(maxExpenseId, maxUserId) + 1;

  return data;
};

// Function to save data to file
const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Load data once at startup to initialize nextId
const initialData = loadData(); // No need to use initialData, loadData manages nextId

// Register a new user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const data = loadData();

  const userExists = data.users.find(user => user.email === email);
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: nextId.toString(), email, password: hashedPassword, lastActive: Date.now() };
  nextId++;

  data.users.push(newUser);
  saveData(data);

  res.status(201).json({ message: 'User registered successfully' });
});

// User login
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

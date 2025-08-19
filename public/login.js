import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

// Имитируем БД
let users = [
  { id: 1, email: 'admin@mybank.com', password: await bcrypt.hash('123456', 10), balance: 5000 }
];

let expenses = []; // { id, userId, city, item, amount, date }

// Логин
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid password' });

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware авторизации
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.userId;
    next();
  });
}

// Получение баланса
app.get('/account', auth, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  res.json({ balance: user.balance });
});

// Получение расходов
app.get('/expenses', auth, (req, res) => {
  const userExpenses = expenses.filter(e => e.userId === req.userId);
  res.json(userExpenses);
});

// Добавление расхода
app.post('/expenses', auth, (req, res) => {
  const { city, item, amount } = req.body;
  const user = users.find(u => u.id === req.userId);
  const expense = {
    id: expenses.length + 1,
    userId: req.userId,
    city,
    item,
    amount,
    date: new Date().toISOString()
  };
  expenses.push(expense);
  user.balance -= amount; // вычитаем из баланса
  res.json(expense);
});

// Обновление расхода
app.put('/expenses/:id', auth, (req, res) => {
  const expense = expenses.find(e => e.id == req.params.id && e.userId === req.userId);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });

  const user = users.find(u => u.id === req.userId);
  user.balance += expense.amount; // возвращаем старую сумму
  expense.city = req.body.city || expense.city;
  expense.item = req.body.item || expense.item;
  expense.amount = req.body.amount || expense.amount;
  user.balance -= expense.amount; // вычитаем новую сумму
  res.json(expense);
});

// Удаление расхода
app.delete('/expenses/:id', auth, (req, res) => {
  const index = expenses.findIndex(e => e.id == req.params.id && e.userId === req.userId);
  if (index === -1) return res.status(404).json({ message: 'Expense not found' });

  const user = users.find(u => u.id === req.userId);
  user.balance += expenses[index].amount; // возвращаем деньги
  expenses.splice(index, 1);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

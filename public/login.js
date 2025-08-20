const API_BASE = 'https://mybank-8s6n.onrender.com';

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('login-error');

  if (errorEl) { 
    errorEl.style.display = 'none'; 
    errorEl.textContent = ''; 
  }

  if (!email || !password) {
    if (errorEl) { 
      errorEl.textContent = 'Enter email and password'; 
      errorEl.style.display = 'block'; 
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('isLoggedIn', 'true');
      document.getElementById('auth-overlay').style.display = 'none';
      await loadExpenses(); // подгружаем таблицу расходов
    } else {
      if (errorEl) { 
        errorEl.textContent = data.message || 'Login failed'; 
        errorEl.style.display = 'block'; 
      }
    }
  } catch (err) {
    if (errorEl) { 
      errorEl.textContent = 'Network error'; 
      errorEl.style.display = 'block'; 
    }
  }
}

async function loadExpenses() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/expenses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load expenses');

    const expenses = await response.json();
    renderExpensesTable(expenses);
  } catch (err) {
    console.error('Error loading expenses:', err);
  }
}

function renderExpensesTable(expenses) {
  const tableBody = document.getElementById('expenses-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  const isMobile = window.innerWidth <= 600;
  expenses.forEach(exp => {
    if (isMobile) {
      const block = document.createElement('tr');
      block.innerHTML = `
        <td colspan="6" style="padding:0; border:none;">
          <div class="expense-card">
            <div class="expense-row"><span class="expense-label">ID</span><span class="expense-value">${exp.id}</span></div>
            <div class="expense-row"><span class="expense-label">Type</span><span class="expense-value">${exp.type}</span></div>
            <div class="expense-row"><span class="expense-label">Amount</span><span class="expense-value">${exp.amount}</span></div>
            <div class="expense-row"><span class="expense-label">Date</span><span class="expense-value">${formatDate(exp.date)}</span></div>
            <div class="expense-row"><span class="expense-label">Time</span><span class="expense-value">${formatTime(exp.date)}</span></div>
            <div class="expense-row"><span class="expense-label">Location</span><span class="expense-value">${exp.location || ''}</span></div>
          </div>
        </td>
      `;
      tableBody.appendChild(block);
    } else {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${exp.id}</td>
        <td>${exp.type}</td>
        <td>${exp.amount}</td>
        <td>${formatDate(exp.date)}</td>
        <td>${formatTime(exp.date)}</td>
        <td>${exp.location}</td>
      `;
      tableBody.appendChild(row);
    }
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}
function formatTime(dateStr) {
  const d = new Date(dateStr);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Привязка кнопки логина
const btn = document.getElementById('login-btn');
if (btn) btn.addEventListener('click', login);

// Авто-проверка: если уже залогинен, подгружаем расходы
if (localStorage.getItem('isLoggedIn') === 'true') {
  document.getElementById('auth-overlay').style.display = 'none';
  loadExpenses();
}

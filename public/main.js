const token = localStorage.getItem('token');

async function loadExpenses() {
  const res = await fetch('https://mybank-8s6n.onrender.com/expenses', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const expenses = await res.json();
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = expenses.map(e => `
    <tr>
      <td>${e.id}</td>
      <td>${e.type}</td>
      <td>${e.amount}</td>
      <td>${formatDate(e.date)}</td>
      <td>${formatTime(e.date)}</td>
      <td>${e.location}</td>
    </tr>
  `).join('');
  loadBalance();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString();
}


async function loadExpenses() {
  const res = await fetch('https://mybank-8s6n.onrender.com/expenses', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const expenses = await res.json();
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = expenses.map(e => `
    <tr>
      <td>${e.id}</td>
      <td>${e.type}</td>
      <td>${e.amount}</td>
      <td>${formatDate(e.date)}</td>
      <td>${formatTime(e.date)}</td>
      <td>${e.location}</td>
    </tr>
  `).join('');
  loadBalance();
}

// Обработчик кнопки Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    document.getElementById('auth-overlay').style.display = 'block';
    const tbody = document.querySelector('#table tbody');
    if (tbody) tbody.innerHTML = '';
    document.getElementById('balance').textContent = 'Balance: ---';
  });
}

// Автоматическое обновление таблицы и баланса каждые 10 секунд
setInterval(() => {
  if (localStorage.getItem('token')) {
    loadExpenses();
  }
}, 10000);

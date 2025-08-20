const token = localStorage.getItem('token');

async function loadExpenses() {
  try {
    const res = await fetch('https://mybank-8s6n.onrender.com/expenses', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    if (!res.ok) throw new Error('Ошибка загрузки данных: ' + res.status);
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
  } catch (err) {
    const tbody = document.querySelector('#table tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan='6' style='color:red;text-align:center;'>${err.message}</td></tr>`;
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString();
}

// Logout button handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
  document.getElementById('auth-overlay').style.display = 'flex'; // Center overlay
  // Table and balance remain visible
  });
}

// Automatic table and balance refresh every 10 seconds
setInterval(() => {
  if (localStorage.getItem('token')) {
    loadExpenses();
  }
}, 10000);

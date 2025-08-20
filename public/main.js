
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

async function loadBalance() {
  const res = await fetch('https://mybank-8s6n.onrender.com/account', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  document.getElementById('balance').textContent = `Balance: ${data.balance}`;
}

// ...existing code...

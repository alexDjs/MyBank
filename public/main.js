const token = localStorage.getItem('token');

async function loadExpenses() {
  const res = await fetch('https://mybank-8s6n.onrender.com/expenses', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const expenses = await res.json();
  const table = document.getElementById('expenses-table');
  table.innerHTML = expenses.map(e => `
    <tr>
      <td>${e.city}</td>
      <td>${e.item}</td>
      <td>${e.amount}</td>
      <td>${new Date(e.date).toLocaleString()}</td>
      <td>
        <button onclick="editExpense(${e.id})">Edit</button>
        <button onclick="deleteExpense(${e.id})">Delete</button>
      </td>
    </tr>
  `).join('');
  loadBalance();
}

async function loadBalance() {
  const res = await fetch('https://mybank-8s6n.onrender.com/account', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  document.getElementById('balance').textContent = `Balance: ${data.balance}`;
}

async function addExpense(city, item, amount) {
  await fetch('https://mybank-8s6n.onrender.com/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ city, item, amount })
  });
  loadExpenses();
}

async function deleteExpense(id) {
  await fetch(`https://mybank-8s6n.onrender.com/expenses/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  loadExpenses();
}

async function editExpense(id) {
  const city = prompt('Enter new city:');
  const item = prompt('Enter new item:');
  const amount = parseFloat(prompt('Enter new amount:'));
  if (!city || !item || isNaN(amount)) return;
  await fetch(`https://mybank-8s6n.onrender.com/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ city, item, amount })
  });
  loadExpenses();
}

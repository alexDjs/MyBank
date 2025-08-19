// main.js

// API endpoints (всегда Render)
const API_BASE = 'https://mybank-8s6n.onrender.com';
const API_EXPENSES = `${API_BASE}/expenses`;
const API_ACCOUNT = `${API_BASE}/account`;

// DOM elements
const tbody = document.querySelector('#table tbody');
const balanceEl = document.getElementById('balance');
const bankEl = document.getElementById('bank-name');
const ownerEl = document.getElementById('owner-name');
const countryEl = document.getElementById('country');
const welcomeEl = document.getElementById('welcome-msg');
const authOverlay = document.getElementById('auth-overlay');
const logoutBtn = document.getElementById('logout-btn');

// Format date and time
function formatDate(iso) {
  const d = new Date(iso);
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatTime(iso) {
  const d = new Date(iso);
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Load account and expenses
async function load() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('No token. Please login again.');
    localStorage.removeItem('isLoggedIn');
    authOverlay && (authOverlay.style.display = 'flex');
    return;
  }

  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    const [expenseRes, accountRes] = await Promise.all([
      fetch(API_EXPENSES, { headers }),
      fetch(API_ACCOUNT, { headers })
    ]);

    if (!expenseRes.ok || !accountRes.ok) throw new Error('Access error');

    const expenses = await expenseRes.json();
    const account = await accountRes.json();

    let currentBalance = account.balance;
    expenses.forEach(e => {
      if (e.direction === 'out') currentBalance -= e.amount;
      if (e.direction === 'in') currentBalance += e.amount;
    });

    // Update UI
    bankEl.textContent = `Bank: ${account.bank}`;
    ownerEl.textContent = `Owner: ${account.owner}`;
    countryEl.textContent = `Country: ${account.country}`;
    const sign = currentBalance >= 0 ? '+' : '-';
    balanceEl.textContent = `Balance: ${sign}$${Math.abs(currentBalance).toFixed(2)}`;

    balanceEl.classList.remove('amount-in', 'amount-out', 'positive', 'negative');
    if (currentBalance > 0) balanceEl.classList.add('positive');
    else if (currentBalance < 0) balanceEl.classList.add('negative');

    tbody.innerHTML = expenses.map(e => {
      const amountClass = e.direction === 'in' ? 'amount-in' : 'amount-out';
      const sign = e.direction === 'in' ? '+' : '-';
      return `
        <tr>
          <td data-label="ID">${e.id ?? ''}</td>
          <td data-label="Type">${e.type ?? ''}</td>
          <td data-label="Amount" class="${amountClass}">${sign}$${e.amount ?? ''}</td>
          <td data-label="Date">${e.date ? formatDate(e.date) : ''}</td>
          <td data-label="Time">${e.date ? formatTime(e.date) : ''}</td>
          <td data-label="Location">${e.location ?? ''}</td>
        </tr>`;
    }).join('');

    welcomeEl && (welcomeEl.style.display = 'none');
    authOverlay && (authOverlay.style.display = 'none');
    logoutBtn && (logoutBtn.style.display = 'block');

  } catch (err) {
    console.error('Error loading data:', err);
    alert('Failed to load data. Session may have expired.');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    authOverlay && (authOverlay.style.display = 'flex');
    logoutBtn && (logoutBtn.style.display = 'none');
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isLoggedIn');
  alert('You are logged out.');
  authOverlay && (authOverlay.style.display = 'flex');
  logoutBtn && (logoutBtn.style.display = 'none');
  tbody.innerHTML = '';
  balanceEl.textContent = 'Balance: 0';
  bankEl.textContent = 'Bank: -';
  ownerEl.textContent = 'Owner: -';
  countryEl.textContent = 'Country: -';
}

// DOM ready
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('isLoggedIn') === 'true') {
    authOverlay && (authOverlay.style.display = 'none');
    if (welcomeEl) {
      welcomeEl.style.display = 'block';
      setTimeout(() => {
        welcomeEl.style.display = 'none';
        load();
      }, 3000);
    } else load();
    logoutBtn && (logoutBtn.style.display = 'block');
  } else {
    authOverlay && (authOverlay.style.display = 'flex');
    welcomeEl && (welcomeEl.style.display = 'none');
    logoutBtn && (logoutBtn.style.display = 'none');
  }

  logoutBtn && logoutBtn.addEventListener('click', logout);
});

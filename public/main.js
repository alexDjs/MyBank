// --- API endpoints ---
const API_EXPENSES = 'https://mybank-8s6n.onrender.com/expenses';
const API_ACCOUNT = 'https://mybank-8s6n.onrender.com/account';

// --- DOM elements ---
const tbody = document.querySelector('#table tbody');
const balanceEl = document.getElementById('balance');
const bankEl = document.getElementById('bank-name');
const ownerEl = document.getElementById('owner-name');
const countryEl = document.getElementById('country');
const welcomeEl = document.getElementById('welcome-msg');
const authOverlay = document.getElementById('auth-overlay');
const logoutBtn = document.getElementById('logout-btn');

// --- Formatters ---
function toDateObject(value) {
  if (!value && value !== 0) return null;
  // if already a Date
  if (value instanceof Date) return value;
  // if numeric timestamp
  if (typeof value === 'number') return new Date(value);
  // if string that looks like an ISO timestamp or number
  const asNumber = Number(value);
  if (!isNaN(asNumber) && value.toString().trim() !== '') {
    // treat numeric-string as timestamp (seconds or ms)
    // heuristic: if number length <= 10 -> seconds, multiply by 1000
    if (value.toString().length <= 10) return new Date(asNumber * 1000);
    return new Date(asNumber);
  }
  // fallback: try Date parse
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(value) {
  const d = toDateObject(value);
  if (!d) return '';
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatTime(value) {
  // if value is already a short time string like '14:30' return it
  if (typeof value === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(value.trim())) return value.trim();
  const d = toDateObject(value);
  if (!d) return '';
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Format amount for display: integers without decimals, fractional with up to 2 decimals
function formatAmount(value) {
  const n = Number(value) || 0;
  if (Number.isInteger(n)) return n.toString();
  // Use locale formatting but limit to 2 decimals and trim unnecessary zeros
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// --- Load account + expenses ---
async function load() {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.removeItem('isLoggedIn');
    if (authOverlay) authOverlay.style.display = 'flex';
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

  // --- Balance: use server-provided balance (server already applies deltas)
  let currentBalance = Number(account.balance) || 0;

    // --- Update account info ---
    bankEl.textContent = `Bank: ${account.bank}`;
    ownerEl.textContent = `Owner: ${account.owner}`;
    countryEl.textContent = `Country: ${account.country}`;
    const sign = currentBalance >= 0 ? '+' : '-';
    balanceEl.textContent = `Balance: ${sign}$${Math.abs(currentBalance).toFixed(2)}`;
    balanceEl.classList.remove('positive', 'negative');
    if (currentBalance > 0) balanceEl.classList.add('positive');
    else if (currentBalance < 0) balanceEl.classList.add('negative');

    // --- Render expenses table ---
    tbody.innerHTML = expenses.map(e => {
    const amountClass = e.direction === 'in' ? 'amount-in' : 'amount-out';
    const sign = e.direction === 'in' ? '+' : '-';
  const amt = Number(e.amount) || 0;
  const amtText = `${sign}$${formatAmount(amt)}`;
    return `
        <tr>
          <td data-label="ID">${e.id ?? ''}</td>
          <td data-label="Type">${e.type ?? ''}</td>
      <td data-label="Amount" class="${amountClass}">${amtText}</td>
          <td data-label="Date">${e.date ? formatDate(e.date) : ''}</td>
          <td data-label="Time">${e.date ? formatTime(e.date) : ''}</td>
          <td data-label="Location">${e.location ?? ''}</td>
        </tr>`;
    }).join('');

    // --- UI state ---
    if (welcomeEl) welcomeEl.style.display = 'none';
    if (authOverlay) authOverlay.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';

  } catch (err) {
    console.error('Error loading data:', err);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    if (authOverlay) authOverlay.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;text-align:center;">${err.message}</td></tr>`;
  }
}

// --- Logout ---
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isLoggedIn');
  if (authOverlay) authOverlay.style.display = 'flex';
  if (logoutBtn) logoutBtn.style.display = 'none';
  tbody.innerHTML = '';
  balanceEl.textContent = 'Balance: 0';
  bankEl.textContent = 'Bank: -';
  ownerEl.textContent = 'Owner: -';
  countryEl.textContent = 'Country: -';
}

// --- Init on DOM ready ---
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('isLoggedIn') === 'true') {
    if (authOverlay) authOverlay.style.display = 'none';
    if (welcomeEl) {
      welcomeEl.style.display = 'block';
      setTimeout(() => {
        welcomeEl.style.display = 'none';
        load();
      }, 3000);
    } else {
      load();
    }
    if (logoutBtn) logoutBtn.style.display = 'block';
  } else {
    if (authOverlay) authOverlay.style.display = 'flex';
    if (welcomeEl) welcomeEl.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

// --- Auto-refresh every 10s ---
setInterval(() => {
  if (localStorage.getItem('token')) {
    load();
  }
}, 10000);

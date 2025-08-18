// main.js

// API endpoints for expenses and account
// !!! IMPORTANT: Use server IP address, not localhost !!!
const API_EXPENSES = 'http://192.168.100.45:3000/expenses';
const API_ACCOUNT = 'http://192.168.100.45:3000/account';

// DOM elements
const tbody = document.querySelector('#table tbody');
const balanceEl = document.getElementById('balance');
const bankEl = document.getElementById('bank-name');
const ownerEl = document.getElementById('owner-name');
const countryEl = document.getElementById('country');
const welcomeEl = document.getElementById('welcome-msg'); // Welcome message element
const authOverlay = document.getElementById('auth-overlay'); // Auth overlay element
const logoutBtn = document.getElementById('logout-btn'); // Logout button

// Format ISO date to YYYY-MM-DD (for displaying just the date)
function formatDate(iso) {
  const d = new Date(iso);
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Format ISO date to HH:MM:SS (for displaying just the time)
function formatTime(iso) {
  const d = new Date(iso);
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function apiGet(path) {
  const token = localStorage.getItem('authToken');
  const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
  const res = await fetch(path, { headers });
  if (res.status === 401) throw new Error('Unauthorized');
  return res.json();
}

function formatCurrency(n) {
  return (n >= 0 ? '+$' : '-$') + Math.abs(n).toFixed(2);
}

async function loadProfileAndTransactions() {
  try {
    const profile = await apiGet('/api/profile');
    document.getElementById('owner-name').textContent = 'Owner: ' + (profile.name || profile.email);
    document.getElementById('bank-name').textContent = 'Bank: ' + (profile.bank || 'MyBank');
    const balEl = document.getElementById('balance');
    balEl.textContent = 'Balance: ' + formatCurrency(profile.balance || 0);
    balEl.className = (profile.balance >= 0) ? 'positive' : 'negative';

    const data = await apiGet('/api/transactions');
    const tbody = document.querySelector('#table tbody');
    tbody.innerHTML = '';
    (data || []).forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.id}</td><td>${t.type}</td><td>${formatCurrency(t.amount)}</td><td>${t.date}</td><td>${t.time}</td><td>${t.location || ''}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.warn(e);
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('welcome-msg').style.display = 'none';
  }
}

// Load account and expenses data, update UI
async function load() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('No token. Please login again.');
    localStorage.removeItem('isLoggedIn');
    if (authOverlay) {
        authOverlay.style.display = 'flex';
    }
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  try {
    // Fetch expenses and account data in parallel
    const [expenseRes, accountRes] = await Promise.all([
      fetch(API_EXPENSES, { headers }),
      fetch(API_ACCOUNT, { headers })
    ]);

    if (!expenseRes.ok || !accountRes.ok) {
      throw new Error('Access error');
    }

    const expenses = await expenseRes.json();
    const account = await accountRes.json();

    // Calculate current balance
    let currentBalance = account.balance;
    expenses.forEach(e => {
      if (e.direction === 'out') currentBalance -= e.amount;
      if (e.direction === 'in') currentBalance += e.amount;
    });

    // Update account info in UI
    bankEl.textContent = `Bank: ${account.bank}`;
    ownerEl.textContent = `Owner: ${account.owner}`;
    countryEl.textContent = `Country: ${account.country}`;
    const sign = currentBalance >= 0 ? '+' : '-';
    balanceEl.textContent = `Balance: ${sign}$${Math.abs(currentBalance).toFixed(2)}`;
    // Set balance color class for green/red
    balanceEl.classList.remove('amount-in', 'amount-out', 'positive', 'negative');
    if (currentBalance > 0) {
      balanceEl.classList.add('positive');
    } else if (currentBalance < 0) {
      balanceEl.classList.add('negative');
    }

    // Render expenses table (add data-labels for mobile adaptation)
    tbody.innerHTML = expenses.map(e => {
      const amountClass = e.direction === 'in' ? 'amount-in' : 'amount-out';
      const sign = e.direction === 'in' ? '+' : '-';

      // Use fallback for undefined fields to avoid empty cells
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

    // Hide welcome message and auth overlay, show logout button
    if (welcomeEl) {
        welcomeEl.style.display = 'none';
    }
    if (authOverlay) {
        authOverlay.style.display = 'none';
    }
    if (logoutBtn) {
        logoutBtn.style.display = 'block';
    }

  } catch (err) {
    // Handle errors (e.g., session expired)
    console.error('Error loading data:', err);
    alert('Failed to load data. Session may have expired.');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    if (authOverlay) {
        authOverlay.style.display = 'flex';
    }
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
  }
}

// Logout function: clear session and reset UI
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    alert('You are logged out.');
    if (authOverlay) {
        authOverlay.style.display = 'flex';
    }
    // if (welcomeEl) {
    //     welcomeEl.style.display = 'block';
    // }
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
    // Clear displayed data
    tbody.innerHTML = '';
    balanceEl.textContent = 'Balance: 0';
    bankEl.textContent = 'Bank: -';
    ownerEl.textContent = 'Owner: -';
    countryEl.textContent = 'Country: -';
}

// On DOM ready, check login status and initialize UI
window.addEventListener('DOMContentLoaded', () => {
  // If logged in, show welcome, then load data
  if (localStorage.getItem('isLoggedIn') === 'true') {
    if (authOverlay) {
      authOverlay.style.display = 'none';
    }
    if (welcomeEl) {
        welcomeEl.style.display = 'block';
        setTimeout(() => {
            welcomeEl.style.display = 'none';
            load();
        }, 3000);
    } else {
        load();
    }
    if (logoutBtn) {
        logoutBtn.style.display = 'block';
    }
  } else {
    // If not logged in, show auth overlay and hide logout
    if (authOverlay) {
      authOverlay.style.display = 'flex';
    }
    if (welcomeEl) {
        welcomeEl.style.display = 'none';
    }
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
  }

  // Attach logout handler
  if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
  }
});

window.addEventListener('load', async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'inline-block';
    document.getElementById('welcome-msg').style.display = 'block';
    await loadProfileAndTransactions();
  } else {
    document.getElementById('auth-overlay').style.display = 'flex';
  }
});

// ---
// If data disappears on mobile after 4-5 seconds:
// 1. Make sure that nowhere in main.js/login.js you use setTimeout(window.location.reload()...) or setInterval(...).
// 1. Make sure that nowhere in main.js/login.js you use setTimeout(window.location.reload()...) or setInterval(...).

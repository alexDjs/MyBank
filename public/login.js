async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('login-error');

  const IS_GITHUB_PAGES = (location.hostname || '').includes('github.io') || location.pathname.startsWith('/MyBank');

  try {
    let data;
    if (IS_GITHUB_PAGES) {
      // emulate login in static demo: only accept demo credentials
      if (!(email === 'admin@mybank.com' && password === '123456')) {
        throw new Error('Invalid credentials');
      }
      data = { token: 'demo-token' };
    } else {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('isLoggedIn', 'true');
    errEl.textContent = '';
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('welcome-msg').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'inline-block';
    await loadProfileAndTransactions();
  } catch (e) {
    // show user-friendly message
    const msg = (e && e.message) ? e.message : 'Login failed';
    if (errEl) errEl.textContent = msg;
  }
}

// Logout handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isLoggedIn');
    const overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.style.display = 'flex';
    const welcome = document.getElementById('welcome-msg');
    if (welcome) welcome.style.display = 'none';
    const balanceEl = document.getElementById('balance');
    if (balanceEl) balanceEl.textContent = 'Balance: --';
    const tbody = document.querySelector('#table tbody');
    if (tbody) tbody.innerHTML = '';
  });
}

// Using loadProfileAndTransactions implementation from main.js (demo-aware)

// expose login to global scope so inline onclick handlers work
try { window.login = login; } catch (e) { /* non-browser or sandboxed environment */ }

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('login-error');

  if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Enter email and password'; errorEl.style.display = 'block'; }
    return;
  }

  try {
    const response = await fetch('https://mybank-8s6n.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('isLoggedIn', 'true');
      document.getElementById('auth-overlay').style.display = 'none';
      loadExpenses(); // подгружаем таблицу
    } else {
      if (errorEl) { errorEl.textContent = data.message || 'Login failed'; errorEl.style.display = 'block'; }
    }
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Network error'; errorEl.style.display = 'block'; }
  }
}

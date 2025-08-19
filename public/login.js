async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');

  // Clear previous error message
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  try {
    // Используем адрес Render-бэкенда
    const backend = (localStorage.getItem('backendUrl') || '').replace(/\/$/, '');
    const apiUrl = backend ? `${backend}/login` : 'https://mybank-8s6n.onrender.com/login';

    // Send login request to backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Save token and login status, hide overlay, reload page
      localStorage.setItem('token', data.token);
      localStorage.setItem('isLoggedIn', 'true');
      document.getElementById('auth-overlay').style.display = 'none';
      location.reload();
    } else {
      // Show error message from backend
      if (errorEl) {
        errorEl.textContent = `Login error: ${data.message}`;
        errorEl.style.display = 'block';
      } else {
        alert(`Login error: ${data.message}`);
      }
    }
  } catch (err) {
    // Show network error
    if (errorEl) {
      errorEl.textContent = 'Network error. Please try again later.';
      errorEl.style.display = 'block';
    } else {
      alert('Network error. Please try again later.');
    }
  }
}

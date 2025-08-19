async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');

  // Очистка предыдущей ошибки
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  try {
    // Получаем URL бэкенда из localStorage или используем дефолтный
    let backend = localStorage.getItem('backendUrl');
    if (!backend || backend.trim() === '' || backend.trim().startsWith('/')) {
      backend = 'https://mybank-8s6n.onrender.com';
    }

    const apiUrl = `${backend.replace(/\/$/, '')}/login`;

    // Отправляем POST-запрос на /login
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Успешный вход: сохраняем токен и статус
      localStorage.setItem('token', data.token);
      localStorage.setItem('isLoggedIn', 'true');

      // Скрываем overlay и перезагружаем страницу
      const overlay = document.getElementById('auth-overlay');
      if (overlay) overlay.style.display = 'none';
      location.reload();
    } else {
      // Ошибка от сервера
      const message = data.message || 'Login failed';
      if (errorEl) {
        errorEl.textContent = `Login error: ${message}`;
        errorEl.style.display = 'block';
      } else {
        alert(`Login error: ${message}`);
      }
    }
  } catch (err) {
    // Сетевая ошибка
    if (errorEl) {
      errorEl.textContent = 'Network error. Please try again later.';
      errorEl.style.display = 'block';
    } else {
      alert('Network error. Please try again later.');
    }
  }
}

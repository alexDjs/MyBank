async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('login-error');

  // Очистка предыдущей ошибки
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  // Проверка пустых полей
  if (!email || !password) {
    if (errorEl) {
      errorEl.textContent = 'Please enter email and password';
      errorEl.style.display = 'block';
    }
    return;
  }

  try {
    const backend = 'https://mybank-8s6n.onrender.com';
    const apiUrl = `${backend}/login`;

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

      // Скрываем overlay
      const overlay = document.getElementById('auth-overlay');
      if (overlay) overlay.style.display = 'none';

      // Загружаем данные аккаунта и таблицу расходов без перезагрузки
      if (typeof load === 'function') load();
    } else {
      // Ошибка от сервера
      const message = data.message || 'Login failed';
      if (errorEl) {
        errorEl.textContent = `Login error: ${message}`;
        errorEl.style.display = 'block';
      }
    }
  } catch (err) {
    // Сетевая ошибка
    if (errorEl) {
      errorEl.textContent = 'Network error. Please try again later.';
      errorEl.style.display = 'block';
    }
  }
}

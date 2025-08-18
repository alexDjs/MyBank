async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('login-error');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('authToken', data.token);
    errEl.textContent = '';
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('welcome-msg').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'inline-block';
    await loadProfileAndTransactions();
  } catch (e) {
    errEl.textContent = e.message;
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('authToken');
  document.getElementById('auth-overlay').style.display = 'flex';
  document.getElementById('welcome-msg').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'none';
  document.getElementById('balance').textContent = 'Balance: --';
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = '';
});
});
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

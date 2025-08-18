console.log('[login.js] script loaded');

async function login() {
  console.log('[login] invoked');
  const email = document.getElementById('email')?.value || '';
  const password = document.getElementById('password')?.value || '';
  const errorEl = document.getElementById('login-error');

  // Clear previous error message
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  try {
  // Use relative path so single-origin deployment works
  const apiUrl = '/login';

    console.log('[login] sending POST', apiUrl, { email });

    // Send login request to backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    // Try to parse response body safely
    let data = {};
    try { data = await response.json(); } catch (e) { console.warn('[login] failed to parse JSON', e); }

    console.log('[login] response', response.status, data);

    if (response.ok) {
      // Save token and login status, hide overlay, reload page
      localStorage.setItem('token', data.token);
      localStorage.setItem('isLoggedIn', 'true');
      document.getElementById('auth-overlay').style.display = 'none';
      // reload to trigger app flow
      location.reload();
    } else {
      // Show error message from backend
      const msg = data && data.message ? data.message : ('Login failed: ' + response.status);
      if (errorEl) {
        errorEl.textContent = `Login error: ${msg}`;
        errorEl.style.display = 'block';
      } else {
        alert(`Login error: ${msg}`);
      }
    }
  } catch (err) {
    console.error('[login] error', err);
    // Show network error
    if (errorEl) {
      errorEl.textContent = 'Network error. Please try again later.';
      errorEl.style.display = 'block';
    } else {
      alert('Network error. Please try again later.');
    }
  }
}

// Robust binding: attach handler immediately if element is present, otherwise on DOMContentLoaded
function bindLoginButton() {
  const btn = document.getElementById('login-btn');
  if (btn) {
    console.log('[login.js] binding click handler to login-btn');
    try { btn.removeEventListener('click', login); } catch (e) {}
    btn.addEventListener('click', login);
    // fallback
    btn.onclick = () => { login(); };
    return true;
  }
  return false;
}

if (!bindLoginButton()) {
  window.addEventListener('DOMContentLoaded', () => {
    bindLoginButton();
  });
}

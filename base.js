/* ============================================================
   FCAI - SOFRA  |  BASE JAVASCRIPT
   Shared utilities used on every page
   ============================================================ */

/* ── TOAST NOTIFICATION ── */
function showToast(message, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── SCROLL REVEAL ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

/* ── ACTIVE NAV LINK ── */
function setActiveNavLink() {
  const current = location.pathname.split('/').pop();
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href === current) a.classList.add('active');
  });
}

/* ── LOCAL STORAGE HELPERS ── */
const Store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { console.warn('Storage unavailable'); }
  },
  remove(key) { localStorage.removeItem(key); }
};

/* ── USER SESSION ── */
const Session = {
  getUser() { return Store.get('sofra_user'); },
  setUser(user) { Store.set('sofra_user', user); },
  logout() {
    Store.remove('sofra_user');
    window.location.href = 'EntryPage.html';
  },
  isLoggedIn() { return !!this.getUser(); },
  isAdmin() {
    const u = this.getUser();
    return u && u.role === 'admin';
  }
};

/* ── NAV ROLE-BASED VISIBILITY ── */
function applyNavRoles() {
  const user = Session.getUser();
  const favLink   = document.querySelector('nav a[href="favorites.html"]');
  const adminLink = document.querySelector('nav a[href="admin_recipes.html"]');
  if (!user) {
    if (favLink)   favLink.style.display   = 'none';
    if (adminLink) adminLink.style.display = 'none';
    return;
  }
  if (user.role !== 'admin' && adminLink) adminLink.style.display = 'none';
  if (user.role === 'admin' && favLink)   favLink.style.display   = 'none';
}

/* ── THEME TOGGLE ── */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const savedTheme = localStorage.getItem('sofra_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    toggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('sofra_theme', isLight ? 'light' : 'dark');
    toggle.innerHTML = isLight
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  });
}

/* ============================================================
   SIGN-UP PAGE
   ============================================================ */
function initSignup() {
  const form = document.querySelector('form[action="./LogIn.html"]');
  if (!form) return;

  /* --- Password strength indicator --- */
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    const strengthBar = document.createElement('div');
    strengthBar.style.cssText = `
      height: 4px; border-radius: 4px; margin-top: 6px;
      width: 0%; transition: width 0.4s ease, background 0.4s ease;
    `;

    const strengthLabel = document.createElement('small');
    strengthLabel.style.cssText = 'display:block; margin-top:3px;';

    passwordInput.insertAdjacentElement('afterend', strengthLabel);
    passwordInput.insertAdjacentElement('afterend', strengthBar);

    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      let score = 0;
      if (val.length >= 8)          score++;
      if (/[A-Z]/.test(val))        score++;
      if (/[0-9]/.test(val))        score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const levels = [
        { label: '',       color: 'transparent', width: '0%'   },
        { label: 'Weak',   color: '#e74c3c',     width: '25%'  },
        { label: 'Fair',   color: '#e67e22',     width: '50%'  },
        { label: 'Good',   color: '#f1c40f',     width: '75%'  },
        { label: 'Strong', color: '#2ecc71',     width: '100%' },
      ];

      strengthBar.style.width      = levels[score].width;
      strengthBar.style.background = levels[score].color;
      strengthLabel.textContent    = val.length ? levels[score].label : '';
      strengthLabel.style.color    = levels[score].color;
    });
  }

  /* --- Submit handler --- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username        = document.getElementById('username').value.trim();
    const email           = document.getElementById('email').value.trim();
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const isAdmin         = document.getElementById('is_admin').checked;

    // Validations
    if (username.length < 3) {
      showToast('⚠️ Username must be at least 3 characters.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('⚠️ Please enter a valid email address.'); return;
    }
    if (password.length < 8) {
      showToast('⚠️ Password must be at least 8 characters.'); return;
    }
    if (password !== confirmPassword) {
      showToast('⚠️ Passwords do not match.'); return;
    }

    // Check if username already exists
    const users = Store.get('sofra_users') || [];
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      showToast('⚠️ Username already taken. Please choose another.'); return;
    }

    // Save new user
    const newUser = {
      username,
      email,
      password,   // Phase 2: hash this on the backend
      role: isAdmin ? 'admin' : 'user'
    };
    users.push(newUser);
    Store.set('sofra_users', users);

    showToast('✅ Account created! Redirecting to login…', 2000);
    setTimeout(() => { window.location.href = './LogIn.html'; }, 2000);
  });
}

/* ============================================================
   LOGIN PAGE
   ============================================================ */
function initLogin() {
  const form = document.querySelector('form[action="homepage.html"]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      showToast('⚠️ Please fill in all fields.'); return;
    }

    // Look up user in storage
    const users = Store.get('sofra_users') || [];
    const user  = users.find(
      u => u.username.toLowerCase() === username.toLowerCase()
        && u.password === password
    );

    if (!user) {
      showToast('❌ Invalid username or password.'); return;
    }

    // Save session and redirect
    Session.setUser({ username: user.username, email: user.email, role: user.role });
    showToast(`✅ Welcome back, ${user.username}! Redirecting…`, 2000);
    setTimeout(() => { window.location.href = 'homepage.html'; }, 2000);
  });
}

/* ── INIT ON EVERY PAGE ── */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  setActiveNavLink();
  applyNavRoles();
  initScrollReveal();
  initSignup();
  initLogin();
});

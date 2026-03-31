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
  const favLink = document.querySelector('nav a[href="favorites.html"]');
  const adminLink = document.querySelector('nav a[href="admin_recipes.html"]');
  if (!user) {
    if (favLink) favLink.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
    return;
  }
  if (user.role !== 'admin' && adminLink) adminLink.style.display = 'none';
  if (user.role === 'admin' && favLink) favLink.style.display = 'none';
}

/* ── INIT ON EVERY PAGE ── */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLink();
  applyNavRoles();
  initScrollReveal();
  initThemeToggle();


/* ── THEME TOGGLE ── */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  
  // Check localStorage for saved theme
  const savedTheme = localStorage.getItem('sofra_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    toggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('sofra_theme', isLight ? 'light' : 'dark');
    toggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });
}
});

/* ============================================================
   FCAI - SOFRA  |  BASE JAVASCRIPT
   Shared utilities used on every page
   ============================================================ */

/* ── CONFIG ── */
const API_BASE = '';

/* ── RECIPES JSON LOADER ── */
const RecipesAPI = {
  _cache: null,
  async getAll() {
    if (this._cache) return this._cache;
    try {
      const res = await fetch(API_BASE + '/api/recipes/');
      if (res.ok) {
        this._cache = await res.json();
        return this._cache;
      }
    } catch {  }
    return [];
  },
  async getById(id) {
    const all = await this.getAll();
    return all.find(r => r.id === id) || null;
  }
};

/* ── CHEFS JSON LOADER ── */
const ChefsAPI = {
  _cache: null,
  async getAll() {
    if (this._cache) return this._cache;
    try {
      const res = await fetch(API_BASE + '/api/chefs/');
      this._cache = await res.json();
      return this._cache;
    } catch {
      return [];
    }
  },
  async getByName(name) {
    const all = await this.getAll();
    return all.find(c => c.name === name) || null;
  }
};

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
  const current = location.pathname.split('/').pop() || 'homepage.html';
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
  logout() {
    window.location.href = '/logout/';
  }
};

/* ── NAV ROLE-BASED VISIBILITY ── */
function applyNavRoles() {
  // Navigation visibility is now handled by Django templates (user.is_authenticated, user.is_staff)
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

/* ── FAVORITES (localStorage) ── */
const Favorites = {
  _key() {
    const user = Session.getUser();
    return user ? 'sofra_favorites_' + user.username : 'sofra_favorites';
  },
  getAll() { return Store.get(this._key()) || []; },
  add(recipeId) {
    const favs = this.getAll();
    if (!favs.includes(recipeId)) {
      favs.push(recipeId);
      Store.set(this._key(), favs);
    }
  },
  remove(recipeId) {
    Store.set(this._key(), this.getAll().filter(id => id !== recipeId));
  },
  has(recipeId) { return this.getAll().includes(recipeId); }
};

/* ── INIT ON EVERY PAGE ── */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  setActiveNavLink();
  initScrollReveal();
});

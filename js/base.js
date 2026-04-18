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
      const res = await fetch(API_BASE + '/api/recipes');
      if (res.ok) {
        this._cache = await res.json();
        return this._cache;
      }
    } catch {  }
    try {      
      const res = await fetch(API_BASE + '/recipes.json?t=' + Date.now());
      this._cache = await res.json();
      return this._cache;
    } catch {
      return [];
    }
  },
  async getById(id) {
    const all = await this.getAll();
    return all.find(r => r.id === id) || null;
  },
  async save(recipe) {
    try {
      const res = await fetch(API_BASE + '/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      });
      this._cache = null;
      return await res.json();
    } catch {
      const recipes = Store.get('sofra_recipes') || [];
      const idx = recipes.findIndex(r => r.id === recipe.id);
      if (idx !== -1) recipes[idx] = recipe; else recipes.push(recipe);
      Store.set('sofra_recipes', recipes);
      this._cache = null;
      return { success: true, recipe };
    }
  },
  async delete(id) {
    try {
      await fetch(API_BASE + '/api/recipes/' + id, { method: 'DELETE' });
      this._cache = null;
    } catch {
      const recipes = (Store.get('sofra_recipes') || []).filter(r => r.id !== id);
      Store.set('sofra_recipes', recipes);
      this._cache = null;
    }
  }
};

/* ── CHEFS JSON LOADER ── */
const ChefsAPI = {
  _cache: null,
  async getAll() {
    if (this._cache) return this._cache;
    try {
      const res = await fetch(API_BASE + '/chefs.json?t=' + Date.now());
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

/* ── SIGN-UP PAGE ── */
function initSignup() {
  const form = document.querySelector('form[action="./LogIn.html"]');
  if (!form) return;

  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    const strengthBar = document.createElement('div');
    strengthBar.style.cssText = `height:4px;border-radius:4px;margin-top:6px;width:0%;transition:width 0.4s ease,background 0.4s ease;`;
    const strengthLabel = document.createElement('small');
    strengthLabel.style.cssText = 'display:block;margin-top:3px;';
    passwordInput.insertAdjacentElement('afterend', strengthLabel);
    passwordInput.insertAdjacentElement('afterend', strengthBar);
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;
      const levels = [
        { label: '', color: 'transparent', width: '0%' },
        { label: 'Weak', color: '#e74c3c', width: '25%' },
        { label: 'Fair', color: '#e67e22', width: '50%' },
        { label: 'Good', color: '#f1c40f', width: '75%' },
        { label: 'Strong', color: '#2ecc71', width: '100%' },
      ];
      strengthBar.style.width = levels[score].width;
      strengthBar.style.background = levels[score].color;
      strengthLabel.textContent = val.length ? levels[score].label : '';
      strengthLabel.style.color = levels[score].color;
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const isAdmin = document.getElementById('is_admin').checked;
    if (username.length < 3) { showToast('⚠️ Username must be at least 3 characters.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('⚠️ Please enter a valid email address.'); return; }
    if (password.length < 8) { showToast('⚠️ Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { showToast('⚠️ Passwords do not match.'); return; }
    const users = Store.get('sofra_users') || [];
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      showToast('⚠️ Username already taken.'); return;
    }
    users.push({ username, email, password, role: isAdmin ? 'admin' : 'user' });
    Store.set('sofra_users', users);
    showToast('✅ Account created! Redirecting to login…', 2000);
    setTimeout(() => { window.location.href = './LogIn.html'; }, 2000);
  });
}

/* ── LOGIN PAGE ── */
function initLogin() {
  const form = document.querySelector('form[action="homepage.html"]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) { showToast('⚠️ Please fill in all fields.'); return; }
    const users = Store.get('sofra_users') || [];
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) { showToast('❌ Invalid username or password.'); return; }
    Session.setUser({ username: user.username, email: user.email, role: user.role });
    showToast(`✅ Welcome back, ${user.username}! Redirecting…`, 2000);
    setTimeout(() => { window.location.href = 'homepage.html'; }, 2000);
  });
}

/* ── SEED Demo RECIPES ── */
function seedDemocodedRecipes() {
    if (Store.get('sofra_hardcoded_seeded')) return;

    const hardcoded = [
        {
            id: 'RCP-HARDCODED-001',
            name: 'Macaroni Bashamel',
            course: 'main_course',
            description: 'A popular Egyptian baked pasta dish made with layers of pasta, rich meat sauce, creamy bechamel sauce, and melted mozzarella cheese.',
            imageUrl: 'images/Bashamel2.jpg',
            chef: 'Chef El Sherbiny',
            chefImg: 'https://assets.minly.com/assets/avatars/zPtgfPwF2LsozVn2g6MEl.jpg',
            adminName: 'system',
            ingredients: [
                { name: 'Minced Beef', qty: '500g' },
                { name: 'Onion', qty: '1' },
                { name: 'Garlic', qty: '3 cloves' },
                { name: 'Tomato Paste', qty: '½ cup' },
                { name: 'Butter', qty: '5 tbsp' },
                { name: 'All-Purpose Flour', qty: '5 tbsp' },
                { name: 'Whole Milk', qty: '5-6 cups' },
                { name: 'Penne Pasta', qty: '600g' },
                { name: 'Mozzarella Cheese', qty: '2 cups' }
            ],
            steps: [
                'Boil pasta in salted water until almost cooked, then drain.',
                'Cook onion and garlic in a pan until soft, add minced beef and brown.',
                'Add tomato paste, salt, pepper and water. Simmer 10 minutes.',
                'Melt butter, add flour, gradually add milk stirring to make bechamel.',
                'Layer pasta, meat sauce, bechamel in a baking dish.',
                'Bake at 180°C for 30 minutes until golden.'
            ]
        },
        {
            id: 'RCP-HARDCODED-002',
            name: 'Koshari',
            course: 'main_course',
            description: "A famous Egyptian street food made with layers of rice, pasta, and lentils, topped with a rich tomato sauce, crispy fried onions, and chickpeas.",
            imageUrl: 'images/koshary.png',
            chef: 'Chef Hassan',
            chefImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJYSpXwt07ODmH4Lw1r8uQLuTHqijHV-bZmA&s',
            adminName: 'system',
            ingredients: [
                { name: 'Brown Lentils', qty: '1 cup' },
                { name: 'Rice', qty: '1 cup' },
                { name: 'Ditalini Pasta', qty: '1 cup' },
                { name: 'Chickpeas', qty: '1 can' },
                { name: 'Onions', qty: '2 large' },
                { name: 'Garlic', qty: '4 cloves' },
                { name: 'Tomato Sauce', qty: '1 cup' },
                { name: 'White Vinegar', qty: '2 tbsp' },
                { name: 'Ground Cumin', qty: '1 tsp' }
            ],
            steps: [
                'Cook rice and lentils separately until done.',
                'Cook pasta in salted water, drain.',
                'Fry sliced onions until crispy and golden.',
                'Make tomato sauce with garlic, tomatoes, cumin and vinegar.',
                'Layer rice, lentils and pasta, top with sauce and onions.'
            ]
        },
        {
            id: 'RCP-HARDCODED-003',
            name: 'Molokhia',
            course: 'main_course',
            description: 'A traditional Egyptian dish made from finely chopped jute leaves, cooked with garlic and coriander, served over rice.',
            imageUrl: 'images/molokhya.png',
            chef: 'Chef Hassan',
            chefImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJYSpXwt07ODmH4Lw1r8uQLuTHqijHV-bZmA&s',
            adminName: 'system',
            ingredients: [
                { name: 'Molokhia Leaves', qty: '500g' },
                { name: 'Whole Chicken', qty: '1' },
                { name: 'Chicken Broth', qty: '6 cups' },
                { name: 'Garlic', qty: '6 cloves' },
                { name: 'Ground Coriander', qty: '2 tsp' },
                { name: 'Butter', qty: '2 tbsp' }
            ],
            steps: [
                'Boil chicken in broth until cooked, shred and keep broth.',
                'Add molokhia to hot broth and simmer 5-7 minutes.',
                'Fry garlic and coriander in butter until fragrant.',
                'Pour garlic mix into molokhia and stir.',
                'Serve over rice with shredded chicken.'
            ]
        },
        {
            id: 'RCP-HARDCODED-004',
            name: 'Chicken Ranch Pizza',
            course: 'main_course',
            description: 'A delicious pizza with creamy ranch sauce, grilled chicken, and melted mozzarella on a crispy crust.',
            imageUrl: 'images/chickenranch.png',
            chef: 'Chef Nadia El Sayed',
            chefImg: 'https://yt3.googleusercontent.com/wEwWYlGQVCpenDDdkc_CNYQiFHzzixW6Bd7gGlGrOlbnq3XpPzytMa3mOq48Wxcj_qOx1xmXOw=s900-c-k-c0x00ffffff-no-rj',
            adminName: 'system',
            ingredients: [
                { name: 'Pizza Dough', qty: '1 ball' },
                { name: 'Ranch Sauce', qty: '1 cup' },
                { name: 'Cooked Chicken Breast', qty: '2 cups' },
                { name: 'Mozzarella Cheese', qty: '2 cups' },
                { name: 'Bell Peppers', qty: '½ cup' },
                { name: 'Onions', qty: '½ cup' }
            ],
            steps: [
                'Preheat oven to 200°C.',
                'Roll out dough and spread ranch sauce evenly.',
                'Add shredded chicken, bell peppers and onions.',
                'Cover with mozzarella cheese.',
                'Bake 15-20 minutes until golden.'
            ]
        }
    ];

    const existing = Store.get('sofra_recipes') || [];
    Store.set('sofra_recipes', [...hardcoded, ...existing]);
    Store.set('sofra_hardcoded_seeded', true);
}
/* ── INIT ON EVERY PAGE ── */
seedDemocodedRecipes();
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  setActiveNavLink();
  applyNavRoles();
  initScrollReveal();
  initSignup();
  initLogin();
});

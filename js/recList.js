/* ============================================================
   FCAI - SOFRA  |  ALL RECIPES PAGE JS
   ============================================================ */

let allRecipes = [];
let currentFilter = 'all';
let currentView   = 'grid'; // 'grid' | 'list'

function courseLabel(course) {
  const map = { main_course: 'Main Course', appetizers: 'Appetizers', dessert: 'Dessert' };
  return map[course] || course;
}

/* ── GRID CARD ── */
function buildCard(recipe, isAdmin) {
  const isFav      = Favorites.has(recipe.id);
  const heartClass = isFav ? 'fav-active' : '';
  const heartIcon  = isFav ? 'fas fa-heart' : 'far fa-heart';
  const heartBtn = isAdmin ? '' : `
    <button class="rl-card__heart ${heartClass}" title="${isFav?'Remove from favorites':'Add to favorites'}"
            onclick="toggleFav('${recipe.id}', this)"><i class="${heartIcon}"></i></button>`;
  return `
    <div class="rl-card reveal" data-course="${recipe.course}" style="animation-delay:${Math.random()*0.3}s">
      <div class="rl-card__img-wrap">
        <img class="rl-card__img" src="${recipe.imageUrl||'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=75'}" alt="${recipe.name}"
             onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=75'">
        <span class="rl-card__course">${courseLabel(recipe.course)}</span>
        ${heartBtn}
      </div>
      <div class="rl-card__body">
        <div class="rl-card__title">${recipe.name}</div>
        <p class="rl-card__desc">${recipe.description||''}</p>
        <div class="rl-card__footer">
          <span class="rl-card__chef">
            <img class="rl-card__chef-img" src="${recipe.chefImg||''}" alt="${recipe.chef||''}" onerror="this.style.display='none'">
            ${recipe.chef||'Self-Made'}
          </span>
          <a class="rl-card__view" href="recipeInfo.html?id=${recipe.id}">View <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>`;
}

/* ── LIST / BAR ROW ── */
function buildRow(recipe, isAdmin) {
  const isFav  = Favorites.has(recipe.id);
  const heartBtn = isAdmin ? '' : `
    <button class="rl-row__heart ${isFav?'fav-active':''}" title="${isFav?'Remove from favorites':'Add to favorites'}"
            onclick="toggleFav('${recipe.id}', this)"><i class="${isFav?'fas':'far'} fa-heart"></i></button>`;
  const chefPic = recipe.chefImg ? `<img src="${recipe.chefImg}" onerror="this.style.display='none'">` : '';
  return `
    <div class="rl-row reveal" data-course="${recipe.course}">
      <img class="rl-row__img" src="${recipe.imageUrl||'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=70'}"
           alt="${recipe.name}" onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=70'">
      <div class="rl-row__info">
        <div class="rl-row__title">${recipe.name}</div>
        <div class="rl-row__meta">
          <span class="rl-row__course">${courseLabel(recipe.course)}</span>
          <span class="rl-row__chef">${chefPic}${recipe.chef||'Self-Made'}</span>
        </div>
        <p class="rl-row__desc">${(recipe.description||'').substring(0,130)}${(recipe.description||'').length>130?'…':''}</p>
      </div>
      <div class="rl-row__actions">
        ${heartBtn}
        <a class="rl-row__view" href="recipeInfo.html?id=${recipe.id}">View <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>`;
}

function renderGrid(recipes) {
  const grid  = document.getElementById('recipeGrid');
  const empty = document.getElementById('emptyState');
  const filtered = currentFilter === 'all' ? recipes : recipes.filter(r => r.course === currentFilter);

  if (!filtered.length) {
    grid.innerHTML = '';
    grid.className = 'rl-grid';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  const isAdmin = Session.isAdmin();
  if (isAdmin) document.body.classList.add('admin-view');

  if (currentView === 'list') {
    grid.className = 'rl-list';
    grid.innerHTML = filtered.map(r => buildRow(r, isAdmin)).join('');
  } else {
    grid.className = 'rl-grid';
    grid.innerHTML = filtered.map(r => buildCard(r, isAdmin)).join('');
  }
  if (typeof initScrollReveal === 'function') initScrollReveal();
}

window.toggleFav = function(recipeId, btn) {
  if (Favorites.has(recipeId)) {
    Favorites.remove(recipeId);
    btn.classList.remove('fav-active');
    btn.title = 'Add to favorites';
    btn.innerHTML = '<i class="far fa-heart"></i>';
    showToast('💔 Removed from favorites');
  } else {
    Favorites.add(recipeId);
    btn.classList.add('fav-active');
    btn.title = 'Remove from favorites';
    btn.innerHTML = '<i class="fas fa-heart"></i>';
    showToast('❤️ Added to favorites!');
  }
};

async function init() {
  const params = new URLSearchParams(window.location.search);
  const courseParam = params.get('course');
  if (courseParam) {
    currentFilter = courseParam;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.course === courseParam);
    });
  }

  try {
    allRecipes = await RecipesAPI.getAll();
    const localRecipes = Store.get('sofra_recipes') || [];
    localRecipes.forEach(lr => { if (!allRecipes.find(r => r.id === lr.id)) allRecipes.push(lr); });
  } catch {
    allRecipes = Store.get('sofra_recipes') || [];
  }

  renderGrid(allRecipes);

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.course;
      renderGrid(allRecipes);
    });
  });

  // View toggle buttons
  const gridBtn = document.getElementById('gridViewBtn');
  const listBtn = document.getElementById('listViewBtn');
  if (gridBtn && listBtn) {
    gridBtn.addEventListener('click', () => {
      currentView = 'grid';
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
      renderGrid(allRecipes);
    });
    listBtn.addEventListener('click', () => {
      currentView = 'list';
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
      renderGrid(allRecipes);
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

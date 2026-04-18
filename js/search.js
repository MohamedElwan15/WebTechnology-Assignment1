/* ============================================================
   FCAI - SOFRA  |  SEARCH PAGE JS
   ============================================================ */

let allRecipes  = [];
let activeQuery = '';
let activeCourse = 'all';
let activeChef   = 'all';

const courseMap = {
  main_course: 'Main Course',
  appetizers:  'Appetizers',
  dessert:     'Dessert'
};
function courseLabel(c) { return courseMap[c] || c; }

/* =========== returns match score and what is matched ========== */
function matchRecipe(recipe, query) {
  if (!query) return null;
  const q   = query.toLowerCase();
  const name = (recipe.name || '').toLowerCase();
  const desc = (recipe.description || '').toLowerCase();
  const chef = (recipe.chef || '').toLowerCase();
  const ings = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');

  const hits = [];

  if (name.includes(q))  hits.push({ label: 'name match', priority: 1 });
  if (ings.includes(q))  hits.push({ label: `contains ${query}`, priority: 2 });
  if (desc.includes(q))  hits.push({ label: 'in description', priority: 3 });
  if (chef.includes(q))  hits.push({ label: 'by chef', priority: 4 });

  const words = q.split(/\s+/).filter(Boolean);
  if (!hits.length && words.length > 1) {
    const allMatch = words.every(w => name.includes(w) || ings.includes(w) || desc.includes(w));
    if (allMatch) hits.push({ label: 'partial match', priority: 3 });
  }

  return hits.length ? { recipe, hit: hits[0] } : null;
}

function highlight(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<span class="hl">$1</span>');
}

/* ========= Build Result row HTML ========= */
function buildResultRow(recipe, query, delay) {
  const chefHtml = recipe.chef
    ? `<span class="result-row__chef"><img src="${recipe.chefImg||''}" onerror="this.style.display='none'">${recipe.chef}</span>`
    : `<span class="result-row__chef">Self-Made</span>`;

  const matchLabel = query
    ? matchRecipe(recipe, query)?.hit?.label || ''
    : '';

  const hlName = highlight(recipe.name, query);
  const snippet = (recipe.description || '').substring(0, 120) + ((recipe.description||'').length > 120 ? '…' : '');
  const hlSnippet = highlight(snippet, query);

  return `
    <a class="result-row" href="recipeInfo.html?id=${recipe.id}" style="animation-delay:${delay}s">
      <img class="result-row__img"
           src="${recipe.imageUrl || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=70'}"
           alt="${recipe.name}"
           onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=70'">
      <div class="result-row__body">
        <div class="result-row__name">${hlName}</div>
        <div class="result-row__meta">
          <span class="result-row__badge">${courseLabel(recipe.course)}</span>
          ${chefHtml}
          ${matchLabel ? `<span class="result-row__match"><i class="fas fa-check-circle"></i> ${matchLabel}</span>` : ''}
        </div>
        <p class="result-row__desc">${hlSnippet}</p>
      </div>
      <i class="fas fa-chevron-right result-row__arrow"></i>
    </a>`;
}

/* ======== Render Results ======= */
function renderResults() {
  const list   = document.getElementById('resultsList');
  const status = document.getElementById('searchStatus');
  const empty  = document.getElementById('emptyState');

  let candidates = allRecipes;

  // Apply course filter
  if (activeCourse !== 'all') {
    candidates = candidates.filter(r => r.course === activeCourse);
  }
  // Apply chef filter
  if (activeChef !== 'all') {
    if (activeChef === '__selfmade__') {
      candidates = candidates.filter(r => !r.chef || r.chef === '');
    } else {
      candidates = candidates.filter(r => r.chef === activeChef);
    }
  }
  // Apply text search
  let results;
  if (activeQuery.trim()) {
    results = candidates
      .map(r => matchRecipe(r, activeQuery.trim()))
      .filter(Boolean)
      .sort((a, b) => a.hit.priority - b.hit.priority)
      .map(m => m.recipe);
  } else {
    results = candidates;
  }

  if (!results.length) {
    list.innerHTML   = '';
    empty.style.display = 'block';
    if (activeQuery) {
      document.querySelector('.search-empty h3').textContent = `No results for "${activeQuery}"`;
      document.querySelector('.search-empty p').textContent  = 'Try searching by ingredient, dish name, or a chef\'s name.';
    } else {
      document.querySelector('.search-empty h3').textContent = 'No recipes match these filters.';
      document.querySelector('.search-empty p').textContent  = 'Try a different course or chef filter.';
    }
    status.innerHTML = '';
    return;
  }

  empty.style.display = 'none';

  if (activeQuery) {
    status.innerHTML = `Found <strong>${results.length}</strong> result${results.length !== 1 ? 's' : ''} for "<strong>${activeQuery}</strong>"`;
  } else {
    status.innerHTML = `Showing <strong>${results.length}</strong> recipe${results.length !== 1 ? 's' : ''}`;
  }

  list.innerHTML = results.map((r, i) => buildResultRow(r, activeQuery.trim(), i * 0.04)).join('');
}

/* ========== Build Chef Filter Buttons dynamically ======== */
async function buildChefFilters() {
  const container = document.getElementById('chefFilters');
  if (!container) return;

  let chefs = [];
  try { chefs = await ChefsAPI.getAll(); } catch {  }

  const selfMadeBtn = `<button class="sf-btn" data-chef="__selfmade__">Self-Made</button>`;
  const chefBtns = chefs.map(c => `<button class="sf-btn" data-chef="${c.name}">${c.name}</button>`).join('');
  container.insertAdjacentHTML('beforeend', chefBtns + selfMadeBtn);

  container.querySelectorAll('.sf-btn[data-chef]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('chefAllBtn').classList.remove('active');
      container.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeChef = btn.dataset.chef;
      renderResults();
    });
  });

  const chefAllBtn = document.getElementById('chefAllBtn');
  if (chefAllBtn) {
    chefAllBtn.addEventListener('click', () => {
      chefAllBtn.classList.add('active');
      container.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('active'));
      activeChef = 'all';
      renderResults();
    });
  }
}

/* ===== Init =====*/
async function init() {
  try {
    allRecipes = await RecipesAPI.getAll();
    const local = Store.get('sofra_recipes') || [];
    local.forEach(lr => { if (!allRecipes.find(r => r.id === lr.id)) allRecipes.push(lr); });
  } catch {
    allRecipes = Store.get('sofra_recipes') || [];
  }

  await buildChefFilters();

  const input     = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearBtn  = document.getElementById('clearBtn');


  searchBtn.addEventListener('click', () => {
    activeQuery = input.value.trim();
    clearBtn.style.display = activeQuery ? 'inline-flex' : 'none';
    renderResults();
  });

  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      activeQuery = input.value.trim();
      clearBtn.style.display = activeQuery ? 'inline-flex' : 'none';
      renderResults();
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    activeQuery = '';
    clearBtn.style.display = 'none';
    renderResults();
  });

  document.querySelectorAll('.sf-btn[data-course]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sf-btn[data-course]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCourse = btn.dataset.course;
      renderResults();
    });
  });

  document.getElementById('emptyState').style.display = 'none';
  renderResults();
}

document.addEventListener('DOMContentLoaded', init);

/* ============================================================
   FCAI - SOFRA  |  FAVORITES PAGE JS
   ============================================================ */

function courseLabel(c) {
  return { main_course: 'Main Course', appetizers: 'Appetizers', dessert: 'Dessert' }[c] || c;
}

function buildFavCard(recipe) {
  return `
    <div class="fav-card" id="fav-${recipe.id}">
      <div class="fav-card__img-wrap">
        <img class="fav-card__img"
             src="${recipe.imageUrl || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=75'}"
             alt="${recipe.name}"
             onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=75'">
        <span class="fav-card__course">${courseLabel(recipe.course)}</span>
        <button class="fav-card__remove"
                title="Remove from favorites"
                onclick="removeFav('${recipe.id}')">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
      <div class="fav-card__body">
        <div class="fav-card__title">${recipe.name}</div>
        <p class="fav-card__desc">${recipe.description || ''}</p>
        <div class="fav-card__footer">
          <span class="fav-card__chef">
            <img class="fav-card__chef-img"
                 src="${recipe.chefImg || ''}"
                 alt="${recipe.chef || ''}"
                 onerror="this.style.display='none'">
            ${recipe.chef || ''}
          </span>
          <a class="fav-card__view" href="recipeInfo.html?id=${recipe.id}">
            View <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>`;
}

window.removeFav = function (recipeId) {
  Favorites.remove(recipeId);

  // Animate card out
  const card = document.getElementById(`fav-${recipeId}`);
  if (card) {
    card.style.transition = 'all 0.35s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.88)';
    setTimeout(() => {
      card.remove();
      // Show empty state if no cards remain
      if (!document.querySelector('.fav-card')) {
        document.getElementById('favEmpty').style.display = 'block';
        document.getElementById('favGrid').style.display = 'none';
      }
    }, 350);
  }
  showToast('🗑️ Removed from favorites');
};

async function init() {
  const loading = document.getElementById('favLoading');
  const empty   = document.getElementById('favEmpty');
  const grid    = document.getElementById('favGrid');

  const favIds = Favorites.getAll();

  if (!favIds.length) {
    loading.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  // Load all recipes, then filter to saved ones
  let allRecipes = [];
  try {
    allRecipes = await RecipesAPI.getAll();
    // Merge localStorage recipes
    const local = Store.get('sofra_recipes') || [];
    local.forEach(lr => {
      if (!allRecipes.find(r => r.id === lr.id)) allRecipes.push(lr);
    });
  } catch {
    allRecipes = Store.get('sofra_recipes') || [];
  }

  const favRecipes = favIds
    .map(id => allRecipes.find(r => r.id === id))
    .filter(Boolean);

  loading.style.display = 'none';

  if (!favRecipes.length) {
    empty.style.display = 'block';
    return;
  }

  grid.innerHTML = favRecipes.map(buildFavCard).join('');
}

document.addEventListener('DOMContentLoaded', init);

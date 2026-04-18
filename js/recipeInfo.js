/* ============================================================
   FCAI - SOFRA  |  RECIPE INFO TEMPLATE JS
   ============================================================ */

let currentRecipe = null;

function courseLabel(course) {
  const map = { main_course: 'Main Course', appetizers: 'Appetizers', dessert: 'Dessert' };
  return map[course] || course;
}

function renderFavBtn(recipe) {
  if (Session.isAdmin()) return;
  const btn = document.getElementById('favBtn');
  if (!btn) return;
  btn.style.display = 'flex';
  updateFavBtn(btn, recipe.id);
}

function updateFavBtn(btn, recipeId) {
  const isFav = Favorites.has(recipeId);
  btn.classList.toggle('fav-active', isFav);
  btn.innerHTML = isFav
    ? '<i class="fas fa-heart"></i><span>Remove from Favorites</span>'
    : '<i class="far fa-heart"></i><span>Add to Favorites</span>';
}

window.handleFav = function () {
  if (!currentRecipe) return;
  if (Favorites.has(currentRecipe.id)) {
    Favorites.remove(currentRecipe.id);
    showToast('💔 Removed from favorites');
  } else {
    Favorites.add(currentRecipe.id);
    showToast('❤️ Added to favorites!');
  }
  updateFavBtn(document.getElementById('favBtn'), currentRecipe.id);
};

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showNotFound();
    return;
  }

  let recipe = await RecipesAPI.getById(id);
  if (!recipe) {
    const local = Store.get('sofra_recipes') || [];
    recipe = local.find(r => r.id === id) || null;
  }

  if (!recipe) {
    showNotFound();
    return;
  }

  currentRecipe = recipe;
  renderRecipe(recipe);
}

function showNotFound() {
  document.getElementById('notFound').style.display = 'block';
  document.getElementById('recipeContent').style.display = 'none';
  document.getElementById('heroTitle').textContent = 'Recipe Not Found';
}

function renderRecipe(recipe) {
  document.title = `FCAI - SOFRA | ${recipe.name}`;

  const heroImg = document.getElementById('heroImg');
  if (recipe.imageUrl) {
    heroImg.style.backgroundImage = `url('${recipe.imageUrl}')`;
  } else {
    heroImg.style.background = 'linear-gradient(135deg, #1a0a00, #2a1000)';
  }
  document.getElementById('heroCourse').textContent = courseLabel(recipe.course);
  document.getElementById('heroTitle').textContent = recipe.name;

  if (recipe.chef) {
    document.getElementById('heroChef').innerHTML = `
      <img src="${recipe.chefImg || ''}" alt="${recipe.chef}"
           onerror="this.style.display='none'">
      <span>By ${recipe.chef}</span>`;
  }

  // Description
  document.getElementById('recipeDesc').textContent = recipe.description || '';

  // Ingredients
  const ingList = document.getElementById('recipeIngredients');
  if (recipe.ingredients && recipe.ingredients.length) {
    ingList.innerHTML = recipe.ingredients.map(ing => `
      <li>
        <span class="ri-ing-name">${ing.name}</span>
        <span class="ri-ing-qty">${ing.qty}</span>
      </li>`).join('');
  } else {
    ingList.innerHTML = '<li style="color:var(--clr-muted)">No ingredients listed.</li>';
  }

  // Steps
  const stepList = document.getElementById('recipeSteps');
  if (recipe.steps && recipe.steps.length) {
    stepList.innerHTML = recipe.steps.map(step => `<li>${step}</li>`).join('');
  } else {
    stepList.innerHTML = '<li style="color:var(--clr-muted)">No steps listed.</li>';
  }

  // Show content
  document.getElementById('recipeContent').style.display = 'block';

  renderFavBtn(recipe);

  if (typeof initScrollReveal === 'function') {
    setTimeout(initScrollReveal, 80);
  }
}

document.addEventListener('DOMContentLoaded', init);

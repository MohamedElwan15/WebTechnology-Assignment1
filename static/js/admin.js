const RecipeStore = {
  getAll() {
    return Store.get('sofra_recipes') || [];
  },
  save(recipes) {
    Store.set('sofra_recipes', recipes);
  },
  add(recipe) {
    const recipes = this.getAll();
    recipes.push(recipe);
    this.save(recipes);
  },
  update(id, updated) {
    const recipes = this.getAll().map(r => r.id === id ? Object.assign({}, r, updated) : r);
    this.save(recipes);
  },
  delete(id) {
    this.save(this.getAll().filter(r => r.id !== id));
  },
  getById(id) {
    return this.getAll().find(r => r.id === id) || null;
  },
  getForCurrentAdmin() {
    const user = Session.getUser();
    if (!user) return [];
    return this.getAll().filter(r => r.adminName === user.username);
  },
  generateId() {
    return 'RCP-' + Date.now();
  }
};

async function saveRecipeToServer(recipe) {
  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe)
    });
    if (res.ok) {
      const isEdit = RecipeStore.getById(recipe.id);
      if (isEdit) RecipeStore.update(recipe.id, recipe);
      else RecipeStore.add(recipe);
      return true;
    }
  } catch {
  }
  const isEdit = RecipeStore.getById(recipe.id);
  if (isEdit) RecipeStore.update(recipe.id, recipe);
  else RecipeStore.add(recipe);
  return true;
}

async function deleteRecipeFromServer(id) {
  try {
    await fetch('/api/recipes/' + id, { method: 'DELETE' });
  } catch {}
  RecipeStore.delete(id);
}

function initDashboard() {
  const tableBody = document.getElementById('recipesTableBody');
  if (!tableBody) return;

  const user = Session.getUser();
  if (!user) {
    showToast('You must be logged in.');
    setTimeout(() => { window.location.href = 'EntryPage.html'; }, 1500);
    return;
  }

  renderTable();

  let pendingDeleteId = null;
  const modal      = document.getElementById('deleteModal');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const cancelBtn  = document.getElementById('cancelDeleteBtn');

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    pendingDeleteId = null;
  });

  confirmBtn.addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    await deleteRecipeFromServer(pendingDeleteId);
    modal.style.display = 'none';
    pendingDeleteId = null;
    showToast('Recipe deleted.');
    renderTable();
  });

  window.requestDelete = function (id, name) {
    pendingDeleteId = id;
    document.getElementById('deleteModalMsg').textContent =
      `Are you sure you want to delete "${name}"?`;
    modal.style.display = 'flex';
  };

  function renderTable() {
    const recipes = RecipeStore.getForCurrentAdmin();
    const emptyEl = document.getElementById('emptyState');

    if (!recipes.length) {
      tableBody.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    tableBody.innerHTML = recipes.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.course}</td>
        <td>${r.imageUrl ? `<img src="${r.imageUrl}" alt="${r.name}" width="80" style="border-radius:6px;">` : 'No image'}</td>
        <td>
          <a href="admin_add.html?id=${r.id}" style="color:var(--clr-orange);font-weight:600;">
            <i class="fas fa-pencil-alt"></i> Edit
          </a>
          &nbsp;&nbsp;
          <button type="button" class="action-btn-delete"
                  onclick="requestDelete('${r.id}', '${r.name.replace(/'/g, "\\'")}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>`).join('');
  }
}

function initRecipeForm() {
  const form = document.getElementById('addRecipeForm');
  if (!form) return;

  const user = Session.getUser();
  if (!user) {
    showToast('You must be logged in.');
    setTimeout(() => { window.location.href = 'EntryPage.html'; }, 1500);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');
  const isEdit = editId !== null;

  const chefSelect = document.getElementById('chefSelect');
  const chefHint   = document.getElementById('chefHint');
  let chefsData    = [];

  ChefsAPI.getAll().then(chefs => {
    chefsData = chefs;
  });

  if (chefSelect) {
    chefSelect.addEventListener('change', () => {
      const selectedName = chefSelect.value;
      const chef = chefsData.find(c => c.name === selectedName);
      chefHint.textContent = chef ? `Specialty: ${chef.specialty}` : 'Recipe will not appear on any chef profile.';
    });
  }

  if (isEdit) {
    document.querySelector('h1').innerHTML = '<i class="fas fa-pencil-alt"></i> Edit Recipe';
    document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Save Changes';

    const recipe = RecipeStore.getById(editId);
    if (!recipe) {
      showToast('Recipe not found.');
      setTimeout(() => { window.location.href = 'admin_recipes.html'; }, 1500);
      return;
    }

    document.getElementById('recipeId').value    = recipe.id;
    document.getElementById('Recipe_name').value  = recipe.name;
    document.getElementById('Descriptionn').value = recipe.description;
    document.getElementById('adminName').value     = recipe.adminName || user.username;

    const options = document.getElementById('course').options;
    for (let i = 0; i < options.length; i++) {
      options[i].selected = (options[i].value === recipe.course);
    }

    if (chefSelect && recipe.chef) {
      chefSelect.value = recipe.chef;
    }

    if (recipe.imageUrl) {
      const preview = document.getElementById('imagePreview');
      preview.src = recipe.imageUrl;
      preview.style.display = 'block';
    }

    (recipe.ingredients || []).forEach(ing => addIngredientRow(ing.name, ing.qty));
    if (!(recipe.ingredients || []).length) addIngredientRow();

    (recipe.steps || []).forEach(s => addStepRow(s));
    if (!(recipe.steps || []).length) addStepRow();

  } else {
    document.getElementById('adminName').value = user.username;
    document.getElementById('recipeId').value  = RecipeStore.generateId();
    addIngredientRow();
    addStepRow();
  }

  document.getElementById('addIngredientBtn').addEventListener('click', () => addIngredientRow());
  document.getElementById('addStepBtn').addEventListener('click', () => addStepRow());

  document.getElementById('recipe_img').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('imagePreview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name        = document.getElementById('Recipe_name').value.trim();
    const course      = document.getElementById('course').value;
    const description = document.getElementById('Descriptionn').value.trim();

    if (!name)        { showToast('Recipe name is required.');  return; }
    if (!course)      { showToast('Please select a course.');    return; }
    if (!description) { showToast('Description is required.');   return; }

    const ingredients = collectIngredients();
    if (!ingredients.length) { showToast('Add at least one ingredient.'); return; }

    const steps = collectSteps();
    if (!steps.length) { showToast('Add at least one step.'); return; }

    const preview  = document.getElementById('imagePreview');
    const imageUrl = (preview && preview.style.display !== 'none') ? preview.src : '';

    const selectedChefName = (chefSelect && chefSelect.value) ? chefSelect.value : '';
    const selectedChef     = chefsData.find(c => c.name === selectedChefName) || null;
    const chefName         = selectedChef ? selectedChef.name : (selectedChefName || '');
    const chefImg          = selectedChef ? selectedChef.img  : '';

    const recipe = {
      id:          isEdit ? editId : document.getElementById('recipeId').value,
      adminName:   user.username,
      name,
      course,
      description,
      imageUrl,
      ingredients,
      steps,
      chef:        chefName,
      chefImg:     chefImg,
      featured:    false
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

    await saveRecipeToServer(recipe);

    showToast(isEdit ? '✅ Recipe updated!' : '✅ Recipe added!');
    setTimeout(() => { window.location.href = 'admin_recipes.html'; }, 1500);
  });
}

function addIngredientRow(nameVal = '', qtyVal = '') {
  const container = document.getElementById('ingredientsList');
  const index = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML =
    `<label>Ingredient ${index}</label>` +
    `<input type="text" class="ing-name" placeholder="Name" value="${nameVal}">` +
    `<input type="text" class="ing-qty"  placeholder="Quantity" value="${qtyVal}">` +
    `<button type="button" class="row-remove-btn"><i class="fas fa-times"></i></button>`;
  row.querySelector('.row-remove-btn').addEventListener('click', () => {
    row.remove();
    reNumberRows('ingredientsList', 'Ingredient');
  });
  container.appendChild(row);
}

function addStepRow(stepVal = '') {
  const container = document.getElementById('stepsList');
  const index = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'step-row';
  row.innerHTML =
    `<label>Step ${index}</label>` +
    `<input type="text" class="step-input" placeholder="Step description" value="${stepVal}">` +
    `<button type="button" class="row-remove-btn"><i class="fas fa-times"></i></button>`;
  row.querySelector('.row-remove-btn').addEventListener('click', () => {
    row.remove();
    reNumberRows('stepsList', 'Step');
  });
  container.appendChild(row);
}

function reNumberRows(containerId, label) {
  document.querySelectorAll(`#${containerId} label`).forEach((lbl, i) => {
    lbl.textContent = `${label} ${i + 1}`;
  });
}

function collectIngredients() {
  return [...document.querySelectorAll('.ingredient-row')]
    .map(row => ({ name: row.querySelector('.ing-name').value.trim(), qty: row.querySelector('.ing-qty').value.trim() }))
    .filter(i => i.name);
}

function collectSteps() {
  return [...document.querySelectorAll('.step-input')]
    .map(inp => inp.value.trim())
    .filter(Boolean);
}

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initRecipeForm();
});

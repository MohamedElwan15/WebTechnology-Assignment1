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
        const recipes = this.getAll().map(function(r) {
            return r.id === id ? Object.assign({}, r, updated) : r;
        });
        this.save(recipes);
    },
    delete(id) {
        this.save(this.getAll().filter(function(r) { return r.id !== id; }));
    },
    getById(id) {
        return this.getAll().find(function(r) { return r.id === id; }) || null;
    },
    getForCurrentAdmin() {
        const user = Session.getUser();
        if (!user) return [];
        return this.getAll().filter(function(r) { return r.adminName === user.username; });
    },
    generateId() {
        return 'RCP-' + Date.now();
    }
};


/* PAGE: admin_recipes.html */
function initDashboard() {
    const tableBody = document.getElementById('recipesTableBody');
    if (!tableBody) return;

    const user = Session.getUser();
    if (!user) {
        showToast('You must be logged in.');
        setTimeout(function() { window.location.href = 'EntryPage.html'; }, 1500);
        return;
    }

    renderTable();

    var pendingDeleteId = null;

    const modal      = document.getElementById('deleteModal');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn  = document.getElementById('cancelDeleteBtn');

    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        pendingDeleteId = null;
    });

    confirmBtn.addEventListener('click', function() {
        if (!pendingDeleteId) return;
        RecipeStore.delete(pendingDeleteId);
        modal.style.display = 'none';
        pendingDeleteId = null;
        showToast('Recipe deleted.');
        renderTable();
    });

    window.requestDelete = function(id, name) {
        pendingDeleteId = id;
        document.getElementById('deleteModalMsg').textContent =
            'Are you sure you want to delete "' + name + '"?';
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

        tableBody.innerHTML = recipes.map(function(r) {
            return '<tr>' +
                '<td>' + r.id + '</td>' +
                '<td>' + r.name + '</td>' +
                '<td>' + r.course + '</td>' +
                '<td>' +
                    (r.imageUrl
                        ? '<img src="' + r.imageUrl + '" alt="' + r.name + '" width="100">'
                        : 'No image') +
                '</td>' +
                '<td>' +
                    '<a href="admin_add.html?id=' + r.id + '">' +
                        '<i class="fas fa-pencil-alt"></i> Edit' +
                    '</a>' +
                    '&nbsp;&nbsp;' +
                    '<button type="button" class="action-btn-delete" onclick="requestDelete(\'' + r.id + '\', \'' + r.name + '\')">' +
                        '<i class="fas fa-trash"></i> Delete' +
                    '</button>' +
                '</td>' +
            '</tr>';
        }).join('');
    }
}


/* PAGE: admin_add.html/Edit */
function initRecipeForm() {
    const form = document.getElementById('addRecipeForm');
    if (!form) return;

    const user = Session.getUser();
    if (!user) {
        showToast('You must be logged in.');
        setTimeout(function() { window.location.href = 'EntryPage.html'; }, 1500);
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');
    const isEdit = editId !== null;

    if (isEdit) {
        document.querySelector('h1').innerHTML = '<i class="fas fa-pencil-alt"></i> Edit Recipe';
        document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Save Changes';

        const recipe = RecipeStore.getById(editId);
        if (!recipe) {
            showToast('Recipe not found.');
            setTimeout(function() { window.location.href = 'admin_recipes.html'; }, 1500);
            return;
        }

        document.getElementById('recipeId').value = recipe.id;

        document.getElementById('Recipe_name').value  = recipe.name;
        document.getElementById('Descriptionn').value = recipe.description;

        var options = document.getElementById('course').options;
        for (var i = 0; i < options.length; i++) {
            options[i].selected = (options[i].value === recipe.course);
        }

        if (recipe.imageUrl) {
            var preview       = document.getElementById('imagePreview');
            preview.src           = recipe.imageUrl;
            preview.style.display = 'block';
        }

        var ingredients = recipe.ingredients || [];
        for (var i = 0; i < ingredients.length; i++) {
            addIngredientRow(ingredients[i].name, ingredients[i].qty);
        }
        if (!ingredients.length) addIngredientRow();

        var steps = recipe.steps || [];
        for (var i = 0; i < steps.length; i++) {
            addStepRow(steps[i]);
        }
        if (!steps.length) addStepRow();

    } else {
        document.getElementById('adminName').value = user.username;
        document.getElementById('recipeId').value  = RecipeStore.generateId();

        addIngredientRow();
        addStepRow();
    }

    document.getElementById('addIngredientBtn').addEventListener('click', function() {
        addIngredientRow();
    });
    document.getElementById('addStepBtn').addEventListener('click', function() {
        addStepRow();
    });

    document.getElementById('recipe_img').addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            var preview       = document.getElementById('imagePreview');
            preview.src           = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });

    form.addEventListener('submit', function(e) {
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

        var preview  = document.getElementById('imagePreview');
        var imageUrl = (preview && preview.style.display !== 'none') ? preview.src : '';

        if (isEdit) {
            RecipeStore.update(editId, {
                name:        name,
                course:      course,
                description: description,
                imageUrl:    imageUrl,
                ingredients: ingredients,
                steps:       steps
            });
            showToast('Recipe updated! Redirecting...');
        } else {
            const recipe = {
                id:          document.getElementById('recipeId').value,
                adminName:   user.username,
                name:        name,
                course:      course,
                description: description,
                imageUrl:    imageUrl,
                ingredients: ingredients,
                steps:       steps
            };
            RecipeStore.add(recipe);
            showToast('Recipe added! Redirecting...');
        }

        setTimeout(function() { window.location.href = 'admin_recipes.html'; }, 1500);
    });
}


/* DYNAMIC ROW HELPERS */
function addIngredientRow(nameVal, qtyVal) {
    nameVal = nameVal || '';
    qtyVal  = qtyVal  || '';

    const container = document.getElementById('ingredientsList');
    const index     = container.children.length + 1;

    const row     = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML =
        '<label>Ingredient ' + index + '</label>' +
        '<input type="text" class="ing-name" placeholder="Name"     value="' + nameVal + '">' +
        '<input type="text" class="ing-qty"  placeholder="Quantity" value="' + qtyVal  + '">' +
        '<button type="button" class="row-remove-btn"><i class="fas fa-times"></i></button>';

    row.querySelector('.row-remove-btn').addEventListener('click', function() {
        row.remove();
        reNumberRows('ingredientsList', 'Ingredient');
    });

    container.appendChild(row);
}

function addStepRow(stepVal) {
    stepVal = stepVal || '';

    const container = document.getElementById('stepsList');
    const index     = container.children.length + 1;

    const row     = document.createElement('div');
    row.className = 'step-row';
    row.innerHTML =
        '<label>Step ' + index + '</label>' +
        '<input type="text" class="step-input" placeholder="Step description" value="' + stepVal + '">' +
        '<button type="button" class="row-remove-btn"><i class="fas fa-times"></i></button>';

    row.querySelector('.row-remove-btn').addEventListener('click', function() {
        row.remove();
        reNumberRows('stepsList', 'Step');
    });

    container.appendChild(row);
}

function reNumberRows(containerId, label) {
    const container = document.getElementById(containerId);
    const labels    = container.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
        labels[i].textContent = label + ' ' + (i + 1);
    }
}

function collectIngredients() {
    const rows   = document.querySelectorAll('.ingredient-row');
    const result = [];
    for (var i = 0; i < rows.length; i++) {
        const name = rows[i].querySelector('.ing-name').value.trim();
        const qty  = rows[i].querySelector('.ing-qty').value.trim();
        if (name) result.push({ name: name, qty: qty });
    }
    return result;
}

function collectSteps() {
    const inputs = document.querySelectorAll('.step-input');
    const result = [];
    for (var i = 0; i < inputs.length; i++) {
        const val = inputs[i].value.trim();
        if (val) result.push(val);
    }
    return result;
}


/* INIT */
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    initRecipeForm();
});
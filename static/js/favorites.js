/* ============================================================
   FCAI - SOFRA  |  FAVORITES PAGE JS
   ============================================================ */

const favGrid    = document.getElementById('favGrid');
const favLoading = document.getElementById('favLoading');
const favEmpty   = document.getElementById('favEmpty');

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
}

async function loadFavorites() {
    try {
        const res  = await fetch('/api/favorites/', { credentials: 'same-origin' });
        const data = await res.json();

        favLoading.style.display = 'none';

        if (data.favorites.length === 0) {
            favEmpty.style.display = 'flex';
            return;
        }

        favGrid.innerHTML = data.favorites.map(r => `
            <div class="recipe-card" data-id="${r.recipe_id}">
                <img src="${r.image_url || 'images/placeholder.jpg'}" alt="${r.name}">
                <div class="recipe-card__body">
                    <span class="recipe-card__category">${r.course}</span>
                    <h3>${r.name}</h3>
                    <p>${r.description}</p>
                    <small><i class="fas fa-user"></i> ${r.chef}</small>
                    <div class="recipe-card__footer">
                        <a href="/recipes/${r.recipe_id}/" class="btn btn-primary">
                            <i class="fas fa-eye"></i> View Recipe
                        </a>
                        <button class="btn-unfav" onclick="removeFavorite('${r.recipe_id}', this)">
                            <i class="fas fa-heart-broken"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        favLoading.innerHTML = '<p>Failed to load. Are you logged in?</p>';
        console.error(err);
    }
}

async function removeFavorite(recipeId, btn) {
    btn.disabled = true;
    try {
        const res  = await fetch('/api/favorites/toggle/', {
            method:      'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken':  getCookie('csrftoken'),
            },
            body: JSON.stringify({ recipe_id: recipeId }),
        });
        const data = await res.json();

        if (data.status === 'removed') {
            const card = favGrid.querySelector(`[data-id="${recipeId}"]`);
            card.style.transition = 'opacity 0.3s';
            card.style.opacity    = '0';
            setTimeout(() => {
                card.remove();
                if (!favGrid.querySelector('.recipe-card')) {
                    favEmpty.style.display = 'flex';
                }
            }, 300);
        }
    } catch (err) {
        console.error('Remove failed:', err);
        btn.disabled = false;
    }
}

loadFavorites();

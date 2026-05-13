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
            favEmpty.style.display = 'block';
            return;
        }

        favGrid.innerHTML = data.favorites.map(r => `
            <div class="rl-card reveal" data-id="${r.recipe_id}">
                <div class="rl-card__img-wrap">
                    <img class="rl-card__img" src="${r.image_url || '/static/images/macarona.png'}" alt="${r.name}"
                         onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=75'">
                    <span class="rl-card__course">${r.course}</span>
                    <button class="rl-card__heart fav-active" onclick="removeFavorite('${r.recipe_id}', this)" title="Remove from favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>

                <div class="rl-card__body">
                    <div class="rl-card__title">${r.name}</div>
                    <p class="rl-card__desc">${r.description}</p>

                    <div class="rl-card__footer">
                        <span class="rl-card__chef">${r.chef || 'Self-Made'}</span>
                        <a class="rl-card__view" href="/recipe/${r.recipe_id}/">View <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        favLoading.innerHTML = '<i class="fas fa-exclamation-circle"></i><p>Failed to load. Are you logged in?</p>';
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
            card.style.transition = 'all 0.4s ease';
            card.style.opacity    = '0';
            card.style.transform  = 'scale(0.9) translateY(20px)';
            setTimeout(() => {
                card.remove();
                if (!favGrid.querySelector('.rl-card')) {
                    favEmpty.style.display = 'block';
                }
            }, 400);
            showToast("Removed from favorites");
        }
    } catch (err) {
        console.error('Remove failed:', err);
        btn.disabled = false;
        showToast("Error removing favorite");
    }
}

loadFavorites();

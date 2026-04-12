/* ============================================================
   FCAI - SOFRA  |  HOMEPAGE JAVASCRIPT
   ============================================================ */

function courseLabel(c) {
  return { main_course: 'Main Course', appetizers: 'Appetizers', dessert: 'Dessert' }[c] || c;
}

// Build Course Cards
function buildCourseCards() {
  const container = document.getElementById('courseGrid');
  if (!container) return;

  const courses = [
    {
      title: 'Appetizers',
      desc: 'Light, inviting starters to open any meal.',
      img: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=700&q=75',
      link: 'recList.html?course=appetizers'
    },
    {
      title: 'Main Course',
      desc: 'Hearty, satisfying dishes that take center stage.',
      img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=75',
      link: 'recList.html?course=main_course'
    },
    {
      title: 'Desserts',
      desc: 'Sweet finales for every occasion.',
      img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&q=75',
      link: 'recList.html?course=dessert'
    }
  ];

  container.innerHTML = courses.map((c, idx) => `
    <a href="${c.link}" class="course-card reveal" style="animation-delay: ${idx * 0.1}s">
      <img class="course-card__img" src="${c.img}" alt="${c.title}"
           onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=60'">
      <div class="course-card__overlay"></div>
      <div class="course-card__info">
        <div class="course-card__title">${c.title}</div>
        <div class="course-card__desc">${c.desc}</div>
        <span class="course-card__arrow">Explore →</span>
      </div>
    </a>
  `).join('');
}

// Build Chef Cards
function buildChefCards() {
  const container = document.getElementById('chefsGrid');
  if (!container) return;

  const chefs = [
    {
      name: 'Chef El Sherbiny',
      specialty: 'Egyptian & Oriental Cuisine',
      bio: 'One of the most celebrated names in Egyptian cooking, known for blending authentic oriental flavors with modern presentation.',
      img: 'https://assets.minly.com/assets/avatars/zPtgfPwF2LsozVn2g6MEl.jpg',
      link: 'chef-el-sherbiny.html'
    },
    {
      name: 'Chef Hassan',
      specialty: 'Grills & Main Courses',
      bio: 'A master of hearty mains and bold flavors, celebrated for his grilled dishes and rich slow-cooked recipes.',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJYSpXwt07ODmH4Lw1r8uQLuTHqijHV-bZmA&s',
      link: 'chef-hassan.html'
    },
    {
      name: 'Chef Nadia El Sayed',
      specialty: 'Desserts & International Cuisine',
      bio: "One of Egypt's most-followed culinary personalities, known for precise recipes bridging Egyptian and international cooking.",
      img: 'https://yt3.googleusercontent.com/wEwWYlGQVCpenDDdkc_CNYQiFHzzixW6Bd7gGlGrOlbnq3XpPzytMa3mOq48Wxcj_qOx1xmXOw=s900-c-k-c0x00ffffff-no-rj',
      link: 'chef-nadia-elsayed.html'
    }
  ];

  container.innerHTML = chefs.map(c => `
    <a href="${c.link}" class="chef-card reveal">
      <div class="chef-card__img-wrap">
        <img class="chef-card__img" src="${c.img}" alt="${c.name}"
             onerror="this.src='https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=60'">
      </div>
      <div class="chef-card__body">
        <div class="chef-card__name">${c.name}</div>
        <div class="chef-card__specialty">${c.specialty}</div>
        <p class="chef-card__bio">${c.bio}</p>
        <span class="chef-card__link">View Profile →</span>
      </div>
    </a>
  `).join('');
}

// Build Featured Recipes — loaded from JSON (includes admin-added ones)
async function buildFeaturedRecipes() {
  const container = document.getElementById('featuredGrid');
  if (!container) return;

  let recipes = [];
  try {
    recipes = await RecipesAPI.getAll();
    // Also include localStorage recipes (admin-added when no server)
    const local = Store.get('sofra_recipes') || [];
    local.forEach(lr => {
      if (!recipes.find(r => r.id === lr.id)) recipes.push(lr);
    });
  } catch {
    recipes = Store.get('sofra_recipes') || [];
  }

  if (!recipes.length) {
    container.innerHTML = '<p style="color:var(--clr-muted);text-align:center">No recipes yet.</p>';
    return;
  }

  const isAdmin = Session.isAdmin();

  container.innerHTML = recipes.map((r, i) => {
    const isFav = Favorites.has(r.id);
    const heartBtn = isAdmin ? '' : `
      <button class="hp-heart" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
              onclick="toggleHomeFav('${r.id}', this)">
        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
      </button>`;

    return `
      <div class="recipe-card reveal" style="animation-delay: ${i * 0.05}s">
        <div class="recipe-card__img-wrap">
          <img class="recipe-card__img" src="${r.imageUrl || ''}" alt="${r.name}"
               onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=60'">
          <span class="badge">${courseLabel(r.course)}</span>
          ${heartBtn}
        </div>
        <div class="recipe-card__body">
          <div class="recipe-card__title">${r.name}</div>
          <div class="recipe-card__ingredients">${r.description ? r.description.substring(0, 90) + '…' : ''}</div>
          <div class="recipe-card__footer">
            <span class="recipe-card__chef">
              <img class="recipe-card__chef-icon" src="${r.chefImg || ''}" alt="${r.chef || ''}"
                   onerror="this.style.display='none'">
              ${r.chef || ''}
            </span>
            <a class="recipe-card__view" href="recipeInfo.html?id=${r.id}">View →</a>
          </div>
        </div>
      </div>`;
  }).join('');

  if (typeof initScrollReveal === 'function') {
    setTimeout(initScrollReveal, 80);
  }
}

// Heart toggle on homepage cards
window.toggleHomeFav = function (recipeId, btn) {
  if (Favorites.has(recipeId)) {
    Favorites.remove(recipeId);
    btn.innerHTML = '<i class="far fa-heart"></i>';
    btn.title = 'Add to favorites';
    showToast('💔 Removed from favorites');
  } else {
    Favorites.add(recipeId);
    btn.innerHTML = '<i class="fas fa-heart"></i>';
    btn.title = 'Remove from favorites';
    showToast('❤️ Added to favorites!');
  }
};

// Hero Parallax
function initHeroParallax() {
  const heroBg = document.querySelector('.hero__bg');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    heroBg.style.transform = `scale(1.05) translateY(${window.scrollY * 0.15}px)`;
  }, { passive: true });
}

// Homepage search
function initHomeSearch() {
  const form = document.getElementById('homeSearchForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    const input = document.getElementById('home-search');
    if (input.value.trim() === '') {
      e.preventDefault();
      showToast('Please enter a search term.');
    }
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  buildCourseCards();
  buildChefCards();
  buildFeaturedRecipes();
  initHomeSearch();
  initHeroParallax();
});

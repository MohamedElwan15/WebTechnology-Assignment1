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
      link: '/all-recipes/?course=appetizers'
    },
    {
      title: 'Main Course',
      desc: 'Hearty, satisfying dishes that take center stage.',
      img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=75',
      link: '/all-recipes/?course=main_course'
    },
    {
      title: 'Desserts',
      desc: 'Sweet finales for every occasion.',
      img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&q=75',
      link: '/all-recipes/?course=dessert'
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
async function buildChefCards() {
  const container = document.getElementById('chefsGrid');
  if (!container) return;

  let chefs = [];
  try {
    chefs = await ChefsAPI.getAll();
  } catch (e) {
    console.error("Failed to load chefs", e);
  }

  // Fallback bio data since API might not have full bio for the grid
  const bioMap = {
    'chef-el-sherbiny': 'One of the most celebrated names in Egyptian cooking, known for blending authentic oriental flavors with modern presentation.',
    'chef-hassan': 'A master of hearty mains and bold flavors, celebrated for his grilled dishes and rich slow-cooked recipes.',
    'chef-nadia-elsayed': "One of Egypt's most-followed culinary personalities, known for precise recipes bridging Egyptian and international cooking."
  };

  container.innerHTML = chefs.map(c => `
    <a href="/chef/${c.id}/" class="chef-card reveal">
      <div class="chef-card__img-wrap">
        <img class="chef-card__img" src="${c.img}" alt="${c.name}"
             onerror="this.src='https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=60'">
      </div>
      <div class="chef-card__body">
        <div class="chef-card__name">${c.name}</div>
        <div class="chef-card__specialty">${c.specialty}</div>
        <p class="chef-card__bio">${bioMap[c.id] || ''}</p>
        <span class="chef-card__link">View Profile →</span>
      </div>
    </a>
  `).join('');
}

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
  initHomeSearch();
  initHeroParallax();
  
  if (typeof initScrollReveal === 'function') {
    setTimeout(initScrollReveal, 200);
  }
});

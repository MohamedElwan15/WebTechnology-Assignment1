/* ============================================================
   FCAI - SOFRA  |  CHEF PROFILE JAVASCRIPT
   Used by: chef-el-sherbiny.html, chef-hassan.html,
            chef-nadia-elsayed.html
   ============================================================ */

/* ── GHOST PORTRAIT ENTRANCE ── */
function initGhostPortrait() {
  const ghost = document.querySelector('.chef-ghost-portrait');
  if (!ghost) return;
  setTimeout(() => ghost.classList.add('visible'), 350);
}

/* ── PARALLAX GHOST ON SCROLL ── */
function initGhostParallax() {
  const ghost = document.querySelector('.chef-ghost-portrait img');
  if (!ghost) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    ghost.style.transform = `translateX(0) translateY(${y * 0.08}px)`;
  }, { passive: true });
}

/* ── RECIPE TABLE ROW HOVER HIGHLIGHT ── */
function initRecipeTableInteractions() {
  document.querySelectorAll('.recipes-table tbody tr').forEach(row => {
    const link = row.querySelector('a');
    if (!link) return;
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      window.location.href = link.href;
    });
  });
}

/* ── FACTS TABLE: COPY TO CLIPBOARD ON CLICK ── */
function initFactsCopy() {
  document.querySelectorAll('.facts-table td:last-child').forEach(td => {
    td.title = 'Click to copy';
    td.style.cursor = 'pointer';
    td.addEventListener('click', () => {
      navigator.clipboard.writeText(td.textContent.trim()).then(() => {
        showToast('Copied: ' + td.textContent.trim().slice(0, 40));
      }).catch(() => {});
    });
  });
}

/* ── AUDIO: NOTIFY ON PLAY ── */
function initAudioHint() {
  const audio = document.querySelector('audio');
  if (!audio) return;
  audio.addEventListener('play', () => {
    showToast('🎵 Now playing background music');
  }, { once: true });
}

/* ── BACK TO TOP SMOOTH ── */
function initBackToTop() {
  document.querySelectorAll('a[href="#top"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = '#top';
    });
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initGhostPortrait();
  initGhostParallax();
  initRecipeTableInteractions();
  initFactsCopy();
  initAudioHint();
  initBackToTop();
  loadChefRecipes();
});
/* ── DYNAMIC RECIPE TABLE FROM JSON ── */
async function loadChefRecipes() {
  const container = document.getElementById('chefRecipesContainer');
  if (!container) return;

  // CHEF_NAME is defined inline in each chef HTML file
  const chefName = (typeof CHEF_NAME !== 'undefined') ? CHEF_NAME : null;
  if (!chefName) {
    container.innerHTML = '<p style="color:var(--clr-muted)">No chef name set.</p>';
    return;
  }

  let allRecipes = [];
  try {
    allRecipes = await RecipesAPI.getAll();
    // Also merge localStorage recipes
    const local = Store.get('sofra_recipes') || [];
    local.forEach(lr => { if (!allRecipes.find(r => r.id === lr.id)) allRecipes.push(lr); });
  } catch {
    allRecipes = Store.get('sofra_recipes') || [];
  }

  const courseLabel = c => ({ main_course: 'Main Course', appetizers: 'Appetizers', dessert: 'Dessert' }[c] || c);

  const chefRecipes = allRecipes.filter(r => r.chef === chefName);

  if (!chefRecipes.length) {
    container.innerHTML = '<p style="color:var(--clr-muted)">No recipes listed yet for this chef.</p>';
    return;
  }

  const rows = chefRecipes.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${courseLabel(r.course)}</td>
      <td><a href="recipeInfo.html?id=${r.id}" style="color:var(--clr-orange);font-weight:600;">View Recipe →</a></td>
    </tr>`).join('');

  container.innerHTML = `
    <table class="recipes-table">
      <thead><tr><th>Recipe</th><th>Course</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

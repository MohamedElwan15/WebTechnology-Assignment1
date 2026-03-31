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
});
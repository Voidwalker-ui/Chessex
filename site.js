/* Chess-X — site.js: dark mode + search */

/* ── Dark Mode ── */
(function () {
  const saved = localStorage.getItem('chessex-theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();

function toggleDark() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('chessex-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('chessex-theme', 'dark');
  }
}

/* ── Search ── */
function openSearch() {
  document.getElementById('search-overlay').classList.add('is-open');
  document.getElementById('search-input').focus();
  document.body.style.overflow = 'hidden';
}

function closeSearch() {
  document.getElementById('search-overlay').classList.remove('is-open');
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
  document.body.style.overflow = '';
}

function runSearch(query) {
  const results = document.getElementById('search-results');
  if (!query || query.length < 2) { results.innerHTML = ''; return; }

  const q = query.toLowerCase();
  const matches = (window.CHESSEX_INDEX || []).filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.snippet.toLowerCase().includes(q) ||
    item.tag.toLowerCase().includes(q)
  );

  if (!matches.length) {
    results.innerHTML = '<p class="search-empty">No results found — try a different term.</p>';
    return;
  }

  results.innerHTML = matches.slice(0, 10).map(item => `
    <a class="search-result-item" href="${item.url}">
      <div class="result-tag">${item.tag}</div>
      <div class="result-title">${item.title}</div>
      <div class="result-snippet">${item.snippet}</div>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', function () {
  /* Keyboard shortcut: / to open search */
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  });

  const input = document.getElementById('search-input');
  if (input) input.addEventListener('input', () => runSearch(input.value));

  /* Close overlay on backdrop click */
  const overlay = document.getElementById('search-overlay');
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeSearch();
  });
});

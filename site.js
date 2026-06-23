/* Chess-X — site.js */

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
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search-input');
  const searchDrop  = document.getElementById('search-dropdown');
  const searchClear = document.getElementById('search-clear');
  const searchField = document.getElementById('search-field');

  if (!searchInput || !searchDrop) return;

  /* Resolve URLs relative to site root regardless of which subfolder this page is in */
  const _depth = window.location.pathname.split('/').length - 2;
  const _prefix = _depth > 1 ? '../'.repeat(_depth - 1) : '';
  function resolveUrl(url) { return _prefix + url; }


  function positionDropdown() {
    if (!searchField) return;
    const rect = searchField.getBoundingClientRect();
    searchDrop.style.top   = (rect.bottom + 10) + 'px';
    searchDrop.style.left  = rect.left + 'px';
    searchDrop.style.width = Math.max(rect.width, 480) + 'px';
  }

  function renderResults(q) {
    if (!q || q.length < 2) { searchDrop.classList.remove('open'); return; }

    const index = window.CHESSEX_INDEX || [];
    const matches = index.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.snippet.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q)
    ).slice(0, 8);

    if (!matches.length) {
      searchDrop.innerHTML = '<div class="search-result-empty">No results for \u201c' + q + '\u201d</div>';
    } else {
      const tagIcon = { Opening:'♟', Tactic:'⚔', Endgame:'♔', Blog:'✒', Newbie:'♟' };
      const tagCat  = { Opening:'opening', Tactic:'tactics', Endgame:'endgame', Blog:'blog', Newbie:'newbie' };
      searchDrop.innerHTML =
        '<div class="search-dropdown-header">Results</div>' +
        matches.map(item =>
          '<a class="search-result-item" href="' + resolveUrl(item.url) + '">' +
            '<div class="res-icon ' + (tagCat[item.tag] || '') + '">' + (tagIcon[item.tag] || '♟') + '</div>' +
            '<div class="res-text">' +
              '<span class="res-tag">' + item.tag + '</span>' +
              '<span class="res-title">' + item.title + '</span>' +
              '<span class="res-desc">' + (item.snippet ? item.snippet.slice(0, 90) + (item.snippet.length > 90 ? '\u2026' : '') : '') + '</span>' +
            '</div>' +
            '<span class="res-arrow">\u203a</span>' +
          '</a>'
        ).join('');
    }

    positionDropdown();
    searchDrop.classList.add('open');
  }

  searchInput.addEventListener('input', function () {
    const q = searchInput.value.trim().toLowerCase();
    if (searchClear) searchClear.classList.toggle('visible', q.length > 0);
    renderResults(q);
  });

  if (searchClear) {
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      searchClear.classList.remove('visible');
      searchDrop.classList.remove('open');
      searchInput.focus();
    });
  }

  window.addEventListener('scroll',  function () { if (searchDrop.classList.contains('open')) positionDropdown(); }, { passive: true });
  window.addEventListener('resize',  function () { if (searchDrop.classList.contains('open')) positionDropdown(); });
  document.addEventListener('mousedown', function (e) {
    const wrap = document.getElementById('search-wrap');
    if (wrap && !wrap.contains(e.target) && !searchDrop.contains(e.target)) {
      searchDrop.classList.remove('open');
    }
  });

  /* Keyboard shortcut: / to focus search */
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      searchDrop.classList.remove('open');
      searchInput.blur();
    }
  });
});

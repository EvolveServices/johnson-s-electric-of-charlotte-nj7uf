/**
 * Blog Listing - dynamically renders cards from /_content/registry/blog.json
 * Cards use existing .blog-card CSS classes from /css/blog.css
 */

(function () {
  // Map category names to filter keys used by data-filter buttons
  var CATEGORY_FILTER_MAP = {
    'safety':            'safety',
    'panel upgrades':    'upgrades',
    'ev charging':       'ev',
    'generators':        'generators',
    'home tips':         'tips',
    'energy efficiency': 'energy',
    'commercial':        'commercial'
  };

  function filterKey(category) {
    return CATEGORY_FILTER_MAP[(category || '').toLowerCase()] || 'other';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  var calendarSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  var arrowSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

  function buildCard(post, index) {
    var delay = (index % 3) * 0.1;
    var article = document.createElement('article');
    article.className = 'blog-card reveal';
    article.dataset.category = filterKey(post.category);
    article.dataset.title = (post.title || '').toLowerCase();
    article.dataset.excerpt = (post.excerpt || '').toLowerCase();
    if (delay > 0) {
      article.dataset.delay = delay + 's';
      article.style.transitionDelay = delay + 's';
    }

    article.innerHTML =
      '<a href="' + post.url + '" class="blog-card-img">' +
        '<img src="' + post.image + '" alt="' + post.title + '" width="640" height="360" loading="lazy" />' +
        '<span class="blog-card-category">' + post.category + '</span>' +
      '</a>' +
      '<div class="blog-card-body">' +
        '<div class="blog-card-meta">' +
          '<span class="blog-card-meta-item">' + calendarSVG + formatDate(post.date) + '</span>' +
        '</div>' +
        '<a href="' + post.url + '">' +
          '<h2 class="blog-card-title">' + post.title + '</h2>' +
        '</a>' +
        '<p class="blog-card-excerpt">' + post.excerpt + '</p>' +
        '<div class="blog-card-footer">' +
          '<a href="' + post.url + '" class="blog-card-read-more">Read More ' + arrowSVG + '</a>' +
        '</div>' +
      '</div>';

    return article;
  }

  function renderCards(posts) {
    var grid = document.getElementById('blog-grid');
    if (!grid) return;
    grid.innerHTML = '';
    posts.forEach(function (post, i) {
      grid.appendChild(buildCard(post, i));
    });
    // Re-init scroll reveal for newly inserted cards
    if (window.__scrollRevealInit) {
      window.__scrollRevealInit();
    }
  }

  function applyFilters(posts, filterValue, searchTerm) {
    return posts.filter(function (post) {
      var catMatch = filterValue === 'all' || filterKey(post.category) === filterValue;
      var searchMatch = !searchTerm ||
        (post.title || '').toLowerCase().indexOf(searchTerm) !== -1 ||
        (post.excerpt || '').toLowerCase().indexOf(searchTerm) !== -1 ||
        (post.category || '').toLowerCase().indexOf(searchTerm) !== -1;
      return catMatch && searchMatch;
    });
  }

  function init(allPosts) {
    var grid = document.getElementById('blog-grid');
    var noResults = document.getElementById('blog-no-results');
    var filterTags = document.querySelectorAll('.blog-filter-tag');
    var searchInput = document.getElementById('blog-search');
    var activeFilter = 'all';
    var searchTerm = '';

    function update() {
      var filtered = applyFilters(allPosts, activeFilter, searchTerm);
      renderCards(filtered);
      if (noResults) {
        noResults.style.display = filtered.length === 0 ? 'block' : 'none';
      }
    }

    filterTags.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterTags.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.dataset.filter || 'all';
        update();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchTerm = searchInput.value.toLowerCase().trim();
        update();
      });
    }

    // Initial render
    update();
  }

  fetch('/_content/registry/blog.json')
    .then(function (res) { return res.json(); })
    .then(function (posts) {
      // Sort by date descending (newest first)
      posts.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      init(posts);
    })
    .catch(function (err) {
      console.error('Blog listing: failed to load registry', err);
    });
})();

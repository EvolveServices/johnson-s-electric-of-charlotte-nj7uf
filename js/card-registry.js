/**
 * card-registry.js
 * Centralized card rendering system for Johnson's Electric of Charlotte.
 *
 * Usage:
 *   CardRegistry.renderCards(containerId, data, options)
 *
 * Parameters:
 *   containerId {string}  - ID of the DOM element to render cards into
 *   data        {Array}   - Array of card data objects (see registry JSON files)
 *   options     {Object}  - Optional configuration (see defaults below)
 *
 * Options:
 *   type        {string}  - Card style: 'service' | 'service-area' | 'blog' (default: 'service')
 *   limit       {number}  - Max cards to render (default: all)
 *   filter      {string}  - Filter by category field value (default: null = show all)
 *   sortBy      {string}  - Sort field: 'date' | 'title' (default: null = original order)
 *   sortDir     {string}  - 'asc' | 'desc' (default: 'desc')
 *   ctaText     {string}  - Override button/link label (default varies by type)
 *
 * Registry JSON files:
 *   /_content/registry/services.json
 *   /_content/registry/service-areas.json
 *   /_content/registry/blog.json
 */

(function (global) {
  'use strict';

  /* -----------------------------------------------------------------------
   * Internal helpers
   * --------------------------------------------------------------------- */

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* -----------------------------------------------------------------------
   * Card builders
   * --------------------------------------------------------------------- */

  /**
   * Service card - image + badge + body with CTA button
   */
  function buildServiceCard(item, opts) {
    var ctaText = opts.ctaText || 'Learn More';
    var imgHtml = item.image
      ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
      : '<div class="cr-card-img-placeholder"></div>';

    var badgeHtml = item.badge
      ? '<div class="cr-card-badge">' + escapeHtml(item.badge) + '</div>'
      : '';

    return (
      '<div class="cr-card cr-card--service reveal">' +
        '<div class="cr-card-img">' +
          imgHtml +
          badgeHtml +
        '</div>' +
        '<div class="cr-card-body">' +
          '<h3 class="cr-card-title">' + escapeHtml(item.title) + '</h3>' +
          '<p class="cr-card-excerpt">' + escapeHtml(item.excerpt) + '</p>' +
          '<a href="' + escapeHtml(item.url) + '" class="btn btn-primary cr-card-cta">' + escapeHtml(ctaText) + '</a>' +
        '</div>' +
      '</div>'
    );
  }

  /**
   * Service-area card - icon map pin + title + excerpt + link
   */
  function buildServiceAreaCard(item, opts) {
    var ctaText = opts.ctaText || 'View Service Area';

    var badgeHtml = item.badge
      ? '<span class="cr-area-badge">' + escapeHtml(item.badge) + '</span>'
      : '';

    return (
      '<div class="cr-card cr-card--area reveal">' +
        '<div class="cr-area-header">' +
          '<div class="cr-area-icon" aria-hidden="true">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>' +
              '<circle cx="12" cy="10" r="3"/>' +
            '</svg>' +
          '</div>' +
          '<div class="cr-area-title-wrap">' +
            '<h3 class="cr-card-title">' + escapeHtml(item.title) + '</h3>' +
            badgeHtml +
          '</div>' +
        '</div>' +
        '<p class="cr-card-excerpt">' + escapeHtml(item.excerpt) + '</p>' +
        '<a href="' + escapeHtml(item.url) + '" class="cr-area-link">' +
          escapeHtml(ctaText) +
          ' <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
        '</a>' +
      '</div>'
    );
  }

  /**
   * Blog card - image + category + date + title + excerpt + read more
   */
  function buildBlogCard(item, opts) {
    var ctaText = opts.ctaText || 'Read Article';
    var imgHtml = item.image
      ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
      : '<div class="cr-card-img-placeholder"></div>';

    var metaHtml = '';
    if (item.category || item.date) {
      metaHtml = '<div class="cr-blog-meta">';
      if (item.category) {
        metaHtml += '<span class="cr-blog-category">' + escapeHtml(item.category) + '</span>';
      }
      if (item.date) {
        metaHtml += '<span class="cr-blog-date">' + escapeHtml(formatDate(item.date)) + '</span>';
      }
      metaHtml += '</div>';
    }

    return (
      '<div class="cr-card cr-card--blog reveal">' +
        '<a href="' + escapeHtml(item.url) + '" class="cr-card-img-link">' +
          '<div class="cr-card-img">' + imgHtml + '</div>' +
        '</a>' +
        '<div class="cr-card-body">' +
          metaHtml +
          '<h3 class="cr-card-title">' +
            '<a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' +
          '</h3>' +
          '<p class="cr-card-excerpt">' + escapeHtml(item.excerpt) + '</p>' +
          '<a href="' + escapeHtml(item.url) + '" class="cr-read-more">' +
            escapeHtml(ctaText) +
            ' <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
          '</a>' +
        '</div>' +
      '</div>'
    );
  }

  /* -----------------------------------------------------------------------
   * Core render function
   * --------------------------------------------------------------------- */

  /**
   * renderCards
   * @param {string} containerId  - DOM element id to render into
   * @param {Array}  data         - Array of card objects from registry JSON
   * @param {Object} [options]    - Rendering options
   */
  function renderCards(containerId, data, options) {
    var container = document.getElementById(containerId);
    if (!container) {
      console.warn('[CardRegistry] Container #' + containerId + ' not found.');
      return;
    }
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p class="cr-empty">No items found.</p>';
      return;
    }

    var opts = Object.assign({
      type: 'service',
      limit: null,
      filter: null,
      sortBy: null,
      sortDir: 'desc',
      ctaText: null
    }, options || {});

    /* Filter */
    var items = data.slice();
    if (opts.filter) {
      var filterVal = opts.filter.toLowerCase();
      items = items.filter(function (item) {
        return item.category && item.category.toLowerCase() === filterVal;
      });
    }

    /* Sort */
    if (opts.sortBy === 'date') {
      items.sort(function (a, b) {
        var da = a.date ? new Date(a.date) : new Date(0);
        var db = b.date ? new Date(b.date) : new Date(0);
        return opts.sortDir === 'asc' ? da - db : db - da;
      });
    } else if (opts.sortBy === 'title') {
      items.sort(function (a, b) {
        var ta = (a.title || '').toLowerCase();
        var tb = (b.title || '').toLowerCase();
        if (ta < tb) return opts.sortDir === 'asc' ? -1 : 1;
        if (ta > tb) return opts.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    /* Limit */
    if (opts.limit && opts.limit > 0) {
      items = items.slice(0, opts.limit);
    }

    /* Build HTML */
    var html = '';
    items.forEach(function (item, idx) {
      var cardHtml = '';
      if (opts.type === 'blog') {
        cardHtml = buildBlogCard(item, opts);
      } else if (opts.type === 'service-area') {
        cardHtml = buildServiceAreaCard(item, opts);
      } else {
        cardHtml = buildServiceCard(item, opts);
      }

      /* Stagger reveal delay */
      var delay = (idx * 0.1).toFixed(1) + 's';
      cardHtml = cardHtml.replace('class="cr-card', 'data-delay="' + delay + '" class="cr-card');
      html += cardHtml;
    });

    container.innerHTML = html;

    /* Re-trigger scroll reveal if already initialized */
    if (typeof window.__scrollRevealInit === 'function') {
      window.__scrollRevealInit();
    } else if (window.__scrollRevealObserver) {
      container.querySelectorAll('.reveal').forEach(function (el) {
        window.__scrollRevealObserver.observe(el);
      });
    }
  }

  /* -----------------------------------------------------------------------
   * Fetch helpers for loading registry JSON files
   * --------------------------------------------------------------------- */

  /**
   * loadRegistry
   * Fetches a registry JSON file and calls renderCards once loaded.
   *
   * @param {string} registryUrl  - Path to the JSON registry file
   * @param {string} containerId  - DOM element id to render into
   * @param {Object} [options]    - Rendering options passed to renderCards
   */
  function loadRegistry(registryUrl, containerId, options) {
    fetch(registryUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + registryUrl + ' (' + res.status + ')');
        return res.json();
      })
      .then(function (data) {
        renderCards(containerId, data, options);
      })
      .catch(function (err) {
        console.error('[CardRegistry] ' + err.message);
        var container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = '<p class="cr-empty cr-error">Unable to load content. Please try refreshing.</p>';
        }
      });
  }

  /* -----------------------------------------------------------------------
   * Registry paths (convenience constants)
   * --------------------------------------------------------------------- */
  var REGISTRY_PATHS = {
    services: '/_content/registry/services.json',
    serviceAreas: '/_content/registry/service-areas.json',
    blog: '/_content/registry/blog.json'
  };

  /* -----------------------------------------------------------------------
   * Public API
   * --------------------------------------------------------------------- */
  var CardRegistry = {
    /**
     * Render cards directly from a data array.
     * Use when you already have the data loaded or defined inline.
     */
    renderCards: renderCards,

    /**
     * Fetch a registry JSON file and render cards.
     * Use on listing pages that need to load the registry dynamically.
     *
     * Example:
     *   CardRegistry.loadRegistry('/_content/registry/blog.json', 'blog-grid', {
     *     type: 'blog',
     *     sortBy: 'date',
     *     limit: 6
     *   });
     */
    loadRegistry: loadRegistry,

    /**
     * Convenience loaders for each registry type.
     *
     * Example:
     *   CardRegistry.loadServices('services-grid');
     *   CardRegistry.loadBlog('blog-grid', { limit: 3, sortBy: 'date' });
     *   CardRegistry.loadServiceAreas('areas-grid', { sortBy: 'title', sortDir: 'asc' });
     */
    loadServices: function (containerId, options) {
      var opts = Object.assign({ type: 'service' }, options || {});
      loadRegistry(REGISTRY_PATHS.services, containerId, opts);
    },
    loadServiceAreas: function (containerId, options) {
      var opts = Object.assign({ type: 'service-area' }, options || {});
      loadRegistry(REGISTRY_PATHS.serviceAreas, containerId, opts);
    },
    loadBlog: function (containerId, options) {
      var opts = Object.assign({ type: 'blog', sortBy: 'date', sortDir: 'desc' }, options || {});
      loadRegistry(REGISTRY_PATHS.blog, containerId, opts);
    },

    /** Registry file paths for direct use */
    paths: REGISTRY_PATHS
  };

  /* Expose globally */
  global.CardRegistry = CardRegistry;

}(window));

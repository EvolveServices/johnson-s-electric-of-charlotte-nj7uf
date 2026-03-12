/**
 * Partial Include Loader
 * Fetches /_includes/<name>.html and injects into [data-include="<name>"] elements.
 */
(function () {
  'use strict';

  var cache = {};

  function loadIncludes() {
    var elements = document.querySelectorAll('[data-include]');
    if (!elements.length) return;

    var pending = elements.length;

    elements.forEach(function (el) {
      var name = el.getAttribute('data-include');
      var url = '/_includes/' + name + '.html';

      if (cache[url]) {
        el.outerHTML = cache[url];
        pending--;
        if (pending === 0) onAllLoaded();
        return;
      }

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to load: ' + url);
          return res.text();
        })
        .then(function (html) {
          cache[url] = html;
          // Create a temp container to parse scripts
          var temp = document.createElement('div');
          temp.innerHTML = html;

          // Replace placeholder element
          el.outerHTML = html;

          // Execute any scripts inside the loaded partial
          var scripts = temp.querySelectorAll('script');
          scripts.forEach(function (oldScript) {
            var newScript = document.createElement('script');
            if (oldScript.src) {
              newScript.src = oldScript.src;
            } else {
              newScript.textContent = oldScript.textContent;
            }
            Array.from(oldScript.attributes).forEach(function (attr) {
              if (attr.name !== 'src') newScript.setAttribute(attr.name, attr.value);
            });
            document.body.appendChild(newScript);
          });

          pending--;
          if (pending === 0) onAllLoaded();
        })
        .catch(function (err) {
          console.warn('[loader.js]', err);
          pending--;
          if (pending === 0) onAllLoaded();
        });
    });
  }

  function onAllLoaded() {
    // Dispatch event so animations.js can init after partials are loaded
    document.dispatchEvent(new CustomEvent('includes:loaded'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIncludes);
  } else {
    loadIncludes();
  }
})();

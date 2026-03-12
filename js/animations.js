/**
 * Johnson's Electric of Charlotte — animations.js
 * Requires ALL THREE: Scroll Reveal, Navbar Scroll Background, Counter Animations
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
   * 1. SCROLL REVEAL
   * ───────────────────────────────────────────── */
  function initScrollReveal() {
    if (window.__scrollRevealInit) return;
    window.__scrollRevealInit = true;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = el.getAttribute('data-delay') || '0s';
            el.style.transitionDelay = delay;
            el.classList.add('revealed');
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ─────────────────────────────────────────────
   * 2. NAVBAR SCROLL BACKGROUND
   * Uses MutationObserver to wait for header
   * loaded via data-include partial
   * ───────────────────────────────────────────── */
  function initNavbarScroll() {
    function attachScrollListener(header) {
      function onScroll() {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      // Run immediately on init
      onScroll();
    }

    var header = document.querySelector('header');
    if (header) {
      attachScrollListener(header);
      return;
    }

    // Header not yet in DOM — wait via MutationObserver
    var observer = new MutationObserver(function (mutations, obs) {
      var header = document.querySelector('header');
      if (header) {
        obs.disconnect();
        attachScrollListener(header);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ─────────────────────────────────────────────
   * 3. COUNTER ANIMATIONS
   * Animates [data-target] numbers from 0 to value
   * ───────────────────────────────────────────── */
  function initCounters() {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-target'));
          var suffix = el.getAttribute('data-suffix') || '';
          var prefix = el.getAttribute('data-prefix') || '';
          var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
          var duration = parseInt(el.getAttribute('data-duration') || 2000);

          counterObserver.unobserve(el);

          if (prefersReduced) {
            el.textContent = prefix + target.toFixed(decimals) + suffix;
            return;
          }

          var start = null;
          var startValue = 0;

          function step(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            // Ease-out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = startValue + (target - startValue) * eased;
            el.textContent = prefix + current.toFixed(decimals) + suffix;
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = prefix + target.toFixed(decimals) + suffix;
            }
          }

          requestAnimationFrame(step);
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('[data-target]').forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* ─────────────────────────────────────────────
   * ACCORDION BEHAVIOR
   * ───────────────────────────────────────────── */
  function initAccordions() {
    document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var expanded = trigger.getAttribute('aria-expanded') === 'true';
        var content = trigger.nextElementSibling;

        // Close all others in same accordion
        var parentAccordion = trigger.closest('.accordion');
        if (parentAccordion) {
          parentAccordion.querySelectorAll('.accordion-trigger').forEach(function (t) {
            t.setAttribute('aria-expanded', 'false');
            var c = t.nextElementSibling;
            if (c) c.classList.remove('open');
          });
        }

        if (!expanded) {
          trigger.setAttribute('aria-expanded', 'true');
          if (content) content.classList.add('open');
        }
      });
    });
  }

  /* ─────────────────────────────────────────────
   * INIT — run on DOMContentLoaded + after includes
   * ───────────────────────────────────────────── */
  function init() {
    initScrollReveal();
    initNavbarScroll();
    initCounters();
    initAccordions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init scroll reveal & counters after includes are loaded
  document.addEventListener('includes:loaded', function () {
    // Reset guard so new .reveal elements in partials are observed
    window.__scrollRevealInit = false;
    initScrollReveal();
    initCounters();
    initAccordions();
  });

})();

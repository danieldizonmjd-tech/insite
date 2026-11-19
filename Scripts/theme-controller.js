/**
 * Insite Theme Controller
 * Handles light/dark mode across all pages with time-of-day auto-detection.
 *
 * Default: dark at night (6pm-6am), light during day (6am-6pm).
 * Users can override via toggle; preference is persisted to localStorage.
 *
 * Load this script in <head> BEFORE CSS to prevent flash of wrong theme.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'insite-theme-preference';
  var DARK_META = '#0c1017';
  var LIGHT_META = '#f8fafc';

  function getTimeBasedTheme() {
    var hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'light' : 'dark';
  }

  function resolveTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Auto mode: use time of day
    return getTimeBasedTheme();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Update meta theme-color for mobile browsers
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? LIGHT_META : DARK_META);
    }

    // Update toggle icon if present
    var icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    // Update any theme select dropdown if present
    var select = document.getElementById('themeSetting');
    if (select) {
      var stored = localStorage.getItem(STORAGE_KEY);
      select.value = stored || 'auto';
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  function setTheme(value) {
    if (value === 'auto') {
      localStorage.removeItem(STORAGE_KEY);
      applyTheme(getTimeBasedTheme());
    } else if (value === 'light' || value === 'dark') {
      localStorage.setItem(STORAGE_KEY, value);
      applyTheme(value);
    }
  }

  // Apply immediately (before DOM ready) to prevent flash
  applyTheme(resolveTheme());

  // Re-apply on DOM ready in case elements weren't available at first run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyTheme(resolveTheme());
    });
  }

  // Export to window for onclick handlers
  window.toggleTheme = toggleTheme;
  window.setTheme = setTheme;
  window.applyThemeSetting = function (value) { setTheme(value); };
})();

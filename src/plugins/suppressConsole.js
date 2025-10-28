/* eslint-disable no-console */
// Global console suppression utility
// Suppresses console output in the browser based on env flag.
// Default: suppress (unless VUE_APP_SUPPRESS_CONSOLE is explicitly set to 'false').

(function () {
  if (typeof window === 'undefined') return;

  var suppress = process.env && process.env.VUE_APP_SUPPRESS_CONSOLE;
  var shouldSuppress = (suppress === undefined) || (String(suppress).toLowerCase() === 'true');

  if (!shouldSuppress) return;

  var noop = function () {};
  var methods = [
    'log', 'info', 'debug', 'warn', 'error', 'trace', 'group', 'groupCollapsed', 'groupEnd',
    'table', 'dir', 'dirxml', 'assert', 'count', 'countReset', 'clear', 'time', 'timeLog', 'timeEnd',
    'profile', 'profileEnd'
  ];

  if (!window.console) {
    window.console = {};
  }

  methods.forEach(function (m) {
    try {
      window.console[m] = noop;
    } catch (e) {
      // Ignore any assignment errors
    }
  });
})();
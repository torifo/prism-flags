export const THEMES = ['black', 'purple', 'white'] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = 'black';
export const STORAGE_KEY = 'prism-flags-theme';

export const themeInitScript = `(function() {
  try {
    var t = localStorage.getItem('prism-flags-theme');
    if (t === 'black' || t === 'purple' || t === 'white') {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      document.documentElement.setAttribute('data-theme', 'black');
    }
  } catch(e) {}
})();`;

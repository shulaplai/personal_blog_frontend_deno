const TOKEN_KEY = 'auth_token';
const DARK_MODE_KEY = 'dark_mode';
const THEME_STYLE_KEY = 'theme_style';

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable (private browsing)
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable
  }
}

export const storage = {
  getToken() {
    return safeGet(TOKEN_KEY);
  },
  setToken(token) {
    safeSet(TOKEN_KEY, token);
  },
  removeToken() {
    safeRemove(TOKEN_KEY);
  },

  /**
   * Returns the user's dark mode preference.
   * - `true`: explicitly set to dark
   * - `false`: explicitly set to light
   * - `null`: never set (caller should check system preference)
   */
  getDarkMode() {
    const val = safeGet(DARK_MODE_KEY);
    if (val === null) return null;
    return val === 'true';
  },
  setDarkMode(enabled) {
    safeSet(DARK_MODE_KEY, String(enabled));
  },
  removeDarkMode() {
    safeRemove(DARK_MODE_KEY);
  },

  getThemeStyle() {
    return safeGet(THEME_STYLE_KEY);
  },
  setThemeStyle(value) {
    safeSet(THEME_STYLE_KEY, value);
  },
  removeThemeStyle() {
    safeRemove(THEME_STYLE_KEY);
  },
};

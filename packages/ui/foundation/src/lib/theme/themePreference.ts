/**
 * Framework-agnostic light/dark/system theme preference.
 *
 * `createThemePreference` resolves the stored preference ("system" or one of
 * the two theme names), applies it to `document.documentElement.dataset.theme`,
 * persists it to localStorage and, under "system", follows
 * `prefers-color-scheme: dark` live. `themeInitScript` returns the matching
 * inline script for app.html so the right theme is set before first paint.
 *
 * SSR-safe: nothing touches `window` at import time, and every browser API
 * access is guarded. Storage failures (private mode, blocked site data, quota)
 * never throw; they fall back to "system".
 */

export const SYSTEM = "system";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

export interface ThemePair<L extends string = string, D extends string = string> {
  light: L;
  dark: D;
}

export interface ThemePreferenceOptions<L extends string = string, D extends string = string> {
  /** localStorage key. Omit, or pass `null`/`""`, to keep the choice in memory only. */
  storageKey?: string | null;
  /** The `data-theme` values used for light and dark. */
  themes: ThemePair<L, D>;
}

export type ThemePreferenceValue<L extends string = string, D extends string = string> =
  | typeof SYSTEM
  | L
  | D;

export interface ThemePreferenceState<L extends string = string, D extends string = string> {
  preference: ThemePreferenceValue<L, D>;
  resolved: L | D;
}

export interface ThemePreference<L extends string = string, D extends string = string> {
  /** The stored preference: "system" or one of the theme names. */
  get(): ThemePreferenceValue<L, D>;
  /** The theme name actually applied. */
  resolved(): L | D;
  /** Store and apply a preference. Unknown values fall back to "system". */
  set(preference: ThemePreferenceValue<L, D>): void;
  /** Store-contract subscribe: called now and on every change. Returns an unsubscribe. */
  subscribe(listener: (state: ThemePreferenceState<L, D>) => void): () => void;
  /** Stop following the OS preference and drop every subscriber. */
  destroy(): void;
}

function isPreference<L extends string, D extends string>(
  value: unknown,
  themes: ThemePair<L, D>,
): value is ThemePreferenceValue<L, D> {
  return value === SYSTEM || value === themes.light || value === themes.dark;
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readStored<L extends string, D extends string>(
  key: string | null | undefined,
  themes: ThemePair<L, D>,
): ThemePreferenceValue<L, D> {
  if (!key) return SYSTEM;
  try {
    const value = storage()?.getItem(key);
    return isPreference(value, themes) ? value : SYSTEM;
  } catch {
    return SYSTEM;
  }
}

function writeStored(key: string | null | undefined, value: string): void {
  if (!key) return;
  try {
    storage()?.setItem(key, value);
  } catch {
    // Persisting is best effort; the preference still applies for this page.
  }
}

function darkQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  return window.matchMedia(DARK_QUERY);
}

/** Pure resolution shared by the helper and mirrored by `themeInitScript`. */
export function resolveTheme<L extends string, D extends string>(
  preference: ThemePreferenceValue<L, D>,
  themes: ThemePair<L, D>,
  prefersDark: boolean,
): L | D {
  if (preference !== SYSTEM) return preference;
  return prefersDark ? themes.dark : themes.light;
}

function applyTheme(theme: string): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

export function createThemePreference<L extends string, D extends string>(
  options: ThemePreferenceOptions<L, D>,
): ThemePreference<L, D> {
  const { storageKey, themes } = options;
  const query = darkQuery();
  const listeners = new Set<(state: ThemePreferenceState<L, D>) => void>();
  let preference = readStored(storageKey, themes);
  let following = false;

  const state = (): ThemePreferenceState<L, D> => ({
    preference,
    resolved: resolveTheme(preference, themes, query?.matches ?? false),
  });

  function update(): void {
    const current = state();
    applyTheme(current.resolved);
    listeners.forEach((listener) => listener(current));
  }

  function follow(enabled: boolean): void {
    if (!query || enabled === following) return;
    following = enabled;
    if (enabled) query.addEventListener("change", update);
    else query.removeEventListener("change", update);
  }

  function set(next: ThemePreferenceValue<L, D>): void {
    preference = isPreference(next, themes) ? next : SYSTEM;
    writeStored(storageKey, preference);
    follow(preference === SYSTEM);
    update();
  }

  follow(preference === SYSTEM);
  applyTheme(state().resolved);

  return {
    get: () => preference,
    resolved: () => state().resolved,
    set,
    subscribe(listener) {
      listeners.add(listener);
      listener(state());
      return () => listeners.delete(listener);
    },
    destroy() {
      follow(false);
      listeners.clear();
    },
  };
}

/** JSON-encode for safe embedding inside an inline <script>. */
function scriptLiteral(value: string | null): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Inline script for app.html (inside <head>, before any stylesheet paints)
 * that sets `data-theme` on <html> before first paint, using the same storage
 * key and resolution as `createThemePreference`. Storage failures fall back to
 * "system".
 */
export function themeInitScript(options: ThemePreferenceOptions): string {
  const key = scriptLiteral(options.storageKey || null);
  const light = scriptLiteral(options.themes.light);
  const dark = scriptLiteral(options.themes.dark);
  return (
    `(function(){var k=${key},l=${light},d=${dark},p=null;` +
    `try{if(k)p=localStorage.getItem(k)}catch(e){}` +
    `if(p!==l&&p!==d){try{p=matchMedia(${scriptLiteral(DARK_QUERY)}).matches?d:l}catch(e){p=l}}` +
    `document.documentElement.dataset.theme=p})();`
  );
}

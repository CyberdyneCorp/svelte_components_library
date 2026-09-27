import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createThemePreference,
  resolveTheme,
  themeInitScript,
  type ThemePreferenceState,
} from "./index.js";

const KEY = "app.theme";
const themes = { light: "calm", dark: "calm-dark" } as const;

interface FakeQuery {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  /** Simulate the OS switching colour scheme. */
  flip(dark: boolean): void;
}

function mockMatchMedia(dark: boolean): FakeQuery {
  const listeners = new Set<() => void>();
  const query: FakeQuery = {
    matches: dark,
    addEventListener: vi.fn((_: string, fn: () => void) => listeners.add(fn)),
    removeEventListener: vi.fn((_: string, fn: () => void) => listeners.delete(fn)),
    flip(next) {
      query.matches = next;
      listeners.forEach((fn) => fn());
    },
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => query),
  );
  return query;
}

function breakStorage(): void {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("denied", "SecurityError");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("quota", "QuotaExceededError");
  });
}

const appliedTheme = () => document.documentElement.dataset.theme;

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("resolveTheme", () => {
  it("returns explicit choices as-is and maps system to the OS scheme", () => {
    expect(resolveTheme("calm", themes, true)).toBe("calm");
    expect(resolveTheme("calm-dark", themes, false)).toBe("calm-dark");
    expect(resolveTheme("system", themes, true)).toBe("calm-dark");
    expect(resolveTheme("system", themes, false)).toBe("calm");
  });
});

describe("createThemePreference", () => {
  it("defaults to system and applies the OS scheme on creation", () => {
    mockMatchMedia(true);
    const pref = createThemePreference({ storageKey: KEY, themes });
    expect(pref.get()).toBe("system");
    expect(pref.resolved()).toBe("calm-dark");
    expect(appliedTheme()).toBe("calm-dark");
    pref.destroy();
  });

  it("restores a stored choice and ignores unknown stored values", () => {
    mockMatchMedia(true);
    localStorage.setItem(KEY, "calm");
    const stored = createThemePreference({ storageKey: KEY, themes });
    expect(stored.get()).toBe("calm");
    expect(appliedTheme()).toBe("calm");
    stored.destroy();

    localStorage.setItem(KEY, "neon");
    const unknown = createThemePreference({ storageKey: KEY, themes });
    expect(unknown.get()).toBe("system");
    expect(unknown.resolved()).toBe("calm-dark");
    unknown.destroy();
  });

  it("persists and applies set()", () => {
    mockMatchMedia(false);
    const pref = createThemePreference({ storageKey: KEY, themes });
    pref.set("calm-dark");
    expect(localStorage.getItem(KEY)).toBe("calm-dark");
    expect(appliedTheme()).toBe("calm-dark");
    pref.set("system");
    expect(localStorage.getItem(KEY)).toBe("system");
    expect(appliedTheme()).toBe("calm");
    pref.destroy();
  });

  it("coerces an invalid set() value to system", () => {
    mockMatchMedia(true);
    const pref = createThemePreference({ storageKey: KEY, themes });
    pref.set("calm");
    pref.set("bogus" as never);
    expect(pref.get()).toBe("system");
    expect(appliedTheme()).toBe("calm-dark");
    pref.destroy();
  });

  it("follows the OS scheme live under system, and only then", () => {
    const query = mockMatchMedia(false);
    const pref = createThemePreference({ storageKey: KEY, themes });
    expect(query.addEventListener).toHaveBeenCalledTimes(1);

    query.flip(true);
    expect(appliedTheme()).toBe("calm-dark");

    pref.set("calm");
    expect(query.removeEventListener).toHaveBeenCalledTimes(1);
    query.flip(false);
    query.flip(true);
    expect(appliedTheme()).toBe("calm");

    pref.set("system");
    expect(query.addEventListener).toHaveBeenCalledTimes(2);
    expect(appliedTheme()).toBe("calm-dark");
    pref.destroy();
  });

  it("removes the OS listener on destroy", () => {
    const query = mockMatchMedia(false);
    const pref = createThemePreference({ storageKey: KEY, themes });
    pref.destroy();
    expect(query.removeEventListener).toHaveBeenCalledTimes(1);
    query.flip(true);
    expect(appliedTheme()).toBe("calm");
  });

  it("notifies subscribers immediately and on every change until unsubscribed", () => {
    const query = mockMatchMedia(false);
    const pref = createThemePreference({ storageKey: KEY, themes });
    const seen: ThemePreferenceState[] = [];
    const unsubscribe = pref.subscribe((state) => seen.push(state));

    pref.set("calm-dark");
    pref.set("system");
    query.flip(true);
    unsubscribe();
    pref.set("calm");

    expect(seen).toEqual([
      { preference: "system", resolved: "calm" },
      { preference: "calm-dark", resolved: "calm-dark" },
      { preference: "system", resolved: "calm" },
      { preference: "system", resolved: "calm-dark" },
    ]);
    pref.destroy();
  });

  it("falls back to system without throwing when storage throws", () => {
    mockMatchMedia(true);
    localStorage.setItem(KEY, "calm");
    breakStorage();
    const pref = createThemePreference({ storageKey: KEY, themes });
    expect(pref.get()).toBe("system");
    expect(appliedTheme()).toBe("calm-dark");
    expect(() => pref.set("calm")).not.toThrow();
    expect(appliedTheme()).toBe("calm");
    pref.destroy();
  });

  it("falls back to system when localStorage itself is inaccessible", () => {
    mockMatchMedia(false);
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const pref = createThemePreference({ storageKey: KEY, themes });
    expect(pref.get()).toBe("system");
    expect(() => pref.set("calm-dark")).not.toThrow();
    expect(pref.resolved()).toBe("calm-dark");
    pref.destroy();
  });

  it("keeps the choice in memory only when no storage key is given", () => {
    mockMatchMedia(false);
    const pref = createThemePreference({ storageKey: null, themes });
    pref.set("calm-dark");
    expect(localStorage.length).toBe(0);
    expect(pref.get()).toBe("calm-dark");
    pref.destroy();
  });

  it("resolves to the light theme when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    const pref = createThemePreference({ storageKey: KEY, themes });
    expect(pref.resolved()).toBe("calm");
    expect(() => pref.set("system")).not.toThrow();
    pref.destroy();
  });
});

describe("themeInitScript", () => {
  const run = (script: string) => new Function(script)();

  it("applies the stored explicit theme before paint", () => {
    mockMatchMedia(true);
    localStorage.setItem(KEY, "calm");
    run(themeInitScript({ storageKey: KEY, themes }));
    expect(appliedTheme()).toBe("calm");
  });

  it("uses the OS scheme for system, missing or unknown values", () => {
    mockMatchMedia(true);
    run(themeInitScript({ storageKey: KEY, themes }));
    expect(appliedTheme()).toBe("calm-dark");

    localStorage.setItem(KEY, "system");
    mockMatchMedia(false);
    run(themeInitScript({ storageKey: KEY, themes }));
    expect(appliedTheme()).toBe("calm");
  });

  it("agrees with createThemePreference for every stored value", () => {
    for (const stored of ["calm", "calm-dark", "system", "junk"]) {
      for (const dark of [true, false]) {
        mockMatchMedia(dark);
        localStorage.setItem(KEY, stored);
        run(themeInitScript({ storageKey: KEY, themes }));
        const fromScript = appliedTheme();
        const pref = createThemePreference({ storageKey: KEY, themes });
        expect(fromScript, `${stored}/${dark}`).toBe(pref.resolved());
        pref.destroy();
      }
    }
  });

  it("survives throwing storage and missing matchMedia", () => {
    breakStorage();
    vi.stubGlobal("matchMedia", undefined);
    expect(() => run(themeInitScript({ storageKey: KEY, themes }))).not.toThrow();
    expect(appliedTheme()).toBe("calm");
  });

  it("escapes values so they cannot break out of the script tag", () => {
    const script = themeInitScript({ storageKey: "</script><b>", themes });
    expect(script).not.toContain("</script>");
    expect(script).toContain("\\u003c/script>");
  });

  it("matches the app.html snippet documented in DesignTokens.mdx", () => {
    expect(themeInitScript({ storageKey: "app.theme", themes })).toBe(
      '(function(){var k="app.theme",l="calm",d="calm-dark",p=null;' +
        "try{if(k)p=localStorage.getItem(k)}catch(e){}" +
        'if(p!==l&&p!==d){try{p=matchMedia("(prefers-color-scheme: dark)").matches?d:l}catch(e){p=l}}' +
        "document.documentElement.dataset.theme=p})();",
    );
  });

  it("is a single self-contained expression", () => {
    const script = themeInitScript({ storageKey: KEY, themes });
    expect(script.startsWith("(function(){")).toBe(true);
    expect(script.endsWith("})();")).toBe(true);
    expect(script.length).toBeLessThan(400);
  });
});

describe("SSR safety", () => {
  it("imports without touching window", async () => {
    const matchMedia = vi.fn();
    vi.stubGlobal("matchMedia", matchMedia);
    vi.resetModules();
    await import("./index.js");
    expect(matchMedia).not.toHaveBeenCalled();
  });
});

import { render, screen, fireEvent } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import ThemeToggle from "./ThemeToggle.svelte";

const KEY = "cyberdyne-theme";
const applied = () => document.documentElement.dataset.theme;

function mockMatchMedia(dark: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches: dark,
    addEventListener: vi.fn((_: string, fn: () => void) => listeners.add(fn)),
    removeEventListener: vi.fn((_: string, fn: () => void) => listeners.delete(fn)),
    flip(next: boolean) {
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

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ThemeToggle", () => {
  it("renders with default props", () => {
    render(ThemeToggle);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("has aria-label for toggling theme", () => {
    render(ThemeToggle);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-label")).toContain("Toggle");
  });

  it("can be clicked", async () => {
    render(ThemeToggle);
    const btn = screen.getByRole("button");
    await fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it("applies size class", () => {
    render(ThemeToggle, { props: { size: "sm" } });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("sm");
  });

  describe("two-state (default)", () => {
    it("starts from the OS scheme and toggles light/dark, persisting the choice", async () => {
      mockMatchMedia(true);
      const onchange = vi.fn();
      render(ThemeToggle, { props: { onchange } });
      expect(applied()).toBe("dark");

      await fireEvent.click(screen.getByRole("button", { name: "Toggle light mode" }));
      expect(applied()).toBe("light");
      expect(localStorage.getItem(KEY)).toBe("light");
      expect(onchange).toHaveBeenCalledWith("light");

      await fireEvent.click(screen.getByRole("button", { name: "Toggle dark mode" }));
      expect(applied()).toBe("dark");
      expect(onchange).toHaveBeenLastCalledWith("dark");
    });

    it("restores a stored choice from the legacy light/dark values", () => {
      mockMatchMedia(true);
      localStorage.setItem(KEY, "light");
      render(ThemeToggle);
      expect(applied()).toBe("light");
      expect(screen.getByRole("button")).toHaveAccessibleName("Toggle dark mode");
    });

    it("maps modes to custom theme names", async () => {
      mockMatchMedia(false);
      render(ThemeToggle, { props: { themes: { light: "calm", dark: "calm-dark" } } });
      expect(applied()).toBe("calm");
      await fireEvent.click(screen.getByRole("button"));
      expect(applied()).toBe("calm-dark");
      expect(localStorage.getItem(KEY)).toBe("calm-dark");
    });

    it("applies a theme written by the parent", async () => {
      mockMatchMedia(false);
      const { rerender } = render(ThemeToggle, { props: { theme: "light" } });
      await rerender({ theme: "dark" });
      expect(applied()).toBe("dark");
    });

    it("does not persist when persistKey is empty", async () => {
      mockMatchMedia(false);
      render(ThemeToggle, { props: { persistKey: "" } });
      await fireEvent.click(screen.getByRole("button"));
      expect(localStorage.length).toBe(0);
      expect(applied()).toBe("dark");
    });

    it("does not throw when storage is blocked", async () => {
      mockMatchMedia(true);
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new DOMException("denied", "SecurityError");
      });
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("denied", "SecurityError");
      });
      render(ThemeToggle);
      expect(applied()).toBe("dark");
      await fireEvent.click(screen.getByRole("button"));
      expect(applied()).toBe("light");
    });
  });

  describe("three-state (includeSystem)", () => {
    const themes = { light: "calm", dark: "calm-dark" };

    it("renders a labelled radiogroup with light, dark and system options", () => {
      mockMatchMedia(false);
      render(ThemeToggle, { props: { includeSystem: true, ariaLabel: "Appearance" } });
      const group = screen.getByRole("radiogroup", { name: "Appearance" });
      expect(group).toBeInTheDocument();
      expect(screen.getAllByRole("radio").map((r) => r.getAttribute("value"))).toEqual([
        "light",
        "dark",
        "system",
      ]);
      expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    });

    it("follows the OS live under system", () => {
      const query = mockMatchMedia(false);
      render(ThemeToggle, { props: { includeSystem: true, themes } });
      expect(applied()).toBe("calm");
      query.flip(true);
      expect(applied()).toBe("calm-dark");
    });

    it("stores an explicit choice and stops following the OS", async () => {
      const query = mockMatchMedia(false);
      const onpreferencechange = vi.fn();
      const onchange = vi.fn();
      render(ThemeToggle, {
        props: { includeSystem: true, themes, onpreferencechange, onchange },
      });

      await fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
      expect(applied()).toBe("calm-dark");
      expect(localStorage.getItem(KEY)).toBe("calm-dark");
      expect(onpreferencechange).toHaveBeenCalledWith("dark");
      expect(onchange).toHaveBeenCalledWith("dark");
      expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();

      query.flip(false);
      expect(applied()).toBe("calm-dark");
    });

    it("returns to system and persists it", async () => {
      mockMatchMedia(true);
      localStorage.setItem(KEY, "calm");
      render(ThemeToggle, { props: { includeSystem: true, themes } });
      expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();

      await fireEvent.click(screen.getByRole("radio", { name: "System" }));
      expect(localStorage.getItem(KEY)).toBe("system");
      expect(applied()).toBe("calm-dark");
    });

    it("applies a preference written by the parent", async () => {
      mockMatchMedia(false);
      const { rerender } = render(ThemeToggle, {
        props: { includeSystem: true, themes, preference: "system" as const },
      });
      await rerender({ preference: "dark" });
      expect(applied()).toBe("calm-dark");
      expect(localStorage.getItem(KEY)).toBe("calm-dark");
    });

    it("stops following the OS after unmount", () => {
      const query = mockMatchMedia(false);
      const { unmount } = render(ThemeToggle, { props: { includeSystem: true, themes } });
      unmount();
      expect(query.removeEventListener).toHaveBeenCalled();
    });
  });
});

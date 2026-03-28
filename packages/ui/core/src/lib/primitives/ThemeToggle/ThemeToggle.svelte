<svelte:options runes={true} />

<script lang="ts">
  let {
    theme = $bindable("dark"),
    size = "md",
    persistKey = "cyberdyne-theme",
    onchange,
  }: {
    theme?: "light" | "dark";
    size?: "sm" | "md";
    persistKey?: string;
    onchange?: (theme: "light" | "dark") => void;
  } = $props();

  // Initialize from localStorage or system preference
  function getInitialTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "dark";
    if (persistKey) {
      const stored = localStorage.getItem(persistKey);
      if (stored === "light" || stored === "dark") return stored;
    }
    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
  }

  // Set on mount
  import { onMount } from "svelte";
  onMount(() => {
    theme = getInitialTheme();
    applyTheme(theme);
  });

  function applyTheme(t: "light" | "dark") {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", t);
    if (persistKey) {
      localStorage.setItem(persistKey, t);
    }
  }

  function toggle() {
    theme = theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    onchange?.(theme);
  }

  $effect(() => {
    applyTheme(theme);
  });

  let isDark = $derived(theme === "dark");
</script>

<button
  class="cy-theme-toggle cy-theme-toggle--{size}"
  onclick={toggle}
  aria-label="Toggle {isDark ? 'light' : 'dark'} mode"
  title="Switch to {isDark ? 'light' : 'dark'} mode"
  type="button"
>
  <span class="cy-theme-toggle__track" class:cy-theme-toggle__track--light={!isDark}>
    <span class="cy-theme-toggle__thumb" class:cy-theme-toggle__thumb--light={!isDark}>
      {#if isDark}
        <!-- Moon icon -->
        <svg class="cy-theme-toggle__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      {:else}
        <!-- Sun icon -->
        <svg class="cy-theme-toggle__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      {/if}
    </span>
  </span>
</button>

<style>
  .cy-theme-toggle {
    display: inline-flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .cy-theme-toggle__track {
    position: relative;
    display: flex;
    align-items: center;
    border-radius: var(--radius-pill, 999px);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border-subtle);
    transition: all 0.3s ease;
  }

  .cy-theme-toggle--md .cy-theme-toggle__track {
    width: 52px;
    height: 28px;
    padding: 2px;
  }

  .cy-theme-toggle--sm .cy-theme-toggle__track {
    width: 40px;
    height: 22px;
    padding: 2px;
  }

  .cy-theme-toggle__track--light {
    background: var(--color-surface-hover);
    border-color: var(--color-border-subtle);
  }

  .cy-theme-toggle__thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-surface-default);
    color: var(--color-action-brand-default);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-theme-toggle--md .cy-theme-toggle__thumb {
    width: 22px;
    height: 22px;
    transform: translateX(0);
  }

  .cy-theme-toggle--sm .cy-theme-toggle__thumb {
    width: 16px;
    height: 16px;
    transform: translateX(0);
  }

  .cy-theme-toggle__thumb--light {
    background: var(--color-bg-primary);
    color: var(--color-state-warning);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-theme-toggle--md .cy-theme-toggle__thumb--light {
    transform: translateX(24px);
  }

  .cy-theme-toggle--sm .cy-theme-toggle__thumb--light {
    transform: translateX(18px);
  }

  .cy-theme-toggle__icon {
    display: block;
  }

  .cy-theme-toggle--sm .cy-theme-toggle__icon {
    width: 10px;
    height: 10px;
  }
</style>

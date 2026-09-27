<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";
  import {
    createThemePreference,
    type ThemePreference,
    type ThemePreferenceState,
  } from "@cyberdynecorp/svelte-ui-foundation/theme";

  type Mode = "light" | "dark";
  type Preference = Mode | "system";

  let {
    theme = $bindable("dark"),
    preference = $bindable("system"),
    size = "md",
    persistKey = "cyberdyne-theme",
    includeSystem = false,
    themes = { light: "light", dark: "dark" },
    ariaLabel = "Color theme",
    onchange,
    onpreferencechange,
  }: {
    /** Resolved mode currently applied. Bindable. */
    theme?: Mode;
    /** Stored choice: "light", "dark" or "system" (follows the OS). Bindable. */
    preference?: Preference;
    size?: "sm" | "md";
    /** localStorage key; pass "" to keep the choice in memory only. */
    persistKey?: string;
    /** Render a light / dark / system segmented control instead of the two-state switch. */
    includeSystem?: boolean;
    /** `data-theme` values applied for each mode, e.g. `{ light: "calm", dark: "calm-dark" }`. */
    themes?: { light: string; dark: string };
    /** Accessible name of the light / dark / system group. */
    ariaLabel?: string;
    /** Called with the resolved mode after the user changes the theme. */
    onchange?: (theme: Mode) => void;
    /** Called with the new preference after the user picks one. */
    onpreferencechange?: (preference: Preference) => void;
  } = $props();

  const OPTIONS: { value: Preference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];
  const groupName = `cy-theme-${Math.random().toString(36).slice(2, 9)}`;

  let controller: ThemePreference | undefined;

  const modeOf = (name: string): Mode => (name === themes.dark ? "dark" : "light");
  const preferenceOf = (stored: string): Preference =>
    stored === "system" ? "system" : modeOf(stored);
  const storedValue = (pref: Preference): string => (pref === "system" ? "system" : themes[pref]);

  function sync(state: ThemePreferenceState) {
    theme = modeOf(state.resolved);
    preference = preferenceOf(state.preference);
  }

  onMount(() => {
    controller = createThemePreference({ storageKey: persistKey || null, themes });
    const unsubscribe = controller.subscribe(sync);
    return () => {
      unsubscribe();
      controller?.destroy();
    };
  });

  // Controlled usage: a parent writing `theme` or `preference` applies it.
  $effect(() => {
    const wanted = theme;
    if (controller && modeOf(controller.resolved()) !== wanted) controller.set(themes[wanted]);
  });

  $effect(() => {
    const wanted = preference;
    if (controller && preferenceOf(controller.get()) !== wanted) {
      controller.set(storedValue(wanted));
    }
  });

  function choose(pref: Preference) {
    controller?.set(storedValue(pref));
    onpreferencechange?.(pref);
    onchange?.(theme);
  }

  function toggle() {
    choose(theme === "dark" ? "light" : "dark");
  }

  let isDark = $derived(theme === "dark");
</script>

{#snippet moon()}
  <svg class="cy-theme-toggle__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
{/snippet}

{#snippet sun()}
  <svg class="cy-theme-toggle__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
{/snippet}

{#snippet monitor()}
  <svg class="cy-theme-toggle__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
{/snippet}

{#if includeSystem}
  <div
    class="cy-theme-toggle cy-theme-toggle--segmented cy-theme-toggle--{size}"
    role="radiogroup"
    aria-label={ariaLabel}
  >
    {#each OPTIONS as option (option.value)}
      <label
        class="cy-theme-toggle__option"
        class:cy-theme-toggle__option--active={preference === option.value}
        title={option.label}
      >
        <input
          class="cy-theme-toggle__input"
          type="radio"
          name={groupName}
          value={option.value}
          checked={preference === option.value}
          onchange={() => choose(option.value)}
        />
        {#if option.value === "light"}{@render sun()}{:else if option.value === "dark"}{@render moon()}{:else}{@render monitor()}{/if}
        <span class="cy-theme-toggle__label">{option.label}</span>
      </label>
    {/each}
  </div>
{:else}
  <button
    class="cy-theme-toggle cy-theme-toggle--{size}"
    onclick={toggle}
    aria-label="Toggle {isDark ? 'light' : 'dark'} mode"
    title="Switch to {isDark ? 'light' : 'dark'} mode"
    type="button"
  >
    <span class="cy-theme-toggle__track" class:cy-theme-toggle__track--light={!isDark}>
      <span class="cy-theme-toggle__thumb" class:cy-theme-toggle__thumb--light={!isDark}>
        {#if isDark}{@render moon()}{:else}{@render sun()}{/if}
      </span>
    </span>
  </button>
{/if}

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

  /* ── Light / dark / system segmented control ── */

  .cy-theme-toggle--segmented {
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-pill, 999px);
    background: var(--color-surface-hover);
    cursor: default;
  }

  .cy-theme-toggle__option {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-pill, 999px);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast);
  }

  .cy-theme-toggle--md .cy-theme-toggle__option {
    width: 28px;
    height: 24px;
  }

  .cy-theme-toggle--sm .cy-theme-toggle__option {
    width: 22px;
    height: 18px;
  }

  .cy-theme-toggle__option:hover {
    color: var(--color-text-primary);
  }

  .cy-theme-toggle__option--active {
    background: var(--color-surface-default);
    color: var(--color-action-brand-default);
    /* Selected state is also shown by a ≥3:1 outline, not by colour alone. */
    box-shadow:
      inset 0 0 0 1px var(--color-border-strong),
      var(--shadow-sm);
  }

  .cy-theme-toggle__option:has(.cy-theme-toggle__input:focus-visible) {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 1px;
  }

  .cy-theme-toggle__input,
  .cy-theme-toggle__label {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
</style>

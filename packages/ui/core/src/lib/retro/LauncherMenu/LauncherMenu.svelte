<svelte:options runes={true} />

<script lang="ts">
  /**
   * Sectioned OS-style launcher menu — a dark, dropdown launcher with a
   * header tile, search, grouped sections, per-item hover submenus and a
   * pinned account row. Modelled on macOS Launchpad / Windows 11 Start /
   * Raycast.
   *
   * Layout:
   *   header tile (title + tagline + decorative pixel cube)
   *   search input (the configurable shortcut opens + focuses it)
   *   sections, each with a coloured label and a list of items
   *     - items render icon + label + optional subtitle + optional badge
   *     - items with `children` reveal a submenu on hover/focus
   *   account row pinned at the bottom (status + identity + copy)
   *
   * Picking an item calls `onItemSelect(id)` — the host app decides what
   * each id means. Use `bind:open` to close it on navigation.
   *
   * Per-section accent colours are caller-controlled via the
   * `--section-accent-<id>` CSS custom property (e.g. set
   * `--section-accent-core: #4ade80` on a wrapper). Sensible defaults
   * are provided for the common `core`/`ecosystem`/`learn`/`system` ids.
   */
  import { onMount, tick, type Snippet } from "svelte";
  import type {
    LauncherMenuAccountContext,
    LauncherMenuEntry,
    LauncherMenuSection,
  } from "./types.js";

  interface Props {
    sections: LauncherMenuSection[];
    open?: boolean;
    /** Topbar trigger label. */
    triggerLabel?: string;
    /** Header tile title (top of the panel). */
    header?: string;
    /** Header tile second line. */
    tagline?: string;
    /** Show "ACCOUNT CONNECTED" + identity + copy at the bottom. Ignored
     *  when the `account` snippet is supplied. */
    connected?: boolean;
    /** Short identity form shown in the pill (e.g. "0x7aF…9c3B"). */
    identity?: string | null;
    /** Full identity copied to the clipboard. */
    identityFull?: string | null;
    /** Keyboard shortcut that opens + focuses search. Displayed in the
     *  search badge; the trailing letter is the trigger key (with
     *  Cmd/Ctrl). Pass `null` to disable the shortcut and hide the badge. */
    shortcut?: string | null;
    /** Render a custom icon (SVG, pixel-art, `<img>`…) per entry. Receives
     *  the entry and is used for both items and submenu items. Falls back
     *  to rendering `entry.icon` as text when omitted. */
    icon?: Snippet<[LauncherMenuEntry]>;
    /** Replace the built-in account row entirely. Receives the connection
     *  state. Use this to render a connect-wallet button when signed out,
     *  a custom identity chip, etc. When omitted, the built-in row renders. */
    account?: Snippet<[LauncherMenuAccountContext]>;
    onItemSelect?: (id: string) => void;
  }

  let {
    sections,
    open = $bindable(false),
    triggerLabel = "Start",
    header = "CYBERDYNE OS",
    tagline = "Open infrastructure for AI, Web3, DeFi and beyond.",
    connected = false,
    identity = null,
    identityFull = null,
    shortcut = "⌘K",
    icon,
    account,
    onItemSelect,
  }: Props = $props();

  let search = $state("");
  let hoveredId = $state<string | null>(null);
  let copied = $state(false);
  let searchEl = $state<HTMLInputElement | null>(null);
  // Submenu anchors against the viewport (position: fixed) so the inner
  // scroll container can't clip it. Recomputed on each hover; auto-flips
  // to the left of the item when there isn't room on the right.
  let submenuTop = $state(0);
  let submenuLeft = $state(0);
  const SUBMENU_W = 280;
  const SUBMENU_GAP = 8;

  // The letter that, with Cmd/Ctrl, opens the menu. Derived from the last
  // ASCII letter in the shortcut string (e.g. "⌘K" → "k").
  const shortcutKey = $derived.by(() => {
    if (!shortcut) return null;
    const letters = shortcut.toLowerCase().match(/[a-z]/g);
    return letters ? letters[letters.length - 1] : null;
  });

  // Default accent per known section id; callers override any of these
  // via `--section-accent-<id>` on an ancestor.
  function defaultAccent(id: string): string {
    switch (id) {
      case "core":
        return "#4ade80";
      case "ecosystem":
        return "#60a5fa";
      case "learn":
      case "system":
        return "#93c5fd";
      default:
        return "#60a5fa";
    }
  }

  function placeSubmenu(target: EventTarget | null): void {
    const btn =
      target instanceof Element
        ? (target.closest(".item") as HTMLElement | null)
        : null;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const wouldOverflow = r.right + SUBMENU_GAP + SUBMENU_W > window.innerWidth;
    submenuLeft = wouldOverflow
      ? r.left - SUBMENU_GAP - SUBMENU_W
      : r.right + SUBMENU_GAP;
    submenuTop = r.top;
  }

  const filteredSections = $derived.by(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            i.label.toLowerCase().includes(q) ||
            (i.subtitle ?? "").toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.items.length > 0);
  });

  function toggle() {
    open = !open;
  }

  function pick(id: string) {
    onItemSelect?.(id);
    open = false;
  }

  async function copyIdentity() {
    if (!identityFull) return;
    try {
      await navigator.clipboard.writeText(identityFull);
      copied = true;
      setTimeout(() => (copied = false), 1200);
    } catch {
      /* clipboard denied — ignore */
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      open = false;
      return;
    }
    if (
      shortcutKey &&
      (e.metaKey || e.ctrlKey) &&
      e.key.toLowerCase() === shortcutKey
    ) {
      e.preventDefault();
      open = true;
      void tick().then(() => searchEl?.focus());
    }
  }

  function onDocClick(e: MouseEvent) {
    const t = e.target as HTMLElement | null;
    if (!t || !t.closest(".launcher-menu")) open = false;
  }

  onMount(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  $effect(() => {
    if (open) {
      document.addEventListener("click", onDocClick);
      void tick().then(() => searchEl?.focus());
      return () => document.removeEventListener("click", onDocClick);
    }
  });
</script>

<div class="launcher-menu">
  <button
    type="button"
    class="trigger"
    class:trigger--open={open}
    onclick={toggle}
    aria-haspopup="menu"
    aria-expanded={open}
  >
    <span class="trigger__label">{triggerLabel}</span>
    <span class="trigger__arrow" aria-hidden="true">{open ? "▼" : "▶"}</span>
  </button>

  {#if open}
    <div class="panel" role="menu" aria-label={header}>
      <header class="head">
        <div class="head__text">
          <div class="head__title">{header}</div>
          {#if tagline}<div class="head__sub">{tagline}</div>{/if}
        </div>
        <div class="head__cube" aria-hidden="true">
          <div class="head__cube-inner"></div>
        </div>
      </header>

      <label class="search">
        <span class="search__icon" aria-hidden="true">⌕</span>
        <input
          bind:this={searchEl}
          bind:value={search}
          type="text"
          class="search__input"
          placeholder="Search {header}…"
          autocomplete="off"
          spellcheck="false"
        />
        {#if shortcut}<kbd class="search__kbd">{shortcut}</kbd>{/if}
      </label>

      <div class="sections">
        {#each filteredSections as section (section.id)}
          <div
            class="section"
            style="--_accent: var(--section-accent-{section.id}, {defaultAccent(
              section.id,
            )});"
          >
            <div class="section__label">{section.label}</div>
            {#each section.items as item (item.id)}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="item"
                class:item--has-sub={!!item.children}
                onmouseenter={(e) => {
                  hoveredId = item.id;
                  if (item.children) placeSubmenu(e.currentTarget);
                }}
                onmouseleave={() => {
                  if (hoveredId === item.id) hoveredId = null;
                }}
              >
                <button
                  type="button"
                  class="item__main"
                  role="menuitem"
                  onclick={() => pick(item.id)}
                  onfocus={(e) => {
                    hoveredId = item.id;
                    if (item.children) placeSubmenu(e.currentTarget);
                  }}
                >
                  <span class="item__icon" aria-hidden="true">
                    {#if icon}{@render icon(item)}{:else}{item.icon}{/if}
                  </span>
                  <span class="item__text">
                    <span class="item__label">{item.label}</span>
                    {#if item.subtitle}
                      <span class="item__sub">{item.subtitle}</span>
                    {/if}
                  </span>
                  {#if item.badge !== undefined && item.badge > 0}
                    <span class="item__badge">{item.badge}</span>
                  {/if}
                  {#if item.children}
                    <span class="item__chev" aria-hidden="true">›</span>
                  {/if}
                </button>
                {#if item.children && hoveredId === item.id}
                  <div
                    class="submenu"
                    role="menu"
                    aria-label={`${item.label} submenu`}
                    style="top: {submenuTop}px; left: {submenuLeft}px; width: {SUBMENU_W}px;"
                  >
                    {#each item.children as sub (sub.id)}
                      {@const isViewAll = sub.id === item.id && sub.icon === "↗"}
                      <button
                        type="button"
                        class="submenu__item"
                        class:submenu__item--view-all={isViewAll}
                        role="menuitem"
                        onclick={() => pick(sub.id)}
                      >
                        <span class="submenu__icon" aria-hidden="true">
                          {#if icon}{@render icon(sub)}{:else}{sub.icon}{/if}
                        </span>
                        <span class="submenu__text">
                          <span class="submenu__label">{sub.label}</span>
                          {#if sub.subtitle}
                            <span class="submenu__sub">{sub.subtitle}</span>
                          {/if}
                        </span>
                        {#if isViewAll}
                          <span class="submenu__chev" aria-hidden="true">›</span>
                        {/if}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/each}
        {#if filteredSections.length === 0}
          <p class="empty">No matches for "{search}".</p>
        {/if}
      </div>

      {#if account}
        {@render account({ connected, identity, identityFull })}
      {:else}
        <div class="account" class:account--off={!connected}>
          <span class="dot" class:dot--ok={connected}></span>
          <span class="account__text">
            {connected ? "ACCOUNT CONNECTED" : "NOT SIGNED IN"}
          </span>
          {#if connected && identity}
            <span class="account__id" title={identityFull ?? identity}
              >{identity}</span
            >
            {#if identityFull}
              <button
                type="button"
                class="account__copy"
                onclick={copyIdentity}
                aria-label={copied ? "Copied" : "Copy address"}
                title={copied ? "Copied!" : "Copy address"}
              >
                {copied ? "✓" : "⧉"}
              </button>
            {/if}
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .launcher-menu {
    position: relative;
    display: inline-block;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
  }

  /* ── Trigger ──────────────────────────────────────────────────── */
  .trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    /* Match the height of a typical wallet/account button on the topbar
       (~36 px) so the bar reads as one row, not two. */
    padding: 10px 18px;
    min-height: 36px;
    background: rgba(255, 255, 255, 0.18);
    border: 2px solid #000;
    color: #fff;
    font-weight: 700;
    font-size: 0.8125rem;
    letter-spacing: 0.02em;
    font-family: inherit;
    cursor: pointer;
  }
  .trigger:hover,
  .trigger--open {
    background: rgba(255, 255, 255, 0.3);
  }
  .trigger__arrow {
    font-size: 0.75em;
  }

  /* ── Panel ────────────────────────────────────────────────────── */
  .panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 360px;
    /* No overflow on the panel itself — the inner `.sections` container
       scrolls. This lets the position: fixed submenu render outside the
       panel without being clipped. */
    overflow: visible;
    background: #070a25;
    color: #e0e7ff;
    /* Lighter chrome than retro windows, so the menu reads as a menu
       rather than a third window. */
    border: 1px solid #1e293b;
    box-shadow:
      0 16px 36px rgba(0, 0, 0, 0.55),
      0 2px 0 rgba(0, 0, 0, 0.4);
    z-index: 200;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── Header tile ──────────────────────────────────────────────── */
  .head {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 12px 14px;
    background: linear-gradient(135deg, #0e1538 0%, #1e1b4b 100%);
    border: 1px solid #312e81;
  }
  .head__title {
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #fff;
    font-size: 0.95rem;
  }
  .head__sub {
    font-size: 0.72rem;
    color: #c7d2fe;
    margin-top: 4px;
    line-height: 1.35;
  }
  .head__cube {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%);
    border: 2px solid #1e1b4b;
    box-shadow:
      inset -2px -2px 0 rgba(0, 0, 0, 0.35),
      inset 2px 2px 0 rgba(255, 255, 255, 0.15);
  }
  .head__cube-inner {
    width: 18px;
    height: 18px;
    background: #c7d2fe;
    border: 1.5px solid #1e1b4b;
    transform: rotate(45deg);
    box-shadow:
      inset 1px 1px 0 #fff,
      inset -1px -1px 0 #4338ca;
  }

  /* ── Search ───────────────────────────────────────────────────── */
  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #050a25;
    border: 1.5px solid #1e3a8a;
  }
  .search__icon {
    color: #93c5fd;
  }
  .search__input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    font: inherit;
    font-size: 0.85rem;
    color: #e0e7ff;
  }
  .search__input::placeholder {
    color: #475569;
  }
  .search__kbd {
    font-family: inherit;
    font-size: 0.625rem;
    color: #94a3b8;
    background: #1e293b;
    padding: 2px 6px;
    border: 1px solid #334155;
  }

  /* ── Sections ─────────────────────────────────────────────────── */
  .sections {
    display: flex;
    flex-direction: column;
    gap: 4px;
    /* Scroll here, not on the panel — so the submenu (position: fixed)
       can escape the panel's viewport. */
    max-height: clamp(220px, 60vh, 520px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #1e293b transparent;
  }
  .section {
    display: flex;
    flex-direction: column;
    padding-top: 6px;
  }
  .section + .section {
    margin-top: 6px;
    border-top: 1px solid #1e293b;
  }
  .section__label {
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    /* Caller-overridable via --section-accent-<id>; default per id. */
    color: var(--_accent, #60a5fa);
    padding: 6px 10px 4px;
  }

  /* ── Items ────────────────────────────────────────────────────── */
  .item {
    position: relative;
  }
  .item__main {
    all: unset;
    width: 100%;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 24px 1fr auto auto;
    gap: 12px;
    align-items: center;
    padding: 8px 10px;
    font-size: 0.85rem;
    color: #e0e7ff;
    border-left: 3px solid transparent;
    cursor: pointer;
    transition:
      background 0.1s ease,
      border-color 0.1s ease;
  }
  .item__main:hover,
  .item__main:focus-visible {
    background: #1e1b4b;
    border-left-color: #6366f1;
    outline: none;
  }
  .item__icon {
    width: 24px;
    text-align: center;
    font-size: 1rem;
  }
  .item__text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .item__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item__sub {
    font-size: 0.65rem;
    color: #94a3b8;
    line-height: 1.3;
  }
  .item__badge {
    display: inline-grid;
    place-items: center;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    font-size: 0.7rem;
    font-weight: 700;
    color: #052e16;
    background: #22c55e;
    border-radius: 999px;
  }
  .item__chev {
    color: #93c5fd;
    font-size: 1.1rem;
    line-height: 1;
  }

  /* ── Submenu ──────────────────────────────────────────────────── */
  .submenu {
    /* Anchored to the viewport via JS-computed top/left so the panel's
       scrolling/clipping never affects it. */
    position: fixed;
    background: #070a25;
    color: #e0e7ff;
    border: 1px solid #1e293b;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55);
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 250;
  }
  .submenu__item {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    display: grid;
    grid-template-columns: 26px 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 8px 10px;
    font-size: 0.85rem;
    color: #e0e7ff;
    cursor: pointer;
  }
  .submenu__item:hover,
  .submenu__item:focus-visible {
    background: #1e1b4b;
    outline: none;
  }
  .submenu__icon {
    width: 26px;
    text-align: center;
    font-size: 1.05rem;
  }
  .submenu__text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .submenu__label {
    font-weight: 600;
  }
  .submenu__sub {
    font-size: 0.65rem;
    color: #94a3b8;
    line-height: 1.3;
  }
  .submenu__chev {
    color: #93c5fd;
    font-size: 1.1rem;
    line-height: 1;
  }
  .submenu__item--view-all {
    border-top: 1px solid #1e293b;
    margin-top: 4px;
    padding-top: 10px;
    color: #c7d2fe;
    font-weight: 600;
  }
  .submenu__item--view-all .submenu__icon {
    color: #93c5fd;
  }

  /* ── Account row (pinned at bottom of the panel) ─────────────── */
  .account {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #050a25;
    border: 1px solid #1e293b;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: #94a3b8;
    margin-top: 2px;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #64748b;
    flex: 0 0 auto;
    box-shadow: 0 0 6px rgba(100, 116, 139, 0.5);
  }
  .dot--ok {
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.7);
  }
  .account__text {
    font-weight: 700;
    color: #e0e7ff;
  }
  .account__id {
    margin-left: auto;
    font-family: inherit;
    font-size: 0.7rem;
    letter-spacing: normal;
    color: #c7d2fe;
    background: #1e1b4b;
    padding: 2px 7px;
    border: 1px solid #312e81;
    max-width: 11em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .account__copy {
    font-family: inherit;
    background: transparent;
    border: 1px solid #312e81;
    color: #c7d2fe;
    padding: 2px 6px;
    cursor: pointer;
  }
  .account__copy:hover {
    background: #1e1b4b;
    color: #fff;
  }

  .empty {
    font-size: 0.78rem;
    color: #94a3b8;
    font-style: italic;
    padding: 12px 10px;
    margin: 0;
  }

  @media (max-width: 480px) {
    .panel {
      width: min(92vw, 320px);
    }
    .submenu {
      width: min(82vw, 260px);
    }
  }
</style>

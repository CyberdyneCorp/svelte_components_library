<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    label,
    icon,
    iconSrc,
    selected = false,
    disabled = false,
    badge,
    onActivate,
    children,
  }: {
    label: string;
    icon?: string;
    iconSrc?: string;
    selected?: boolean;
    disabled?: boolean;
    badge?: string | number;
    onActivate?: () => void;
    children?: Snippet;
  } = $props();

  function activate() {
    if (!disabled) onActivate?.();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  }
</script>

<button
  class="cy-dicon"
  class:cy-dicon--selected={selected}
  disabled={disabled}
  aria-label={label}
  ondblclick={activate}
  onclick={activate}
  onkeydown={onKey}
>
  <span class="cy-dicon__img" aria-hidden="true">
    {#if children}
      {@render children()}
    {:else if iconSrc}
      <img src={iconSrc} alt="" />
    {:else if icon}
      <span class="cy-dicon__emoji">{icon}</span>
    {/if}
    {#if badge !== undefined}
      <span class="cy-dicon__badge">{badge}</span>
    {/if}
  </span>
  <span class="cy-dicon__label">{label}</span>
</button>

<style>
  .cy-dicon {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 84px;
    padding: 6px 4px;
    background: transparent;
    border: 2px solid transparent;
    cursor: pointer;
    font-family: var(--font-body, monospace);
    color: var(--color-text-primary, #12121a);
  }
  .cy-dicon:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
    border-color: var(--color-border-subtle, #e0e0e8);
  }
  .cy-dicon--selected {
    background: rgba(168, 85, 247, 0.15);
    border-color: var(--color-action-tertiary-default, #7e22ce);
  }
  .cy-dicon:disabled { opacity: 0.5; cursor: not-allowed; }
  .cy-dicon__img {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    image-rendering: pixelated;
  }
  .cy-dicon__img img { max-width: 100%; max-height: 100%; image-rendering: pixelated; }
  .cy-dicon__emoji { font-size: 32px; line-height: 1; }
  .cy-dicon__badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background: var(--color-state-error, #ff4444);
    color: #fff;
    border: 2px solid var(--color-text-primary, #12121a);
    border-radius: 9px;
    font-size: 0.65rem;
    line-height: 14px;
    text-align: center;
  }
  .cy-dicon__label {
    display: inline-block;
    padding: 1px 6px;
    max-width: 100%;
    background: var(--color-action-secondary-default, #00aacc);
    color: var(--color-action-secondary-text, #fff);
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

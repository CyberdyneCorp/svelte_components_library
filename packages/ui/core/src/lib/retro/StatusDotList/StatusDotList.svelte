<svelte:options runes={true} />

<script lang="ts">
  import type { StatusDotItem } from "./types.js";

  let {
    items = [],
    title,
    icon,
    ariaLabel,
  }: {
    items: StatusDotItem[];
    title?: string;
    icon?: string;
    ariaLabel?: string;
  } = $props();
</script>

<section class="cy-sdlist" aria-label={ariaLabel ?? title ?? "Status list"}>
  {#if title}
    <header class="cy-sdlist__header">
      {#if icon}<span aria-hidden="true">{icon}</span>{/if}
      <h3 class="cy-sdlist__title">{title}</h3>
    </header>
  {/if}
  <ul class="cy-sdlist__list">
    {#each items as it (it.id)}
      <li class="cy-sdlist__item">
        <span
          class="cy-sdlist__dot cy-sdlist__dot--{it.tone ?? 'muted'}"
          aria-hidden="true"
          data-testid="cy-sdlist-dot"
        ></span>
        <span class="cy-sdlist__label">{it.label}</span>
        {#if it.value !== undefined}
          <span class="cy-sdlist__value">{it.value}</span>
        {/if}
      </li>
    {/each}
  </ul>
</section>

<style>
  .cy-sdlist { background: var(--color-surface-default, #fff); border: 2px solid var(--color-text-primary, #12121a); padding: 8px 10px; font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); }
  .cy-sdlist__header { display: flex; align-items: center; gap: 6px; border-bottom: 2px dashed var(--color-border-default, #d0d0da); padding-bottom: 5px; margin-bottom: 6px; }
  .cy-sdlist__title { margin: 0; font-size: 0.82rem; }
  .cy-sdlist__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
  .cy-sdlist__item { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; }
  .cy-sdlist__dot { display: inline-block; width: 10px; height: 10px; border: 1px solid var(--color-text-primary, #12121a); flex-shrink: 0; }
  .cy-sdlist__dot--success { background: var(--color-state-success, #00b32d); }
  .cy-sdlist__dot--danger { background: var(--color-state-error, #ff4444); }
  .cy-sdlist__dot--warning { background: var(--color-state-warning, #ffb800); }
  .cy-sdlist__dot--info { background: var(--color-state-info, #00aacc); }
  .cy-sdlist__dot--muted { background: var(--color-text-tertiary, #6a6a7e); }
  .cy-sdlist__label { flex: 1; }
  .cy-sdlist__value { font-weight: 700; }
</style>

<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import ActionLinks from "./ActionLinks.svelte";
  import type { MarketingAction } from "./types.js";

  let {
    id,
    eyebrow,
    title,
    description,
    actions = [],
    layout = "split",
    align = "start",
    media,
  }: {
    id?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: MarketingAction[];
    layout?: "split" | "centered";
    align?: "start" | "center";
    media?: Snippet;
  } = $props();
</script>

<section
  {id}
  class="cy-marketing-hero cy-marketing-hero--{layout}"
  class:cy-marketing-hero--center={align === "center" || layout === "centered"}
  aria-labelledby={id ? `${id}-title` : undefined}
>
  <div class="cy-marketing-hero__content">
    {#if eyebrow}<p class="cy-marketing-hero__eyebrow">{eyebrow}</p>{/if}
    <h1 class="cy-marketing-hero__title" id={id ? `${id}-title` : undefined}>{title}</h1>
    {#if description}<p class="cy-marketing-hero__description">{description}</p>{/if}
    <ActionLinks {actions} />
  </div>
  {#if media}
    <div class="cy-marketing-hero__media">{@render media()}</div>
  {/if}
</section>

<style>
  .cy-marketing-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(18rem, .95fr);
    align-items: center;
    gap: clamp(2rem, 7vw, 7rem);
    min-height: min(46rem, 90svh);
    padding: clamp(4rem, 10vw, 9rem) clamp(1rem, 8vw, 7rem);
    color: var(--color-text-primary, #f3f4f6);
    background: var(--color-bg-primary, #080a0d);
  }
  .cy-marketing-hero__content { max-width: 48rem; }
  .cy-marketing-hero__eyebrow {
    margin: 0 0 1rem;
    color: var(--color-action-brand-default, #00ff41);
    font: 600 .78rem/1.4 var(--font-mono, monospace);
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .cy-marketing-hero__title {
    margin: 0;
    font: 750 clamp(2.75rem, 7vw, 6.25rem)/.98 var(--font-display, system-ui, sans-serif);
    letter-spacing: -.06em;
    text-wrap: balance;
  }
  .cy-marketing-hero__description {
    max-width: 42rem;
    margin: 1.5rem 0 2rem;
    color: var(--color-text-secondary, #b8bdc9);
    font: 400 clamp(1.05rem, 1.7vw, 1.3rem)/1.65 var(--font-body, system-ui, sans-serif);
  }
  .cy-marketing-hero__media { min-width: 0; }
  .cy-marketing-hero--centered { display: block; min-height: auto; text-align: center; }
  .cy-marketing-hero--center .cy-marketing-hero__content { margin-inline: auto; }
  .cy-marketing-hero--center .cy-marketing-hero__description { margin-inline: auto; }
  .cy-marketing-hero--center :global(.cy-marketing-actions) { justify-content: center; }
  .cy-marketing-hero--center .cy-marketing-hero__media { max-width: 54rem; margin: 3rem auto 0; }
  @media (max-width: 48rem) {
    .cy-marketing-hero { grid-template-columns: minmax(0, 1fr); min-height: auto; gap: 2.5rem; padding-block: 5rem; }
    .cy-marketing-hero__title { font-size: clamp(2.75rem, 13vw, 4.5rem); }
  }
</style>

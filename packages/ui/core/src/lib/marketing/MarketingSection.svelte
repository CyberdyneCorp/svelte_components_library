<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    MarketingHeadingLevel,
    MarketingSectionTone,
    MarketingSectionWidth,
  } from "./types.js";

  let {
    id,
    eyebrow,
    heading,
    description,
    headingLevel = "h2",
    align = "start",
    tone = "default",
    width = "wide",
    children,
  }: {
    id?: string;
    eyebrow?: string;
    heading?: string;
    description?: string;
    headingLevel?: MarketingHeadingLevel;
    align?: "start" | "center";
    tone?: MarketingSectionTone;
    width?: MarketingSectionWidth;
    children?: Snippet;
  } = $props();
</script>

<section
  {id}
  class="cy-marketing-section cy-marketing-section--{tone}"
  class:cy-marketing-section--center={align === "center"}
  aria-labelledby={heading && id ? `${id}-title` : undefined}
>
  <div class="cy-marketing-section__inner cy-marketing-section__inner--{width}">
    {#if eyebrow || heading || description}
      <header class="cy-marketing-section__header">
        {#if eyebrow}<p class="cy-marketing-section__eyebrow">{eyebrow}</p>{/if}
        {#if heading}
          <svelte:element this={headingLevel} class="cy-marketing-section__title" id={id ? `${id}-title` : undefined}>
            {heading}
          </svelte:element>
        {/if}
        {#if description}<p class="cy-marketing-section__description">{description}</p>{/if}
      </header>
    {/if}
    {#if children}{@render children()}{/if}
  </div>
</section>

<style>
  .cy-marketing-section {
    color: var(--color-text-primary, #f3f4f6);
    padding: clamp(3rem, 8vw, 7rem) clamp(1rem, 5vw, 4rem);
  }

  .cy-marketing-section--muted { background: var(--color-surface-raised, #181a22); }
  .cy-marketing-section--accent { background: var(--color-state-info-bg, #06232a); }
  .cy-marketing-section--center { text-align: center; }
  .cy-marketing-section__inner { width: 100%; margin-inline: auto; }
  .cy-marketing-section__inner--narrow { max-width: 48rem; }
  .cy-marketing-section__inner--standard { max-width: 64rem; }
  .cy-marketing-section__inner--wide { max-width: 80rem; }
  .cy-marketing-section__inner--full { max-width: none; }
  .cy-marketing-section__header { max-width: 48rem; margin-bottom: clamp(2rem, 5vw, 3.5rem); }
  .cy-marketing-section--center .cy-marketing-section__header { margin-inline: auto; }
  .cy-marketing-section__eyebrow {
    margin: 0 0 .75rem;
    color: var(--color-action-brand-default, #00ff41);
    font: 600 .75rem/1.4 var(--font-mono, monospace);
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .cy-marketing-section__title {
    margin: 0;
    color: var(--color-text-primary, #f3f4f6);
    font: 700 clamp(1.8rem, 4vw, 3rem)/1.08 var(--font-display, system-ui, sans-serif);
    letter-spacing: -.035em;
  }
  .cy-marketing-section__description {
    max-width: 42rem;
    margin: 1rem 0 0;
    color: var(--color-text-secondary, #b8bdc9);
    font: 400 clamp(1rem, 1.5vw, 1.125rem)/1.65 var(--font-body, system-ui, sans-serif);
  }
  .cy-marketing-section--center .cy-marketing-section__description { margin-inline: auto; }
</style>

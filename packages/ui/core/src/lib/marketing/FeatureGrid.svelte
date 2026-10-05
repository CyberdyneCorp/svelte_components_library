<svelte:options runes={true} />

<script lang="ts">
  import MarketingSection from "./MarketingSection.svelte";
  import type { MarketingFeature, MarketingSectionTone } from "./types.js";

  let {
    id,
    eyebrow,
    heading,
    description,
    features = [],
    columns = 3,
    variant = "cards",
    tone = "default",
  }: {
    id?: string;
    eyebrow?: string;
    heading?: string;
    description?: string;
    features: MarketingFeature[];
    columns?: 2 | 3 | 4;
    variant?: "cards" | "bento";
    tone?: MarketingSectionTone;
  } = $props();
</script>

<MarketingSection {id} {eyebrow} {heading} {description} {tone}>
  {#if features.length}
    <ul class="cy-marketing-features cy-marketing-features--{columns} cy-marketing-features--{variant}">
      {#each features as feature, index (feature.id)}
        <li class="cy-marketing-feature" class:cy-marketing-feature--featured={variant === "bento" && index === 0}>
          {#if feature.icon}<span class="cy-marketing-feature__icon" aria-hidden="true">{feature.icon}</span>{/if}
          <h3 class="cy-marketing-feature__title">{feature.title}</h3>
          <p class="cy-marketing-feature__description">{feature.description}</p>
          {#if feature.href && feature.linkLabel}
            <a class="cy-marketing-feature__link" href={feature.href}>{feature.linkLabel}<span aria-hidden="true"> →</span></a>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</MarketingSection>

<style>
  .cy-marketing-features { display: grid; grid-template-columns: repeat(var(--cy-marketing-columns), minmax(0, 1fr)); gap: 1rem; margin: 0; padding: 0; list-style: none; }
  .cy-marketing-features--2 { --cy-marketing-columns: 2; }
  .cy-marketing-features--3 { --cy-marketing-columns: 3; }
  .cy-marketing-features--4 { --cy-marketing-columns: 4; }
  .cy-marketing-feature {
    min-width: 0;
    min-height: 12rem;
    padding: clamp(1.25rem, 3vw, 2rem);
    border: 1px solid var(--color-border-default, #343843);
    border-radius: var(--radius-lg, 1rem);
    background: var(--color-surface-default, #11131a);
  }
  .cy-marketing-features--bento .cy-marketing-feature--featured { grid-column: span 2; grid-row: span 2; min-height: 24rem; }
  .cy-marketing-feature__icon { display: inline-flex; margin-bottom: 1.5rem; font-size: 1.75rem; }
  .cy-marketing-feature__title { margin: 0; font: 650 1.2rem/1.3 var(--font-display, system-ui, sans-serif); color: var(--color-text-primary, #f3f4f6); }
  .cy-marketing-feature__description { margin: .75rem 0 0; color: var(--color-text-secondary, #b8bdc9); font: 400 .98rem/1.6 var(--font-body, system-ui, sans-serif); }
  .cy-marketing-feature__link { display: inline-block; margin-top: 1.25rem; color: var(--color-action-brand-default, #00ff41); text-decoration-thickness: .08em; text-underline-offset: .2em; }
  .cy-marketing-feature__link:focus-visible { outline: 3px solid var(--color-action-secondary-default, #00d4ff); outline-offset: 3px; }
  @media (max-width: 54rem) { .cy-marketing-features { grid-template-columns: repeat(2, minmax(0, 1fr)); } .cy-marketing-features--4 { --cy-marketing-columns: 2; } }
  @media (max-width: 38rem) { .cy-marketing-features, .cy-marketing-features--4 { grid-template-columns: minmax(0, 1fr); } .cy-marketing-features--bento .cy-marketing-feature--featured { grid-column: auto; grid-row: auto; min-height: 12rem; } }
</style>

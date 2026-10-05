<svelte:options runes={true} />

<script lang="ts">
  import MarketingSection from "./MarketingSection.svelte";
  import type { MarketingMetric, MarketingSectionTone } from "./types.js";

  let {
    id,
    eyebrow,
    heading,
    description,
    metrics = [],
    columns = 3,
    tone = "muted",
  }: {
    id?: string;
    eyebrow?: string;
    heading?: string;
    description?: string;
    metrics: MarketingMetric[];
    columns?: 2 | 3 | 4;
    tone?: MarketingSectionTone;
  } = $props();
</script>

<MarketingSection {id} {eyebrow} {heading} {description} {tone}>
  {#if metrics.length}
    <dl class="cy-marketing-stats cy-marketing-stats--{columns}">
      {#each metrics as metric (metric.id)}
        <div class="cy-marketing-stat">
          <dt>{metric.label}</dt>
          <dd>
            {metric.value}
            {#if metric.description}<p>{metric.description}</p>{/if}
          </dd>
        </div>
      {/each}
    </dl>
  {/if}
</MarketingSection>

<style>
  .cy-marketing-stats { display: grid; grid-template-columns: repeat(var(--cy-stat-columns), minmax(0, 1fr)); gap: 1rem; margin: 0; }
  .cy-marketing-stats--2 { --cy-stat-columns: 2; }
  .cy-marketing-stats--3 { --cy-stat-columns: 3; }
  .cy-marketing-stats--4 { --cy-stat-columns: 4; }
  .cy-marketing-stat { min-width: 0; padding: 1.25rem; border-top: 2px solid var(--color-action-brand-default, #00ff41); }
  .cy-marketing-stat dt { color: var(--color-text-secondary, #b8bdc9); font: 500 .9rem/1.4 var(--font-body, system-ui, sans-serif); }
  .cy-marketing-stat dd { margin: .5rem 0 0; color: var(--color-text-primary, #f3f4f6); font: 750 clamp(1.8rem, 4vw, 3rem)/1 var(--font-display, system-ui, sans-serif); letter-spacing: -.04em; }
  .cy-marketing-stat dd p { margin: .65rem 0 0; color: var(--color-text-secondary, #b8bdc9); font: 400 .9rem/1.5 var(--font-body, system-ui, sans-serif); letter-spacing: 0; }
  @media (max-width: 48rem) { .cy-marketing-stats--4 { --cy-stat-columns: 2; } }
  @media (max-width: 38rem) { .cy-marketing-stats, .cy-marketing-stats--4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>

<svelte:options runes={true} />

<script lang="ts">
  import MarketingSection from "./MarketingSection.svelte";
  import type { MarketingPlan, MarketingSectionTone } from "./types.js";

  let {
    id,
    eyebrow,
    heading,
    description,
    plans = [],
    footnote,
    tone = "default",
  }: {
    id?: string;
    eyebrow?: string;
    heading?: string;
    description?: string;
    plans: MarketingPlan[];
    footnote?: string;
    tone?: MarketingSectionTone;
  } = $props();
</script>

<MarketingSection {id} {eyebrow} {heading} {description} {tone}>
  {#if plans.length}
    <ul class="cy-marketing-plans">
      {#each plans as plan (plan.id)}
        <li class="cy-marketing-plan" class:cy-marketing-plan--highlighted={plan.highlighted}>
          {#if plan.badge}<p class="cy-marketing-plan__badge">{plan.badge}</p>{/if}
          <h3 class="cy-marketing-plan__name">{plan.name}</h3>
          {#if plan.description}<p class="cy-marketing-plan__description">{plan.description}</p>{/if}
          <p class="cy-marketing-plan__price">
            <span>{plan.price}</span>
            {#if plan.period}<span class="cy-marketing-plan__period">{plan.period}</span>{/if}
          </p>
          <a class="cy-marketing-plan__action cy-marketing-plan__action--{plan.action.variant ?? 'primary'}" href={plan.action.href}>{plan.action.label}</a>
          {#if plan.features.length}
            <ul class="cy-marketing-plan__features" aria-label={`${plan.name} features`}>
              {#each plan.features as feature, index (`${plan.id}-feature-${index}`)}
                <li><span aria-hidden="true">✓</span>{feature}</li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  {#if footnote}<p class="cy-marketing-plans__footnote">{footnote}</p>{/if}
</MarketingSection>

<style>
  .cy-marketing-plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); align-items: stretch; gap: 1rem; margin: 0; padding: 0; list-style: none; }
  .cy-marketing-plan { min-width: 0; padding: clamp(1.25rem, 3vw, 2rem); border: 1px solid var(--color-border-default, #343843); border-radius: var(--radius-lg, 1rem); background: var(--color-surface-default, #11131a); }
  .cy-marketing-plan--highlighted { border-color: var(--color-action-brand-default, #00ff41); box-shadow: 0 0 0 1px var(--color-action-brand-default, #00ff41); }
  .cy-marketing-plan__badge { display: table; margin: 0 0 .75rem; border-radius: 999px; padding: .35rem .65rem; background: var(--color-state-success-bg, #12341d); color: var(--color-action-brand-default, #00ff41); font: 650 .75rem/1.2 var(--font-body, system-ui, sans-serif); }
  .cy-marketing-plan__name { margin: 0; color: var(--color-text-primary, #f3f4f6); font: 700 1.4rem/1.25 var(--font-display, system-ui, sans-serif); }
  .cy-marketing-plan__description { min-height: 2.8em; margin: .65rem 0 0; color: var(--color-text-secondary, #b8bdc9); line-height: 1.5; }
  .cy-marketing-plan__price { display: flex; flex-wrap: wrap; align-items: baseline; gap: .5rem; margin: 1.5rem 0; color: var(--color-text-primary, #f3f4f6); }
  .cy-marketing-plan__price > span:first-child { font: 750 clamp(2rem, 4vw, 3rem)/1 var(--font-display, system-ui, sans-serif); letter-spacing: -.04em; }
  .cy-marketing-plan__period { color: var(--color-text-secondary, #b8bdc9); font-size: .9rem; }
  .cy-marketing-plan__action { display: flex; min-height: 2.75rem; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: var(--radius-md, .5rem); padding: .65rem 1rem; font-weight: 650; text-align: center; text-decoration: none; }
  .cy-marketing-plan__action--primary { background: var(--color-action-brand-default, #00ff41); color: var(--color-bg-primary, #080a0d); }
  .cy-marketing-plan__action--secondary { border-color: var(--color-border-default, #555b67); color: var(--color-text-primary, #f3f4f6); }
  .cy-marketing-plan__action--text { color: var(--color-action-brand-default, #00ff41); }
  .cy-marketing-plan__action:focus-visible { outline: 3px solid var(--color-action-secondary-default, #00d4ff); outline-offset: 3px; }
  .cy-marketing-plan__features { display: grid; gap: .75rem; margin: 1.5rem 0 0; padding: 0; list-style: none; color: var(--color-text-secondary, #b8bdc9); font-size: .92rem; }
  .cy-marketing-plan__features li { display: flex; gap: .6rem; align-items: baseline; }
  .cy-marketing-plan__features li span { flex: none; color: var(--color-action-brand-default, #00ff41); }
  .cy-marketing-plans__footnote { margin: 1.5rem 0 0; color: var(--color-text-secondary, #b8bdc9); font-size: .85rem; }
</style>

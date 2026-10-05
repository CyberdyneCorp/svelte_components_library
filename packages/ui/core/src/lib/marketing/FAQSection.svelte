<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import MarketingSection from "./MarketingSection.svelte";
  import type { MarketingFaqItem, MarketingSectionTone } from "./types.js";

  let {
    id,
    eyebrow,
    heading,
    description,
    items = [],
    tone = "default",
    answerId,
  }: {
    id?: string;
    eyebrow?: string;
    heading?: string;
    description?: string;
    items: MarketingFaqItem[];
    tone?: MarketingSectionTone;
    /** Return a stable, unique panel id for each item when explicit IDs are needed. */
    answerId?: (item: MarketingFaqItem) => string;
  } = $props();

  function isSnippet(answer: string | Snippet): answer is Snippet {
    return typeof answer === "function";
  }
</script>

<MarketingSection {id} {eyebrow} {heading} {description} tone={tone} width="standard">
  {#if items.length}
    <div class="cy-marketing-faq">
      {#each items as item (item.id)}
        <details class="cy-marketing-faq__item">
          <summary class="cy-marketing-faq__question" aria-controls={answerId?.(item)}>
            {item.question}<span aria-hidden="true">+</span>
          </summary>
          <div class="cy-marketing-faq__answer" id={answerId?.(item)}>
            {#if isSnippet(item.answer)}{@render item.answer()}{:else}<p>{item.answer}</p>{/if}
          </div>
        </details>
      {/each}
    </div>
  {/if}
</MarketingSection>

<style>
  .cy-marketing-faq { border-top: 1px solid var(--color-border-default, #343843); }
  .cy-marketing-faq__item { border-bottom: 1px solid var(--color-border-default, #343843); }
  .cy-marketing-faq__question { display: flex; min-height: 4rem; align-items: center; justify-content: space-between; gap: 1rem; cursor: pointer; color: var(--color-text-primary, #f3f4f6); font: 650 1.05rem/1.4 var(--font-body, system-ui, sans-serif); list-style: none; }
  .cy-marketing-faq__question::-webkit-details-marker { display: none; }
  .cy-marketing-faq__question::marker { content: ""; }
  .cy-marketing-faq__question > span { color: var(--color-action-brand-default, #00ff41); font-size: 1.4rem; }
  details[open] .cy-marketing-faq__question > span { transform: rotate(45deg); }
  .cy-marketing-faq__question:focus-visible { outline: 3px solid var(--color-action-secondary-default, #00d4ff); outline-offset: 4px; }
  .cy-marketing-faq__answer { max-width: 48rem; padding: 0 2rem 1.5rem 0; color: var(--color-text-secondary, #b8bdc9); font: 400 .98rem/1.65 var(--font-body, system-ui, sans-serif); }
  .cy-marketing-faq__answer :global(p:first-child) { margin-top: 0; }
  .cy-marketing-faq__answer :global(p:last-child) { margin-bottom: 0; }
</style>

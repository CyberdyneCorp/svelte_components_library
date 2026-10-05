<svelte:options runes={true} />

<script lang="ts">
  import MarketingSection from "./MarketingSection.svelte";
  import type { MarketingLogo, MarketingSectionTone } from "./types.js";

  let {
    id,
    heading = "",
    description,
    logos = [],
    tone = "muted",
  }: {
    id?: string;
    heading?: string;
    description?: string;
    logos: MarketingLogo[];
    tone?: MarketingSectionTone;
  } = $props();
</script>

<MarketingSection {id} {heading} {description} align="center" width="wide" {tone}>
  {#if logos.length}
    <ul class="cy-marketing-logos" aria-label={heading || undefined}>
      {#each logos as logo (logo.id)}
        <li class="cy-marketing-logo">
          {#if logo.href}<a href={logo.href} aria-label={logo.name}>{@render logoContent(logo)}</a>
          {:else}{@render logoContent(logo)}{/if}
        </li>
      {/each}
    </ul>
  {/if}
</MarketingSection>

{#snippet logoContent(logo: MarketingLogo)}
  {#if logo.src}
    <img class="cy-marketing-logo__image" src={logo.src} alt={logo.alt ?? logo.name} loading="lazy" />
  {:else}
    <span class="cy-marketing-logo__name">{logo.name}</span>
  {/if}
{/snippet}

<style>
  .cy-marketing-logos { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: clamp(1.5rem, 5vw, 4rem); margin: 0; padding: 0; list-style: none; }
  .cy-marketing-logo { display: grid; min-width: 5rem; min-height: 2.75rem; place-items: center; }
  .cy-marketing-logo a { display: inline-flex; align-items: center; min-height: 2.75rem; color: inherit; text-decoration: none; }
  .cy-marketing-logo a:focus-visible { outline: 3px solid var(--color-action-secondary-default, #00d4ff); outline-offset: 4px; }
  .cy-marketing-logo__image { display: block; max-width: min(10rem, 36vw); max-height: 2.5rem; object-fit: contain; filter: grayscale(1); opacity: .78; }
  .cy-marketing-logo__name { color: var(--color-text-secondary, #b8bdc9); font: 700 1.15rem/1.2 var(--font-display, system-ui, sans-serif); letter-spacing: .02em; }
</style>

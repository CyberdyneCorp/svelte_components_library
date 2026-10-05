<svelte:options runes={true} />

<script lang="ts">
  import type { MarketingLink, MarketingLinkGroup } from "./types.js";

  let {
    brand,
    brandHref = "/",
    description,
    groups = [],
    legalLinks = [],
    copyright,
  }: {
    brand: string;
    brandHref?: string;
    description?: string;
    groups?: MarketingLinkGroup[];
    legalLinks?: MarketingLink[];
    copyright?: string;
  } = $props();
</script>

<footer class="cy-marketing-footer">
  <div class="cy-marketing-footer__main">
    <div class="cy-marketing-footer__brand">
      <a class="cy-marketing-footer__brand-link" href={brandHref}>{brand}</a>
      {#if description}<p>{description}</p>{/if}
    </div>
    {#if groups.length}
      <nav class="cy-marketing-footer__nav" aria-label="Footer">
        {#each groups as group (group.id)}
          {#if group.links.length}
            <div class="cy-marketing-footer__group">
              <h2>{group.label}</h2>
              <ul>
                {#each group.links as link (`${group.id}-${link.href}`)}<li><a href={link.href}>{link.label}</a></li>{/each}
              </ul>
            </div>
          {/if}
        {/each}
      </nav>
    {/if}
  </div>
  {#if copyright || legalLinks.length}
    <div class="cy-marketing-footer__bottom">
      {#if copyright}<p>{copyright}</p>{/if}
      {#if legalLinks.length}
        <nav aria-label="Legal"><ul>{#each legalLinks as link (`${link.href}-${link.label}`)}<li><a href={link.href}>{link.label}</a></li>{/each}</ul></nav>
      {/if}
    </div>
  {/if}
</footer>

<style>
  .cy-marketing-footer { padding: clamp(2.5rem, 6vw, 5rem) clamp(1rem, 5vw, 4rem) 1.5rem; background: var(--color-bg-primary, #080a0d); color: var(--color-text-primary, #f3f4f6); }
  .cy-marketing-footer__main, .cy-marketing-footer__bottom { max-width: 80rem; margin-inline: auto; }
  .cy-marketing-footer__main { display: grid; grid-template-columns: minmax(12rem, 1fr) 2fr; gap: 3rem; padding-bottom: 3rem; }
  .cy-marketing-footer__brand-link { color: var(--color-text-primary, #f3f4f6); font: 750 1.35rem/1.2 var(--font-display, system-ui, sans-serif); text-decoration: none; }
  .cy-marketing-footer__brand p { max-width: 24rem; color: var(--color-text-secondary, #b8bdc9); line-height: 1.55; }
  .cy-marketing-footer__nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); gap: 1.5rem; }
  .cy-marketing-footer__group h2 { margin: 0 0 1rem; font: 650 .88rem/1.3 var(--font-body, system-ui, sans-serif); }
  .cy-marketing-footer__group ul, .cy-marketing-footer__bottom ul { display: grid; gap: .7rem; margin: 0; padding: 0; list-style: none; }
  .cy-marketing-footer a { color: var(--color-text-secondary, #b8bdc9); text-underline-offset: .2em; }
  .cy-marketing-footer a:hover { color: var(--color-text-primary, #f3f4f6); }
  .cy-marketing-footer a:focus-visible { outline: 3px solid var(--color-action-secondary-default, #00d4ff); outline-offset: 3px; }
  .cy-marketing-footer__bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid var(--color-border-default, #343843); padding-top: 1.25rem; color: var(--color-text-secondary, #b8bdc9); font-size: .85rem; }
  .cy-marketing-footer__bottom p { margin: 0; }
  .cy-marketing-footer__bottom ul { display: flex; flex-wrap: wrap; gap: 1rem; }
  @media (max-width: 42rem) { .cy-marketing-footer__main { grid-template-columns: minmax(0, 1fr); gap: 2rem; } }
</style>

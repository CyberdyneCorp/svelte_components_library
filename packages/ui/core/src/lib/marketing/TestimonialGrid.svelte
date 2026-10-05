<svelte:options runes={true} />

<script lang="ts">
  import MarketingSection from "./MarketingSection.svelte";
  import type { MarketingSectionTone, MarketingTestimonial } from "./types.js";

  let {
    id,
    eyebrow,
    heading,
    description,
    testimonials = [],
    columns = 3,
    tone = "default",
  }: {
    id?: string;
    eyebrow?: string;
    heading?: string;
    description?: string;
    testimonials: MarketingTestimonial[];
    columns?: 2 | 3;
    tone?: MarketingSectionTone;
  } = $props();
</script>

<MarketingSection {id} {eyebrow} {heading} {description} {tone}>
  {#if testimonials.length}
    <ul class="cy-marketing-testimonials cy-marketing-testimonials--{columns}">
      {#each testimonials as testimonial (testimonial.id)}
        <li class="cy-marketing-testimonial">
          <figure>
            <blockquote class="cy-marketing-testimonial__quote">{testimonial.quote}</blockquote>
            <figcaption class="cy-marketing-testimonial__person">
              {#if testimonial.avatarSrc}<img src={testimonial.avatarSrc} alt="" loading="lazy" />{/if}
              <span>
                <span class="cy-marketing-testimonial__author">{testimonial.author}</span>
                {#if testimonial.role || testimonial.organization}
                  <span class="cy-marketing-testimonial__meta">{[testimonial.role, testimonial.organization].filter(Boolean).join(" · ")}</span>
                {/if}
              </span>
            </figcaption>
          </figure>
        </li>
      {/each}
    </ul>
  {/if}
</MarketingSection>

<style>
  .cy-marketing-testimonials { display: grid; grid-template-columns: repeat(var(--cy-testimonial-columns), minmax(0, 1fr)); gap: 1rem; margin: 0; padding: 0; list-style: none; }
  .cy-marketing-testimonials--2 { --cy-testimonial-columns: 2; }
  .cy-marketing-testimonials--3 { --cy-testimonial-columns: 3; }
  .cy-marketing-testimonial { min-width: 0; padding: clamp(1.25rem, 3vw, 2rem); border: 1px solid var(--color-border-default, #343843); border-radius: var(--radius-lg, 1rem); background: var(--color-surface-default, #11131a); }
  .cy-marketing-testimonial figure { display: flex; height: 100%; flex-direction: column; justify-content: space-between; gap: 2rem; margin: 0; }
  .cy-marketing-testimonial__quote { margin: 0; color: var(--color-text-primary, #f3f4f6); font: 450 1.05rem/1.65 var(--font-body, system-ui, sans-serif); }
  .cy-marketing-testimonial__quote::before { content: "“"; color: var(--color-action-brand-default, #00ff41); font-size: 1.5em; }
  .cy-marketing-testimonial__person { display: flex; align-items: center; gap: .8rem; color: var(--color-text-primary, #f3f4f6); }
  .cy-marketing-testimonial__person img { width: 2.75rem; height: 2.75rem; border-radius: 50%; object-fit: cover; }
  .cy-marketing-testimonial__person > span { display: grid; gap: .2rem; }
  .cy-marketing-testimonial__author { font-weight: 650; }
  .cy-marketing-testimonial__meta { color: var(--color-text-secondary, #b8bdc9); font-size: .85rem; }
  @media (max-width: 48rem) { .cy-marketing-testimonials { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 38rem) { .cy-marketing-testimonials { grid-template-columns: minmax(0, 1fr); } }
</style>

<svelte:options runes={true} />

<script lang="ts">
  import ActionLinks from "./ActionLinks.svelte";
  import MarketingSection from "./MarketingSection.svelte";
  import type { MarketingAction, MarketingSectionTone } from "./types.js";

  let {
    id,
    eyebrow,
    heading,
    description,
    actions = [],
    tone = "accent",
    align = "center",
  }: {
    id?: string;
    eyebrow?: string;
    heading: string;
    description?: string;
    actions?: MarketingAction[];
    tone?: MarketingSectionTone;
    align?: "start" | "center";
  } = $props();
</script>

<MarketingSection {id} {eyebrow} {heading} {description} headingLevel="h2" {tone} {align} width="standard">
  <div class="cy-marketing-cta__actions"><ActionLinks {actions} /></div>
</MarketingSection>

<style>
  .cy-marketing-cta__actions { margin-top: -1rem; }
  .cy-marketing-cta__actions :global(.cy-marketing-actions) { justify-content: var(--cy-marketing-actions-justify, flex-start); }
  :global(.cy-marketing-section--center) .cy-marketing-cta__actions { --cy-marketing-actions-justify: center; }
</style>

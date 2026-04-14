<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from "svelte";

  let {
    lines = [],
    logo = "CyberdyneOS",
    typeSpeedMs = 50,
    autoStart = true,
    onDone,
  }: {
    lines?: string[];
    logo?: string;
    typeSpeedMs?: number;
    autoStart?: boolean;
    onDone?: () => void;
  } = $props();

  let visible = $state<string[]>([]);
  let done = $state(false);

  onMount(() => {
    if (!autoStart || lines.length === 0) { done = true; onDone?.(); return; }
    let i = 0;
    const t = setInterval(() => {
      visible = [...visible, lines[i]];
      i++;
      if (i >= lines.length) {
        clearInterval(t);
        done = true;
        onDone?.();
      }
    }, typeSpeedMs);
    return () => clearInterval(t);
  });
</script>

<div class="cy-boot" role="status" aria-live="polite" aria-label="Boot screen">
  <pre class="cy-boot__logo" aria-hidden="true">{logo}</pre>
  <ul class="cy-boot__lines">
    {#each visible as line, i (i)}
      <li class="cy-boot__line">[OK] {line}</li>
    {/each}
  </ul>
  {#if done}
    <p class="cy-boot__ready" data-testid="cy-boot-ready">Ready.</p>
  {/if}
</div>

<style>
  .cy-boot { min-height: 200px; padding: 24px; background: #000; color: #00ff41; font-family: "Courier New", monospace; font-size: 0.85rem; line-height: 1.5; }
  .cy-boot__logo { font-size: 1.4rem; font-weight: 700; letter-spacing: 0.1em; margin: 0 0 12px; color: #00ff41; text-shadow: 0 0 8px rgba(0, 255, 65, 0.5); }
  .cy-boot__lines { margin: 0; padding: 0; list-style: none; }
  .cy-boot__line { white-space: pre-wrap; }
  .cy-boot__ready { margin-top: 10px; color: #00d4ff; font-weight: 700; }
</style>

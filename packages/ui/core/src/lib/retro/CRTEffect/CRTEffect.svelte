<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    scanlines = true,
    vignette = true,
    flicker = false,
    intensity = 0.15,
    children,
  }: {
    scanlines?: boolean;
    vignette?: boolean;
    flicker?: boolean;
    intensity?: number;
    children?: Snippet;
  } = $props();
</script>

<div
  class="cy-crt"
  class:cy-crt--scan={scanlines}
  class:cy-crt--vig={vignette}
  class:cy-crt--flick={flicker}
  style:--cy-crt-intensity={intensity}
  data-testid="cy-crt"
>
  {#if children}{@render children()}{/if}
</div>

<style>
  .cy-crt { position: relative; }
  .cy-crt--scan::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, calc(var(--cy-crt-intensity, 0.15) * 1)) 0 1px,
      transparent 1px 3px
    );
    z-index: 9998;
  }
  .cy-crt--vig::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.45) 100%);
    z-index: 9999;
  }
  .cy-crt--flick { animation: cy-crt-flick 4s infinite; }
  @keyframes cy-crt-flick {
    0%, 97%, 100% { opacity: 1; }
    98% { opacity: 0.85; }
    99% { opacity: 0.95; }
  }
</style>

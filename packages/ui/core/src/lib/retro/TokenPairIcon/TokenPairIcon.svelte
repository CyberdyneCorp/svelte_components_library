<svelte:options runes={true} />

<script lang="ts">
  let {
    tokenA,
    tokenB,
    tokenAIconSrc,
    tokenBIconSrc,
    tokenAColor,
    tokenBColor,
    size = 28,
    ariaLabel,
    showInitials = true,
    maxInitials = 2,
  }: {
    tokenA: string;
    tokenB: string;
    tokenAIconSrc?: string;
    tokenBIconSrc?: string;
    /** Ring background for token A. Defaults to the `--tpair-a-bg` token (brand colour). */
    tokenAColor?: string;
    /** Ring background for token B. Defaults to the `--tpair-b-bg` token (secondary colour). */
    tokenBColor?: string;
    size?: number;
    ariaLabel?: string;
    /** Render symbol initials in rings without an icon; `false` leaves them as plain discs. */
    showInitials?: boolean;
    /** Maximum number of characters taken from each symbol for the initials. */
    maxInitials?: number;
  } = $props();

  const label = $derived(ariaLabel ?? `${tokenA}/${tokenB}`);
  const initialsLength = $derived(Math.max(1, Math.floor(maxInitials)));
  const initials = (sym: string) => sym.slice(0, initialsLength).toUpperCase();
</script>

{#snippet ring(side: "a" | "b", symbol: string, src: string | undefined, color: string | undefined)}
  <span
    class="cy-tpair__ring cy-tpair__ring--{side}"
    style:background={color}
    data-testid="cy-tpair-{side}"
  >
    {#if src}
      <img {src} alt="" />
    {:else if showInitials}
      {initials(symbol)}
    {/if}
  </span>
{/snippet}

<span
  class="cy-tpair"
  role="img"
  aria-label={label}
  style:--cy-tpair-size="{size}px"
  data-testid="cy-tpair"
>
  {@render ring("a", tokenA, tokenAIconSrc, tokenAColor)}
  {@render ring("b", tokenB, tokenBIconSrc, tokenBColor)}
</span>

<style>
  .cy-tpair {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: calc(var(--cy-tpair-size, 28px) * 1.6);
    height: var(--cy-tpair-size, 28px);
    font-family: var(--font-body, monospace);
  }
  .cy-tpair__ring {
    position: absolute;
    width: var(--cy-tpair-size, 28px);
    height: var(--cy-tpair-size, 28px);
    border: var(--tpair-ring-border, 2px solid var(--color-text-primary, #12121a));
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: calc(var(--cy-tpair-size, 28px) * 0.35);
    font-weight: 700;
    color: var(--tpair-initials-color, var(--color-text-inverse, #fff));
    overflow: hidden;
  }
  .cy-tpair__ring img { width: 100%; height: 100%; object-fit: cover; }
  .cy-tpair__ring--a {
    left: 0;
    z-index: 1;
    background: var(--tpair-a-bg, var(--color-action-brand-default, #00b32d));
  }
  .cy-tpair__ring--b {
    left: calc(var(--cy-tpair-size, 28px) * 0.55);
    z-index: 2;
    background: var(--tpair-b-bg, var(--color-action-secondary-default, #00aacc));
  }
</style>

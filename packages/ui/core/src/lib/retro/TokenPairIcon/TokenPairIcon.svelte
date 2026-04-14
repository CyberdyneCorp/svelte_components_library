<svelte:options runes={true} />

<script lang="ts">
  let {
    tokenA,
    tokenB,
    tokenAIconSrc,
    tokenBIconSrc,
    tokenAColor = "var(--color-action-brand-default, #00b32d)",
    tokenBColor = "var(--color-action-secondary-default, #00aacc)",
    size = 28,
    ariaLabel,
  }: {
    tokenA: string;
    tokenB: string;
    tokenAIconSrc?: string;
    tokenBIconSrc?: string;
    tokenAColor?: string;
    tokenBColor?: string;
    size?: number;
    ariaLabel?: string;
  } = $props();

  const label = $derived(ariaLabel ?? `${tokenA}/${tokenB}`);
  const initials = (sym: string) => sym.slice(0, 2).toUpperCase();
</script>

<span
  class="cy-tpair"
  role="img"
  aria-label={label}
  style:--cy-tpair-size="{size}px"
  data-testid="cy-tpair"
>
  <span
    class="cy-tpair__ring cy-tpair__ring--a"
    style:background={tokenAColor}
    data-testid="cy-tpair-a"
  >
    {#if tokenAIconSrc}
      <img src={tokenAIconSrc} alt="" />
    {:else}
      {initials(tokenA)}
    {/if}
  </span>
  <span
    class="cy-tpair__ring cy-tpair__ring--b"
    style:background={tokenBColor}
    data-testid="cy-tpair-b"
  >
    {#if tokenBIconSrc}
      <img src={tokenBIconSrc} alt="" />
    {:else}
      {initials(tokenB)}
    {/if}
  </span>
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
    border: 2px solid var(--color-text-primary, #12121a);
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: calc(var(--cy-tpair-size, 28px) * 0.35);
    font-weight: 700;
    color: var(--color-text-inverse, #fff);
    overflow: hidden;
  }
  .cy-tpair__ring img { width: 100%; height: 100%; object-fit: cover; }
  .cy-tpair__ring--a { left: 0; z-index: 1; }
  .cy-tpair__ring--b { left: calc(var(--cy-tpair-size, 28px) * 0.55); z-index: 2; }
</style>

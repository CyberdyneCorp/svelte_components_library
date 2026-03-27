<svelte:options runes={true} />

<script lang="ts">
  let {
    tier = 1,
    label = "",
    showLevel = true,
  }: {
    tier: 1 | 2 | 3 | 4 | 5 | 6;
    label?: string;
    showLevel?: boolean;
  } = $props();

  const tierConfig = {
    1: { name: "Basic", gradient: "linear-gradient(135deg, #555, #777)", glow: "none", color: "#aaa" },
    2: { name: "Verified", gradient: "linear-gradient(135deg, #00cc33, #00ff41)", glow: "none", color: "#00ff41" },
    3: { name: "Advanced", gradient: "linear-gradient(135deg, #0099cc, #00d4ff)", glow: "none", color: "#00d4ff" },
    4: { name: "Expert", gradient: "linear-gradient(135deg, #7b2ff7, #b366ff)", glow: "0 0 12px rgba(123, 47, 247, 0.4)", color: "#b366ff" },
    5: { name: "Elite", gradient: "linear-gradient(135deg, #cc8800, #ffb800)", glow: "0 0 14px rgba(255, 184, 0, 0.4)", color: "#ffb800" },
    6: { name: "Legendary", gradient: "linear-gradient(135deg, #ff2222, #ff4444, #ffd700)", glow: "0 0 18px rgba(255, 34, 34, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)", color: "#ff4444" },
  } as const;

  let config = $derived(tierConfig[tier]);
  let displayLabel = $derived(label || config.name);
  let hasGlow = $derived(tier >= 4);
</script>

<span
  class="cy-tier cy-tier--{tier}"
  class:cy-tier--glow={hasGlow}
  style:--tier-gradient={config.gradient}
  style:--tier-glow={config.glow}
  style:--tier-color={config.color}
>
  {#if showLevel}
    <span class="cy-tier__level">T{tier}</span>
  {/if}
  <span class="cy-tier__label">{displayLabel}</span>
</span>

<style>
  .cy-tier {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-pill, 999px);
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    font-weight: var(--font-weight-bold, 700);
    background: var(--color-surface-base, #12121a);
    border: 1.5px solid transparent;
    position: relative;
    overflow: hidden;
    transition: all var(--transition-default, 0.2s ease);
  }

  /* gradient border via pseudo-element */
  .cy-tier::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    background: var(--tier-gradient);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    pointer-events: none;
  }

  .cy-tier--glow {
    box-shadow: var(--tier-glow);
  }

  .cy-tier--glow:hover {
    filter: brightness(1.15);
  }

  .cy-tier__level {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: var(--radius-full, 50%);
    background: var(--tier-gradient);
    color: #0a0a0f;
    font-size: 0.5625rem;
    font-weight: var(--font-weight-bold, 700);
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  .cy-tier__label {
    color: var(--tier-color);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* Tier 6 special shimmer */
  .cy-tier--6::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 215, 0, 0.1),
      transparent
    );
    animation: tierShimmer 3s ease infinite;
    pointer-events: none;
  }

  @keyframes tierShimmer {
    0% { left: -100%; }
    100% { left: 200%; }
  }
</style>

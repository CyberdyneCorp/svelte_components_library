<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import Icon from "../../primitives/Icon/Icon.svelte";
  import {
    STATUS_BADGE_DEFAULTS,
    type StatusBadgeIndicator,
    type StatusBadgeStatus,
    type StatusBadgeTone,
  } from "./statusBadge.js";

  let {
    status = "active",
    label = "",
    /** Colour tone; defaults to the status' tone (see `STATUS_BADGE_DEFAULTS`). */
    tone,
    /**
     * Leading marker. `"dot"` (default) is the original colour dot; `"icon"`
     * shows the status' own icon shape so the badge reads in grayscale, and an
     * empty `label` falls back to the status' default label.
     */
    indicator = "dot",
    /** Custom leading marker. Replaces the dot or icon; rendered `aria-hidden`. */
    icon,
  }: {
    status?: StatusBadgeStatus;
    label?: string;
    tone?: StatusBadgeTone;
    indicator?: StatusBadgeIndicator;
    icon?: Snippet;
  } = $props();

  const defaults = $derived(STATUS_BADGE_DEFAULTS[status] ?? STATUS_BADGE_DEFAULTS.active);
  const resolvedTone = $derived(tone ?? defaults.tone);
  const iconMode = $derived(indicator === "icon" || icon !== undefined);
  const text = $derived(label || (iconMode ? defaults.label : ""));
</script>

<span class="cy-status-badge cy-status-badge--{status} cy-status-badge--tone-{resolvedTone}">
  {#if icon}
    <span class="cy-status-badge__icon" aria-hidden="true">{@render icon()}</span>
  {:else if indicator === "icon"}
    <span class="cy-status-badge__icon" aria-hidden="true">
      <Icon name={defaults.icon} size={14} />
    </span>
  {:else}
    <span class="cy-status-badge__dot"></span>
  {/if}
  <span class="cy-status-badge__label">{text}</span>
</span>

<style>
  .cy-status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
  }

  /* Tones set the marker and text colours; the dot glow is off for neutral. */
  .cy-status-badge--tone-success {
    --cy-status-dot: var(--color-state-success);
    --cy-status-text: var(--color-state-success);
    --cy-status-glow: 0 0 6px var(--color-state-success-bg);
  }

  .cy-status-badge--tone-neutral {
    --cy-status-dot: var(--primitive-grey-50);
    --cy-status-text: var(--color-text-tertiary);
    --cy-status-glow: none;
  }

  .cy-status-badge--tone-warning {
    --cy-status-dot: var(--color-state-warning);
    --cy-status-text: var(--color-state-warning);
    --cy-status-glow: 0 0 6px var(--color-state-warning-bg);
  }

  .cy-status-badge--tone-error {
    --cy-status-dot: var(--color-state-error);
    --cy-status-text: var(--color-state-error);
    --cy-status-glow: 0 0 6px var(--color-state-error-bg);
  }

  .cy-status-badge--tone-info {
    --cy-status-dot: var(--color-state-info);
    --cy-status-text: var(--color-state-info);
    --cy-status-glow: 0 0 6px var(--color-state-info-bg);
  }

  .cy-status-badge__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--cy-status-dot);
    box-shadow: var(--cy-status-glow);
  }

  .cy-status-badge--active .cy-status-badge__dot {
    animation: cy-pulse 2s ease-in-out infinite;
  }

  .cy-status-badge__icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--cy-status-text);
  }

  .cy-status-badge__label {
    color: var(--cy-status-text);
  }

  @keyframes cy-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>

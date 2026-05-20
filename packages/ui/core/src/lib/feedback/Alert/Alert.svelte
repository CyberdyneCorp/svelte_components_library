<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    variant = "info",
    /**
     * Severity tone for action-item / status rows. When set it overrides
     * `variant` for colouring: critical=red, warn=orange, caution=yellow,
     * good=green.
     */
    severity,
    title = "",
    dismissible = false,
    /** Compact inline style: short coloured text, no banner chrome. */
    inline = false,
    /**
     * Card style: behaves as a list row (used for severity card lists). No
     * full banner background; relies on the border accent for the tone.
     */
    card = false,
    /** Which side carries the colour accent border. */
    borderSide = "left",
    /** Optional leading icon snippet (e.g. an `<Icon name="alert-circle" />`). */
    icon,
    ondismiss,
    children,
  }: {
    variant?: "success" | "warning" | "error" | "info";
    severity?: "critical" | "warn" | "caution" | "good";
    title?: string;
    dismissible?: boolean;
    inline?: boolean;
    card?: boolean;
    borderSide?: "left" | "top";
    icon?: Snippet;
    ondismiss?: () => void;
    children?: Snippet;
  } = $props();

  let visible = $state(true);

  function dismiss() {
    visible = false;
    ondismiss?.();
  }

  // Resolve the tone class — severity wins over variant when present.
  const tone = $derived(severity ? `sev-${severity}` : variant);
  const appearance = $derived(inline ? "inline" : card ? "card" : "banner");
</script>

{#if visible}
  <div
    class="cy-alert cy-alert--{tone} cy-alert--{appearance} cy-alert--border-{borderSide}"
    role="alert"
  >
    {#if icon && !inline}
      <span class="cy-alert__icon" aria-hidden="true">{@render icon()}</span>
    {/if}
    <div class="cy-alert__content">
      {#if title}
        <div class="cy-alert__title">{title}</div>
      {/if}
      {#if children}
        <div class="cy-alert__body">
          {@render children()}
        </div>
      {/if}
    </div>
    {#if dismissible}
      <button class="cy-alert__dismiss" onclick={dismiss} aria-label="Dismiss alert">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    {/if}
  </div>
{/if}

<style>
  .cy-alert {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    border-left: 3px solid transparent;
    font-family: var(--font-body);
    animation: cy-fade-in 200ms ease;
  }

  /* ── tones ── */
  .cy-alert--success,
  .cy-alert--sev-good {
    background: var(--color-state-success-bg);
    border-color: var(--color-border-subtle);
    --cy-alert-accent: var(--color-state-success);
  }
  .cy-alert--warning,
  .cy-alert--sev-caution {
    background: var(--color-state-warning-bg);
    border-color: var(--color-border-subtle);
    --cy-alert-accent: var(--color-state-warning);
  }
  .cy-alert--error,
  .cy-alert--sev-critical {
    background: var(--color-state-error-bg);
    border-color: var(--color-border-subtle);
    --cy-alert-accent: var(--color-state-error);
  }
  .cy-alert--info {
    background: var(--color-state-info-bg);
    border-color: var(--color-border-subtle);
    --cy-alert-accent: var(--color-state-info);
  }
  .cy-alert--sev-warn {
    background: var(--color-state-warning-bg);
    border-color: var(--color-border-subtle);
    --cy-alert-accent: #ff7a1a;
  }

  /* Accent border position (banner + card). */
  .cy-alert--border-left {
    border-left-color: var(--cy-alert-accent);
  }
  .cy-alert--border-top {
    border-left-width: 1px;
    border-left-color: var(--color-border-subtle);
    border-top-width: 3px;
    border-top-color: var(--cy-alert-accent);
  }

  /* ── card appearance: row-like, lighter background ── */
  .cy-alert--card {
    background: var(--color-surface-default);
    align-items: center;
  }

  /* ── inline appearance: short coloured text, no chrome ── */
  .cy-alert--inline {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-1);
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    animation: none;
    color: var(--cy-alert-accent);
    font-size: 0.8125rem;
  }
  .cy-alert--inline .cy-alert__content {
    color: var(--cy-alert-accent);
  }
  .cy-alert--inline .cy-alert__title {
    margin-bottom: 0;
    color: var(--cy-alert-accent);
  }
  .cy-alert--inline .cy-alert__body {
    color: var(--cy-alert-accent);
  }

  .cy-alert__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: var(--cy-alert-accent);
    margin-top: 1px;
  }

  .cy-alert__content {
    flex: 1;
    min-width: 0;
  }

  .cy-alert__title {
    font-weight: var(--font-weight-semibold);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    margin-bottom: var(--space-1);
  }

  .cy-alert__body {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .cy-alert__dismiss {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .cy-alert__dismiss:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  @keyframes cy-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>

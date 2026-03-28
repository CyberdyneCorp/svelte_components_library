<svelte:options runes={true} />

<script lang="ts">
  let {
    name = "",
    version = "",
    description = "",
    metrics = [],
    status = "draft",
    framework = "",
    size = "",
    ondeploy,
    ondetails,
  }: {
    name?: string;
    version?: string;
    description?: string;
    metrics?: Array<{ label: string; value: string }>;
    status?: "deployed" | "training" | "draft" | "archived";
    framework?: string;
    size?: string;
    ondeploy?: () => void;
    ondetails?: () => void;
  } = $props();

  let statusLabel = $derived(
    status === "deployed" ? "Deployed" :
    status === "training" ? "Training" :
    status === "archived" ? "Archived" : "Draft"
  );
</script>

<div class="cy-mc">
  <div class="cy-mc__header">
    <div class="cy-mc__title-row">
      <h3 class="cy-mc__name">{name}</h3>
      {#if version}
        <span class="cy-mc__version">v{version}</span>
      {/if}
    </div>
    <span
      class="cy-mc__status"
      class:cy-mc__status--deployed={status === "deployed"}
      class:cy-mc__status--training={status === "training"}
      class:cy-mc__status--draft={status === "draft"}
      class:cy-mc__status--archived={status === "archived"}
    >
      {statusLabel}
    </span>
  </div>

  {#if description}
    <p class="cy-mc__desc">{description}</p>
  {/if}

  {#if metrics.length > 0}
    <div class="cy-mc__metrics">
      {#each metrics as metric}
        <div class="cy-mc__metric">
          <span class="cy-mc__metric-label">{metric.label}</span>
          <span class="cy-mc__metric-value">{metric.value}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if framework || size}
    <div class="cy-mc__meta">
      {#if framework}
        <span class="cy-mc__meta-item">
          <span class="cy-mc__meta-key">Framework</span>
          <span class="cy-mc__meta-val">{framework}</span>
        </span>
      {/if}
      {#if size}
        <span class="cy-mc__meta-item">
          <span class="cy-mc__meta-key">Size</span>
          <span class="cy-mc__meta-val">{size}</span>
        </span>
      {/if}
    </div>
  {/if}

  <div class="cy-mc__actions">
    {#if ondeploy}
      <button class="cy-mc__btn cy-mc__btn--deploy" type="button" onclick={() => ondeploy?.()}>
        Deploy
      </button>
    {/if}
    {#if ondetails}
      <button class="cy-mc__btn cy-mc__btn--details" type="button" onclick={() => ondetails?.()}>
        View Details
      </button>
    {/if}
  </div>
</div>

<style>
  .cy-mc {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-default);
  }

  .cy-mc:hover {
    border-color: var(--color-border-default);
  }

  .cy-mc__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .cy-mc__title-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    min-width: 0;
  }

  .cy-mc__name {
    font-family: var(--font-body);
    font-size: 1.0625rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-mc__version {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-sm);
    padding: 1px 6px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .cy-mc__status {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .cy-mc__status--deployed {
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
    border: 1px solid var(--color-action-brand-default);
  }

  .cy-mc__status--training {
    color: var(--color-state-warning);
    background: var(--color-state-warning-bg);
    border: 1px solid var(--color-state-warning);
    animation: cy-mc-pulse 2s ease-in-out infinite;
  }

  @keyframes cy-mc-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .cy-mc__status--draft {
    color: var(--color-text-tertiary);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
  }

  .cy-mc__status--archived {
    color: var(--color-state-error);
    background: var(--color-state-error-bg);
    border: 1px solid var(--color-state-error);
  }

  .cy-mc__desc {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cy-mc__metrics {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-2);
    background: var(--color-bg-primary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-subtle);
  }

  .cy-mc__metric {
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
  }

  .cy-mc__metric-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cy-mc__metric-value {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-action-brand-default);
  }

  .cy-mc__meta {
    display: flex;
    gap: var(--space-4);
  }

  .cy-mc__meta-item {
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
  }

  .cy-mc__meta-key {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cy-mc__meta-val {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .cy-mc__actions {
    display: flex;
    gap: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-border-subtle);
  }

  .cy-mc__btn {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-mc__btn--deploy {
    color: var(--color-bg-primary);
    background: var(--color-action-brand-default);
    border: 1px solid var(--color-action-brand-default);
  }

  .cy-mc__btn--deploy:hover {
    background: var(--color-action-brand-hover);
    border-color: var(--color-action-brand-hover);
  }

  .cy-mc__btn--details {
    color: var(--color-text-secondary);
    background: transparent;
    border: 1px solid var(--color-border-subtle);
  }

  .cy-mc__btn--details:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border-color: var(--color-border-default);
  }
</style>

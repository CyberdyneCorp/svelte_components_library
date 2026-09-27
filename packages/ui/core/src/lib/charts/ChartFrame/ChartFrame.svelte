<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ChartA11yAttributes, ChartTableData } from "./chartTable.js";

  let {
    title,
    description,
    hideTitle = false,
    fallbackLabel = "Chart",
    data,
    tableCaption,
    showDataToggle = true,
    dataExpanded = $bindable(false),
    showDataLabel = "Show data",
    hideDataLabel = "Hide data",
    inline = false,
    class: className = "",
    children,
  }: {
    /** Chart title; becomes the SVG's accessible name. */
    title?: string;
    /** Longer summary; becomes the SVG's accessible description. */
    description?: string;
    /** Keep title and description for assistive tech only (visually hidden). */
    hideTitle?: boolean;
    /** Accessible name used when no `title` is given. */
    fallbackLabel?: string;
    /** Data-table fallback; omitted or empty columns render no table. */
    data?: ChartTableData;
    /** Table caption; defaults to "<title> data". */
    tableCaption?: string;
    /** Render the "Show data" toggle that reveals the table visually. */
    showDataToggle?: boolean;
    /** Whether the table is visually revealed. */
    dataExpanded?: boolean;
    showDataLabel?: string;
    hideDataLabel?: string;
    /** Lay the figure out inline (for sparklines and fixed-size charts). */
    inline?: boolean;
    class?: string;
    /** The chart; spread the received attributes onto its `<svg role="img">`. */
    children: Snippet<[ChartA11yAttributes]>;
  } = $props();

  const uid = $props.id();
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;
  const tableId = `${uid}-table`;

  let a11y = $derived<ChartA11yAttributes>({
    "aria-label": title ? undefined : fallbackLabel,
    "aria-labelledby": title ? titleId : undefined,
    "aria-describedby": description ? descriptionId : undefined,
  });

  let hasTable = $derived(!!data && data.columns.length > 0);
  let caption = $derived(tableCaption ?? `${title ?? fallbackLabel} data`);
  let tableShown = $derived(showDataToggle && dataExpanded);

  function toggle() {
    dataExpanded = !dataExpanded;
  }
</script>

<figure class="cy-chart-frame {className}" class:cy-chart-frame--inline={inline}>
  {#if title || description}
    <figcaption class="cy-chart-frame__caption" class:cy-chart-frame__sr-only={hideTitle}>
      {#if title}
        <span id={titleId} class="cy-chart-frame__title">{title}</span>
      {/if}
      {#if description}
        <span id={descriptionId} class="cy-chart-frame__description">{description}</span>
      {/if}
    </figcaption>
  {/if}

  {@render children(a11y)}

  {#if hasTable && data}
    {#if showDataToggle}
      <button
        type="button"
        class="cy-chart-frame__toggle"
        aria-expanded={dataExpanded}
        aria-controls={tableId}
        onclick={toggle}
      >
        {dataExpanded ? hideDataLabel : showDataLabel}
      </button>
    {/if}
    <!-- Focusable only while visible, so a wide table can be scrolled by keyboard. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      id={tableId}
      class="cy-chart-frame__table-wrap"
      class:cy-chart-frame__sr-only={!tableShown}
      role={tableShown ? "region" : undefined}
      aria-label={tableShown ? caption : undefined}
      tabindex={tableShown ? 0 : undefined}
    >
      <table class="cy-chart-frame__table">
        <caption class="cy-chart-frame__table-caption">{caption}</caption>
        <thead>
          <tr>
            {#each data.columns as column, ci (ci)}
              <th scope="col">{column}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each data.rows as row, ri (ri)}
            <tr>
              {#each row as cell, ci (ci)}
                {#if ci === 0}
                  <th scope="row">{cell}</th>
                {:else}
                  <td>{cell}</td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</figure>

<style>
  .cy-chart-frame {
    position: relative;
    margin: 0;
    font-family: var(--font-body);
  }

  .cy-chart-frame--inline {
    display: inline-block;
    vertical-align: middle;
  }

  .cy-chart-frame__caption {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin-bottom: var(--space-2);
  }

  .cy-chart-frame__title {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .cy-chart-frame__description {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-chart-frame__toggle {
    display: block;
    margin-top: var(--space-2);
    padding: var(--space-1) var(--space-3);
    font: inherit;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    background: transparent;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .cy-chart-frame__toggle:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-hover);
  }

  .cy-chart-frame__toggle:focus-visible,
  .cy-chart-frame__table-wrap:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-chart-frame__table-wrap {
    margin-top: var(--space-2);
    overflow-x: auto;
  }

  .cy-chart-frame__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
    color: var(--color-text-primary);
  }

  .cy-chart-frame__table-caption {
    text-align: left;
    padding-bottom: var(--space-1);
    color: var(--color-text-secondary);
  }

  .cy-chart-frame__table th,
  .cy-chart-frame__table td {
    padding: var(--space-1) var(--space-2);
    border-bottom: 1px solid var(--table-border);
    text-align: right;
    font-family: var(--font-mono);
  }

  .cy-chart-frame__table th {
    font-family: var(--font-body);
  }

  .cy-chart-frame__table th[scope="row"],
  .cy-chart-frame__table th[scope="col"]:first-child {
    text-align: left;
  }

  .cy-chart-frame__table thead th {
    background: var(--table-header-bg);
    font-weight: var(--font-weight-semibold);
  }

  .cy-chart-frame__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
</style>

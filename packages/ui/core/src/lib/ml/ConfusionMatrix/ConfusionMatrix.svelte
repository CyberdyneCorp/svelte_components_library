<svelte:options runes={true} />

<script lang="ts">
  let {
    matrix = [],
    labels = [],
    title = "Confusion Matrix",
    showValues = true,
    showPercentages = false,
    colorScale = "green",
  }: {
    matrix?: number[][];
    labels?: string[];
    title?: string;
    showValues?: boolean;
    showPercentages?: boolean;
    colorScale?: "green" | "cyan";
  } = $props();

  let maxVal = $derived.by(() => {
    let max = 0;
    for (const row of matrix) {
      for (const val of row) {
        if (val > max) max = val;
      }
    }
    return max || 1;
  });

  let totalPerRow = $derived.by(() => {
    return matrix.map(row => row.reduce((a, b) => a + b, 0) || 1);
  });

  function cellIntensity(val: number): number {
    return Math.min(val / maxVal, 1);
  }

  function cellColor(rowIdx: number, colIdx: number, val: number): string {
    const intensity = cellIntensity(val);
    const alpha = Math.round(intensity * 40 + 5);
    if (rowIdx === colIdx) {
      // Diagonal: correct predictions - green/cyan
      return colorScale === "cyan"
        ? `var(--color-action-secondary-default)`
        : `var(--color-action-brand-default)`;
    } else {
      // Off-diagonal: errors - red
      return `var(--color-state-error)`;
    }
  }

  function cellOpacity(val: number): number {
    return Math.max(cellIntensity(val) * 0.7 + 0.05, 0.05);
  }

  function formatValue(rowIdx: number, val: number): string {
    if (showPercentages) {
      const pct = (val / totalPerRow[rowIdx]) * 100;
      return `${pct.toFixed(1)}%`;
    }
    return String(val);
  }
</script>

<div class="cy-cm">
  {#if title}
    <h3 class="cy-cm__title">{title}</h3>
  {/if}

  <div class="cy-cm__wrapper">
    <div class="cy-cm__y-label">
      <span>Actual</span>
    </div>

    <div class="cy-cm__grid-area">
      <!-- Column headers -->
      <div class="cy-cm__col-headers" style="grid-template-columns: repeat({matrix.length}, 1fr)">
        {#each labels as lbl}
          <span class="cy-cm__col-label">{lbl}</span>
        {/each}
      </div>

      <!-- Grid with row labels -->
      <div class="cy-cm__body">
        {#each matrix as row, rowIdx}
          <div class="cy-cm__row">
            <span class="cy-cm__row-label">{labels[rowIdx] || ""}</span>
            {#each row as val, colIdx}
              <div
                class="cy-cm__cell"
                class:cy-cm__cell--diagonal={rowIdx === colIdx}
                style="--cell-color: {cellColor(rowIdx, colIdx, val)}; --cell-opacity: {cellOpacity(val)}"
              >
                {#if showValues}
                  <span class="cy-cm__cell-val">{formatValue(rowIdx, val)}</span>
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </div>

      <div class="cy-cm__x-label">
        <span>Predicted</span>
      </div>
    </div>
  </div>
</div>

<style>
  .cy-cm {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .cy-cm__title {
    font-family: var(--font-body);
    font-size: 0.9375rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .cy-cm__wrapper {
    display: flex;
    align-items: stretch;
    gap: var(--space-2);
  }

  .cy-cm__y-label {
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-lr;
    transform: rotate(180deg);
  }

  .cy-cm__y-label span {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .cy-cm__grid-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1;
  }

  .cy-cm__col-headers {
    display: grid;
    gap: 3px;
    margin-left: 72px;
  }

  .cy-cm__col-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 var(--space-1);
  }

  .cy-cm__body {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .cy-cm__row {
    display: flex;
    gap: 3px;
    align-items: stretch;
  }

  .cy-cm__row-label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 68px;
    padding-right: var(--space-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-cm__cell {
    flex: 1;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    background-color: var(--cell-color);
    opacity: var(--cell-opacity);
    min-width: 48px;
    min-height: 48px;
    transition: opacity var(--transition-default);
  }

  .cy-cm__cell:hover {
    opacity: 1;
  }

  .cy-cm__cell-val {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .cy-cm__x-label {
    display: flex;
    justify-content: center;
    margin-left: 72px;
  }

  .cy-cm__x-label span {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
</style>

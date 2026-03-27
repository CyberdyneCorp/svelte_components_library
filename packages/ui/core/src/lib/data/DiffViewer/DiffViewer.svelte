<svelte:options runes={true} />

<script lang="ts">
  type DiffLineType = "unchanged" | "added" | "removed";

  type DiffLine = {
    type: DiffLineType;
    oldNum: number | null;
    newNum: number | null;
    text: string;
  };

  let {
    oldText = "",
    newText = "",
    oldLabel = "Original",
    newLabel = "Modified",
    mode = "split",
    language = "",
    showLineNumbers = true,
  }: {
    oldText?: string;
    newText?: string;
    oldLabel?: string;
    newLabel?: string;
    mode?: "split" | "unified";
    language?: string;
    showLineNumbers?: boolean;
  } = $props();

  // LCS-based diff algorithm
  function computeDiff(oldStr: string, newStr: string): DiffLine[] {
    const oldLines = oldStr.split("\n");
    const newLines = newStr.split("\n");
    const m = oldLines.length;
    const n = newLines.length;

    // Build LCS table
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to produce diff
    const result: DiffLine[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        result.unshift({
          type: "unchanged",
          oldNum: i,
          newNum: j,
          text: oldLines[i - 1],
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({
          type: "added",
          oldNum: null,
          newNum: j,
          text: newLines[j - 1],
        });
        j--;
      } else {
        result.unshift({
          type: "removed",
          oldNum: i,
          newNum: null,
          text: oldLines[i - 1],
        });
        i--;
      }
    }

    return result;
  }

  let diffLines = $derived(computeDiff(oldText, newText));

  // For split mode: separate into left and right columns
  let splitLeft = $derived(
    diffLines.filter((l) => l.type !== "added").map((l) => ({
      type: l.type,
      num: l.oldNum,
      text: l.text,
    }))
  );

  let splitRight = $derived(
    diffLines.filter((l) => l.type !== "removed").map((l) => ({
      type: l.type,
      num: l.newNum,
      text: l.text,
    }))
  );

  // Synchronized scroll
  let leftPane: HTMLElement | undefined = $state();
  let rightPane: HTMLElement | undefined = $state();
  let syncing = false;

  function syncScroll(source: "left" | "right") {
    if (syncing) return;
    syncing = true;
    if (source === "left" && leftPane && rightPane) {
      rightPane.scrollTop = leftPane.scrollTop;
    } else if (source === "right" && leftPane && rightPane) {
      leftPane.scrollTop = rightPane.scrollTop;
    }
    syncing = false;
  }
</script>

<div class="cy-diff" class:cy-diff--unified={mode === "unified"}>
  {#if mode === "split"}
    <div class="cy-diff__split">
      <div class="cy-diff__column">
        <div class="cy-diff__header">
          <span class="cy-diff__label">{oldLabel}</span>
          {#if language}
            <span class="cy-diff__lang">{language}</span>
          {/if}
        </div>
        <div
          class="cy-diff__body"
          bind:this={leftPane}
          onscroll={() => syncScroll("left")}
        >
          {#each splitLeft as line}
            <div class="cy-diff__line cy-diff__line--{line.type}">
              {#if showLineNumbers}
                <span class="cy-diff__gutter">{line.num ?? ""}</span>
              {/if}
              <span class="cy-diff__prefix">
                {#if line.type === "removed"}-{:else}&nbsp;{/if}
              </span>
              <span class="cy-diff__text">{line.text}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="cy-diff__column">
        <div class="cy-diff__header">
          <span class="cy-diff__label">{newLabel}</span>
          {#if language}
            <span class="cy-diff__lang">{language}</span>
          {/if}
        </div>
        <div
          class="cy-diff__body"
          bind:this={rightPane}
          onscroll={() => syncScroll("right")}
        >
          {#each splitRight as line}
            <div class="cy-diff__line cy-diff__line--{line.type}">
              {#if showLineNumbers}
                <span class="cy-diff__gutter">{line.num ?? ""}</span>
              {/if}
              <span class="cy-diff__prefix">
                {#if line.type === "added"}+{:else}&nbsp;{/if}
              </span>
              <span class="cy-diff__text">{line.text}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="cy-diff__unified-view">
      <div class="cy-diff__header cy-diff__header--unified">
        <span class="cy-diff__label">{oldLabel} &rarr; {newLabel}</span>
        {#if language}
          <span class="cy-diff__lang">{language}</span>
        {/if}
      </div>
      <div class="cy-diff__body">
        {#each diffLines as line}
          <div class="cy-diff__line cy-diff__line--{line.type}">
            {#if showLineNumbers}
              <span class="cy-diff__gutter cy-diff__gutter--old">{line.oldNum ?? ""}</span>
              <span class="cy-diff__gutter cy-diff__gutter--new">{line.newNum ?? ""}</span>
            {/if}
            <span class="cy-diff__prefix">
              {#if line.type === "added"}+{:else if line.type === "removed"}-{:else}&nbsp;{/if}
            </span>
            <span class="cy-diff__text">{line.text}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .cy-diff {
    font-family: var(--font-mono, "JetBrains Mono", "Fira Code", monospace);
    font-size: 0.8125rem;
    line-height: 1.5;
    border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-md, 8px);
    overflow: hidden;
    background: var(--color-surface-base, #0a0a0f);
  }

  .cy-diff__split {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .cy-diff__split .cy-diff__column:first-child {
    border-right: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
  }

  .cy-diff__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: var(--color-surface-raised, #12121a);
    border-bottom: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
  }

  .cy-diff__label {
    color: var(--color-text-primary, rgba(255, 255, 255, 0.85));
    font-weight: var(--font-weight-medium, 500);
    font-family: var(--font-body, system-ui, sans-serif);
    font-size: 0.75rem;
  }

  .cy-diff__lang {
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.4));
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cy-diff__body {
    overflow: auto;
    max-height: 480px;
  }

  .cy-diff__line {
    display: flex;
    align-items: stretch;
    min-height: 1.5em;
    border-left: 3px solid transparent;
  }

  .cy-diff__line--added {
    background: rgba(0, 255, 65, 0.08);
    border-left-color: #00ff41;
  }

  .cy-diff__line--removed {
    background: rgba(255, 68, 68, 0.08);
    border-left-color: #ff4444;
  }

  .cy-diff__line--unchanged {
    border-left-color: transparent;
  }

  .cy-diff__gutter {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 3em;
    padding: 0 0.5rem;
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.25));
    user-select: none;
    flex-shrink: 0;
  }

  .cy-diff__gutter--old,
  .cy-diff__gutter--new {
    min-width: 2.5em;
  }

  .cy-diff__prefix {
    display: inline-flex;
    align-items: center;
    width: 1.5em;
    padding-left: 0.25rem;
    flex-shrink: 0;
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.4));
    user-select: none;
  }

  .cy-diff__line--added .cy-diff__prefix {
    color: #00ff41;
  }

  .cy-diff__line--removed .cy-diff__prefix {
    color: #ff4444;
  }

  .cy-diff__text {
    flex: 1;
    white-space: pre;
    padding-right: 1rem;
  }
</style>

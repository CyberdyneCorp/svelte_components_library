<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";
  import FileTypeIcon from "../../primitives/FileTypeIcon/FileTypeIcon.svelte";
  import IconButton from "../../primitives/IconButton/IconButton.svelte";

  let {
    name,
    meta,
    layout = "tile",
    preview,
    previewSrc,
    progress,
    error,
    onopen,
    onremove,
    openLabel,
    removeLabel,
    progressLabel,
  }: {
    /** File name; truncated with an ellipsis, full name in the tooltip. */
    name: string;
    /** Secondary line, e.g. a size or a date. */
    meta?: string;
    /** `"tile"` stacks the preview above the name; `"row"` puts it beside. */
    layout?: "tile" | "row";
    /** Custom preview (e.g. a rendered PDF page); takes precedence over `previewSrc`. */
    preview?: Snippet;
    /** Image URL for the preview; falls back to the file-type icon if it fails to load. */
    previewSrc?: string;
    /** Upload progress, 0–100. Shown while there is no `error`. */
    progress?: number;
    /** Error text, e.g. "Upload failed". */
    error?: string;
    /** Makes the name a button that calls this. */
    onopen?: () => void;
    /** Adds a remove button that calls this. */
    onremove?: () => void;
    /** Accessible name of the open button. Defaults to the file name. */
    openLabel?: string;
    /** Accessible name of the remove button. Defaults to "Remove <name>". */
    removeLabel?: string;
    /** Accessible name of the progress bar. Defaults to "Uploading <name>". */
    progressLabel?: string;
  } = $props();

  const uid = `cy-file-card-${Math.random().toString(36).slice(2, 9)}`;
  const nameId = `${uid}-name`;
  const metaId = `${uid}-meta`;
  const errorId = `${uid}-error`;

  // Remember which URL failed, so a new previewSrc gets a fresh attempt.
  let failedSrc = $state<string | undefined>();
  let showImage = $derived(!!previewSrc && failedSrc !== previewSrc);
  let clamped = $derived(progress === undefined ? undefined : Math.min(100, Math.max(0, progress)));
  let describedBy = $derived(
    [meta ? metaId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined,
  );
</script>

<div
  class="cy-file-card cy-file-card--{layout}"
  class:cy-file-card--error={!!error}
  role="group"
  aria-labelledby={nameId}
  aria-describedby={describedBy}
>
  <div class="cy-file-card__preview">
    {#if preview}
      {@render preview()}
    {:else if showImage}
      <img class="cy-file-card__image" src={previewSrc} alt="" onerror={() => (failedSrc = previewSrc)} />
    {:else}
      <FileTypeIcon fileName={name} size={layout === "tile" ? 40 : 28} />
    {/if}
  </div>

  <div class="cy-file-card__body">
    {#if onopen}
      <button
        type="button"
        class="cy-file-card__name cy-file-card__name--button"
        id={nameId}
        title={name}
        aria-label={openLabel && openLabel !== name ? openLabel : undefined}
        onclick={onopen}>{name}</button
      >
    {:else}
      <span class="cy-file-card__name" id={nameId} title={name}>{name}</span>
    {/if}
    {#if meta}
      <span class="cy-file-card__meta" id={metaId}>{meta}</span>
    {/if}
    {#if error}
      <span class="cy-file-card__error" id={errorId}>{error}</span>
    {:else if clamped !== undefined}
      <div
        class="cy-file-card__progress"
        role="progressbar"
        aria-label={progressLabel ?? `Uploading ${name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div class="cy-file-card__progress-fill" style="width: {clamped}%"></div>
      </div>
    {/if}
  </div>

  {#if onremove}
    <div class="cy-file-card__remove">
      <IconButton icon="x" label={removeLabel ?? `Remove ${name}`} size="sm" onclick={() => onremove()} />
    </div>
  {/if}
</div>

<style>
  .cy-file-card {
    position: relative;
    display: grid;
    gap: var(--space-2);
    min-width: 0;
    padding: var(--space-2);
    background: var(--color-surface-default);
    border: var(--border-width) var(--border-style) var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    color: var(--color-text-primary);
  }

  .cy-file-card--tile {
    grid-template-rows: auto auto;
    width: 10rem;
  }

  .cy-file-card--row {
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
  }

  .cy-file-card--error {
    border-color: var(--color-state-error);
  }

  .cy-file-card__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: var(--radius-sm);
    background: var(--color-bg-secondary);
  }

  .cy-file-card--tile .cy-file-card__preview {
    aspect-ratio: 4 / 3;
  }

  .cy-file-card--row .cy-file-card__preview {
    width: 2.5rem;
    height: 2.5rem;
  }

  .cy-file-card__preview :global(img),
  .cy-file-card__preview :global(canvas) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cy-file-card__body {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .cy-file-card__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
  }

  .cy-file-card__name--button {
    padding: 0;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    text-align: start;
    cursor: pointer;
  }

  .cy-file-card__name--button:hover {
    color: var(--color-text-link);
    text-decoration: underline;
  }

  .cy-file-card__name--button:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  .cy-file-card__meta {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-file-card__error {
    font-size: 0.75rem;
    color: var(--color-state-error);
  }

  .cy-file-card__progress {
    height: 4px;
    overflow: hidden;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-pill);
  }

  .cy-file-card__progress-fill {
    height: 100%;
    background: var(--color-action-brand-default);
    transition: width var(--transition-default);
  }

  .cy-file-card--tile .cy-file-card__remove {
    position: absolute;
    top: var(--space-1);
    right: var(--space-1);
    background: var(--color-surface-raised);
    border-radius: var(--radius-md);
  }
</style>

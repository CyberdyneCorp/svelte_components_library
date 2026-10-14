<svelte:options runes={true} />

<script lang="ts">
  import { fileCategory, fileExtension, normalizeExtension } from "./fileTypes.js";

  let {
    type = "",
    fileName,
    size = 24,
    label,
  }: {
    /** Extension to draw, with or without its dot, any case (`"pdf"`, `".PDF"`). Ignored when `fileName` is set. */
    type?: string;
    /** Filename to take the extension from, e.g. `"report.final.pdf"`. */
    fileName?: string;
    /** Rendered size in px (square). */
    size?: number;
    /** Accessible name; without it the icon is decorative. */
    label?: string;
  } = $props();

  let ext = $derived(fileName !== undefined ? fileExtension(fileName) : normalizeExtension(type));
  let category = $derived(fileCategory(ext));
  let text = $derived(ext.slice(0, 4).toUpperCase());
  let fontSize = $derived(text.length > 3 ? 6 : 7);
</script>

<svg
  class="cy-file-type-icon cy-file-type-icon--{category}"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  data-category={category}
  role={label ? "img" : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : "true"}
>
  <path class="cy-file-type-icon__page" d="M5 1.5h9.5L20 7v15.5H5z" />
  <path class="cy-file-type-icon__fold" d="M14.5 1.5V7H20" />
  <rect class="cy-file-type-icon__band" x="5" y="19" width="15" height="3.5" />
  {#if text}
    <text
      class="cy-file-type-icon__text"
      x="12.5"
      y="15.5"
      text-anchor="middle"
      font-size={fontSize}
    >{text}</text>
  {:else}
    <path class="cy-file-type-icon__lines" d="M8 10h9M8 13h9M8 16h6" />
  {/if}
</svg>

<style>
  .cy-file-type-icon {
    --cy-file-type-color: var(--color-text-secondary);
    display: inline-block;
    flex-shrink: 0;
    vertical-align: middle;
  }

  .cy-file-type-icon--pdf { --cy-file-type-color: var(--color-state-error); }
  .cy-file-type-icon--document { --cy-file-type-color: var(--color-state-info); }
  .cy-file-type-icon--spreadsheet { --cy-file-type-color: var(--color-state-success); }
  .cy-file-type-icon--presentation { --cy-file-type-color: var(--color-state-warning); }
  .cy-file-type-icon--image { --cy-file-type-color: var(--color-accent-violet); }
  .cy-file-type-icon--audio { --cy-file-type-color: var(--color-accent-cyan); }
  .cy-file-type-icon--video { --cy-file-type-color: var(--color-accent-2); }
  .cy-file-type-icon--archive { --cy-file-type-color: var(--color-accent-3); }
  .cy-file-type-icon--code { --cy-file-type-color: var(--color-accent-green); }

  .cy-file-type-icon__page {
    fill: var(--color-surface-raised);
    stroke: var(--color-border-strong);
    stroke-width: 1;
    stroke-linejoin: round;
  }

  .cy-file-type-icon__fold,
  .cy-file-type-icon__lines {
    fill: none;
    stroke: var(--color-border-strong);
    stroke-width: 1;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .cy-file-type-icon__band {
    fill: var(--cy-file-type-color);
  }

  /* Text sits on the page, not the band, so its contrast never depends on the category colour. */
  .cy-file-type-icon__text {
    fill: var(--color-text-primary);
    font-family: var(--font-mono);
    font-weight: var(--font-weight-bold, 700);
    letter-spacing: -0.02em;
  }
</style>

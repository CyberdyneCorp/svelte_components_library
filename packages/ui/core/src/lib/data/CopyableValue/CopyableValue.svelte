<svelte:options runes={true} />

<script lang="ts">
  import CopyButton from "../../primitives/CopyButton/CopyButton.svelte";
  import { truncateMiddle } from "./truncate.js";

  let {
    value,
    display,
    truncate = "middle",
    head = 6,
    tail = 4,
    mono = true,
    label,
    copyLabel,
  }: {
    /** The full value; this is what the copy button copies. */
    value: string;
    /** Text shown instead of `value` (e.g. a friendlier form); still copies `value`. */
    display?: string;
    /** `"middle"` keeps both ends, `"end"` clips with a CSS ellipsis, `"none"` shows everything. */
    truncate?: "none" | "middle" | "end";
    /** Characters kept at the start for middle truncation. */
    head?: number;
    /** Characters kept at the end for middle truncation. */
    tail?: number;
    /** Use the monospace font. */
    mono?: boolean;
    /** What the value is, e.g. "Request ID"; used in the copy button's name. */
    label?: string;
    /** Accessible name of the copy button. Defaults to "Copy <label>" or "Copy". */
    copyLabel?: string;
  } = $props();

  let fullText = $derived(display ?? value);
  let shown = $derived(truncate === "middle" ? truncateMiddle(fullText, head, tail) : fullText);
  let buttonLabel = $derived(copyLabel ?? (label ? `Copy ${label}` : "Copy"));
</script>

<span class="cy-copyable-value" class:cy-copyable-value--mono={mono}>
  <span
    class="cy-copyable-value__text"
    class:cy-copyable-value__text--clip={truncate === "end"}
    title={fullText}
    aria-hidden="true">{shown}</span
  >
  <span class="cy-copyable-value__sr">{fullText}</span>
  <CopyButton text={value} label={buttonLabel} size="sm" iconOnly />
</span>

<style>
  .cy-copyable-value {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    max-width: 100%;
    min-width: 0;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    vertical-align: middle;
  }

  .cy-copyable-value--mono {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .cy-copyable-value__text {
    white-space: nowrap;
    min-width: 0;
  }

  .cy-copyable-value__text--clip {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cy-copyable-value__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>

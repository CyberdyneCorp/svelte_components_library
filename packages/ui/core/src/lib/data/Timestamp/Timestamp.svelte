<svelte:options runes={true} />

<script lang="ts">
  import { refreshInterval, relativeParts, toDate } from "./relativeTime.js";

  type DateTimeStyle = "full" | "long" | "medium" | "short";

  let {
    value,
    format = "relative",
    locale,
    timeZone,
    dateStyle = "medium",
    timeStyle = "short",
    live = true,
    now,
    invalidLabel = "Invalid date",
  }: {
    /** The point in time: a Date, an ISO 8601 string or epoch milliseconds. */
    value: Date | string | number;
    /** Relative ("3 minutes ago"), absolute, or both ("Oct 14, 2026, 9:00 AM (3 minutes ago)"). */
    format?: "relative" | "absolute" | "both";
    /** BCP 47 locale; the runtime default when omitted. */
    locale?: string;
    /** IANA time zone for the absolute text (e.g. "UTC"); the runtime default when omitted. */
    timeZone?: string;
    /** `Intl.DateTimeFormat` date style of the absolute text. */
    dateStyle?: DateTimeStyle;
    /** `Intl.DateTimeFormat` time style of the absolute text. */
    timeStyle?: DateTimeStyle;
    /** Keep relative text current while mounted. */
    live?: boolean;
    /** Reference "now" (tests, SSR); live updates advance from it. Defaults to the clock. */
    now?: Date;
    /** Text shown when `value` is not a valid date. */
    invalidLabel?: string;
  } = $props();

  // Wall-clock time at mount, so live updates advance from `now` when one is given.
  const mountedAt = Date.now();
  let clock = $state(mountedAt);
  let current = $derived(new Date((now?.getTime() ?? mountedAt) + (clock - mountedAt)));

  let date = $derived(toDate(value));
  let showsRelative = $derived(format !== "absolute");

  let absolute = $derived(
    date
      ? new Intl.DateTimeFormat(locale, { dateStyle, timeStyle, timeZone }).format(date)
      : "",
  );

  let relative = $derived.by(() => {
    if (!date) return "";
    const { value: amount, unit } = relativeParts(date, current);
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(amount, unit);
  });

  let text = $derived.by(() => {
    if (format === "absolute") return absolute;
    if (format === "both") return `${absolute} (${relative})`;
    return relative;
  });

  $effect(() => {
    if (!live || !showsRelative || !date) return;
    const timer = setTimeout(() => (clock = Date.now()), refreshInterval(date, current));
    return () => clearTimeout(timer);
  });
</script>

{#if date}
  <time
    class="cy-timestamp"
    datetime={date.toISOString()}
    title={format === "relative" ? absolute : undefined}
  >{text}</time>
{:else}
  <time class="cy-timestamp cy-timestamp--invalid">{invalidLabel}</time>
{/if}

<style>
  .cy-timestamp {
    font-family: inherit;
    color: inherit;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .cy-timestamp--invalid {
    color: var(--color-text-tertiary);
  }
</style>

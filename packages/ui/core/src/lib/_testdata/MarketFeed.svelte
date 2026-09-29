<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import { createMarketFeed, type MarketSnapshot } from "./marketFeed.js";

  let {
    interval = 250,
    burst = 1,
    children,
  }: {
    /** Milliseconds between feed ticks. */
    interval?: number;
    /** Synchronous updates per tick, to exercise frame coalescing. */
    burst?: number;
    children: Snippet<[MarketSnapshot]>;
  } = $props();

  const feed = createMarketFeed({ start: Date.now() });
  let snapshot = $state.raw(feed.current());

  $effect(() => {
    const timer = setInterval(() => {
      for (let i = 0; i < burst; i++) snapshot = feed.next();
    }, interval);
    return () => clearInterval(timer);
  });
</script>

{@render children(snapshot)}

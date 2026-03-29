<svelte:options runes={true} />

<script lang="ts">
  import InfiniteScroll from "./InfiniteScroll.svelte";

  let {
    loading = false,
    hasMore = true,
    threshold = 200,
    onloadmore,
    loadingText = "Loading...",
  }: {
    loading?: boolean;
    hasMore?: boolean;
    threshold?: number;
    onloadmore?: () => void;
    loadingText?: string;
  } = $props();
</script>

<InfiniteScroll {loading} {hasMore} {threshold} {onloadmore} {loadingText}>
  {#snippet children()}
    <div data-testid="scroll-content">Content</div>
  {/snippet}
</InfiniteScroll>

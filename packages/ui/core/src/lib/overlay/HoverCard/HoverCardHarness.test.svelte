<script lang="ts">
  import HoverCard from "./HoverCard.svelte";

  let { open = $bindable(false), openDelay = 500, closeDelay = 200 }: {
    open?: boolean;
    openDelay?: number;
    closeDelay?: number;
  } = $props();
</script>

<HoverCard bind:open {openDelay} {closeDelay}>
  {#snippet trigger()}<a href="#ada">@ada</a>{/snippet}
  <p>Ada Lovelace, analyst</p>
  <a href="#ada-profile">View profile</a>
</HoverCard>
<button type="button">Outside</button>

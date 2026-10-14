<script lang="ts">
  import FileCard from "./FileCard.svelte";

  let { name }: { name: string } = $props();
</script>

<FileCard {name}>
  {#snippet preview()}
    <canvas data-testid="custom-preview" width="4" height="3"></canvas>
  {/snippet}
</FileCard>

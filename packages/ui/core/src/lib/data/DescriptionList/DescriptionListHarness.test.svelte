<svelte:options runes={true} />

<script lang="ts">
  // Test-only harness (the `.test.` infix keeps it out of the published package):
  // DescriptionList with real IconButton actions and a StatusBadge value.
  import DescriptionList from "./DescriptionList.svelte";
  import type { DescriptionListItem } from "./types.js";
  import IconButton from "../../primitives/IconButton/IconButton.svelte";
  import StatusBadge from "../StatusBadge/StatusBadge.svelte";

  let {
    items,
    withBadge = false,
    onedit,
  }: {
    items: DescriptionListItem[];
    withBadge?: boolean;
    onedit?: (item: DescriptionListItem) => void;
  } = $props();
</script>

{#if withBadge}
  <DescriptionList {items}>
    {#snippet value(item)}
      <StatusBadge status="active" label={item.value ?? ""} />
    {/snippet}
  </DescriptionList>
{:else}
  <DescriptionList {items}>
    {#snippet action(item)}
      <IconButton
        icon="settings"
        label={`Editar ${item.label}`}
        size="sm"
        onclick={() => onedit?.(item)}
      />
    {/snippet}
  </DescriptionList>
{/if}

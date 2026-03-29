<svelte:options runes={true} />

<script lang="ts">
  import Dropdown from "./Dropdown.svelte";

  let {
    items = [],
    onselect,
    align = "left",
  }: {
    items?: Array<{ label: string; value: string; icon?: string; variant?: "default" | "danger" }>;
    onselect?: (value: string) => void;
    align?: "left" | "right";
  } = $props();
</script>

<Dropdown {items} {onselect} {align}>
  {#snippet trigger()}
    <span data-testid="dropdown-trigger">Open menu</span>
  {/snippet}
</Dropdown>

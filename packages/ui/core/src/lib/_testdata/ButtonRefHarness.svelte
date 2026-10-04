<svelte:options runes={true} />

<script lang="ts">
  import Button from "../primitives/Button/Button.svelte";

  let ref = $state<HTMLButtonElement | null>(null);
</script>

<Button bind:ref aria-expanded={false} aria-controls="menu">Menu</Button>
<button type="button" onclick={() => ref?.focus()}>Focus menu</button>

<svelte:options runes={true} />

<script lang="ts">
  import { getContext } from "svelte";
  import Toast from "./Toast.svelte";

  let {
    variant = "success",
    message = "Test toast",
    withAction = false,
  }: {
    variant?: "success" | "warning" | "error" | "info";
    message?: string;
    withAction?: boolean;
  } = $props();

  let toastApi: any;

  function handleClick() {
    if (!toastApi) return;
    const action = withAction ? { label: "Undo", onclick: () => {} } : undefined;
    toastApi[variant](message, action);
  }
</script>

<Toast>
  {#snippet children()}
    {@const api = getContext("toast")}
    {(toastApi = api, "")}
    <button data-testid="toast-trigger" onclick={handleClick}>Trigger</button>
  {/snippet}
</Toast>

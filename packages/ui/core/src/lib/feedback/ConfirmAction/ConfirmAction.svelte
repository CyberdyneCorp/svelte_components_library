<svelte:options runes={true} />

<script lang="ts">
  import { tick, type Snippet } from "svelte";
  import Button from "../../primitives/Button/Button.svelte";
  import Dialog from "../Dialog/Dialog.svelte";
  import TextInput from "../../forms/TextInput/TextInput.svelte";

  let {
    label,
    level = "confirm",
    variant = "danger",
    size = "md",
    disabled = false,
    title,
    children,
    confirmLabel,
    cancelLabel = "Cancel",
    confirmText = "",
    typePrompt,
    onconfirm,
    oncancel,
  }: {
    /** Text of the trigger button. */
    label: string;
    /** "click" runs at once, "confirm" asks in a dialog, "type" also requires typing `confirmText`. */
    level?: "click" | "confirm" | "type";
    /** Button variant of the trigger; "danger" also makes the dialog a danger dialog. */
    variant?: "brand" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    /** Dialog title; defaults to `label`. */
    title?: string;
    /** Dialog body explaining the consequences. */
    children?: Snippet;
    /** Text of the dialog's confirm button; defaults to `label`. */
    confirmLabel?: string;
    cancelLabel?: string;
    /** Exact phrase (e.g. the resource name) to type when `level="type"`. Case-sensitive. */
    confirmText?: string;
    /** Label of the typing field; defaults to `Type "<confirmText>" to confirm`. */
    typePrompt?: string;
    /** Called once the action is confirmed. Progress and errors are the application's to show. */
    onconfirm?: () => void;
    /** Called when the dialog is cancelled or dismissed. */
    oncancel?: () => void;
  } = $props();

  let open = $state(false);
  let typed = $state("");
  let triggerRef: HTMLButtonElement | null = $state(null);

  let matches = $derived(confirmText !== "" && typed.trim() === confirmText);
  let prompt = $derived(typePrompt ?? `Type "${confirmText}" to confirm`);
  let hasBody = $derived(Boolean(children) || level === "type");

  function activate() {
    if (level === "click") {
      onconfirm?.();
      return;
    }
    typed = "";
    open = true;
  }

  async function returnFocus() {
    await tick();
    triggerRef?.focus();
  }

  function handleConfirm() {
    onconfirm?.();
    returnFocus();
  }

  function handleCancel() {
    oncancel?.();
    returnFocus();
  }
</script>

<Button {variant} {size} {disabled} bind:ref={triggerRef} onclick={activate}>{label}</Button>

{#snippet body()}
  {#if children}
    <div class="cy-confirm-action__body">{@render children()}</div>
  {/if}
  {#if level === "type"}
    <TextInput label={prompt} bind:value={typed} autocomplete="off" spellcheck={false} />
  {/if}
{/snippet}

{#if level !== "click"}
  <Dialog
    bind:open
    title={title ?? label}
    confirmLabel={confirmLabel ?? label}
    {cancelLabel}
    variant={variant === "danger" ? "danger" : "default"}
    confirmDisabled={level === "type" && !matches}
    onconfirm={handleConfirm}
    oncancel={handleCancel}
    children={hasBody ? body : undefined}
  />
{/if}

<style>
  .cy-confirm-action__body {
    margin-bottom: var(--space-4);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .cy-confirm-action__body:last-child {
    margin-bottom: 0;
  }
</style>

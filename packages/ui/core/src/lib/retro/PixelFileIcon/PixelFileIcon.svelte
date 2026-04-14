<svelte:options runes={true} />

<script lang="ts">
  let {
    kind = "file",
    name = "",
    extension,
    size = 32,
    color = "var(--color-text-primary, #12121a)",
    ariaLabel,
  }: {
    kind?: "file" | "folder" | "image" | "code" | "archive" | "pdf";
    name?: string;
    extension?: string;
    size?: number;
    color?: string;
    ariaLabel?: string;
  } = $props();

  const ext = $derived(extension ?? (name.includes(".") ? name.split(".").pop() : ""));
  const label = $derived(ariaLabel ?? `${kind}${name ? `: ${name}` : ""}`);
</script>

<div
  class="cy-pfile cy-pfile--{kind}"
  role="img"
  aria-label={label}
  style:--cy-pfile-size="{size}px"
  style:--cy-pfile-color={color}
  data-testid="cy-pfile"
>
  {#if kind === "folder"}
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M2 8 L2 26 L30 26 L30 10 L14 10 L12 8 Z" fill="var(--color-action-tertiary-default, #7e22ce)" stroke="var(--color-text-primary, #12121a)" stroke-width="2"/>
    </svg>
  {:else}
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M6 2 L22 2 L28 8 L28 30 L6 30 Z" fill="var(--color-surface-default, #fff)" stroke="var(--color-text-primary, #12121a)" stroke-width="2"/>
      <path d="M22 2 L22 8 L28 8" fill="none" stroke="var(--color-text-primary, #12121a)" stroke-width="2"/>
    </svg>
    {#if ext}
      <span class="cy-pfile__ext" data-testid="cy-pfile-ext">{ext}</span>
    {/if}
  {/if}
</div>

<style>
  .cy-pfile { position: relative; display: inline-flex; align-items: center; justify-content: center; width: var(--cy-pfile-size, 32px); height: var(--cy-pfile-size, 32px); font-family: var(--font-body, monospace); color: var(--cy-pfile-color); image-rendering: pixelated; }
  .cy-pfile__ext { position: absolute; bottom: 4px; right: 2px; font-size: 0.5rem; font-weight: 700; background: var(--color-text-primary, #12121a); color: var(--color-text-inverse, #fff); padding: 0 2px; text-transform: uppercase; }
</style>

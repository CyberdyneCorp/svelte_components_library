<svelte:options runes={true} />

<script lang="ts">
  let {
    name,
    size = 20,
    color = "currentColor",
  }: {
    name: string;
    size?: number;
    color?: string;
  } = $props();

  const icons: Record<string, string> = {
    "check": "M20 6L9 17l-5-5",
    "x": "M18 6L6 18M6 6l12 12",
    "chevron-down": "M6 9l6 6 6-6",
    "chevron-right": "M9 18l6-6-6-6",
    "chevron-left": "M15 18l-6-6 6-6",
    "search": "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.35-4.35",
    "alert-circle": "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6v4m0 4h.01",
    "info": "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 9v4m0-7h.01",
    "settings": "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8.59-2.56a1.65 1.65 0 0 0 .33-1.82l-.15-.36a1.65 1.65 0 0 0-1.53-1.03h-.42a8.1 8.1 0 0 0-.67-1.17l.21-.37a1.65 1.65 0 0 0-.25-1.85l-.26-.26a1.65 1.65 0 0 0-1.85-.25l-.37.21a8.1 8.1 0 0 0-1.17-.67v-.42A1.65 1.65 0 0 0 13.38 2h-.36a1.65 1.65 0 0 0-1.82.33L11 2.6a8.1 8.1 0 0 0-1.17.67l-.37-.21a1.65 1.65 0 0 0-1.85.25l-.26.26a1.65 1.65 0 0 0-.25 1.85l.21.37a8.1 8.1 0 0 0-.67 1.17h-.42A1.65 1.65 0 0 0 5.19 8.5l-.15.36a1.65 1.65 0 0 0 .33 1.82",
    "menu": "M3 12h18M3 6h18M3 18h18",
    "plus": "M12 5v14M5 12h14",
    "minus": "M5 12h14",
    "copy": "M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2M16 2h-8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",
    "external-link": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
    "terminal": "M4 17l6-5-6-5M12 19h8",
    "cpu": "M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 4h6v8H9V8zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
    "shield": "M12 2l8 4v6c0 5.25-3.5 10-8 11.25C7.5 22 4 17.25 4 12V6l8-4z",
    "zap": "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    "activity": "M22 12h-4l-3 9L9 3l-3 9H2",
    "lock": "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zm2-3a5 5 0 0 1 10 0v3H7V8z",
  };

  let path = $derived(icons[name] ?? "");
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  class="cy-icon"
>
  {#if name === "copy"}
    <rect x="8" y="2" width="10" height="14" rx="2" />
    <path d="M4 6v12a2 2 0 0 0 2 2h8" />
  {:else if name === "lock"}
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  {:else if name === "cpu"}
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  {:else}
    <path d={path} />
  {/if}
</svg>

<style>
  .cy-icon {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }
</style>

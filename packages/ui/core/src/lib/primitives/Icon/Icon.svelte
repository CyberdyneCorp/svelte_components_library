<svelte:options runes={true} />

<script lang="ts">
  // String-literal union of the built-in icon names. Exported below as
  // `IconName` so consumers get autocomplete; the `name` prop still accepts
  // any string so a misspelled name renders empty rather than failing typecheck.
  type BuiltInIconName =
    | "check"
    | "x"
    | "chevron-down"
    | "chevron-right"
    | "chevron-left"
    | "search"
    | "alert-circle"
    | "info"
    | "settings"
    | "menu"
    | "plus"
    | "minus"
    | "copy"
    | "external-link"
    | "terminal"
    | "cpu"
    | "shield"
    | "zap"
    | "activity"
    | "lock"
    | "target"
    | "maximize"
    | "download"
    | "play"
    | "pause"
    | "clock"
    | "alert-triangle"
    | "home"
    | "bell"
    | "edit"
    | "trash"
    | "key"
    | "cloud"
    | "globe"
    | "more-vertical"
    | "refresh"
    | "box";

  let {
    name = "",
    size = 20,
    color = "currentColor",
  }: {
    /** Built-in icon name (autocompletes) or any custom string (renders empty if unknown). */
    name: BuiltInIconName | (string & {});
    size?: number;
    color?: string;
  } = $props();

  const icons: Record<string, string> = {
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18M6 6l12 12",
    "chevron-down": "M6 9l6 6 6-6",
    "chevron-right": "M9 18l6-6-6-6",
    "chevron-left": "M15 18l-6-6 6-6",
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.35-4.35",
    "alert-circle": "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6v4m0 4h.01",
    info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 9v4m0-7h.01",
    settings:
      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8.59-2.56a1.65 1.65 0 0 0 .33-1.82l-.15-.36a1.65 1.65 0 0 0-1.53-1.03h-.42a8.1 8.1 0 0 0-.67-1.17l.21-.37a1.65 1.65 0 0 0-.25-1.85l-.26-.26a1.65 1.65 0 0 0-1.85-.25l-.37.21a8.1 8.1 0 0 0-1.17-.67v-.42A1.65 1.65 0 0 0 13.38 2h-.36a1.65 1.65 0 0 0-1.82.33L11 2.6a8.1 8.1 0 0 0-1.17.67l-.37-.21a1.65 1.65 0 0 0-1.85.25l-.26.26a1.65 1.65 0 0 0-.25 1.85l.21.37a8.1 8.1 0 0 0-.67 1.17h-.42A1.65 1.65 0 0 0 5.19 8.5l-.15.36a1.65 1.65 0 0 0 .33 1.82",
    menu: "M3 12h18M3 6h18M3 18h18",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    copy: "M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2M16 2h-8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",
    "external-link": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
    terminal: "M4 17l6-5-6-5M12 19h8",
    cpu: "M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 4h6v8H9V8zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
    shield: "M12 2l8 4v6c0 5.25-3.5 10-8 11.25C7.5 22 4 17.25 4 12V6l8-4z",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zm2-3a5 5 0 0 1 10 0v3H7V8z",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    play: "M6 4l14 8-14 8V4z",
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v5l3 3",
    "alert-triangle":
      "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01",
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
    edit: "M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
    trash:
      "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6",
    key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
    cloud: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
    globe:
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    "more-vertical":
      "M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 18a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
    refresh:
      "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
    box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
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
  {:else if name === "target"}
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
  {:else if name === "maximize"}
    <path
      d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"
    />
  {:else if name === "pause"}
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
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

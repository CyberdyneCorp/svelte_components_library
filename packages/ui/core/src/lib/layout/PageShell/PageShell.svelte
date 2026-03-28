<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    sidebarWidth = "260px",
    headerHeight = "56px",
    showSidebar = true,
    showHeader = true,
    collapsedSidebar = false,
    header,
    sidebar,
    children,
    footer,
  }: {
    sidebarWidth?: string;
    headerHeight?: string;
    showSidebar?: boolean;
    showHeader?: boolean;
    collapsedSidebar?: boolean;
    header?: Snippet;
    sidebar?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  } = $props();

  let effectiveSidebarWidth = $derived(
    !showSidebar ? "0px" : collapsedSidebar ? "60px" : sidebarWidth
  );
</script>

<div
  class="cy-ps"
  class:cy-ps--with-sidebar={showSidebar}
  class:cy-ps--collapsed={collapsedSidebar}
  class:cy-ps--with-header={showHeader}
  class:cy-ps--with-footer={!!footer}
  style:--ps-sidebar-width={effectiveSidebarWidth}
  style:--ps-header-height={headerHeight}
>
  {#if showHeader && header}
    <header class="cy-ps__header">
      {@render header()}
    </header>
  {/if}

  {#if showSidebar && sidebar}
    <aside class="cy-ps__sidebar">
      {@render sidebar()}
    </aside>
  {/if}

  <main class="cy-ps__main">
    {#if children}
      {@render children()}
    {/if}
  </main>

  {#if footer}
    <footer class="cy-ps__footer">
      {@render footer()}
    </footer>
  {/if}
</div>

<style>
  .cy-ps {
    display: grid;
    min-height: 100vh;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "main"
      "main";
    background: var(--color-bg-primary);
  }

  .cy-ps--with-header {
    grid-template-rows: var(--ps-header-height) 1fr;
  }

  .cy-ps--with-sidebar {
    grid-template-columns: var(--ps-sidebar-width) 1fr;
    grid-template-areas:
      "sidebar main"
      "sidebar main";
  }

  .cy-ps--with-sidebar.cy-ps--with-header {
    grid-template-areas:
      "header header"
      "sidebar main";
  }

  .cy-ps--with-sidebar.cy-ps--with-header.cy-ps--with-footer {
    grid-template-rows: var(--ps-header-height) 1fr auto;
    grid-template-areas:
      "header header"
      "sidebar main"
      "sidebar footer";
  }

  .cy-ps--with-header.cy-ps--with-footer:not(.cy-ps--with-sidebar) {
    grid-template-rows: var(--ps-header-height) 1fr auto;
    grid-template-areas:
      "header"
      "main"
      "footer";
  }

  .cy-ps__header {
    grid-area: header;
    display: flex;
    align-items: center;
    padding: 0 var(--space-4);
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    z-index: 10;
  }

  .cy-ps__sidebar {
    grid-area: sidebar;
    background: var(--nav-bg);
    border-right: 1px solid var(--color-border-subtle);
    overflow-y: auto;
    overflow-x: hidden;
    transition: width var(--transition-default);
    scrollbar-width: thin;
    scrollbar-color: var(--color-border-subtle) transparent;
  }

  .cy-ps--collapsed .cy-ps__sidebar {
    width: 60px;
  }

  .cy-ps__main {
    grid-area: main;
    overflow-y: auto;
    padding: var(--space-6);
    min-width: 0;
  }

  .cy-ps__footer {
    grid-area: footer;
    display: flex;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border-subtle);
  }

  @media (max-width: 768px) {
    .cy-ps--with-sidebar {
      grid-template-columns: 1fr;
      grid-template-areas:
        "main"
        "main";
    }

    .cy-ps--with-sidebar.cy-ps--with-header {
      grid-template-areas:
        "header"
        "main";
    }

    .cy-ps--with-sidebar.cy-ps--with-header.cy-ps--with-footer {
      grid-template-rows: var(--ps-header-height) 1fr auto;
      grid-template-areas:
        "header"
        "main"
        "footer";
    }

    .cy-ps__sidebar {
      display: none;
    }
  }
</style>

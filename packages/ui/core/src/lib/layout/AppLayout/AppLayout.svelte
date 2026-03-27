<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    sidebarWidth = "260px",
    hasSidebar = true,
    sidebar,
    header,
    children,
  }: {
    sidebarWidth?: string;
    hasSidebar?: boolean;
    sidebar?: Snippet;
    header?: Snippet;
    children?: Snippet;
  } = $props();
</script>

<div
  class="cy-app-layout"
  class:cy-app-layout--with-sidebar={hasSidebar}
  style:--sidebar-width={sidebarWidth}
>
  {#if hasSidebar && sidebar}
    <aside class="cy-app-layout__sidebar">
      {@render sidebar()}
    </aside>
  {/if}
  <div class="cy-app-layout__main">
    {#if header}
      <header class="cy-app-layout__header">
        {@render header()}
      </header>
    {/if}
    <main class="cy-app-layout__content">
      {#if children}
        {@render children()}
      {/if}
    </main>
  </div>
</div>

<style>
  .cy-app-layout {
    display: flex;
    min-height: 100vh;
    background: var(--color-bg-primary);
  }

  .cy-app-layout__sidebar {
    width: var(--sidebar-width);
    flex-shrink: 0;
    background: var(--nav-bg);
    border-right: 1px solid var(--color-border-subtle);
    overflow-y: auto;
  }

  .cy-app-layout__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .cy-app-layout__header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-border-subtle);
    background: var(--color-bg-secondary);
    padding: var(--space-3) var(--space-6);
  }

  .cy-app-layout__content {
    flex: 1;
    padding: var(--space-6);
    overflow-y: auto;
  }
</style>

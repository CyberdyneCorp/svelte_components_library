<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CommandPalette from "./CommandPalette.svelte";

  const { Story } = defineMeta({
    title: "Overlay/CommandPalette",
    component: CommandPalette,
    tags: ["autodocs"],
  });
</script>

<script>
  let openDefault = $state(false);
  let openGroups = $state(false);
  let openFiltered = $state(false);

  const basicCommands = [
    { id: "1", label: "New Project", icon: "📁", onselect: () => {} },
    { id: "2", label: "Open Terminal", icon: "💻", shortcut: "⌘T", onselect: () => {} },
    { id: "3", label: "Run Pipeline", icon: "▶", shortcut: "⌘R", onselect: () => {} },
    { id: "4", label: "Deploy Model", icon: "🚀", onselect: () => {} },
    { id: "5", label: "View Logs", icon: "📋", onselect: () => {} },
  ];

  const groupedCommands = [
    { id: "g1", label: "New Project", icon: "📁", group: "General", onselect: () => {} },
    { id: "g2", label: "Open Settings", icon: "⚙", group: "General", shortcut: "⌘,", onselect: () => {} },
    { id: "g3", label: "Start Training", icon: "🧠", group: "ML Pipeline", shortcut: "⌘⇧T", onselect: () => {} },
    { id: "g4", label: "Evaluate Model", icon: "📊", group: "ML Pipeline", onselect: () => {} },
    { id: "g5", label: "Export Results", icon: "📦", group: "ML Pipeline", onselect: () => {} },
    { id: "g6", label: "Connect Wallet", icon: "🔗", group: "Web3", onselect: () => {} },
    { id: "g7", label: "Deploy Contract", icon: "📜", group: "Web3", shortcut: "⌘⇧D", onselect: () => {} },
  ];

  const filteredDemoCommands = [
    { id: "f1", label: "Search Files", icon: "🔍", shortcut: "⌘P", onselect: () => {} },
    { id: "f2", label: "Search Symbols", icon: "🏷", shortcut: "⌘⇧O", onselect: () => {} },
    { id: "f3", label: "Search Commands", icon: "⌨", shortcut: "⌘⇧P", onselect: () => {} },
    { id: "f4", label: "Search Models", icon: "🧠", onselect: () => {} },
    { id: "f5", label: "Search Datasets", icon: "💾", onselect: () => {} },
    { id: "f6", label: "Search Documentation", icon: "📚", onselect: () => {} },
  ];
</script>

<Story name="Default">
  <div style="padding: 1rem;">
    <button class="trigger-btn" onclick={() => openDefault = true}>
      Open Command Palette
      <kbd class="trigger-kbd">⌘K</kbd>
    </button>
    <CommandPalette bind:open={openDefault} commands={basicCommands} />
  </div>
</Story>

<Story name="WithGroups">
  <div style="padding: 1rem;">
    <button class="trigger-btn" onclick={() => openGroups = true}>
      Open Grouped Commands
      <kbd class="trigger-kbd">⌘K</kbd>
    </button>
    <CommandPalette bind:open={openGroups} commands={groupedCommands} />
  </div>
</Story>

<Story name="Filtered">
  <div style="padding: 1rem;">
    <button class="trigger-btn" onclick={() => openFiltered = true}>
      Open Search Palette
      <kbd class="trigger-kbd">⌘K</kbd>
    </button>
    <CommandPalette
      bind:open={openFiltered}
      commands={filteredDemoCommands}
      placeholder="Search everywhere..."
    />
  </div>
</Story>

<style>
  .trigger-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: var(--color-surface-raised);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 0.875rem;
  }
  .trigger-btn:hover {
    background: var(--color-surface-hover);
  }
  .trigger-kbd {
    padding: 0.125rem 0.5rem;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
  }
</style>

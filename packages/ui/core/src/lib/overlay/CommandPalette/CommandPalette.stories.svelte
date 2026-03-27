<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CommandPalette from "./CommandPalette.svelte";

  const { Story } = defineMeta({
    title: "Overlay/CommandPalette",
    component: CommandPalette,
    tags: ["autodocs"],
  });

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

<Story name="Default" args={{ open: true, commands: basicCommands }} />

<Story name="WithGroups" args={{ open: true, commands: groupedCommands }} />

<Story name="Filtered" args={{ open: true, commands: filteredDemoCommands, placeholder: "Search everywhere..." }} />

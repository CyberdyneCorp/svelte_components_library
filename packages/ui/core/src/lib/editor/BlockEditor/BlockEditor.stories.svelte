<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BlockEditor from "./BlockEditor.svelte";

  const { Story } = defineMeta({
    title: "Editor/BlockEditor",
    component: BlockEditor,
    tags: ["autodocs"],
  });

  const sampleMarkdown = `# Welcome to BlockEditor

This is a **Notion-like** block editor. Click any block to edit it in markdown, then press Enter or click away to see it rendered.

## Features

- Click any rendered block to edit
- Press Enter to create a new block
- Type \`/\` for slash commands
- Drag blocks to reorder

### Code Example

\`\`\`typescript
import { BlockEditor } from "@cyberdynecorp/ui";

function setup() {
  console.log("Block editing!");
}
\`\`\`

## Task List

- [x] Block-based editing
- [x] Slash commands
- [x] Drag and drop
- [ ] Collaborative editing

> The best interface is one that gets out of your way.

| Feature | Status |
|---------|--------|
| Inline edit | Done |
| Preview | Done |
| Toolbar | Done |

---

*Start editing any block above!*
`;

  const minimalMarkdown = `# Quick Note

Just a simple paragraph to get started.

- Item one
- Item two
- Item three
`;

  const readonlyContent = `# Readonly Document

This document is in **readonly** mode. Blocks cannot be edited.

## Key Points

- The editor is locked
- Content is for display only
- Toolbar is hidden

\`\`\`python
print("Read only mode")
\`\`\`
`;
</script>

<Story name="Default" args={{ value: sampleMarkdown }} />

<Story name="Empty" args={{ value: "" }} />

<Story name="Minimal" args={{ value: minimalMarkdown }} />

<Story name="Readonly" args={{ readonly: true, value: readonlyContent }} />

<Story name="NoToolbar" args={{ showToolbar: false, value: sampleMarkdown }} />

<Story name="CustomPlaceholder" args={{ value: "", placeholder: "Start writing your story..." }} />

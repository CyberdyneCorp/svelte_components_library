<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MarkdownPreview from "./MarkdownPreview.svelte";

  const { Story } = defineMeta({
    title: "Editor/MarkdownPreview",
    component: MarkdownPreview,
    tags: ["autodocs"],
  });

  const basicContent = `# Hello World

This is a paragraph with **bold text**, *italic text*, and ~~strikethrough~~.

## Links and Code

Visit [Cyberdyne Systems](https://example.com) for more info.

Here is some \`inline code\` in a sentence.

\`\`\`typescript
const greeting: string = "Hello, Cyberdyne";
console.log(greeting);
\`\`\`

## Lists

- First item
- Second item
- Third item

1. Ordered first
2. Ordered second
3. Ordered third

## Task List

- [x] Completed task
- [ ] Pending task
- [x] Another done task
`;

  const mermaidContent = `# Mermaid Diagrams

## Flowchart

\`\`\`mermaid
flowchart TD
    A[Start] -->|Step 1| B[Process]
    B --> C{Decision}
    C -->|Yes| D[Result A]
    C -->|No| E[Result B]
    D --> F[End]
    E --> F
\`\`\`

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database

    C->>S: Request
    S->>DB: Query
    DB-->>S: Data
    S-->>C: Response
\`\`\`
`;

  const fullContent = `# Full Document Demo

## Introduction

This document demonstrates **all markdown features** supported by the *Cyberdyne* preview component. It includes ~~deprecated~~ legacy formatting.

## Code Examples

Inline: \`npm install @cyberdynecorp/core\`

\`\`\`python
def hello():
    print("Hello from Cyberdyne")
    return True
\`\`\`

## Links and Images

Check out [the docs](https://example.com).

![Placeholder](https://via.placeholder.com/400x200/12121a/00ff41?text=Cyberdyne)

## Blockquote

> The future is not set. There is no fate but what we make for ourselves.

## Table

| Feature | Status | Priority |
|---------|--------|----------|
| Parser | Done | High |
| Mermaid | Done | Medium |
| Export | Pending | Low |

## Lists

- Unordered item A
- Unordered item B

1. First ordered
2. Second ordered

- [x] Task complete
- [ ] Task pending

---

*End of document*
`;
</script>

<Story name="BasicMarkdown" args={{ content: basicContent }}>
  <div style="padding: 2rem; background: var(--color-bg-primary); border-radius: 8px;">
    <MarkdownPreview content={basicContent} />
  </div>
</Story>

<Story name="WithMermaid" args={{ content: mermaidContent }}>
  <div style="padding: 2rem; background: var(--color-bg-primary); border-radius: 8px;">
    <MarkdownPreview content={mermaidContent} />
  </div>
</Story>

<Story name="FullDocument" args={{ content: fullContent }}>
  <div style="padding: 2rem; background: var(--color-bg-primary); border-radius: 8px;">
    <MarkdownPreview content={fullContent} />
  </div>
</Story>

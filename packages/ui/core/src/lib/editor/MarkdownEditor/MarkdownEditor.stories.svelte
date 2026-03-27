<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MarkdownEditor from "./MarkdownEditor.svelte";

  const { Story } = defineMeta({
    title: "Editor/MarkdownEditor",
    component: MarkdownEditor,
    tags: ["autodocs"],
  });

  const sampleMarkdown = `# Getting Started

## Introduction

Welcome to the **Cyberdyne** component library. This editor supports *rich markdown* with live preview.

## Features

- Real-time preview
- Syntax highlighting
- Mermaid diagrams
- Full markdown support

### Code Example

\`\`\`typescript
import { MarkdownEditor } from "@cyberdyne/ui";

const config = {
  theme: "dark",
  mode: "split"
};
\`\`\`

## Task List

- [x] Implement parser
- [x] Add toolbar
- [ ] Add export support

> The best way to predict the future is to create it.

| Feature | Status |
|---------|--------|
| Bold | Done |
| Italic | Done |
| Tables | Done |

---

*End of document*
`;

  const mermaidMarkdown = `# Architecture Overview

## System Diagram

\`\`\`mermaid
flowchart TD
    A[User] -->|Request| B[API Gateway]
    B --> C{Auth Service}
    C -->|Valid| D[ML Service]
    C -->|Invalid| E[Error]
    D --> F[Model Inference]
    F --> G[Response]
    D --> H[(PostgreSQL)]
    H --> I[pgvector]
    H --> J[Apache AGE]

    style A fill:#00ff41,stroke:#00cc33,color:#0a0a0f
    style B fill:#00d4ff,stroke:#00aacc,color:#0a0a0f
    style D fill:#a855f7,stroke:#7e22ce,color:#f0f0ff
    style H fill:#12121a,stroke:#00ff41,color:#f0f0ff
\`\`\`

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant M as ML Service
    participant DB as PostgreSQL

    U->>A: POST /predict
    A->>M: Forward request
    M->>DB: Fetch model config
    DB-->>M: Config data
    M->>M: Run inference
    M-->>A: Prediction result
    A-->>U: JSON response
\`\`\`

## Entity Relationship

\`\`\`mermaid
erDiagram
    USER ||--o{ WALLET : has
    WALLET ||--o{ TRANSACTION : makes
    USER ||--o{ NFT : owns
    NFT }|--|| COLLECTION : belongs_to
    TRANSACTION }|--|| TOKEN : involves
\`\`\`

Some text below the diagrams with **bold** and *italic* formatting.
`;

  const readonlyContent = `# Readonly Document

This document is in **readonly** mode. You cannot edit it.

## Key Points

- The editor is locked
- Preview mode is active
- Content is for display only

\`\`\`python
print("Read only mode")
\`\`\`
`;
</script>

<Story name="SplitMode" args={{ mode: "split", value: sampleMarkdown }} />

<Story name="EditMode" args={{ mode: "edit", value: sampleMarkdown }} />

<Story name="PreviewMode" args={{ mode: "preview", value: sampleMarkdown }} />

<Story name="WithMermaid" args={{ mode: "split", value: mermaidMarkdown }} />

<Story name="Empty" args={{ mode: "split", value: "" }} />

<Story name="Readonly" args={{ mode: "preview", readonly: true, value: readonlyContent }} />

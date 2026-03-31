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
import { MarkdownEditor } from "@cyberdynecorp/ui";

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

  const mathMarkdown = `# Mathematical Equations

## Inline Math

Einstein's famous equation $E = mc^2$ shows the relationship between energy and mass.

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ and applies to any quadratic equation.

## Display Math

The integral of a function:

$$
\\int_{0}^{\\infty} e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}
$$

Maxwell's equations in differential form:

$$
\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}
$$

## Mixed Content

Here's a table with math:

| Formula | Description |
|---------|-------------|
| $a^2 + b^2 = c^2$ | Pythagorean theorem |
| $e^{i\\pi} + 1 = 0$ | Euler's identity |

### Code and Math Together

\`\`\`python
# Compute the integral numerically
import scipy.integrate as integrate
result = integrate.quad(lambda x: x**2, 0, 1)
\`\`\`

The exact result is $\\int_0^1 x^2 \\, dx = \\frac{1}{3}$.

## Mermaid + Math

\`\`\`mermaid
flowchart LR
    A["Input x"] --> B["Compute f(x)"]
    B --> C["Output y"]
\`\`\`

- [x] Add inline math support
- [x] Add display math blocks
- [ ] Add matrix notation
`;

  const editablePreviewMarkdown = `# Editable Preview Demo

Click on any block below to edit it directly in the preview!

## Features

- **Click to edit** any block
- Toolbar works on the active block
- Task checkboxes toggle without entering edit mode

### Task List

- [x] Implement editable preview
- [x] Add math support
- [ ] Add table grid editor
- [ ] Add image upload

### Code Block

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Math Equation

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

> Try clicking on this blockquote to edit it!

| Column A | Column B | Column C |
|----------|----------|----------|
| Alpha    | Beta     | Gamma    |
| Delta    | Epsilon  | Zeta     |

---

*Click any element above to start editing in preview mode!*
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

<Story name="WithMath" args={{ mode: "split", value: mathMarkdown }} />

<Story name="EditablePreview" args={{ mode: "preview", value: editablePreviewMarkdown }} />

<Story name="Empty" args={{ mode: "split", value: "" }} />

<Story name="Readonly" args={{ mode: "preview", readonly: true, value: readonlyContent }} />

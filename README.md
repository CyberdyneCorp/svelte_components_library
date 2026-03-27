# Cyberdyne Design System

A comprehensive Svelte 5 component library built for **Cyberdyne** — powering products across Crypto, Machine Learning, and Research.

Dark-first, cyberpunk-inspired design system with 32+ components, design tokens, and full Storybook documentation.

## Storybook

**Live documentation:** Once deployed, access via GitHub Pages.

**Local development:**

```bash
pnpm install
pnpm dev
# → http://localhost:6006
```

**Build static docs:**

```bash
pnpm build-storybook
# Output → docs/
```

## Packages

| Package | Description |
|---------|------------|
| `@cyberdyne/svelte-ui-foundation` | Design tokens, CSS custom properties, typography, colors, spacing, animations |
| `@cyberdyne/svelte-ui-core` | 32+ UI components across 8 categories |

## Installation

```bash
# Configure registry
echo "@cyberdyne:registry=https://npm.pkg.github.com" >> .npmrc

# Install
pnpm add @cyberdyne/svelte-ui-foundation @cyberdyne/svelte-ui-core
```

### Setup

Import the foundation styles in your root layout:

```svelte
<script>
  import "@cyberdyne/svelte-ui-foundation/styles";
</script>

{@render children()}
```

Use components:

```svelte
<script>
  import { Button, Card, TextInput, Badge, LoginPage } from "@cyberdyne/svelte-ui-core";
</script>

<Card variant="elevated">
  <TextInput label="Search" placeholder="Search transactions..." />
  <Button variant="brand">Execute</Button>
  <Badge variant="success">Online</Badge>
</Card>
```

## Components

### Primitives
`Button` · `Badge` · `Icon` (20+ built-in icons) · `IconButton` · `Avatar` · `Tooltip` · `ChipButton`

### Forms
`TextInput` · `PasswordInput` · `Select` · `Checkbox` · `Switch` · `Textarea` · `FileDropzone`

### Feedback
`Alert` · `Dialog` · `Notification`

### Navigation
`Tabs` · `Breadcrumb` · `Sidebar`

### Data Display
`Table` (sortable columns) · `Pagination` · `ProgressBar` · `StatusBadge` · `EmptyState`

### Layout
`Card` · `AppLayout` · `PageHeader`

### Overlay
`Modal` · `ContextMenu`

### Auth
`LoginPage` (credentials + wallet modes) · `WalletConnect` (MetaMask, WalletConnect, Coinbase, Phantom)

## Design System

### Color Palette

Three signature colors mapping to Cyberdyne's domains:

| Color | Hex | Domain |
|-------|-----|--------|
| Neon Green | `#00ff41` | Crypto / Blockchain |
| Electric Cyan | `#00d4ff` | Machine Learning / Data |
| Violet | `#a855f7` | Research / Innovation |

Built on a 3-layer token architecture:
- **Layer 1 — Primitives:** Raw color values (`--primitive-green-10`)
- **Layer 2 — Semantic:** Purpose-based tokens (`--color-action-brand-default`)
- **Layer 3 — Component:** Scoped to components (`--btn-brand-bg`)

### Typography

| Font | Family | Usage |
|------|--------|-------|
| Space Grotesk | `--font-display` | Headings, hero text |
| Inter | `--font-body` | Body copy, form inputs |
| JetBrains Mono | `--font-mono` | Code, labels, data values |

### Theming

All components use CSS custom properties. Override any token:

```css
:root {
  --color-action-brand-default: #00e5ff;
  --color-bg-primary: #050510;
}
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Svelte 5 (runes) |
| Styling | CSS Custom Properties |
| Types | TypeScript (strict) |
| Docs | Storybook 8 |
| Build | Vite + svelte-package |
| Monorepo | pnpm workspaces |
| Versioning | Changesets |
| CI/CD | GitHub Actions |

## Development

```bash
# Clone
git clone git@github.com:CyberdyneCorp/svelte-components-library.git
cd svelte-components-library

# Install
pnpm install

# Storybook dev server
pnpm dev

# Build all packages
pnpm build

# Lint & type check
pnpm check

# Format
pnpm format
```

### Versioning

```bash
pnpm changeset          # Create a changeset
pnpm version-packages   # Apply versions
pnpm release            # Build & publish
```

## Project Structure

```
├── .storybook/              Storybook config & static docs
│   ├── main.ts              Stories glob, addons, aliases
│   ├── preview.ts           Global styles & parameters
│   ├── manager.ts           Cyberdyne dark theme
│   └── static-docs/         Welcome, Getting Started, Design Tokens
├── .github/workflows/       CI/CD (test, release, publish-storybook)
├── packages/
│   └── ui/
│       ├── foundation/      Design tokens & global styles
│       │   └── src/lib/
│       │       ├── tokens/  TypeScript token definitions
│       │       └── styles/  CSS (colors, typography, spacing, radius, animations)
│       └── core/            UI components
│           └── src/lib/
│               ├── primitives/   Button, Badge, Icon, Avatar, ...
│               ├── forms/        TextInput, Select, Checkbox, ...
│               ├── feedback/     Alert, Dialog, Notification
│               ├── navigation/   Tabs, Breadcrumb, Sidebar
│               ├── data/         Table, Pagination, ProgressBar, ...
│               ├── layout/       Card, AppLayout, PageHeader
│               ├── overlay/      Modal, ContextMenu
│               └── auth/         LoginPage, WalletConnect
└── docs/                    Built Storybook output
```

## License

Private — Cyberdyne Corp.

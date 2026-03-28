# Cyberdyne Design System

A comprehensive Svelte 5 component library built for **Cyberdyne** — powering products across Crypto, Machine Learning, and Research.

Dark-first, cyberpunk-inspired design system with **127 components** across 15 categories, design tokens, and full Storybook documentation.

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

The Storybook includes:
- Interactive component playground with controls
- Auto-generated API documentation for every component
- Design token reference (colors, typography, spacing)
- Getting started guide and architecture overview

All stories use the `args` pattern for Storybook Svelte CSF compatibility. Visual regression testing is handled via Playwright.

## Packages

| Package | Description |
|---------|------------|
| `@cyberdyne/svelte-ui-foundation` | Design tokens, CSS custom properties, typography, colors, spacing, animations |
| `@cyberdyne/svelte-ui-core` | 127 UI components across 15 categories |

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
  import {
    Button, Card, TextInput, Badge,
    TokenBalance, Terminal, CommandPalette
  } from "@cyberdyne/svelte-ui-core";
</script>

<Card variant="elevated">
  <TextInput label="Search" placeholder="Search transactions..." />
  <Button variant="brand">Execute</Button>
  <Badge variant="success">Online</Badge>
</Card>
```

## Components (127)

### Primitives (14)
`Button` · `Badge` · `Icon` (20+ built-in) · `IconButton` · `Avatar` · `Tooltip` · `ChipButton` · `ToggleGroup` · `AvatarGroup` · `Flag` · `InformationPill` · `CopyButton` · `ThemeToggle` · `StarRating`

### Forms (19)
`TextInput` · `PasswordInput` · `Select` · `Checkbox` · `Radio` · `Switch` · `Textarea` · `FileDropzone` · `DateRangePicker` · `MultiSelect` · `TagInput` · `NumberInput` · `ComboBox` · `RangeSlider` · `CodeEditor` · `ColorPicker` · `SearchInput` · `DatePicker` · `TimePicker`

### Feedback (11)
`Alert` · `Dialog` · `Notification` · `Toast` (queue manager) · `Skeleton` (loading placeholders) · `Accordion` · `Dropdown` · `ProgressRing` · `Stepper` · `ErrorBoundary` · `Carousel`

### Navigation (5)
`Tabs` · `Breadcrumb` · `Sidebar` · `Header` · `MenuItem`

### Data Display (15)
`Table` (sortable columns) · `Pagination` · `ProgressBar` · `StatusBadge` · `EmptyState` · `StickyNote` · `VirtualizedList` · `InfiniteScroll` · `FileTree` · `DiffViewer` · `Calendar` · `Kanban` · `DataTable` · `FilterBar` · `SortableList`

### Layout (8)
`Card` · `AppLayout` · `PageHeader` · `ContentSlot` · `Drawer` · `SplitView` · `GridLayout` · `PageShell`

### Overlay (5)
`Modal` · `ModalBackdrop` · `ContextMenu` · `Popover` · `CommandPalette` (Cmd+K)

### Auth (2)
`LoginPage` (credentials + wallet modes) · `WalletConnect` (MetaMask, WalletConnect, Coinbase, Phantom)

### Chat (7)
`Chatbox` · `ChatPanel` · `ChatResponse` · `PromptExample` · `WelcomeText` · `BotAnswer` · `CommentThread`

### Crypto / Web3 (13)
`TokenBalance` · `TransactionList` · `AddressDisplay` · `NetworkBadge` · `NFTCard` · `PriceDisplay` · `MetricCard` · `GasEstimate` · `TierBadge` (6-tier NFT access system) · `SwapInterface` · `TokenSelector` · `StakingCard` · `TransactionConfirm`

### ML / Data Tools (11)
`CodeBlock` (syntax highlighting) · `Terminal` · `LogViewer` (severity filtering) · `Slider` · `StepProgress` · `Timeline` · `DataChart` (chart wrapper) · `Kbd` (keyboard shortcuts) · `NotebookCell` · `ModelCard` · `ConfusionMatrix`

### Graph & Search (2)
`GraphViewer` (force-directed network graph with community detection, zoom/pan, search) · `SemanticSearch` (vector search results with relevance scores)

### Charts (10)
`LineChart` · `BarChart` · `AreaChart` · `HeatmapChart` · `PieChart` · `Sparkline` · `Gauge` · `TreeMap` · `GanttChart` · `ActivityHeatmap`

### Editor (4)
`MarkdownEditor` (with Mermaid diagram support) · `MarkdownPreview` · `MarkdownToolbar` · `MindMap`

### Maps (1)
`MapView` (Leaflet with dark tiles, custom controls, geolocation)

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
| Testing | Playwright (visual regression) |
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
│       └── core/            UI components (127 components)
│           └── src/lib/
│               ├── primitives/   Button, Badge, Icon, Avatar, ToggleGroup, AvatarGroup, ThemeToggle, StarRating, ...
│               ├── forms/        TextInput, Select, DateRangePicker, ColorPicker, SearchInput, DatePicker, TimePicker, ...
│               ├── feedback/     Alert, Toast, Skeleton, Stepper, ProgressRing, ErrorBoundary, Carousel, ...
│               ├── navigation/   Tabs, Breadcrumb, Sidebar, Header, MenuItem
│               ├── data/         Table, Pagination, VirtualizedList, FileTree, DiffViewer, Kanban, DataTable, FilterBar, SortableList, ...
│               ├── layout/       Card, AppLayout, Drawer, SplitView, GridLayout, PageShell, ...
│               ├── overlay/      Modal, ContextMenu, Popover, CommandPalette
│               ├── auth/         LoginPage, WalletConnect
│               ├── chat/         Chatbox, ChatPanel, ChatResponse, CommentThread, ...
│               ├── crypto/       TokenBalance, NFTCard, GasEstimate, TierBadge, SwapInterface, StakingCard, ...
│               ├── ml/           CodeBlock, Terminal, LogViewer, Timeline, NotebookCell, ModelCard, ConfusionMatrix, ...
│               ├── graph/        GraphViewer (force-directed), SemanticSearch
│               ├── charts/       LineChart, BarChart, AreaChart, HeatmapChart, PieChart, Sparkline, Gauge, TreeMap, GanttChart, ActivityHeatmap
│               ├── editor/       MarkdownEditor, MarkdownPreview, MarkdownToolbar, MindMap
│               ├── maps/         MapView (Leaflet)
│               └── _testdata/    Shared test data module for stories
└── docs/                    Built Storybook output
```

## Target Products

This design system is built to support:

- **CyberdyneDAO** — Web3 terminal platform with NFT-gated access
- **YieldPath** — AI-powered DeFi life planner
- **Vision Factory** — Computer vision ML pipeline
- **Terraform Game** — Blockchain RTS strategy game
- **Research Tools** — Internal ML & data exploration interfaces

## License

Private — Cyberdyne Corp.

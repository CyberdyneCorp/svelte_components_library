# Technical Requirements Document (TRD)

## Cyberdyne Design System — Svelte Component Library

| Field | Value |
|-------|-------|
| **Project** | Cyberdyne Design System |
| **Version** | 0.1.0 |
| **Date** | 2026-03-27 |
| **Owner** | Cyberdyne Corp |
| **Repository** | `CyberdyneCorp/svelte_components_library` |
| **Status** | Active Development |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Objectives](#2-objectives)
3. [Architecture](#3-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Package Structure](#5-package-structure)
6. [Design System Specification](#6-design-system-specification)
7. [Component Inventory](#7-component-inventory)
8. [Build & Distribution](#8-build--distribution)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Quality Assurance](#10-quality-assurance)
11. [Documentation](#11-documentation)
12. [Security Considerations](#12-security-considerations)
13. [Performance Requirements](#13-performance-requirements)
14. [Browser Support](#14-browser-support)
15. [Accessibility Requirements](#15-accessibility-requirements)
16. [Future Roadmap](#16-future-roadmap)

---

## 1. Overview

### 1.1 Purpose

The Cyberdyne Design System is a comprehensive, reusable Svelte 5 component library providing a unified visual language and UI toolkit for all Cyberdyne products. It serves as the single source of truth for user interface patterns across the organization's crypto, machine learning, and research platforms.

### 1.2 Scope

The system encompasses:
- **Design Tokens** — Colors, typography, spacing, radius, shadows, and animations defined as CSS custom properties
- **71 UI Components** — Organized across 12 functional categories
- **Storybook Documentation** — Interactive component playground with auto-generated API docs
- **CI/CD Pipeline** — Automated testing, versioning, and publishing workflows

### 1.3 Target Products

| Product | Domain | Key UI Needs |
|---------|--------|-------------|
| CyberdyneDAO | Web3 terminal platform | Wallet connection, NFT tier badges, terminal UI |
| YieldPath | AI-powered DeFi planner | Token balances, metric dashboards, chat interface |
| Vision Factory | Computer vision ML pipeline | Log viewers, terminal output, step progress |
| Terraform Game | Blockchain RTS strategy | NFT cards, price displays, transaction lists |
| Research Tools | Internal ML/data tools | Code blocks, sliders, data charts, timelines |

### 1.4 Stakeholders

| Role | Responsibility |
|------|---------------|
| Frontend Engineers | Consume components, contribute new components |
| Product Designers | Define requirements, validate visual output |
| QA Engineers | Test component behavior and accessibility |
| DevOps | Maintain CI/CD pipeline and package registry |

---

## 2. Objectives

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| FR-01 | Provide a complete set of primitive UI components (buttons, badges, icons, inputs) | P0 |
| FR-02 | Provide domain-specific crypto/Web3 components (wallet connect, token balance, gas estimate) | P0 |
| FR-03 | Provide ML/data visualization components (terminal, code block, log viewer) | P0 |
| FR-04 | Provide a chat interface component system | P1 |
| FR-05 | All components must be fully themeable via CSS custom properties | P0 |
| FR-06 | Components must support Svelte 5 runes mode ($props, $state, $bindable, $derived) | P0 |
| FR-07 | Provide full TypeScript type definitions for all component props | P0 |
| FR-08 | Provide a login/authentication flow with both credential and wallet modes | P1 |
| FR-09 | Provide keyboard shortcut support (CommandPalette, Kbd) | P2 |
| FR-10 | All form components must support bindable values for two-way data flow | P0 |

### 2.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| NFR-01 | Meet WCAG 2.1 AA accessibility standards | P0 |
| NFR-02 | Support `prefers-reduced-motion` media query | P0 |
| NFR-03 | No runtime CSS-in-JS — all styles via CSS custom properties and scoped styles | P0 |
| NFR-04 | Zero external runtime dependencies (foundation package) | P0 |
| NFR-05 | Total core package bundle < 100KB gzipped (tree-shakeable) | P1 |
| NFR-06 | Component render time < 16ms (60fps budget) | P1 |
| NFR-07 | Storybook documentation must be auto-generated from component source | P0 |
| NFR-08 | All components must work in SSR (SvelteKit) environments | P1 |

---

## 3. Architecture

### 3.1 Monorepo Structure

```
svelte_components_library/
├── .changeset/              Version management
├── .github/workflows/       CI/CD pipelines
├── .storybook/              Documentation platform config
│   ├── main.ts              Story discovery, addons, Vite aliases
│   ├── preview.ts           Global styles, background presets
│   ├── manager.ts           Cyberdyne dark theme for Storybook UI
│   └── static-docs/         MDX documentation pages
├── documentation/           Project documentation (TRD, etc.)
├── packages/
│   ├── config/              Shared configuration packages (future)
│   │   ├── tailwind/
│   │   ├── vitest/
│   │   └── playwright/
│   └── ui/
│       ├── foundation/      Design tokens & global styles
│       │   └── src/lib/
│       │       ├── tokens/  TypeScript token definitions
│       │       └── styles/  CSS layers (colors, typography, spacing, ...)
│       └── core/            UI components (71 components)
│           └── src/lib/
│               ├── primitives/   10 components
│               ├── forms/        8 components
│               ├── feedback/     7 components
│               ├── navigation/   5 components
│               ├── data/         6 components
│               ├── layout/       5 components
│               ├── overlay/      5 components
│               ├── auth/         2 components
│               ├── chat/         6 components
│               ├── crypto/       9 components
│               └── ml/           8 components
├── package.json             Root workspace config
├── pnpm-workspace.yaml      Workspace package paths
├── svelte.config.js         Svelte compiler options
├── tsconfig.json            TypeScript configuration
├── vite.config.ts           Vite build configuration
└── eslint.config.js         Linting rules
```

### 3.2 Package Dependency Graph

```
@cyberdyne/svelte-ui-core
  └── depends on → @cyberdyne/svelte-ui-foundation (workspace:*)

@cyberdyne/svelte-ui-foundation
  └── peer dependency → svelte ^5.0.0

Consumer Application
  ├── @cyberdyne/svelte-ui-foundation (styles + tokens)
  └── @cyberdyne/svelte-ui-core (components)
      └── internally imports foundation tokens
```

### 3.3 Design Token Architecture

Three-layer token system ensuring consistent theming and easy overrides:

```
Layer 1: Primitives        Raw values, rarely change
  --primitive-green-10     #00ff41

Layer 2: Semantic          Purpose-based, swappable for themes
  --color-action-brand     var(--primitive-green-10)

Layer 3: Component         Scoped to specific components
  --btn-brand-bg           var(--color-action-brand)
```

**CSS File Organization:**

| File | Purpose | Token Count |
|------|---------|-------------|
| `colors.css` | 3-layer color system | ~80 tokens |
| `typography.css` | Font families, type scale classes | ~15 tokens |
| `spacing.css` | Spacing scale (4px grid) | 14 tokens |
| `radius.css` | Border radius values | 6 tokens |
| `animations.css` | Transitions, keyframes | 4 transition tokens + 7 keyframes |
| `base.css` | Reset, selection, scrollbar, focus styles | — |

### 3.4 Component Architecture Pattern

Every component follows this structure:

```
ComponentName/
├── ComponentName.svelte          Implementation
├── ComponentName.stories.svelte  Storybook stories
└── index.ts                      Barrel export
```

**Component Implementation Pattern:**

```svelte
<svelte:options runes={true} />

<script lang="ts">
  // 1. Type definitions
  type Props = { ... };

  // 2. Props with defaults and bindable values
  let { prop1, prop2 = $bindable("") }: Props = $props();

  // 3. Internal state
  let internalState = $state(false);

  // 4. Derived computations
  let computed = $derived(/* ... */);

  // 5. Event handlers
  function handleEvent() { ... }
</script>

<!-- 6. Semantic HTML with ARIA attributes -->
<div class="cy-component" role="...">
  <!-- 7. Snippet rendering for composition -->
  {@render children?.()}
</div>

<!-- 8. Scoped styles using CSS custom properties -->
<style>
  .cy-component { ... }
</style>
```

**Naming Conventions:**
- CSS classes: `cy-{component}`, `cy-{component}__{element}`, `cy-{component}--{modifier}`
- CSS tokens: `--{layer}-{category}-{name}` (e.g., `--color-action-brand-default`)
- Type classes: `.cy-type-{scale}` (e.g., `.cy-type-h1`)

---

## 4. Technology Stack

### 4.1 Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Svelte | ^5.33.0 | UI framework (runes mode) |
| TypeScript | ^5.8.3 | Type safety |
| Vite | ^6.3.5 | Build tool and dev server |
| pnpm | >=9 | Package manager (workspaces) |
| Node.js | >=20 | Runtime |

### 4.2 Build & Packaging

| Technology | Version | Purpose |
|-----------|---------|---------|
| @sveltejs/package | ^2.3.10 | Component library packaging |
| @sveltejs/vite-plugin-svelte | ^5.0.3 | Svelte compilation in Vite |
| @sveltejs/adapter-auto | ^6.0.0 | SvelteKit adapter |
| @changesets/cli | ^2.29.4 | Version management and changelogs |

### 4.3 Documentation

| Technology | Version | Purpose |
|-----------|---------|---------|
| Storybook | ^8.6.14 | Component documentation platform |
| @storybook/svelte-vite | ^8.6.14 | Svelte framework integration |
| @storybook/addon-svelte-csf | ^5.0.8 | Svelte component story format |
| @storybook/addon-essentials | ^8.6.14 | Controls, actions, viewports, etc. |
| @storybook/addon-a11y | ^8.6.14 | Accessibility audit panel |
| @storybook/addon-interactions | ^8.6.14 | Play function testing |
| @storybook/addon-docs | ^8.6.14 | Auto-generated documentation |

### 4.4 Quality Tools

| Technology | Version | Purpose |
|-----------|---------|---------|
| ESLint | ^9.27.0 | Code linting (flat config) |
| @typescript-eslint | ^8.33.0 | TypeScript linting rules |
| eslint-plugin-svelte | ^3.9.0 | Svelte linting rules |
| Prettier | ^3.5.3 | Code formatting |
| prettier-plugin-svelte | ^3.3.3 | Svelte file formatting |
| svelte-check | ^4.2.1 | Svelte type checking |
| Vitest | ^3.1.4 | Unit testing framework |

### 4.5 External Font Dependencies

Loaded via Google Fonts CDN in `typography.css`:

| Font | Weights | Usage |
|------|---------|-------|
| Space Grotesk | 400, 500, 600, 700 | Display headings |
| Inter | 400, 500, 600, 700 | Body text |
| JetBrains Mono | 400, 500, 600 | Code, labels, data |

---

## 5. Package Structure

### 5.1 @cyberdyne/svelte-ui-foundation

**Version:** 0.1.0
**Purpose:** Design tokens and global styles — zero component code

**Exports:**

| Export Path | Content |
|------------|---------|
| `.` | TypeScript token definitions (breakpoints, grid, typography, spacing, radius, colors) |
| `./styles` | Global CSS (colors.css, typography.css, spacing.css, radius.css, animations.css, base.css) |
| `./tokens` | TypeScript token constants |

**TypeScript Exports:**

```typescript
export const breakpoints: { xs: 320, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1440 }
export const grid: { mobile: {...}, tablet: {...}, desktop: {...} }
export const typography: { fontFamilies: {...}, scales: {...} }
export const spacing: { 0: "0", 1: "0.25rem", ... 32: "8rem" }
export const radius: { xs: "0.25rem", ... pill: "999px" }
export const colors: { primitives: { neonGreen: {...}, cyan: {...}, ... } }
export type BreakpointKey, SpacingKey, RadiusKey
```

### 5.2 @cyberdyne/svelte-ui-core

**Version:** 0.1.0
**Purpose:** 71 UI components
**Dependency:** `@cyberdyne/svelte-ui-foundation` (workspace:*)

**Export Path:** `.` — All components from a single entry point

---

## 6. Design System Specification

### 6.1 Color System

#### Primitive Palette

| Color Family | Shade Range | Brand Mapping |
|-------------|-------------|---------------|
| Neon Green | 10–60 (`#00ff41` → `#007a1f`) | Crypto / Blockchain |
| Electric Cyan | 10–60 (`#00d4ff` → `#006b80`) | Machine Learning / Data |
| Violet | 10–60 (`#a855f7` → `#3b0764`) | Research / Innovation |
| Red | 10–60 (`#ff4444` → `#800f0f`) | Error / Danger |
| Amber | 10–60 (`#ffb800` → `#805e00`) | Warning |
| Grey | 5–110 (`#0a0a0f` → `#f0f0ff`) | Surfaces / Text (13 shades) |

#### Semantic Token Mapping

| Category | Token Examples | Source |
|----------|---------------|--------|
| Backgrounds | `--color-bg-primary` (#0a0a0f), `--color-bg-secondary` (#12121a), `--color-bg-elevated` (#22222e) | Grey 5, 10, 20 |
| Text | `--color-text-primary` (#f0f0ff), `--color-text-code` (#00ff41), `--color-text-link` (#00d4ff) | Grey 110, Green 10, Cyan 10 |
| Borders | `--color-border-focus` (#00d4ff), `--color-border-brand` (#00ff41) | Cyan 10, Green 10 |
| Actions | `--color-action-brand-default` (#00ff41), `--color-action-secondary-default` (#00d4ff) | Green 10, Cyan 10 |
| State | `--color-state-success` (#00ff41), `--color-state-error` (#ff4444), `--color-state-warning` (#ffb800), `--color-state-info` (#00d4ff) | Green, Red, Amber, Cyan |

#### Shadow & Glow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.5)` | Subtle elevation |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.6)` | Card elevation |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.7)` | Modal elevation |
| `--shadow-glow-green` | `0 0 12px rgba(0,255,65,0.3)` | Brand glow |
| `--shadow-glow-cyan` | `0 0 12px rgba(0,212,255,0.3)` | Focus glow |
| `--shadow-glow-violet` | `0 0 12px rgba(168,85,247,0.3)` | Accent glow |

### 6.2 Typography Scale

| Scale | Size | Line Height | Weight | Letter Spacing | CSS Class |
|-------|------|-------------|--------|---------------|-----------|
| Display 1 | 3.5rem | 1.1 | 700 | -0.02em | `.cy-type-display-1` |
| Display 2 | 2.5rem | 1.15 | 700 | -0.015em | `.cy-type-display-2` |
| Heading 1 | 2rem | 1.2 | 600 | -0.01em | `.cy-type-h1` |
| Heading 2 | 1.5rem | 1.25 | 600 | -0.005em | `.cy-type-h2` |
| Heading 3 | 1.25rem | 1.3 | 600 | 0 | `.cy-type-h3` |
| Body Large | 1.125rem | 1.5 | 400 | 0 | `.cy-type-body-lg` |
| Body Medium | 1rem | 1.5 | 400 | 0 | `.cy-type-body-md` |
| Body Small | 0.875rem | 1.5 | 400 | 0.01em | `.cy-type-body-sm` |
| Label | 0.875rem | 1.4 | 500 | 0.02em | `.cy-type-label` |
| Caption | 0.75rem | 1.4 | 400 | 0.03em | `.cy-type-caption` |
| Code | 0.875rem | 1.6 | 400 | 0.02em | `.cy-type-code` |

### 6.3 Spacing Scale

Based on a 4px base grid:

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-0` | 0 | 0 |
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-5` | 1.25rem | 20px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-10` | 2.5rem | 40px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |
| `--space-20` | 5rem | 80px |
| `--space-24` | 6rem | 96px |
| `--space-32` | 8rem | 128px |

### 6.4 Responsive Breakpoints & Grid

| Breakpoint | Width | Grid Columns | Gutter | Margin |
|-----------|-------|-------------|--------|--------|
| xs | 320px | 4 | 16px | 16px |
| sm | 576px | 4 | 16px | 16px |
| md | 768px | 8 | 24px | 32px |
| lg | 992px | 12 | 24px | 40px |
| xl | 1200px | 12 | 24px | 40px |
| xxl | 1440px | 12 | 24px | 40px |

### 6.5 Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | 100ms ease | Hover states, micro-interactions |
| `--transition-default` | 200ms ease | General transitions |
| `--transition-slow` | 300ms ease | Panel reveals |
| `--transition-spring` | 300ms cubic-bezier(0.34, 1.56, 0.64, 1) | Bouncy reveals |

**Keyframe Animations:**

| Animation | Description |
|-----------|------------|
| `cy-fade-in` | Opacity 0 → 1 |
| `cy-slide-up` | Translate Y +8px → 0 with fade |
| `cy-slide-down` | Translate Y -8px → 0 with fade |
| `cy-scale-in` | Scale 0.95 → 1 with fade |
| `cy-glow-pulse` | Pulsing green box-shadow |
| `cy-scan-line` | Vertical scan line effect |
| `cy-spinner` | 360° rotation |

---

## 7. Component Inventory

### 7.1 Primitives (10 components)

| Component | Props | Description |
|-----------|-------|------------|
| `Button` | variant, size, disabled, loading, type, onclick | Primary action element with 5 variants (brand, secondary, outline, ghost, danger) |
| `Badge` | variant, size | Status indicator pill (success, warning, error, info, neutral) |
| `Icon` | name, size, color | SVG icon system with 20+ built-in icons |
| `IconButton` | icon, label, variant, size, disabled, onclick | Circular icon-only button |
| `Avatar` | src, alt, initials, size, status | User avatar with image/initials fallback and status dot |
| `Tooltip` | text, position | Hover tooltip with 4 positions |
| `ChipButton` | selected, disabled, onclick | Toggle chip for filters |
| `Flag` | variant, size | Feature/status flag (new, beta, deprecated, experimental) |
| `InformationPill` | label, value, variant | Key:value inline chip |
| `CopyButton` | text, label, size, variant | Clipboard copy with feedback animation |

### 7.2 Forms (8 components)

| Component | Props | Description |
|-----------|-------|------------|
| `TextInput` | value (bindable), label, placeholder, hint, error, disabled, required, type | Text/email/url/number input with validation |
| `PasswordInput` | value (bindable), label, error, disabled | Password field with show/hide toggle |
| `Select` | value (bindable), label, options, placeholder, error, disabled | Styled dropdown select |
| `Checkbox` | checked (bindable), label, disabled, error | Custom checkbox with green checkmark |
| `Radio` | options, value (bindable), name, label, disabled, error | Radio button group |
| `Switch` | checked (bindable), label, disabled | Toggle switch with smooth animation |
| `Textarea` | value (bindable), label, placeholder, hint, error, rows, maxlength | Multi-line input with character count |
| `FileDropzone` | accept, multiple, disabled, maxSize, onfiles | Drag-and-drop file upload zone |

### 7.3 Feedback (7 components)

| Component | Props | Description |
|-----------|-------|------------|
| `Alert` | variant, title, dismissible, ondismiss | Inline alert with left border accent |
| `Dialog` | open (bindable), title, confirmLabel, cancelLabel, variant, onconfirm, oncancel | Confirmation dialog modal |
| `Notification` | variant, message, duration, onclose | Auto-dismissing toast notification |
| `Toast` | children | Global toast queue manager with context API |
| `Skeleton` | variant, width, height, lines, animated | Loading placeholder (text, circle, rect, card) |
| `Accordion` | items, multiple, defaultOpen | Collapsible content sections |
| `Dropdown` | items, trigger, onselect, align | Custom dropdown menu with keyboard navigation |

### 7.4 Navigation (5 components)

| Component | Props | Description |
|-----------|-------|------------|
| `Tabs` | items, activeId (bindable), onchange | Horizontal tab bar with green underline |
| `Breadcrumb` | items | Chevron-separated navigation trail |
| `Sidebar` | items, activeId, collapsed | Multi-level collapsible sidebar |
| `Header` | title, children, logo | Top navigation bar |
| `MenuItem` | label, icon, active, href, onclick, children | Reusable navigation menu item |

### 7.5 Data Display (6 components)

| Component | Props | Description |
|-----------|-------|------------|
| `Table` | columns, rows, striped | Sortable data table with sort indicators |
| `Pagination` | currentPage (bindable), totalPages, onchange | Page navigation with smart range |
| `ProgressBar` | value, variant, size, showLabel | Animated progress with glow effects |
| `StatusBadge` | status, label | Status indicator with pulsing dot |
| `EmptyState` | title, description, icon, children | Empty data placeholder |
| `StickyNote` | variant, title, children | Callout/annotation card |

### 7.6 Layout (5 components)

| Component | Props | Description |
|-----------|-------|------------|
| `Card` | variant, padding, hoverable | Content container (default, elevated, outlined) |
| `AppLayout` | sidebarWidth, hasSidebar, sidebar, header, children | CSS Grid app layout |
| `PageHeader` | title, description, children | Page title with action area |
| `ContentSlot` | name, padding, children | Named content region wrapper |
| `Drawer` | open (bindable), side, width, title, children, footer | Slide-in panel with backdrop |

### 7.7 Overlay (5 components)

| Component | Props | Description |
|-----------|-------|------------|
| `Modal` | open (bindable), title, size, children, footer | Centered modal with scale-in animation |
| `ModalBackdrop` | open, onclick, blur | Standalone backdrop overlay |
| `ContextMenu` | items, children | Right-click positioned menu |
| `Popover` | trigger, content, position, open (bindable) | Floating content with arrow |
| `CommandPalette` | open (bindable), commands, placeholder | Cmd+K search overlay with keyboard navigation |

### 7.8 Auth (2 components)

| Component | Props | Description |
|-----------|-------|------------|
| `LoginPage` | mode, title, subtitle, email (bindable), password (bindable), error, loading, walletSection, onsubmit | Full login page (credentials + wallet + both modes) |
| `WalletConnect` | wallets, connecting (bindable), disabled, onconnect | Wallet connection list (MetaMask, WalletConnect, Coinbase, Phantom) |

### 7.9 Chat (6 components)

| Component | Props | Description |
|-----------|-------|------------|
| `Chatbox` | value (bindable), placeholder, disabled, loading, onsend, onattach | Chat input with auto-grow, file attach, send button |
| `ChatPanel` | children | Scrollable chat message container with auto-scroll |
| `ChatResponse` | role, content, timestamp, avatar | Message bubble (user/assistant/system alignment) |
| `PromptExample` | title, description, onclick | Clickable example prompt card |
| `WelcomeText` | title, subtitle, children | Empty chat welcome screen |
| `BotAnswer` | content, typing, variant | Bot response with typing dots animation |

### 7.10 Crypto / Web3 (9 components)

| Component | Props | Description |
|-----------|-------|------------|
| `TokenBalance` | symbol, balance, usdValue, icon, change | Crypto balance display with USD conversion |
| `TransactionList` | transactions | Transaction history with type icons and status |
| `AddressDisplay` | address, truncate, label, size | Truncated wallet address with copy button |
| `NetworkBadge` | network, chainId, connected, icon | Connected chain indicator pill |
| `NFTCard` | name, image, collection, tokenId, rarity, price, currency, onclick | NFT display card with hover glow |
| `PriceDisplay` | symbol, price, change, period | Token price with delta indicator |
| `MetricCard` | label, value, change, changeLabel, icon, variant | KPI dashboard card |
| `GasEstimate` | slow, standard, fast, selected (bindable) | Gas fee selector (slow/standard/fast) |
| `TierBadge` | tier, label, showLevel | 6-level NFT access tier badge with gradient effects |

### 7.11 ML / Data Tools (8 components)

| Component | Props | Description |
|-----------|-------|------------|
| `CodeBlock` | code, language, showLineNumbers, copyable, maxHeight | Syntax-highlighted code display (regex-based) |
| `Terminal` | lines, title, showHeader, maxHeight | Terminal output viewer with colored output |
| `LogViewer` | logs, showTimestamp, showLevel, filter (bindable), autoScroll, maxHeight | Log feed with severity filtering |
| `Slider` | value (bindable), min, max, step, label, showValue, disabled, unit | Range input with green fill track |
| `StepProgress` | steps, currentStep, variant | Multi-step pipeline indicator (horizontal/vertical) |
| `Timeline` | items | Vertical timeline with variant markers |
| `DataChart` | title, description, height, children, loading, empty | Chart container wrapper with loading/empty states |
| `Kbd` | keys, size, separator | Keyboard shortcut display |

---

## 8. Build & Distribution

### 8.1 Build Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Storybook dev server on port 6006 |
| `pnpm build` | Build all packages (recursive) |
| `pnpm build-storybook` | Build static Storybook to `docs/` |
| `pnpm check` | Run ESLint + svelte-check |
| `pnpm lint` | ESLint on `packages/` |
| `pnpm format` | Prettier formatting |
| `pnpm changeset` | Create a version changeset |
| `pnpm version-packages` | Apply changeset versions |
| `pnpm release` | Build + publish via changesets |

### 8.2 Package Publishing

- **Registry:** GitHub Packages (`https://npm.pkg.github.com`)
- **Scope:** `@cyberdyne`
- **Access:** Restricted (private packages)
- **Authentication:** GitHub PAT with `read:packages` scope
- **Versioning:** Semantic versioning via Changesets

### 8.3 Consumer Setup

```bash
# .npmrc
@cyberdyne:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
pnpm add @cyberdyne/svelte-ui-foundation @cyberdyne/svelte-ui-core
```

---

## 9. CI/CD Pipeline

### 9.1 Workflows

#### Test (Pull Requests)

| Step | Action |
|------|--------|
| Trigger | Pull request to `main` |
| Environment | Ubuntu latest, Node 20 |
| Steps | Install → Check (lint + svelte-check) → Build |

#### Release (Main Branch)

| Step | Action |
|------|--------|
| Trigger | Push to `main` |
| Environment | Ubuntu latest, Node 20 |
| Permissions | Contents write, Packages write, PRs write |
| Steps | Install → Build → Changesets (version PR or publish) |
| Registry | GitHub Packages with `GITHUB_TOKEN` |

#### Publish Storybook (Main Branch)

| Step | Action |
|------|--------|
| Trigger | Push to `main` |
| Environment | Ubuntu latest, Node 20 |
| Permissions | Pages write, ID token write |
| Steps | Install → Build Storybook → Upload Pages artifact → Deploy |
| Output | GitHub Pages deployment |

### 9.2 Pipeline Diagram

```
Pull Request → [test.yaml]
                  ├── pnpm install
                  ├── pnpm check (lint + types)
                  └── pnpm build

Merge to main → [release.yaml]          → [publish-storybook.yaml]
                  ├── pnpm install          ├── pnpm install
                  ├── pnpm build            ├── pnpm build-storybook
                  └── changeset publish     └── deploy to GitHub Pages
```

---

## 10. Quality Assurance

### 10.1 Linting Configuration

**ESLint** (v9, flat config):
- Base: `@eslint/js` recommended
- TypeScript: `@typescript-eslint` strict rules
- Svelte: `eslint-plugin-svelte` recommended
- Custom rules: unused vars warning with `^_` exception
- Ignores: `dist/`, `docs/`, `node_modules/`, `.svelte-kit/`

**Prettier** (v3.5.3):
- Semi: true
- Single quote: false
- Trailing comma: all
- Print width: 100
- Tab width: 2
- Svelte parser override

### 10.2 Type Checking

- TypeScript: strict mode, ES2022 target, bundler module resolution
- svelte-check: validates Svelte files against tsconfig
- Declaration maps and source maps enabled for debugging

### 10.3 Testing Strategy

| Level | Tool | Scope |
|-------|------|-------|
| Unit tests | Vitest ^3.1.4 | Component logic, derived values, utilities |
| Story tests | Storybook interactions | Visual behavior, play functions |
| Accessibility | @storybook/addon-a11y | WCAG compliance auditing |
| Type safety | svelte-check + tsc | Compile-time type errors |

---

## 11. Documentation

### 11.1 Storybook Documentation Site

**Access:** `http://localhost:6006` (dev) or GitHub Pages (deployed)

**Content:**

| Section | Path | Description |
|---------|------|------------|
| Welcome | `Overview/Welcome` | Project vision, design principles, quick start |
| Getting Started | `Overview/Getting Started` | Installation, setup, theming guide |
| Design Tokens | `Overview/Design Tokens` | Color, typography, spacing reference |
| Foundation/Colors | `Foundation/Colors` | Interactive color palette viewer |
| Foundation/Typography | `Foundation/Typography` | Type scale showcase |
| Foundation/Spacing | `Foundation/Spacing` | Visual spacing scale |
| Component stories | `{Category}/{Component}` | Interactive playground per component |

**Auto-Generated Docs:** Every component with `tags: ["autodocs"]` gets:
- Props table with types and defaults
- Interactive controls panel
- Rendered story variants
- Source code view

### 11.2 Project Documentation

| Document | Location | Purpose |
|---------|----------|---------|
| README.md | Root | Quick start, component list, project overview |
| TRD.md | `documentation/` | This document — full technical specification |

---

## 12. Security Considerations

### 12.1 Supply Chain

- All dependencies pinned via `pnpm-lock.yaml`
- Private packages published to GitHub Packages (not public npm)
- GitHub Actions use pinned action versions

### 12.2 Component Security

- No `innerHTML` or `{@html}` usage without sanitization
- XSS-safe — all user content rendered as text nodes
- No external API calls from components (pure UI)
- Clipboard API access (`CopyButton`, `AddressDisplay`) requires user gesture
- No `eval()` or dynamic code execution

### 12.3 Authentication Components

- `LoginPage` and `WalletConnect` are UI-only — no credential storage or wallet signing
- Actual auth logic is delegated to consumer applications via callbacks
- Password fields use `autocomplete="current-password"` for credential manager support

---

## 13. Performance Requirements

### 13.1 Bundle Size Targets

| Package | Target (gzipped) | Notes |
|---------|------------------|-------|
| Foundation CSS | < 5KB | Tokens only, no components |
| Core (full) | < 100KB | All 71 components |
| Core (tree-shaken) | < 15KB | Typical import of 5–10 components |

### 13.2 Runtime Performance

| Metric | Target |
|--------|--------|
| Component mount | < 5ms per component |
| Re-render | < 16ms (60fps budget) |
| Animation FPS | 60fps (CSS-only animations) |
| First paint (Storybook) | < 3s |

### 13.3 Optimization Strategies

- **Tree-shaking:** Individual component exports enable dead code elimination
- **CSS-only animations:** No JavaScript animation libraries
- **Scoped styles:** No global style pollution beyond foundation
- **No runtime dependencies:** Foundation has zero runtime deps
- **Lazy loading:** Components can be dynamically imported

---

## 14. Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |

**Required Features:**
- CSS Custom Properties (all browsers above)
- CSS Grid (all browsers above)
- `prefers-reduced-motion` media query
- `navigator.clipboard` API (CopyButton, AddressDisplay)
- `backdrop-filter` (Modal, Drawer — graceful degradation)

---

## 15. Accessibility Requirements

### 15.1 Standards

- **WCAG 2.1 Level AA** compliance for all components
- Automated via `@storybook/addon-a11y` (axe-core engine)

### 15.2 Implementation Checklist

| Requirement | Implementation |
|------------|---------------|
| Semantic HTML | All components use appropriate elements (`<button>`, `<nav>`, `<dialog>`, etc.) |
| ARIA attributes | `role`, `aria-label`, `aria-expanded`, `aria-current`, `aria-invalid`, `aria-describedby` |
| Focus management | `:focus-visible` with cyan glow ring (2px solid, 2px offset) |
| Keyboard navigation | All interactive elements reachable via Tab; arrow keys for menus, tabs, palettes |
| Focus trapping | Modal, Dialog, CommandPalette trap focus when open |
| Escape key | All overlays close on Escape |
| Color contrast | Text on dark backgrounds meets 4.5:1 minimum |
| Motion | `prefers-reduced-motion` disables all animations |
| Screen reader | Labels on all inputs, alt on images, aria-live for notifications |

---

## 16. Future Roadmap

### 16.1 Planned Enhancements

| Priority | Item | Description |
|----------|------|------------|
| P1 | Dark/Light theme toggle | Semantic token remapping for light mode |
| P1 | MarkdownEditor package | Milkdown-based rich text editor (from svelte-libs) |
| P1 | Chromatic integration | Visual regression testing |
| P2 | Figma token sync | Automated design-to-code token pipeline |
| P2 | Playwright E2E tests | Full browser testing suite |
| P2 | Tailwind CSS preset | `@cyberdyne/svelte-config-tailwind` for consumer apps |
| P3 | Chart components | Built-in charting (beyond DataChart wrapper) |
| P3 | i18n support | Internationalization for labels and content |
| P3 | RTL support | Right-to-left layout support |

### 16.2 Component Roadmap

| Category | Planned Components |
|----------|-------------------|
| Gaming | Minimap, ResourceBar, AbilityPanel, HealthBar, Leaderboard |
| Data Viz | LineChart, BarChart, PieChart, Heatmap |
| Advanced Forms | DatePicker, TimePicker, ColorPicker, TagInput, Autocomplete |
| Layout | Resizable panels, Masonry grid, Virtual list |

---

## Appendix A: CSS Custom Property Reference

Complete listing of all CSS custom properties defined in the foundation:

```
/* Backgrounds */
--color-bg-primary, --color-bg-secondary, --color-bg-tertiary, --color-bg-elevated, --color-bg-overlay

/* Surfaces */
--color-surface-default, --color-surface-raised, --color-surface-overlay, --color-surface-hover, --color-surface-active

/* Text */
--color-text-primary, --color-text-secondary, --color-text-tertiary, --color-text-disabled, --color-text-inverse, --color-text-link, --color-text-code

/* Borders */
--color-border-default, --color-border-subtle, --color-border-strong, --color-border-focus, --color-border-brand

/* Actions */
--color-action-brand-default, --color-action-brand-hover, --color-action-brand-active, --color-action-brand-text
--color-action-secondary-default, --color-action-secondary-hover, --color-action-secondary-active, --color-action-secondary-text
--color-action-tertiary-default, --color-action-tertiary-hover, --color-action-tertiary-active, --color-action-tertiary-text

/* State */
--color-state-success, --color-state-success-bg
--color-state-warning, --color-state-warning-bg
--color-state-error, --color-state-error-bg
--color-state-info, --color-state-info-bg

/* Component: Buttons */
--btn-brand-bg, --btn-brand-bg-hover, --btn-brand-bg-active, --btn-brand-text
--btn-secondary-bg, --btn-secondary-bg-hover, --btn-secondary-text, --btn-secondary-border
--btn-danger-bg, --btn-danger-bg-hover, --btn-danger-text
--btn-ghost-text, --btn-ghost-text-hover, --btn-ghost-bg-hover

/* Component: Inputs */
--input-bg, --input-bg-hover, --input-border, --input-border-focus, --input-border-error
--input-text, --input-placeholder, --input-label

/* Component: Cards */
--card-bg, --card-border, --card-hover-border

/* Component: Tables */
--table-header-bg, --table-row-bg, --table-row-hover, --table-border

/* Component: Navigation */
--nav-bg, --nav-item-hover, --nav-item-active, --nav-item-text, --nav-item-text-active
```

---

*End of Technical Requirements Document*

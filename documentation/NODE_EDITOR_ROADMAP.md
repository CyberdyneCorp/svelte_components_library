# Node Editor Roadmap

## Cyberdyne Design System — Flow / Node-Graph Editor Components

| Field | Value |
|-------|-------|
| **Project** | Cyberdyne Design System |
| **Document** | Node Editor Roadmap |
| **Version** | 0.1.0 |
| **Date** | 2026-05-19 |
| **Status** | Proposed |
| **Reference** | Parametric Insurance Editor (Svelte 5) |

---

## Table of Contents

1. [Context](#1-context)
2. [Reference Decomposition](#2-reference-decomposition)
3. [Coverage Matrix — Existing vs. Needed](#3-coverage-matrix--existing-vs-needed)
4. [New Components](#4-new-components)
5. [Implementation Order](#5-implementation-order)
6. [API Design Decisions](#6-api-design-decisions)
7. [Risks & Gotchas](#7-risks--gotchas)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Effort Estimate](#9-effort-estimate)

---

## 1. Context

We want to be able to build node-graph editors (n8n / Blender shader editor / ComfyUI style) on top of `@cyberdyne/svelte-ui-core`. The driver is the **Parametric Insurance Editor** reference: a Svelte 5 application that wires Sentinel data sources → indices → conditions → payouts on a pannable / zoomable canvas with a draggable node palette and a tabbed inspector.

The reference is lean (~40 KB of runtime code across 8 components, driven by a single `$state` store plus a node-template registry). Most of the supporting chrome (toolbars, search, tabs, form inputs, toasts) is already covered by the existing library. The gap is a small set of **flow-editor primitives** that don't yet exist.

This document maps what we have, what we need, and the order to build it in.

---

## 2. Reference Decomposition

The reference application (`/Users/leonardoaraujo/Downloads/svelte/`) decomposes into:

| File | Role |
|---|---|
| `App.svelte` | 4-zone layout (topbar / palette / canvas / inspector / statusbar) + global keyboard shortcuts |
| `Topbar.svelte` | Brand, breadcrumb, action buttons (Clear / Validate / Deploy / Run) |
| `Palette.svelte` | Left sidebar — grouped, filterable, draggable node sources |
| `Canvas.svelte` | Pan / wheel-zoom / drop / edge-drag / node-drag — the keystone |
| `Node.svelte` | Draggable node card with header, port rows, data rows, footer status |
| `Inspector.svelte` | Right panel with `inspect / simulate / graph` tabs |
| `Minimap.svelte` | Overview rectangle of all nodes |
| `CanvasControls.svelte` | Floating zoom cluster (`+`, `−`, fit, 1:1) |
| `Statusbar.svelte` | Bottom status strip |
| `Toasts.svelte` | Stacked notifications |
| `state.svelte.js` | Reactive store + actions (load, addNode, addEdge, simulate, fitView, portPos, edgePath) |
| `nodes.js` | Node template registry + port-type color map |
| `scenarios.js` | Demo scenarios (Mozambique flood, etc.) |

---

## 3. Coverage Matrix — Existing vs. Needed

| Concern | Reference file | Existing reusable component | Status |
|---|---|---|---|
| Outer 4-zone layout (top / left / canvas / right / bottom) | `App.svelte` | `AppLayout` / `PageShell` | Compose existing |
| Top bar (brand, breadcrumb, actions) | `Topbar.svelte` | `Header` + `Breadcrumb` + `Button` + `Kbd` | Compose existing |
| Bottom status bar | `Statusbar.svelte` | `StatusBadge` + plain spans | Compose existing |
| Right inspector tabs | `Inspector.svelte` (tabs) | `Tabs` | Reuse |
| Parameter form rows | `Inspector.svelte` (fields) | `NumberInput`, `TextInput`, `Select`, `Switch` | Reuse |
| Palette search input | `Palette.svelte` | `SearchInput` + `Kbd` | Reuse |
| Toasts | `Toasts.svelte` | `Toast` | Reuse |
| Delete-node confirm / context | — | `ContextMenu`, `Dialog`, `Tooltip` | Reuse |
| Status dots in palette / footer | several | `Badge`, `StatusBadge` | Reuse |
| **Pannable / zoomable canvas with drop target** | `Canvas.svelte` | `GraphViewer` is force-directed, not editable | **NEW** |
| **Draggable node card with typed I/O ports** | `Node.svelte` | `Card` lacks ports; `Kanban` cards aren't free-positioned | **NEW** |
| **Typed port (in/out dot, color by data type)** | `Node.svelte` (port spans) | None | **NEW** |
| **Bezier edge SVG with flow animation + hit area** | `Canvas.svelte` (`edgePath`) | None | **NEW** |
| **Node palette (grouped, draggable, filterable)** | `Palette.svelte` | `Sidebar` is nav-only; `FileTree` is hierarchical | **NEW** (thin wrapper) |
| **Node inspector shell (tabs + sections + footer)** | `Inspector.svelte` | Partial via `Tabs` + `Card` | **NEW** (composition wrapper) |
| **Minimap of the graph** | `Minimap.svelte` | None | **NEW** (small) |
| **Floating canvas controls (+ / − / fit / 1:1)** | `CanvasControls.svelte` | `IconButton` stack | **NEW** (small wrapper) |

---

## 4. New Components

All new components live under `packages/ui/core/src/lib/flow/` so they stay cohesive and discoverable in Storybook. Naming convention: `Flow*` for editor-internal primitives, `Node*` for the higher-level building blocks consumers interact with.

### 4.1 `NodeEditor` — the canvas surface (keystone)

Owns pan, wheel-zoom, drop-zone, viewport transform, selection clearing, keyboard shortcuts. Renders edges as an SVG layer and delegates node rendering to a snippet.

**Props:**

```ts
type NodeEditorProps = {
  nodes: FlowNodeSpec[];
  edges: FlowEdgeSpec[];
  viewport?: { x: number; y: number; z: number };  // bindable
  selectedId?: string | null;                       // bindable
  portColors?: Record<string, string>;
  minZoom?: number;
  maxZoom?: number;
  onnodemove?: (id: string, x: number, y: number) => void;
  onnodeadd?: (typeKey: string, x: number, y: number) => void;
  onedgeadd?: (edge: FlowEdgeSpec) => void;
  onedgedelete?: (id: string) => void;
  oncanvasclick?: () => void;
};
```

**Snippets:** `node` snippet receives `{ node, selected, firing }` so consumers fully control node visuals.

**Includes:** the grid background as a CSS layer driven by `--accent` from foundation.

---

### 4.2 `FlowNode` — opinionated node card

Header (color dot + title + sub-badge) + body (port rows + data rows) + footer (idle / firing pulse). Composes existing `Badge` (for the sub-tag like `S1` / `AOI`) and the new `FlowPort` primitive.

**Props:**

```ts
type FlowNodeProps = {
  node: FlowNodeSpec;
  selected?: boolean;
  firing?: boolean;
  accent?: string;
  connecting?: ConnectionState | null;
  hoverPort?: PortRef | null;
  onheaddown?: (e: PointerEvent) => void;
  onportdown?: (e: PointerEvent, port: PortSpec, side: 'in' | 'out') => void;
  onportenter?: (port: PortSpec, side: 'in' | 'out') => void;
  onportleave?: () => void;
};
```

Header is the drag handle. Body rows mix `{ kind: 'row', l, v }` and `{ kind: 'field', l, v, unit }` — rendered declaratively from `node.rows`.

---

### 4.3 `FlowPort` — typed in/out port primitive

A small colored ring with hover halo + "compatible" highlight while a connection is being dragged. Type colors driven by `portColors` prop. Default palette (mirrors reference):

| Port type | Color |
|---|---|
| `data` | `#5FA8FF` |
| `region` | `#22D3EE` |
| `scalar` | `#3FE07F` |
| `bool` | `#FACC15` |
| `event` | `#FB7185` |

Used both inside `FlowNode` and exported standalone for custom nodes.

---

### 4.4 `FlowEdge` — bezier connector

Exports both the `<FlowEdge>` SVG component **and** the `edgePath(x1, y1, x2, y2)` helper.

**Props:**

```ts
type FlowEdgeProps = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
  selected?: boolean;
  firing?: boolean;       // enables flow animation via stroke-dasharray keyframes
  interactive?: boolean;  // adds a wider transparent hit-path under the visible stroke
  onclick?: () => void;
};
```

---

### 4.5 `NodePalette` — draggable source list

Composes `SearchInput` + grouped sections. Items use HTML5 drag (`dataTransfer.setData('application/x-node-type', ...)`) so they integrate with `NodeEditor`'s drop handler without tight coupling.

**Props:**

```ts
type NodePaletteProps = {
  groups: {
    name: string;
    color: string;
    items: { type: string; label: string; sub: string; icon?: string }[];
  }[];
  filter?: string;        // bindable
  totalCount?: number;
  ondragstart?: (e: DragEvent, typeKey: string) => void;
};
```

---

### 4.6 `NodeInspector` — right-side panel scaffold

Thin shell wiring `Tabs` + a sections array. Most parameter rendering is app-specific, but ships with a `ParameterRow` snippet helper that maps `{ kind: 'number' | 'text' | 'select' | 'bool' }` to the existing form primitives.

**Props:**

```ts
type NodeInspectorProps = {
  tabs: { id: string; label: string }[];
  activeTab?: string;     // bindable
  width?: string;
};
```

**Snippets:** one snippet per tab, rendered when active.

---

### 4.7 `FlowMinimap` — viewport overview

SVG rendering of node bounds, scaled to a fixed box (192 × 128). Optional click-to-pan. ~50 LoC.

**Props:**

```ts
type FlowMinimapProps = {
  nodes: FlowNodeSpec[];
  viewport: { x: number; y: number; z: number };
  onpanto?: (x: number, y: number) => void;
};
```

---

### 4.8 `FlowCanvasControls` — zoom cluster

Vertical floating stack of 4 `IconButton`s (`+`, `−`, fit, 1:1). Pure styling wrapper, ~30 LoC.

**Props:**

```ts
type FlowCanvasControlsProps = {
  onzoomin?: () => void;
  onzoomout?: () => void;
  onfit?: () => void;
  onreset?: () => void;
};
```

---

## 5. Implementation Order

1. **`FlowPort` + `FlowEdge` + `edgePath` helper** — lowest layer, easy to unit-test in isolation.
2. **`FlowNode`** — uses `FlowPort`. Story renders a static node with mock ports.
3. **`NodeEditor`** — pan / zoom / drop, edge dragging, drop-target wiring. Biggest piece (~250 LoC). Story renders a 3-node DAG.
4. **`NodePalette`** — straightforward; depends only on existing `SearchInput`.
5. **`FlowMinimap`, `FlowCanvasControls`** — both small, do last.
6. **`NodeInspector`** — composition of `Tabs` + form primitives.
7. **Compose-only example** in Storybook: `flow/Examples/ParametricEditor.stories.svelte` that reproduces the reference using app-level state + the new components. Confirms the API is sufficient.

---

## 6. API Design Decisions

| Decision | Choice | Why |
|---|---|---|
| Category name | `flow/` | Industry-standard term; distinct from the read-only `graph/` (force-directed). |
| State ownership | **Controlled** (consumer owns `nodes` / `edges` arrays) | Matches Svelte 5 bindable idioms; library stays headless about persistence / undo. |
| Port-type registry | Ship sensible defaults; expose `portColors` + a per-type shape hook (circle / square / diamond) | Lets consumers represent custom type systems. |
| Node visual customisation | `NodeEditor` exposes a `node` snippet; ship `FlowNode` as the default | Consumers can swap in fully custom node visuals without forking the editor. |
| Runes mode | Per-component `<svelte:options runes={true} />` | Existing convention; avoids Storybook 8.x global-runes pitfalls. |
| Class naming | `cy-flow-*` | Matches existing `cy-` namespace convention. |
| Touch / mobile | **Out of scope for v1** | Reference is desktop-only. Design event handling so it can be extended later without breaking changes. |

---

## 7. Risks & Gotchas

- **Concurrent gestures.** Pan + zoom + edge-drag at the same time is the hardest part. The reference solves it with separate `$effect` blocks per gesture, each scoped to its activation flag. Replicate that pattern — don't merge gestures into one handler.
- **SVG edge clipping.** Edges must live in a giant offset SVG (the reference uses a `-10000, -10000` translate trick) because Svelte's transformed parent clips overflowed SVG inconsistently across browsers.
- **Drop coordinates under transform.** `clientX/clientY` → world-space conversion has to account for both the viewport translate AND the zoom factor. The reference's `toWorld(clientX, clientY)` helper is the canonical formula — port it verbatim.
- **Port hit area.** A 12 px port circle is hard to grab. Add a transparent padded hit-area around it (≥ 20 px square).
- **Edge clicks vs. node clicks.** The SVG layer must be `pointer-events: none` on container, with `pointer-events: stroke` on the hit-path only, otherwise edges block node selection.
- **Storybook + runes.** Keep `<svelte:options runes={true} />` per-component (existing convention); do not enable runes globally.
- **`$effect` cleanup.** Mouse listeners attached in `$effect` blocks MUST return their cleanup function, otherwise pan / drag listeners leak between gestures.

---

## 8. Acceptance Criteria

The roadmap is "done" when, in Storybook:

- [ ] `flow/Examples/ParametricEditor` reproduces the reference's 3-node DAG with palette + inspector + minimap + status bar.
- [ ] User can: drag a palette item onto canvas → see a new node; drag a node by its header; drag from an `out` port to a compatible `in` port to create an edge; click an edge to delete it; pan with middle-click or empty-canvas-drag; zoom with `Ctrl/⌘ + wheel`; press `/` to focus filter; press `Delete` to remove selected node.
- [ ] Validation: only compatible port types can connect; an `in` port accepts at most one source.
- [ ] All 8 new components have isolated stories + Vitest test files.
- [ ] No regressions in existing `GraphViewer` / `MindMap` / `Kanban` stories.
- [ ] `pnpm build` produces the new exports in `@cyberdyne/svelte-ui-core/dist/`.

---

## 9. Effort Estimate

| Component | LoC (approx) | Tests + Story |
|---|---|---|
| `FlowPort` | 50 | yes |
| `FlowEdge` (+ `edgePath`) | 80 | yes |
| `FlowNode` | 150 | yes |
| `NodeEditor` | 280 | yes |
| `NodePalette` | 90 | yes |
| `NodeInspector` | 80 | yes |
| `FlowMinimap` | 60 | yes |
| `FlowCanvasControls` | 40 | yes |
| Example story (ParametricEditor) | 200 | — |
| **Total net-new component code** | **~830 LoC** | 8 stories + 8 test files |

Calendar estimate: 3–5 focused engineering days for an experienced Svelte 5 developer, excluding design review and PR cycles.

---

## TL;DR

The library already has **every form, navigation, layout, feedback, and overlay primitive** required to build the chrome around this editor. The actual gap is the **4-component flow-editor core** (`NodeEditor`, `FlowNode`, `FlowPort`, `FlowEdge`) plus **3 lightweight wrappers** (`NodePalette`, `FlowMinimap`, `FlowCanvasControls`) and **1 composition shell** (`NodeInspector`). Ship them under `lib/flow/`, controlled by consumer state, with a snippet-based extension hook for custom node visuals.

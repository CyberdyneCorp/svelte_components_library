# Retro Desktop OS

## Purpose

The `retro/` family provides a "CyberdyneOS" pixel desktop-OS aesthetic (38 components) for DAO/DeFi surfaces: a headless multi-window controller, draggable/resizable retro windows, pixel-art primitives (buttons, inputs, tabs, toggles), CRT effects, and DeFi widgets. The pixel/CRT look is achieved entirely with CSS (hard borders, offset drop shadows, glow), and window state is managed by a reactive Svelte 5 runes controller rather than a component tree.

## Requirements

### Requirement: Headless reactive window manager

The system SHALL provide `createWindowManager(options)` — a Svelte 5 runes factory (`.svelte.ts`) that manages multiple windows with reactive `$state`. It SHALL accept options `baseZIndex` (default 100), `cascadeOffset` (default 24), `defaultWidth` (default 560), and `defaultHeight` (default 360), and SHALL expose `open`, `close`, `focus`, `minimize`, `restore`, `toggleMinimize`, `toggleMaximize`, `update`, `closeAll`, plus `windows` and `activeId` getters. `open` SHALL dedupe by window `id` (re-focusing and restoring an already-open window), cascade new-window position, and raise the top z-index; `focus` SHALL raise z-index and un-minimize. (src: packages/ui/core/src/lib/retro/WindowManager/windowManager.svelte.ts:3-8,15-21,28-108; packages/ui/core/src/lib/retro/WindowManager/types.ts:1-13)

#### Scenario: Opening an already-open window

- **GIVEN** a window manager with window `id="wallet"` already open
- **WHEN** `open({ id: "wallet", title: "Wallet" })` is called again
- **THEN** the system SHALL re-focus and restore the existing window rather than create a duplicate

#### Scenario: Active window is the top non-minimized window

- **GIVEN** several open windows
- **WHEN** `activeId` is read
- **THEN** the system SHALL return the id of the highest-z-index non-minimized window

### Requirement: RetroWindow draggable/resizable shell

The system SHALL provide `RetroWindow` with bindable position (`x`/`y`, default 80/80) and size (`width`/`height`, default 720/480) props, a `draggable` flag (default true) enabling title-bar drag, a `resizable` flag (default true) enabling corner resize clamped to `minWidth`/`minHeight` (default 280/160), Escape-to-close, and `onClose`/`onFocus` callbacks. (src: packages/ui/core/src/lib/retro/RetroWindow/RetroWindow.svelte:6-38,54-97,146)

#### Scenario: Resize clamped to minimum

- **GIVEN** a resizable `RetroWindow`
- **WHEN** the user drags the corner handle below the minimum size
- **THEN** the system SHALL clamp the window to `minWidth`/`minHeight`

#### Scenario: Drag disabled

- **GIVEN** a `RetroWindow` with `draggable={false}`
- **WHEN** the user presses down on the title bar
- **THEN** the system SHALL NOT move the window

### Requirement: CSS-only pixel/CRT aesthetic

The system SHALL implement the retro pixel/CRT aesthetic entirely in CSS — hard (non-blurred) 2px borders, offset drop shadows, and an active-press transform that shifts the element into its shadow — without images or canvas. Pixel primitives such as `PixelButton` SHALL expose `variant` (`"solid" | "outline" | "ghost" | "neon"`, default `"solid"`) and `size` (`"sm" | "md" | "lg"`, default `"md"`), with the `neon` variant emulating CRT glow via box-shadow. (src: packages/ui/core/src/lib/retro/PixelButton/PixelButton.svelte:6-24,49-77; packages/ui/core/src/lib/retro/RetroWindow/RetroWindow.svelte:167,230-234)

#### Scenario: Neon glow variant

- **GIVEN** a `PixelButton` with `variant="neon"`
- **WHEN** it renders
- **THEN** the system SHALL apply a neon-green CRT glow via CSS box-shadow

# Flow Node Editor

## Purpose

The `flow/` family provides a node-graph editor (8 components): a pan/zoom canvas (`NodeEditor`), draggable node cards (`FlowNode`), typed in/out ports (`FlowPort`), bezier edge connectors (`FlowEdge`), a draggable palette (`NodePalette`), an inspector shell (`NodeInspector`), a minimap (`FlowMinimap`), and canvas controls. `NodeEditor` is a controlled component: node/edge data is owned by the parent and mutated only through callbacks, while viewport and selection are exposed as bindable state.

## Requirements

### Requirement: Controlled canvas with bindable viewport

The system SHALL make `NodeEditor` a controlled component whose `nodes` and `edges` are parent-owned, exposing bindable `viewport` (`{ x, y, z }`, default `{ x: 40, y: 40, z: 1 }`) and `selectedId` (default `null`). Node position changes, node additions, edge additions/deletions, and canvas clicks SHALL be reported through callbacks (`onnodemove`, `onnodeadd`, `onedgeadd`, `onedgedelete`, `oncanvasclick`) rather than mutated internally. (src: packages/ui/core/src/lib/flow/NodeEditor/NodeEditor.svelte:20-34,57-61,111-133)

#### Scenario: Node drag reports position

- **GIVEN** a `NodeEditor` with a dragged node
- **WHEN** the pointer moves
- **THEN** the system SHALL call `onnodemove(id, x, y)` and SHALL NOT mutate the node position itself

### Requirement: Pan and cursor-anchored zoom

The system SHALL pan the canvas on background pointer-drag (left/middle button) and zoom on wheel, clamping zoom to `[minZoom, maxZoom]` (default 0.3–1.6) and re-centering the viewport so the point under the cursor stays fixed. (src: packages/ui/core/src/lib/flow/NodeEditor/NodeEditor.svelte:28-29,81-109,203-218)

#### Scenario: Zoom stays anchored to cursor

- **GIVEN** a `NodeEditor` at zoom 1
- **WHEN** the user scrolls to zoom in over a point
- **THEN** the system SHALL keep that world point under the cursor and clamp zoom within 0.3–1.6

### Requirement: Type-checked port connections

The system SHALL start an edge only from an `out` port and commit a new edge (`onedgeadd`) only when released over an `in` port on a different node whose `type` matches the source port's `type`. `FlowPort` SHALL carry a `side` (`"in" | "out"`) and a `type` used for compatibility, and `FlowEdge` SHALL render the connection as a horizontal cubic-bezier S-curve with control offset `dx = max(40, |x2-x1| * 0.5)`. (src: packages/ui/core/src/lib/flow/NodeEditor/NodeEditor.svelte:135-185; packages/ui/core/src/lib/flow/FlowPort/FlowPort.svelte:6-26; packages/ui/core/src/lib/flow/geometry.ts:18-21)

#### Scenario: Incompatible connection rejected

- **GIVEN** a drag from an `out` port of type `data`
- **WHEN** it is released over an `in` port of type `region`
- **THEN** the system SHALL NOT create an edge

#### Scenario: Compatible connection committed

- **GIVEN** a drag from an `out` port of type `data`
- **WHEN** it is released over an `in` port of type `data` on a different node
- **THEN** the system SHALL call `onedgeadd` with the new edge

### Requirement: Drag-and-drop node creation

The system SHALL accept HTML drag-and-drop onto the canvas, reading the drag payload keyed by `dropMimeType` (default `"application/x-node-type"`), converting client coordinates to world coordinates, and calling `onnodeadd(typeKey, x, y)`. (src: packages/ui/core/src/lib/flow/NodeEditor/NodeEditor.svelte:32,73-79,191-201)

#### Scenario: Drop creates a node

- **GIVEN** a palette item dragged with the configured MIME type
- **WHEN** it is dropped on the canvas
- **THEN** the system SHALL call `onnodeadd` with the node type and the world-space drop coordinates

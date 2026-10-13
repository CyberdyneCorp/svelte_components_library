# Editable DataGrid

## Why

`DataTable` is read-only, so it suits browsing records but not correcting or entering them. Settings matrices, price lists, small reference tables and data-cleaning screens need in-place cell editing with spreadsheet-style keyboard navigation and per-cell validation. Applications building this on `DataTable` must re-implement the ARIA grid pattern, which is easy to get wrong.

## What Changes

- Add `DataGrid` (data): an ARIA `grid` with one tab stop and arrow-key navigation, editing of typed cells (text, number, select, boolean) by keyboard, double-click or typing, per-cell validation, and committed changes reported to the application.

## Non-goals

- No sorting, pagination, virtualization, column resizing or reordering. `DataTable` and `VirtualizedList` cover browsing large sets.
- No multi-cell selection, range copy and paste, fill handle, undo history or formulas.
- No adding or deleting rows inside the grid. The application renders those controls and updates `rows`.
- No persistence. The application saves changes.

## Capabilities

### New Capabilities

- `data-grid`: the editable DataGrid.

## Impact

- New: `data/DataGrid` (component, `gridKeys.ts` keyboard map, types).
- Exports, stories, README, TRD. Minor changeset.

## Review

The user selected DataGrid on 2026-10-13 as its own OpenSpec change, after the query filtering set.

<svelte:options runes={true} />

<script lang="ts">
  import { tick } from "svelte";
  import {
    gridKeyAction,
    type GridAction,
    type GridCellKind,
    type GridPosition,
  } from "./gridKeys.js";
  import type { DataGridChange, DataGridColumn, DataGridLabels, DataGridRow } from "./types.js";

  type Editing = GridPosition & { draft: string; error?: string; replaced: boolean };

  let {
    columns,
    rows = $bindable([]),
    rowKey = "id",
    ariaLabel,
    ariaLabelledby,
    readonly = false,
    oncellchange,
    labels = {},
  }: {
    /** Column definitions, in display order. */
    columns: DataGridColumn[];
    /** Records shown one per row; replaced immutably on every committed edit. */
    rows?: DataGridRow[];
    /** Row property that identifies a record (default `"id"`). */
    rowKey?: string;
    /** Accessible name of the grid (or use `ariaLabelledby`). */
    ariaLabel?: string;
    /** Id of an element naming the grid. */
    ariaLabelledby?: string;
    /** Make every cell read-only. */
    readonly?: boolean;
    /** Called after a valid edit changes a cell's value. */
    oncellchange?: (change: DataGridChange) => void;
    /** Overridable accessible strings (i18n). */
    labels?: DataGridLabels;
  } = $props();

  const errorId = `cy-dg-${Math.random().toString(36).slice(2, 9)}-error`;

  let tableEl: HTMLTableElement | undefined = $state();
  let active = $state<GridPosition>({ row: 0, col: 0 });
  let editing = $state<Editing | null>(null);

  let size = $derived({ rows: rows.length, cols: columns.length });
  let current = $derived({
    row: Math.min(active.row, Math.max(size.rows - 1, 0)),
    col: Math.min(active.col, Math.max(size.cols - 1, 0)),
  });

  function cellLabel(column: DataGridColumn, rowIndex: number): string {
    return labels.cell?.(column.label, rowIndex + 1) ?? `${column.label}, row ${rowIndex + 1}`;
  }

  function isEditable(column: DataGridColumn): boolean {
    return !readonly && column.editable !== false;
  }

  function kindOf(pos: GridPosition): GridCellKind {
    const column = columns[pos.col];
    if (!column || !isEditable(column)) return "readonly";
    return column.type === "boolean" ? "boolean" : "editable";
  }

  function displayValue(column: DataGridColumn, row: DataGridRow): string {
    const value = row[column.key];
    if (column.format) return column.format(value, row);
    if (column.type === "select") {
      return column.options?.find((o) => o.value === value)?.label ?? String(value ?? "");
    }
    return value == null ? "" : String(value);
  }

  function parseDraft(column: DataGridColumn, draft: string): unknown {
    if (column.type !== "number") return draft;
    return draft.trim() === "" ? null : Number(draft);
  }

  function isEditingAt(r: number, c: number): boolean {
    return editing !== null && editing.row === r && editing.col === c;
  }

  async function focusCell(pos: GridPosition) {
    active = pos;
    await tick();
    tableEl?.querySelector<HTMLElement>(`[data-row="${pos.row}"][data-col="${pos.col}"]`)?.focus();
  }

  function applyChange(rowIndex: number, column: DataGridColumn, value: unknown) {
    const row = rows[rowIndex];
    const previousValue = row[column.key];
    if (Object.is(previousValue, value)) return;
    const updated = { ...row, [column.key]: value };
    rows = rows.map((r, i) => (i === rowIndex ? updated : r));
    oncellchange?.({ rowKey: row[rowKey], key: column.key, value, previousValue, row: updated });
  }

  function startEdit(pos: GridPosition, replace?: string) {
    const column = columns[pos.col];
    const value = rows[pos.row][column.key];
    const useReplace = replace !== undefined && column.type !== "select";
    active = { row: pos.row, col: pos.col };
    editing = {
      ...pos,
      draft: useReplace ? replace : value == null ? "" : String(value),
      replaced: useReplace,
    };
  }

  /** Validate and apply the open edit; returns `false` when validation keeps it open. */
  function commitEdit(): boolean {
    const edit = editing;
    if (!edit) return true;
    const column = columns[edit.col];
    const value = parseDraft(column, edit.draft);
    const error = column.validate?.(value, rows[edit.row]);
    if (error) {
      editing = { ...edit, error };
      return false;
    }
    editing = null;
    applyChange(edit.row, column, value);
    return true;
  }

  function cancelEdit() {
    const edit = editing;
    editing = null;
    if (edit) focusCell(edit);
  }

  function toggle(pos: GridPosition) {
    if (kindOf(pos) !== "boolean") return;
    const column = columns[pos.col];
    applyChange(pos.row, column, !rows[pos.row][column.key]);
  }

  function runCommit(to: GridPosition | "stay" | "exit", e: KeyboardEvent) {
    // "exit" lets the native Tab move focus out of the grid once committed.
    if (to !== "exit") e.preventDefault();
    if (!commitEdit()) {
      e.preventDefault();
      return;
    }
    if (typeof to === "object") focusCell(to);
  }

  function runAction(action: GridAction, e: KeyboardEvent) {
    if (action.type === "commit") return runCommit(action.to, e);
    if (action.type === "none") return;
    e.preventDefault();
    if (action.type === "move") focusCell(action.to);
    else if (action.type === "edit") startEdit(current, action.replace);
    else if (action.type === "toggle") toggle(current);
    else cancelEdit();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (size.rows === 0 || size.cols === 0) return;
    const pos = editing ?? current;
    runAction(gridKeyAction(e, editing ? "edit" : "navigate", pos, size, kindOf(pos)), e);
  }

  function handleCellClick(pos: GridPosition) {
    if (isEditingAt(pos.row, pos.col)) return;
    active = pos;
    toggle(pos);
  }

  function handleDblClick(pos: GridPosition) {
    if (kindOf(pos) === "editable" && !isEditingAt(pos.row, pos.col)) startEdit(pos);
  }

  function handleInput(e: Event) {
    if (editing) editing.draft = (e.currentTarget as HTMLInputElement | HTMLSelectElement).value;
  }

  function handleEditorBlur() {
    // Enter/Tab/Escape clear `editing` before the editor unmounts, so this
    // only commits when focus leaves by pointer or another control.
    if (editing) commitEdit();
  }

  /** Focus the editor on mount; a type-to-replace edit puts the caret after the typed character. */
  function focusEditor(node: HTMLInputElement | HTMLSelectElement, replaced: boolean) {
    node.focus();
    if (replaced && node instanceof HTMLInputElement && node.type === "text") {
      node.setSelectionRange(node.value.length, node.value.length);
    }
  }
</script>

<table
  bind:this={tableEl}
  class="cy-data-grid"
  role="grid"
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledby}
  aria-rowcount={rows.length + 1}
  aria-colcount={columns.length}
  onkeydown={handleKeydown}
>
  <thead>
    <tr aria-rowindex={1}>
      {#each columns as column, c (column.key)}
        <th
          class="cy-data-grid__header"
          class:cy-data-grid__header--end={column.align === "end"}
          scope="col"
          aria-colindex={c + 1}
          style:width={column.width}
        >
          {column.label}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each rows as row, r (row[rowKey] ?? r)}
      <tr class="cy-data-grid__row" aria-rowindex={r + 2}>
        {#each columns as column, c (column.key)}
          {@const pos = { row: r, col: c }}
          {@const kind = kindOf(pos)}
          {@const isEditing = isEditingAt(r, c)}
          <td
            class="cy-data-grid__cell"
            class:cy-data-grid__cell--end={column.align === "end"}
            class:cy-data-grid__cell--readonly={kind === "readonly"}
            class:cy-data-grid__cell--editing={isEditing}
            role="gridcell"
            aria-colindex={c + 1}
            aria-readonly={kind === "readonly" ? "true" : undefined}
            tabindex={current.row === r && current.col === c ? 0 : -1}
            data-row={r}
            data-col={c}
            onfocus={() => (active = pos)}
            onclick={() => handleCellClick(pos)}
            ondblclick={() => handleDblClick(pos)}
          >
            {#if isEditing && editing}
              {#if column.type === "select"}
                <select
                  class="cy-data-grid__editor"
                  aria-label={cellLabel(column, r)}
                  aria-invalid={editing.error ? "true" : undefined}
                  aria-describedby={editing.error ? errorId : undefined}
                  value={editing.draft}
                  onchange={handleInput}
                  onblur={handleEditorBlur}
                  use:focusEditor={editing.replaced}
                >
                  {#each column.options ?? [] as option (option.value)}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                </select>
              {:else}
                <input
                  class="cy-data-grid__editor"
                  type={column.type === "number" ? "number" : "text"}
                  aria-label={cellLabel(column, r)}
                  aria-invalid={editing.error ? "true" : undefined}
                  aria-describedby={editing.error ? errorId : undefined}
                  value={editing.draft}
                  oninput={handleInput}
                  onblur={handleEditorBlur}
                  use:focusEditor={editing.replaced}
                />
              {/if}
              {#if editing.error}
                <span id={errorId} class="cy-data-grid__error" role="alert">{editing.error}</span>
              {/if}
            {:else if column.type === "boolean"}
              <span
                class="cy-data-grid__check"
                class:cy-data-grid__check--on={Boolean(row[column.key])}
                role="checkbox"
                aria-checked={Boolean(row[column.key])}
                aria-label={cellLabel(column, r)}
                aria-readonly={kind === "readonly" ? "true" : undefined}
              >
                {#if row[column.key]}
                  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                {/if}
              </span>
            {:else}
              {displayValue(column, row)}
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .cy-data-grid {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    background: var(--color-surface-default);
    border: var(--border-width) var(--border-style) var(--color-border-default);
    border-radius: var(--radius-md);
  }

  .cy-data-grid__header {
    padding: var(--space-2) var(--space-3);
    text-align: start;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    background: var(--color-bg-secondary);
    border-bottom: var(--border-width) var(--border-style) var(--color-border-default);
    white-space: nowrap;
  }

  .cy-data-grid__header--end,
  .cy-data-grid__cell--end {
    text-align: end;
  }

  .cy-data-grid__cell {
    position: relative;
    padding: var(--space-2) var(--space-3);
    border-bottom: var(--border-width) var(--border-style) var(--color-border-subtle);
    cursor: default;
    outline: none;
  }

  .cy-data-grid__row:last-child .cy-data-grid__cell {
    border-bottom: none;
  }

  .cy-data-grid__cell:hover {
    background: var(--color-surface-hover);
  }

  .cy-data-grid__cell:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: -2px;
  }

  .cy-data-grid__cell--readonly {
    color: var(--color-text-secondary);
  }

  .cy-data-grid__cell--editing {
    padding: var(--space-1);
  }

  .cy-data-grid__editor {
    width: 100%;
    box-sizing: border-box;
    padding: var(--space-1) var(--space-2);
    font: inherit;
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
    border: var(--border-width) var(--border-style) var(--color-border-focus);
    border-radius: var(--radius-sm);
    text-align: inherit;
  }

  .cy-data-grid__editor:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 1px;
  }

  .cy-data-grid__editor[aria-invalid="true"] {
    border-color: var(--color-state-error);
  }

  .cy-data-grid__error {
    display: block;
    margin-top: var(--space-1);
    font-size: 0.75rem;
    color: var(--color-state-error);
    text-align: start;
  }

  .cy-data-grid__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    border: var(--border-width) var(--border-style) var(--color-border-strong);
    border-radius: var(--radius-sm);
    color: var(--color-text-inverse);
    background: var(--color-bg-primary);
  }

  .cy-data-grid__check--on {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
  }
</style>

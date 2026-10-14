/** Zero-based body cell position (the header row is not navigable). */
export type GridPosition = { row: number; col: number };

/** Number of body rows and columns. */
export type GridSize = { rows: number; cols: number };

/** The parts of a keyboard event the grid reacts to. */
export type GridKey = Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">;

/** How the active cell reacts to edit keys. */
export type GridCellKind = "readonly" | "boolean" | "editable";

/** What a key press should do. */
export type GridAction =
  | { type: "move"; to: GridPosition }
  | { type: "edit"; replace?: string }
  | { type: "toggle" }
  | { type: "commit"; to: GridPosition | "stay" | "exit" }
  | { type: "cancel" }
  | { type: "none" };

export const PAGE_ROWS = 10;

const NONE: GridAction = { type: "none" };

function clamp(n: number, max: number): number {
  return Math.min(Math.max(n, 0), max);
}

/** Target cell of a navigation key, or `null` when the key does not move. */
export function moveTarget(key: GridKey, pos: GridPosition, size: GridSize): GridPosition | null {
  const lastRow = size.rows - 1;
  const lastCol = size.cols - 1;
  const ctrl = key.ctrlKey || key.metaKey;
  switch (key.key) {
    case "ArrowUp":
      return { row: clamp(pos.row - 1, lastRow), col: pos.col };
    case "ArrowDown":
      return { row: clamp(pos.row + 1, lastRow), col: pos.col };
    case "ArrowLeft":
      return { row: pos.row, col: clamp(pos.col - 1, lastCol) };
    case "ArrowRight":
      return { row: pos.row, col: clamp(pos.col + 1, lastCol) };
    case "PageUp":
      return { row: clamp(pos.row - PAGE_ROWS, lastRow), col: pos.col };
    case "PageDown":
      return { row: clamp(pos.row + PAGE_ROWS, lastRow), col: pos.col };
    case "Home":
      return { row: ctrl ? 0 : pos.row, col: 0 };
    case "End":
      return { row: ctrl ? lastRow : pos.row, col: lastCol };
    default:
      return null;
  }
}

/** Next (`dir` 1) or previous (`dir` -1) cell in reading order, or `null` past either end. */
export function tabTarget(pos: GridPosition, size: GridSize, dir: 1 | -1): GridPosition | null {
  const index = pos.row * size.cols + pos.col + dir;
  if (index < 0 || index >= size.rows * size.cols) return null;
  return { row: Math.floor(index / size.cols), col: index % size.cols };
}

/** A single printable character typed without Ctrl, Meta or Alt. */
export function isPrintable(key: GridKey): boolean {
  return key.key.length === 1 && !key.ctrlKey && !key.metaKey && !key.altKey;
}

function navigateAction(key: GridKey, pos: GridPosition, size: GridSize, kind: GridCellKind): GridAction {
  const to = moveTarget(key, pos, size);
  if (to) return { type: "move", to };
  if (kind === "readonly") return NONE;
  if (kind === "boolean") return key.key === " " || key.key === "Enter" ? { type: "toggle" } : NONE;
  if (key.key === "Enter" || key.key === "F2") return { type: "edit" };
  if (isPrintable(key)) return { type: "edit", replace: key.key };
  return NONE;
}

function editAction(key: GridKey, pos: GridPosition, size: GridSize): GridAction {
  switch (key.key) {
    case "Escape":
      return { type: "cancel" };
    case "Enter": {
      const row = clamp(pos.row + (key.shiftKey ? -1 : 1), size.rows - 1);
      return { type: "commit", to: { row, col: pos.col } };
    }
    case "Tab":
      return { type: "commit", to: tabTarget(pos, size, key.shiftKey ? -1 : 1) ?? "exit" };
    default:
      return NONE;
  }
}

/**
 * Map a key press to a grid action. In `"navigate"` mode the active cell has
 * focus; in `"edit"` mode its editor does, and only Enter, Tab and Escape are
 * taken from the native control.
 */
export function gridKeyAction(
  key: GridKey,
  mode: "navigate" | "edit",
  pos: GridPosition,
  size: GridSize,
  kind: GridCellKind,
): GridAction {
  return mode === "edit" ? editAction(key, pos, size) : navigateAction(key, pos, size, kind);
}

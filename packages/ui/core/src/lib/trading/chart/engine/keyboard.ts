/**
 * Keyboard navigation (design D3): ←/→ move the crosshair one bar,
 * Shift+←/→ pan, +/− zoom, Home/End jump to the first/last bar, Escape
 * hides the crosshair.
 *
 * Draggable price lines have a keyboard alternative: L selects the next
 * line (Shift+L the previous), ↑/↓ move it one tick (Shift: ten ticks),
 * Enter commits and Escape cancels.
 */
import type { ChartEngine } from "./chartEngine.js";
import { LARGE_STEP } from "./priceLineEditor.js";

export type KeyCommand =
  | { type: "crosshair"; delta: number }
  | { type: "pan"; bars: number }
  | { type: "zoom"; factor: number }
  | { type: "edge"; edge: "first" | "last" }
  | { type: "clear" }
  | { type: "line-select"; step: 1 | -1 }
  | { type: "line-nudge"; ticks: number }
  | { type: "line-commit" }
  | { type: "line-cancel" };

type KeyEvent = Pick<KeyboardEvent, "key" | "shiftKey">;

export const KEY_ZOOM = 1.25;

/** Command for a key press; `panBars` is how far Shift+arrow pans. */
export function keyCommand(event: Pick<KeyboardEvent, "key" | "shiftKey">, panBars: number): KeyCommand | null {
  switch (event.key) {
    case "ArrowLeft":
      return event.shiftKey ? { type: "pan", bars: -panBars } : { type: "crosshair", delta: -1 };
    case "ArrowRight":
      return event.shiftKey ? { type: "pan", bars: panBars } : { type: "crosshair", delta: 1 };
    case "+":
    case "=":
      return { type: "zoom", factor: KEY_ZOOM };
    case "-":
    case "_":
      return { type: "zoom", factor: 1 / KEY_ZOOM };
    case "Home":
      return { type: "edge", edge: "first" };
    case "End":
      return { type: "edge", edge: "last" };
    case "Escape":
      return { type: "clear" };
    default:
      return null;
  }
}

/**
 * Price-line command for a key press, or null to fall through to navigation.
 * `editing`: a line is selected; `available`: the chart has draggable lines.
 */
export function priceLineCommand(event: KeyEvent, editing: boolean, available: boolean): KeyCommand | null {
  if (event.key === "l" || event.key === "L") {
    return available ? { type: "line-select", step: event.shiftKey ? -1 : 1 } : null;
  }
  if (!editing) return null;
  const ticks = event.shiftKey ? LARGE_STEP : 1;
  switch (event.key) {
    case "ArrowUp":
      return { type: "line-nudge", ticks };
    case "ArrowDown":
      return { type: "line-nudge", ticks: -ticks };
    case "Enter":
      return { type: "line-commit" };
    case "Escape":
      return { type: "line-cancel" };
    default:
      return null;
  }
}

function applyLineCommand(engine: ChartEngine, command: KeyCommand): void {
  switch (command.type) {
    case "line-select":
      engine.selectPriceLine(command.step);
      break;
    case "line-nudge":
      engine.nudgePriceLine(command.ticks);
      break;
    case "line-commit":
      engine.commitPriceLine();
      break;
    case "line-cancel":
      engine.cancelPriceLine();
      break;
  }
}

export function applyKeyCommand(engine: ChartEngine, command: KeyCommand): void {
  if (command.type.startsWith("line-")) {
    applyLineCommand(engine, command);
    return;
  }
  switch (command.type) {
    case "crosshair":
      engine.moveCrosshair(command.delta);
      break;
    case "pan":
      engine.panBars(command.bars);
      break;
    case "zoom":
      engine.zoomBy(command.factor);
      break;
    case "edge":
      engine.crosshairTo(command.edge);
      break;
    case "clear":
      engine.clearCrosshair();
      break;
  }
}

/** Handles a keydown on the chart; returns true (and prevents the default) when it was used. */
export function handleChartKey(engine: ChartEngine, event: KeyboardEvent): boolean {
  if (event.altKey || event.ctrlKey || event.metaKey) return false;
  const range = engine.visibleRange();
  const visible = range ? range.to - range.from + 1 : 10;
  const command =
    priceLineCommand(event, engine.editingPriceLine !== null, engine.hasDraggablePriceLines) ??
    keyCommand(event, Math.max(1, Math.round(visible / 10)));
  if (!command) return false;
  event.preventDefault();
  applyKeyCommand(engine, command);
  return true;
}

/**
 * Keyboard navigation (design D3): ←/→ move the crosshair one bar,
 * Shift+←/→ pan, +/− zoom, Home/End jump to the first/last bar, Escape
 * hides the crosshair.
 */
import type { ChartEngine } from "./chartEngine.js";

export type KeyCommand =
  | { type: "crosshair"; delta: number }
  | { type: "pan"; bars: number }
  | { type: "zoom"; factor: number }
  | { type: "edge"; edge: "first" | "last" }
  | { type: "clear" };

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

export function applyKeyCommand(engine: ChartEngine, command: KeyCommand): void {
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
  const command = keyCommand(event, Math.max(1, Math.round(visible / 10)));
  if (!command) return false;
  event.preventDefault();
  applyKeyCommand(engine, command);
  return true;
}

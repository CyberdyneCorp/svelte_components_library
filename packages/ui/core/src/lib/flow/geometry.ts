import type { FlowNodeSpec, PortSide } from "./types.js";
import {
  NODE_DEFAULT_WIDTH,
  NODE_HEADER_HEIGHT,
  NODE_PORT_ROW_HEIGHT,
} from "./types.js";

export function portPos(
  node: FlowNodeSpec,
  side: PortSide,
  portIdx: number,
): { x: number; y: number } {
  const y = node.y + NODE_HEADER_HEIGHT + 6 + 12 + portIdx * NODE_PORT_ROW_HEIGHT;
  const x = side === "in" ? node.x : node.x + (node.w ?? NODE_DEFAULT_WIDTH);
  return { x, y };
}

export function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

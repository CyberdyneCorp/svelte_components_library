export type PortSide = "in" | "out";

export type PortSpec = {
  id: string;
  label: string;
  type: string;
};

export type FlowNodeRow =
  | { kind: "row"; l: string; v: string | number }
  | { kind: "field"; l: string; v: string | number; unit?: string };

export type FlowNodeSpec = {
  id: string;
  type: string;
  x: number;
  y: number;
  w?: number;
  inputs: PortSpec[];
  outputs: PortSpec[];
  data?: Record<string, unknown>;
  rows?: FlowNodeRow[];
  title?: string;
  sub?: string;
  color?: string;
};

export type FlowEdgeSpec = {
  id: string;
  source: { nodeId: string; portId: string };
  target: { nodeId: string; portId: string };
};

export type Viewport = { x: number; y: number; z: number };

export type PortRef = {
  nodeId: string;
  portId: string;
  side: PortSide;
  type: string;
};

export type ConnectionDraft = {
  fromNodeId: string;
  fromPortId: string;
  fromType: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type PortColors = Record<string, string>;

export const DEFAULT_PORT_COLORS: PortColors = {
  data: "#5FA8FF",
  region: "#22D3EE",
  scalar: "#3FE07F",
  bool: "#FACC15",
  event: "#FB7185",
};

export const NODE_HEADER_HEIGHT = 36;
export const NODE_PORT_ROW_HEIGHT = 24;
export const NODE_DEFAULT_WIDTH = 224;

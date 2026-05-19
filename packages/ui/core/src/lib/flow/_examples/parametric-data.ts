import type { NodePaletteGroup } from "../NodePalette/NodePalette.svelte";
import type { FlowEdgeSpec, FlowNodeSpec, FlowNodeRow, PortSpec } from "../types.js";

export type NodeTemplate = {
  type: string;
  label: string;
  sub: string;
  title: string;
  color: string;
  defaults: Record<string, string | number | boolean>;
  inputs: PortSpec[];
  outputs: PortSpec[];
  render: (data: Record<string, unknown>) => FlowNodeRow[];
};

const COL = {
  region: "#22D3EE",
  data: "#5FA8FF",
  index: "#3FE07F",
  transform: "#3FE07F",
  cond: "#FACC15",
  logic: "#A855F7",
  payout: "#FB7185",
};

export const TEMPLATES: Record<string, NodeTemplate> = {
  aoi: {
    type: "aoi",
    label: "Area of Interest",
    sub: "AOI",
    title: "Area of Interest",
    color: COL.region,
    defaults: { name: "Farm cluster M-14", country: "MZ", area_km2: 184, geom: "polygon (24 pts)" },
    inputs: [],
    outputs: [{ id: "out", label: "region", type: "region" }],
    render: (d) => [
      { kind: "row", l: "Name", v: String(d.name) },
      { kind: "row", l: "Country", v: String(d.country) },
      { kind: "row", l: "Area", v: `${d.area_km2} km²` },
      { kind: "row", l: "Geometry", v: String(d.geom) },
    ],
  },
  s1: {
    type: "s1",
    label: "Sentinel-1 SAR",
    sub: "S1",
    title: "Sentinel-1 SAR",
    color: COL.data,
    defaults: { mode: "IW GRD", polar: "VV+VH", revisit: 6 },
    inputs: [],
    outputs: [{ id: "out", label: "SAR", type: "data" }],
    render: (d) => [
      { kind: "row", l: "Mode", v: String(d.mode) },
      { kind: "row", l: "Polarisation", v: String(d.polar) },
      { kind: "row", l: "Revisit", v: `${d.revisit} d` },
    ],
  },
  flood: {
    type: "flood",
    label: "SAR Flood Extent",
    sub: "S1",
    title: "Flood Extent (SAR)",
    color: COL.index,
    defaults: { method: "Otsu + change", smoothing: "morpho 3" },
    inputs: [
      { id: "sar", label: "SAR", type: "data" },
      { id: "region", label: "region", type: "region" },
    ],
    outputs: [{ id: "pct", label: "% flooded", type: "scalar" }],
    render: (d) => [
      { kind: "row", l: "Method", v: String(d.method) },
      { kind: "row", l: "Smoothing", v: String(d.smoothing) },
    ],
  },
  rolling: {
    type: "rolling",
    label: "Rolling window",
    sub: "T",
    title: "Rolling aggregate",
    color: COL.transform,
    defaults: { window: 14, op: "mean" },
    inputs: [{ id: "scalar", label: "scalar", type: "scalar" }],
    outputs: [{ id: "out", label: "scalar", type: "scalar" }],
    render: (d) => [
      { kind: "row", l: "Window", v: `${d.window} days` },
      { kind: "row", l: "Operator", v: String(d.op) },
    ],
  },
  gt: {
    type: "gt",
    label: "Greater than",
    sub: ">",
    title: "Threshold >",
    color: COL.cond,
    defaults: { threshold: 30, unit: "%" },
    inputs: [{ id: "value", label: "value", type: "scalar" }],
    outputs: [{ id: "out", label: "true / false", type: "bool" }],
    render: (d) => [{ kind: "field", l: `Fire when value >`, v: Number(d.threshold), unit: String(d.unit) }],
  },
  and: {
    type: "and",
    label: "AND",
    sub: "∧",
    title: "AND",
    color: COL.logic,
    defaults: {},
    inputs: [
      { id: "a", label: "a", type: "bool" },
      { id: "b", label: "b", type: "bool" },
    ],
    outputs: [{ id: "out", label: "a ∧ b", type: "bool" }],
    render: () => [],
  },
  payout: {
    type: "payout",
    label: "Trigger payout",
    sub: "$",
    title: "Trigger payout",
    color: COL.payout,
    defaults: { policy: "POL-2026-00471", amount: 25000, currency: "USD", channel: "Smart contract" },
    inputs: [{ id: "trigger", label: "trigger", type: "bool" }],
    outputs: [{ id: "event", label: "event", type: "event" }],
    render: (d) => [
      { kind: "row", l: "Policy", v: String(d.policy) },
      { kind: "row", l: "Amount", v: `${Number(d.amount).toLocaleString()} ${d.currency}` },
      { kind: "row", l: "Channel", v: String(d.channel) },
    ],
  },
};

export const PALETTE_GROUPS: NodePaletteGroup[] = [
  {
    name: "Region",
    color: COL.region,
    items: [{ type: "aoi", label: "Area of Interest", sub: "AOI" }],
  },
  {
    name: "Sentinel data sources",
    color: COL.data,
    items: [{ type: "s1", label: "Sentinel-1 SAR", sub: "S1" }],
  },
  {
    name: "Indices & products",
    color: COL.index,
    items: [{ type: "flood", label: "SAR Flood Extent", sub: "S1" }],
  },
  {
    name: "Transforms",
    color: COL.transform,
    items: [{ type: "rolling", label: "Rolling window", sub: "T" }],
  },
  {
    name: "Conditions",
    color: COL.cond,
    items: [{ type: "gt", label: "Greater than", sub: ">" }],
  },
  {
    name: "Logic",
    color: COL.logic,
    items: [{ type: "and", label: "AND", sub: "∧" }],
  },
  {
    name: "Payout & alerts",
    color: COL.payout,
    items: [{ type: "payout", label: "Trigger payout", sub: "$" }],
  },
];

export function hydrate(spec: { type: string; id: string; x: number; y: number }): FlowNodeSpec {
  const tpl = TEMPLATES[spec.type];
  const data = JSON.parse(JSON.stringify(tpl.defaults));
  return {
    id: spec.id,
    type: spec.type,
    x: spec.x,
    y: spec.y,
    title: tpl.title,
    sub: tpl.sub,
    color: tpl.color,
    inputs: tpl.inputs,
    outputs: tpl.outputs,
    data,
    rows: tpl.render(data),
  };
}

export function makeNode(type: string, id: string, x: number, y: number): FlowNodeSpec {
  return hydrate({ type, id, x, y });
}

export const INITIAL_NODES: FlowNodeSpec[] = [
  hydrate({ type: "s1", id: "n_s1", x: 280, y: 100 }),
  hydrate({ type: "flood", id: "n_fl", x: 600, y: 200 }),
  hydrate({ type: "aoi", id: "n_aoi", x: 280, y: 400 }),
];

export const INITIAL_EDGES: FlowEdgeSpec[] = [
  { id: "e1", source: { nodeId: "n_s1", portId: "out" }, target: { nodeId: "n_fl", portId: "sar" } },
  { id: "e2", source: { nodeId: "n_aoi", portId: "out" }, target: { nodeId: "n_fl", portId: "region" } },
];

<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";
  import FlowNode from "../FlowNode/FlowNode.svelte";
  import FlowEdge from "../FlowEdge/FlowEdge.svelte";
  import { edgePath, portPos } from "../geometry.js";
  import type {
    ConnectionDraft,
    FlowEdgeSpec,
    FlowNodeSpec,
    PortColors,
    PortRef,
    PortSide,
    PortSpec,
    Viewport,
  } from "../types.js";
  import { DEFAULT_PORT_COLORS } from "../types.js";

  let {
    nodes,
    edges,
    viewport = $bindable({ x: 40, y: 40, z: 1 }),
    selectedId = $bindable(null),
    firingNodes = {},
    firingEdges = {},
    portColors = DEFAULT_PORT_COLORS,
    minZoom = 0.3,
    maxZoom = 1.6,
    width = "100%",
    height = "100%",
    dropMimeType = "application/x-node-type",
    dropOffsetX = 112,
    dropOffsetY = 24,
    node: nodeSnippet,
    onnodemove,
    onnodeadd,
    onedgeadd,
    onedgedelete,
    oncanvasclick,
  }: {
    nodes: FlowNodeSpec[];
    edges: FlowEdgeSpec[];
    viewport?: Viewport;
    selectedId?: string | null;
    firingNodes?: Record<string, boolean>;
    firingEdges?: Record<string, boolean>;
    portColors?: PortColors;
    minZoom?: number;
    maxZoom?: number;
    width?: string;
    height?: string;
    dropMimeType?: string;
    dropOffsetX?: number;
    dropOffsetY?: number;
    node?: Snippet<[{ node: FlowNodeSpec; selected: boolean; firing: boolean }]>;
    onnodemove?: (id: string, x: number, y: number) => void;
    onnodeadd?: (typeKey: string, x: number, y: number) => void;
    onedgeadd?: (edge: Omit<FlowEdgeSpec, "id">) => void;
    onedgedelete?: (id: string) => void;
    oncanvasclick?: () => void;
  } = $props();

  let canvasEl: HTMLDivElement;
  let panActive = $state(false);
  let panStart = { sx: 0, sy: 0, ox: 0, oy: 0 };
  let draggingNode = $state<{ id: string; dx: number; dy: number } | null>(null);
  let connecting = $state<ConnectionDraft | null>(null);
  let hoverPort = $state<PortRef | null>(null);

  const zoom = $derived(viewport.z || 1);

  function toWorld(clientX: number, clientY: number) {
    const rect = canvasEl.getBoundingClientRect();
    return {
      x: (clientX - rect.left - viewport.x) / zoom,
      y: (clientY - rect.top - viewport.y) / zoom,
    };
  }

  function onCanvasPointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (target !== canvasEl && !target.classList?.contains("cy-flow-canvas__grid")) return;
    if (e.button !== 0 && e.button !== 1) return;
    selectedId = null;
    oncanvasclick?.();
    panActive = true;
    panStart = { sx: e.clientX, sy: e.clientY, ox: viewport.x, oy: viewport.y };
  }

  $effect(() => {
    if (!panActive) return;
    const move = (e: PointerEvent) => {
      viewport = {
        ...viewport,
        x: panStart.ox + (e.clientX - panStart.sx),
        y: panStart.oy + (e.clientY - panStart.sy),
      };
    };
    const up = () => {
      panActive = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  });

  $effect(() => {
    if (!draggingNode) return;
    const move = (e: PointerEvent) => {
      const w = toWorld(e.clientX, e.clientY);
      onnodemove?.(draggingNode!.id, w.x - draggingNode!.dx, w.y - draggingNode!.dy);
    };
    const up = () => {
      draggingNode = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  });

  function onNodeHeadDown(e: PointerEvent, node: FlowNodeSpec) {
    e.stopPropagation();
    selectedId = node.id;
    const w = toWorld(e.clientX, e.clientY);
    draggingNode = { id: node.id, dx: w.x - node.x, dy: w.y - node.y };
  }

  $effect(() => {
    if (!connecting) return;
    const move = (e: PointerEvent) => {
      const w = toWorld(e.clientX, e.clientY);
      connecting = { ...connecting!, x2: w.x, y2: w.y };
    };
    const up = () => {
      if (
        hoverPort &&
        hoverPort.type === connecting!.fromType &&
        hoverPort.side === "in"
      ) {
        onedgeadd?.({
          source: { nodeId: connecting!.fromNodeId, portId: connecting!.fromPortId },
          target: { nodeId: hoverPort.nodeId, portId: hoverPort.portId },
        });
      }
      connecting = null;
      hoverPort = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  });

  function onPortDown(e: PointerEvent, node: FlowNodeSpec, port: PortSpec, side: PortSide) {
    e.stopPropagation();
    if (side !== "out") return;
    const w = toWorld(e.clientX, e.clientY);
    const idx = node.outputs.findIndex((p) => p.id === port.id);
    const start = portPos(node, "out", idx);
    connecting = {
      fromNodeId: node.id,
      fromPortId: port.id,
      fromType: port.type,
      x1: start.x,
      y1: start.y,
      x2: w.x,
      y2: w.y,
    };
  }

  function onPortEnter(node: FlowNodeSpec, port: PortSpec, side: PortSide) {
    if (!connecting) return;
    if (side === "in" && port.type === connecting.fromType && node.id !== connecting.fromNodeId) {
      hoverPort = { nodeId: node.id, portId: port.id, side, type: port.type };
    }
  }

  function onPortLeave() {
    hoverPort = null;
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const tpl = e.dataTransfer?.getData(dropMimeType);
    if (!tpl) return;
    const w = toWorld(e.clientX, e.clientY);
    onnodeadd?.(tpl, w.x - dropOffsetX, w.y - dropOffsetY);
  }

  function onWheel(e: WheelEvent) {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 1) return;
    e.preventDefault();
    const rect = canvasEl.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const dir = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const oldZ = viewport.z || 1;
    const newZ = Math.max(minZoom, Math.min(maxZoom, oldZ * dir));
    const ratio = newZ / oldZ;
    viewport = {
      x: cx - (cx - viewport.x) * ratio,
      y: cy - (cy - viewport.y) * ratio,
      z: newZ,
    };
  }

  function portColor(type: string): string {
    return portColors[type] ?? "var(--color-text-secondary)";
  }
</script>

<div
  bind:this={canvasEl}
  class="cy-flow-canvas"
  class:cy-flow-canvas--panning={panActive}
  style:width
  style:height
  onpointerdown={onCanvasPointerDown}
  ondragover={onDragOver}
  ondrop={onDrop}
  onwheel={onWheel}
  role="application"
  aria-label="Node editor canvas"
  tabindex="-1"
>
  <div
    class="cy-flow-canvas__grid"
    style:transform="translate({viewport.x % 120}px, {viewport.y % 120}px)"
  ></div>

  <div
    class="cy-flow-canvas__world"
    style:transform="translate({viewport.x}px, {viewport.y}px) scale({zoom})"
  >
    <svg
      class="cy-flow-canvas__edges"
      style="left:-10000px; top:-10000px; width:20000px; height:20000px;"
    >
      <g transform="translate(10000,10000)">
        {#each edges as e (e.id)}
          {@const sNode = nodes.find((n) => n.id === e.source.nodeId)}
          {@const tNode = nodes.find((n) => n.id === e.target.nodeId)}
          {#if sNode && tNode}
            {@const sIdx = sNode.outputs.findIndex((p) => p.id === e.source.portId)}
            {@const tIdx = tNode.inputs.findIndex((p) => p.id === e.target.portId)}
            {@const s = portPos(sNode, "out", sIdx)}
            {@const t = portPos(tNode, "in", tIdx)}
            {@const color = portColor(sNode.outputs[sIdx]?.type ?? "")}
            <FlowEdge
              from={s}
              to={t}
              {color}
              firing={!!firingEdges[e.id]}
              interactive
              onclick={() => onedgedelete?.(e.id)}
            />
          {/if}
        {/each}
        {#if connecting}
          <FlowEdge
            from={{ x: connecting.x1, y: connecting.y1 }}
            to={{ x: connecting.x2, y: connecting.y2 }}
            color={portColor(connecting.fromType)}
            preview
          />
        {/if}
      </g>
    </svg>

    {#each nodes as node (node.id)}
      {@const selected = node.id === selectedId}
      {@const firing = !!firingNodes[node.id]}
      {#if nodeSnippet}
        {@render nodeSnippet({ node, selected, firing })}
      {:else}
        <FlowNode
          {node}
          {selected}
          {firing}
          {portColors}
          {connecting}
          {hoverPort}
          onheaddown={(e) => onNodeHeadDown(e, node)}
          onportdown={(e, port, side) => onPortDown(e, node, port, side)}
          onportenter={(port, side) => onPortEnter(node, port, side)}
          onportleave={onPortLeave}
        />
      {/if}
    {/each}
  </div>
</div>

<style>
  .cy-flow-canvas {
    position: relative;
    overflow: hidden;
    background: var(--color-bg-primary);
    cursor: default;
  }

  .cy-flow-canvas--panning {
    cursor: grabbing;
  }

  .cy-flow-canvas__grid {
    position: absolute;
    inset: -120px;
    pointer-events: none;
    background-image:
      linear-gradient(
        to right,
        color-mix(in srgb, var(--color-border-default) 30%, transparent) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        color-mix(in srgb, var(--color-border-default) 30%, transparent) 1px,
        transparent 1px
      );
    background-size: 120px 120px;
  }

  .cy-flow-canvas__world {
    position: absolute;
    inset: 0;
    transform-origin: 0 0;
  }

  .cy-flow-canvas__edges {
    position: absolute;
    pointer-events: none;
    overflow: visible;
  }

  .cy-flow-canvas__edges :global(.cy-flow-edge__hit) {
    pointer-events: stroke;
  }
</style>

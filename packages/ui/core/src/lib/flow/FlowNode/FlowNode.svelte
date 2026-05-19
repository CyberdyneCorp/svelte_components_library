<svelte:options runes={true} />

<script lang="ts">
  import FlowPort from "../FlowPort/FlowPort.svelte";
  import type {
    ConnectionDraft,
    FlowNodeSpec,
    PortColors,
    PortRef,
    PortSide,
    PortSpec,
  } from "../types.js";
  import {
    DEFAULT_PORT_COLORS,
    NODE_DEFAULT_WIDTH,
    NODE_PORT_ROW_HEIGHT,
  } from "../types.js";

  const EMPTY_NODE: FlowNodeSpec = {
    id: "",
    type: "",
    x: 0,
    y: 0,
    inputs: [],
    outputs: [],
  };

  let {
    node = EMPTY_NODE,
    selected = false,
    firing = false,
    portColors = DEFAULT_PORT_COLORS,
    accent,
    connecting = null,
    hoverPort = null,
    onheaddown,
    onportdown,
    onportenter,
    onportleave,
  }: {
    node: FlowNodeSpec;
    selected?: boolean;
    firing?: boolean;
    portColors?: PortColors;
    accent?: string;
    connecting?: ConnectionDraft | null;
    hoverPort?: PortRef | null;
    onheaddown?: (e: PointerEvent) => void;
    onportdown?: (e: PointerEvent, port: PortSpec, side: PortSide) => void;
    onportenter?: (port: PortSpec, side: PortSide) => void;
    onportleave?: () => void;
  } = $props();

  const accentColor = $derived(accent ?? node.color ?? "var(--color-action-brand-default)");
  const portsCount = $derived(Math.max(node.inputs.length, node.outputs.length));
  const portRows = $derived(
    Array.from({ length: portsCount }).map((_, i) => ({
      inp: node.inputs[i] ?? null,
      out: node.outputs[i] ?? null,
    })),
  );

  function portColor(type: string): string {
    return portColors[type] ?? "var(--color-text-secondary)";
  }

  function isCompatibleIn(port: PortSpec): boolean {
    return !!connecting && connecting.fromType === port.type && connecting.fromNodeId !== node.id;
  }

  function isHovered(port: PortSpec): boolean {
    return !!hoverPort && hoverPort.nodeId === node.id && hoverPort.portId === port.id;
  }
</script>

<div
  class="cy-flow-node"
  class:cy-flow-node--selected={selected}
  class:cy-flow-node--firing={firing}
  style:left="{node.x}px"
  style:top="{node.y}px"
  style:width="{node.w ?? NODE_DEFAULT_WIDTH}px"
  style:--node-accent={accentColor}
>
  <div
    class="cy-flow-node__head"
    onpointerdown={onheaddown}
    role="button"
    tabindex="-1"
  >
    <span class="cy-flow-node__dot"></span>
    <span class="cy-flow-node__title">{node.title ?? node.type}</span>
    {#if node.sub}
      <span class="cy-flow-node__sub">{node.sub}</span>
    {/if}
  </div>

  <div class="cy-flow-node__body" style:min-height="{portsCount * NODE_PORT_ROW_HEIGHT + 12}px">
    {#each portRows as row, i (i)}
      <div class="cy-flow-node__row" style:height="{NODE_PORT_ROW_HEIGHT}px">
        {#if row.inp}
          <FlowPort
            side="in"
            color={portColor(row.inp.type)}
            label={row.inp.label}
            type={row.inp.type}
            compatible={isCompatibleIn(row.inp)}
            hover={isHovered(row.inp)}
            onpointerdown={(e) => onportdown?.(e, row.inp!, "in")}
            onpointerenter={() => onportenter?.(row.inp!, "in")}
            onpointerleave={() => onportleave?.()}
          />
          <span class="cy-flow-node__label">{row.inp.label}</span>
        {/if}
        {#if row.out}
          <span class="cy-flow-node__label cy-flow-node__label--right">{row.out.label}</span>
          <FlowPort
            side="out"
            color={portColor(row.out.type)}
            label={row.out.label}
            type={row.out.type}
            hover={isHovered(row.out)}
            onpointerdown={(e) => onportdown?.(e, row.out!, "out")}
            onpointerenter={() => onportenter?.(row.out!, "out")}
            onpointerleave={() => onportleave?.()}
          />
        {/if}
      </div>
    {/each}

    {#if node.rows && node.rows.length > 0}
      {#each node.rows as r, ri (ri)}
        {#if r.kind === "row"}
          <div class="cy-flow-node__row cy-flow-node__row--data">
            <span class="cy-flow-node__label">{r.l}</span>
            <span class="cy-flow-node__value">{r.v}</span>
          </div>
        {:else if r.kind === "field"}
          <div class="cy-flow-node__field">
            <div class="cy-flow-node__field-label">{r.l}</div>
            <div class="cy-flow-node__field-value">
              {r.v}
              {#if r.unit}
                <span class="cy-flow-node__unit">{r.unit}</span>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    {/if}
  </div>

  <div class="cy-flow-node__foot" class:cy-flow-node__foot--live={firing}>
    <span class="cy-flow-node__pulse"></span>
    <span>{firing ? "firing" : "idle"}</span>
    <span class="cy-flow-node__id">{node.id.slice(-4)}</span>
  </div>
</div>

<style>
  .cy-flow-node {
    position: absolute;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    color: var(--color-text-primary);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    user-select: none;
    transition:
      border-color var(--transition-default),
      box-shadow var(--transition-default);
  }

  .cy-flow-node--selected {
    border-color: var(--node-accent);
    box-shadow: 0 0 0 1px var(--node-accent), 0 8px 24px rgba(0, 0, 0, 0.35);
  }

  .cy-flow-node--firing {
    border-color: var(--node-accent);
    box-shadow:
      0 0 0 1px var(--node-accent),
      0 0 24px color-mix(in srgb, var(--node-accent) 35%, transparent);
  }

  .cy-flow-node__head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border-subtle);
    cursor: grab;
    font-size: 12.5px;
    font-weight: var(--font-weight-medium);
  }

  .cy-flow-node__head:active {
    cursor: grabbing;
  }

  .cy-flow-node__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--node-accent);
    box-shadow: 0 0 6px var(--node-accent);
    flex-shrink: 0;
  }

  .cy-flow-node__title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-flow-node__sub {
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--color-text-tertiary);
    padding: 1px 6px;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xs);
    letter-spacing: 0.04em;
  }

  .cy-flow-node__body {
    padding: var(--space-2) 0;
  }

  .cy-flow-node__row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0 var(--space-3);
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .cy-flow-node__row--data {
    height: 22px;
  }

  .cy-flow-node__label {
    font-size: 12px;
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-flow-node__label--right {
    margin-left: auto;
    text-align: right;
  }

  .cy-flow-node__value {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--color-text-primary);
  }

  .cy-flow-node__field {
    padding: var(--space-1) var(--space-3) var(--space-2);
    margin-top: var(--space-1);
    border-top: 1px dashed var(--color-border-subtle);
  }

  .cy-flow-node__field-label {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-tertiary);
    margin-bottom: 2px;
  }

  .cy-flow-node__field-value {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--color-text-primary);
  }

  .cy-flow-node__unit {
    font-size: 11px;
    color: var(--color-text-tertiary);
    margin-left: 4px;
  }

  .cy-flow-node__foot {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 6px var(--space-3);
    border-top: 1px solid var(--color-border-subtle);
    font-family: var(--font-mono);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-tertiary);
  }

  .cy-flow-node__pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-text-tertiary);
  }

  .cy-flow-node__foot--live .cy-flow-node__pulse {
    background: var(--node-accent);
    box-shadow: 0 0 6px var(--node-accent);
    animation: cy-flow-node-pulse 1s ease-in-out infinite;
  }

  .cy-flow-node__foot--live {
    color: var(--node-accent);
  }

  .cy-flow-node__id {
    margin-left: auto;
    opacity: 0.6;
  }

  @keyframes cy-flow-node-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }
</style>

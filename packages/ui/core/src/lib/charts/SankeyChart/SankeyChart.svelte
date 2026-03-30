<svelte:options runes={true} />

<script lang="ts">
  type SankeyNode = { id: string; label?: string; color?: string };
  type SankeyLink = { source: string; target: string; value: number; color?: string };

  let {
    nodes = [],
    links = [],
    width = "100%",
    height = "400px",
    showValues = true,
    showTooltip = true,
    animate = true,
    nodePadding = 20,
    nodeWidth = 20,
    onNodeClick,
    onLinkClick,
    class: className = "",
  }: {
    nodes?: SankeyNode[];
    links?: SankeyLink[];
    width?: string;
    height?: string;
    showValues?: boolean;
    showTooltip?: boolean;
    animate?: boolean;
    nodePadding?: number;
    nodeWidth?: number;
    onNodeClick?: (node: SankeyNode) => void;
    onLinkClick?: (link: SankeyLink) => void;
    class?: string;
  } = $props();

  const defaultColors = ["#00ff41", "#00d4ff", "#a855f7", "#ffb800", "#ff5555", "#50fa7b", "#ff79c6", "#8be9fd"];
  const viewW = 800;
  const viewH = 400;
  const pad = { top: 20, right: 120, bottom: 20, left: 120 };
  const plotW = viewW - pad.left - pad.right;
  const plotH = viewH - pad.top - pad.bottom;

  function getNodeColor(node: SankeyNode, i: number): string {
    return node.color || defaultColors[i % defaultColors.length];
  }

  // Compute layout
  interface LayoutNode {
    id: string;
    label: string;
    color: string;
    x: number;
    y: number;
    w: number;
    h: number;
    value: number;
    column: number;
    sourceLinks: LayoutLink[];
    targetLinks: LayoutLink[];
  }

  interface LayoutLink {
    source: LayoutNode;
    target: LayoutNode;
    value: number;
    color: string;
    sy: number;
    ty: number;
    width: number;
  }

  let layout = $derived.by(() => {
    if (nodes.length === 0 || links.length === 0) return { nodes: [] as LayoutNode[], links: [] as LayoutLink[] };

    // Build adjacency
    const nodeMap = new Map<string, LayoutNode>();
    nodes.forEach((n, i) => {
      nodeMap.set(n.id, {
        id: n.id,
        label: n.label || n.id,
        color: getNodeColor(n, i),
        x: 0, y: 0, w: nodeWidth, h: 0,
        value: 0, column: 0,
        sourceLinks: [], targetLinks: [],
      });
    });

    // Compute columns via topological sort (longest path from source)
    const inDegree = new Map<string, number>();
    const outDegree = new Map<string, number>();
    nodes.forEach((n) => { inDegree.set(n.id, 0); outDegree.set(n.id, 0); });
    links.forEach((l) => {
      inDegree.set(l.target, (inDegree.get(l.target) || 0) + 1);
      outDegree.set(l.source, (outDegree.get(l.source) || 0) + 1);
    });

    // BFS to assign columns
    const columns = new Map<string, number>();
    const queue: string[] = [];
    nodes.forEach((n) => { if ((inDegree.get(n.id) || 0) === 0) { columns.set(n.id, 0); queue.push(n.id); } });

    while (queue.length > 0) {
      const current = queue.shift()!;
      const col = columns.get(current) || 0;
      links.forEach((l) => {
        if (l.source === current) {
          const newCol = col + 1;
          if (newCol > (columns.get(l.target) || 0)) {
            columns.set(l.target, newCol);
          }
          // Simple push (may add duplicates, handled by max)
          if (!queue.includes(l.target)) queue.push(l.target);
        }
      });
    }

    const maxCol = Math.max(...Array.from(columns.values()), 0);

    // Compute node values (sum of connected links)
    nodes.forEach((n) => {
      const node = nodeMap.get(n.id)!;
      const sourceVal = links.filter((l) => l.source === n.id).reduce((s, l) => s + l.value, 0);
      const targetVal = links.filter((l) => l.target === n.id).reduce((s, l) => s + l.value, 0);
      node.value = Math.max(sourceVal, targetVal);
      node.column = columns.get(n.id) || 0;
    });

    // Position nodes by column
    const colNodes = new Map<number, LayoutNode[]>();
    nodeMap.forEach((n) => {
      if (!colNodes.has(n.column)) colNodes.set(n.column, []);
      colNodes.get(n.column)!.push(n);
    });

    const totalValue = Math.max(...Array.from(nodeMap.values()).map((n) => n.value), 1);

    colNodes.forEach((nodesInCol, col) => {
      const x = pad.left + (maxCol > 0 ? (col / maxCol) * plotW : 0);
      const totalNodeValue = nodesInCol.reduce((s, n) => s + n.value, 0);
      const availH = plotH - (nodesInCol.length - 1) * nodePadding;
      let y = pad.top;

      nodesInCol.forEach((n) => {
        n.x = x;
        n.h = Math.max((n.value / (totalNodeValue || 1)) * availH, 4);
        n.y = y;
        y += n.h + nodePadding;
      });
    });

    // Build links
    const layoutLinks: LayoutLink[] = [];
    // Track offset for stacking multiple links at same node
    const sourceOffsets = new Map<string, number>();
    const targetOffsets = new Map<string, number>();
    nodeMap.forEach((n) => { sourceOffsets.set(n.id, 0); targetOffsets.set(n.id, 0); });

    links.forEach((l) => {
      const source = nodeMap.get(l.source);
      const target = nodeMap.get(l.target);
      if (!source || !target) return;

      const linkWidth = source.value > 0 ? (l.value / source.value) * source.h : 0;
      const sy = source.y + (sourceOffsets.get(source.id) || 0);
      const ty = target.y + (targetOffsets.get(target.id) || 0);

      const ll: LayoutLink = {
        source, target, value: l.value,
        color: l.color || source.color,
        sy, ty, width: Math.max(linkWidth, 1),
      };
      layoutLinks.push(ll);

      sourceOffsets.set(source.id, (sourceOffsets.get(source.id) || 0) + linkWidth);
      targetOffsets.set(target.id, (targetOffsets.get(target.id) || 0) + linkWidth);
    });

    return { nodes: Array.from(nodeMap.values()), links: layoutLinks };
  });

  function linkPath(link: LayoutLink): string {
    const sx = link.source.x + link.source.w;
    const tx = link.target.x;
    const midX = (sx + tx) / 2;
    const sy = link.sy + link.width / 2;
    const ty = link.ty + link.width / 2;
    return `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
  }

  // Tooltip state
  let tooltip: { text: string; x: number; y: number } | null = $state(null);

  function showLinkTooltip(link: LayoutLink, e: MouseEvent) {
    const svg = (e.currentTarget as SVGElement).closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    tooltip = {
      text: `${link.source.label} → ${link.target.label}: ${link.value}`,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function showNodeTooltip(node: LayoutNode, e: MouseEvent) {
    const svg = (e.currentTarget as SVGElement).closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    tooltip = {
      text: `${node.label}: ${node.value}`,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function hideTooltip() {
    tooltip = null;
  }
</script>

<div class="cy-sankey-chart {className}" style="width: {width}; height: {height};">
  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-sankey-chart__svg"
    role="img"
    aria-label="Sankey diagram"
  >
    <!-- Links -->
    {#each layout.links as link}
      <path
        d={linkPath(link)}
        fill="none"
        stroke={link.color}
        stroke-width={link.width}
        class="cy-sankey-chart__link"
        class:cy-sankey-chart__link--animated={animate}
        onmouseenter={(e) => showLinkTooltip(link, e)}
        onmouseleave={hideTooltip}
        onclick={() => onLinkClick?.({ source: link.source.id, target: link.target.id, value: link.value })}
        role="presentation"
      />
    {/each}

    <!-- Nodes -->
    {#each layout.nodes as node}
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        fill={node.color}
        class="cy-sankey-chart__node"
        class:cy-sankey-chart__node--animated={animate}
        onmouseenter={(e) => showNodeTooltip(node, e)}
        onmouseleave={hideTooltip}
        onclick={() => onNodeClick?.(nodes.find((n) => n.id === node.id) || { id: node.id })}
        role="presentation"
      />

      <!-- Node labels -->
      <text
        x={node.column === 0 ? node.x - 6 : node.x + node.w + 6}
        y={node.y + node.h / 2 + 4}
        text-anchor={node.column === 0 ? "end" : "start"}
        class="cy-sankey-chart__node-label"
      >
        {node.label}{#if showValues} ({node.value}){/if}
      </text>
    {/each}
  </svg>

  <!-- Tooltip -->
  {#if showTooltip && tooltip}
    <div class="cy-sankey-chart__tooltip" style="left: {tooltip.x + 12}px; top: {tooltip.y - 8}px;">
      {tooltip.text}
    </div>
  {/if}
</div>

<style>
  .cy-sankey-chart {
    position: relative;
    font-family: var(--font-body, "Inter", sans-serif);
  }

  .cy-sankey-chart__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cy-sankey-chart__link {
    opacity: 0.35;
    transition: opacity 150ms ease;
    cursor: pointer;
  }

  .cy-sankey-chart__link:hover {
    opacity: 0.7;
  }

  .cy-sankey-chart__link--animated {
    stroke-dasharray: 1500;
    stroke-dashoffset: 1500;
    animation: cy-sankey-draw 1.5s ease forwards;
  }

  @keyframes cy-sankey-draw {
    to { stroke-dashoffset: 0; }
  }

  .cy-sankey-chart__node {
    cursor: pointer;
    transition: opacity 150ms ease, filter 150ms ease;
    rx: 2;
  }

  .cy-sankey-chart__node:hover {
    filter: brightness(1.2);
  }

  .cy-sankey-chart__node--animated {
    animation: cy-sankey-node-fade 0.6s ease-out forwards;
  }

  @keyframes cy-sankey-node-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .cy-sankey-chart__node-label {
    fill: var(--color-text-secondary);
    font-size: 11px;
    font-family: var(--font-body, "Inter", sans-serif);
  }

  .cy-sankey-chart__tooltip {
    position: absolute;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 0.75rem;
    color: var(--color-text-primary);
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
</style>

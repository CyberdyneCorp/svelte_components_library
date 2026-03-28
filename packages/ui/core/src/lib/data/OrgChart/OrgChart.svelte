<svelte:options runes={true} />

<script lang="ts">
  type OrgNode = {
    id: string;
    label: string;
    title?: string;
    avatar?: string;
    children?: OrgNode[];
    color?: string;
    description?: string;
    email?: string;
    department?: string;
    links?: Array<{ label: string; url: string }>;
  };

  let {
    root = { id: "root", label: "CEO", children: [] },
    direction = "vertical",
    nodeWidth = 180,
    nodeHeight = 80,
    width = "100%",
    height = "500px",
    onnodeclick,
    collapsible = true,
  }: {
    root?: OrgNode;
    direction?: "vertical" | "horizontal";
    nodeWidth?: number;
    nodeHeight?: number;
    width?: string;
    height?: string;
    onnodeclick?: (node: OrgNode) => void;
    collapsible?: boolean;
  } = $props();

  const GAP_SIBLING = 20;
  const GAP_LEVEL = 100;

  let selectedId = $state<string | null>(null);
  let detailNode = $state<OrgNode | null>(null);

  function findNode(tree: OrgNode, id: string): OrgNode | null {
    if (tree.id === id) return tree;
    for (const child of tree.children || []) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  }
  let collapsedIds = $state<Set<string>>(new Set());
  let viewBox = $state({ x: 0, y: 0, w: 1000, h: 600 });
  let isPanning = $state(false);
  let panStart = $state({ x: 0, y: 0 });
  let svgRef = $state<SVGSVGElement | null>(null);
  let containerRef = $state<HTMLDivElement | null>(null);

  type PositionedNode = {
    node: OrgNode;
    x: number;
    y: number;
    children: PositionedNode[];
    subtreeWidth: number;
  };

  function getInitials(label: string): string {
    return label
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function isCollapsed(id: string): boolean {
    return collapsedIds.has(id);
  }

  function toggleCollapse(id: string) {
    const next = new Set(collapsedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    collapsedIds = next;
  }

  function calcSubtreeWidth(node: OrgNode, isHorizontal: boolean): number {
    const nodeDim = isHorizontal ? nodeHeight : nodeWidth;
    const visibleChildren =
      node.children && !isCollapsed(node.id) ? node.children : [];
    if (visibleChildren.length === 0) return nodeDim;
    const childrenWidth = visibleChildren.reduce(
      (sum, child) => sum + calcSubtreeWidth(child, isHorizontal),
      0,
    );
    const gaps = (visibleChildren.length - 1) * GAP_SIBLING;
    return Math.max(nodeDim, childrenWidth + gaps);
  }

  function layoutTree(
    node: OrgNode,
    x: number,
    y: number,
    isHorizontal: boolean,
  ): PositionedNode {
    const subtreeWidth = calcSubtreeWidth(node, isHorizontal);
    const visibleChildren =
      node.children && !isCollapsed(node.id) ? node.children : [];

    const positioned: PositionedNode = {
      node,
      x,
      y,
      children: [],
      subtreeWidth,
    };

    if (visibleChildren.length === 0) return positioned;

    const childrenTotalWidth = visibleChildren.reduce(
      (sum, child) => sum + calcSubtreeWidth(child, isHorizontal),
      0,
    );
    const gaps = (visibleChildren.length - 1) * GAP_SIBLING;
    const totalChildWidth = childrenTotalWidth + gaps;

    let offset = -totalChildWidth / 2;

    for (const child of visibleChildren) {
      const childSubWidth = calcSubtreeWidth(child, isHorizontal);
      const childCenter = offset + childSubWidth / 2;

      let cx: number, cy: number;
      if (isHorizontal) {
        cx = x + nodeWidth + GAP_LEVEL;
        cy = y + childCenter;
      } else {
        cx = x + childCenter;
        cy = y + nodeHeight + GAP_LEVEL;
      }

      positioned.children.push(layoutTree(child, cx, cy, isHorizontal));
      offset += childSubWidth + GAP_SIBLING;
    }

    return positioned;
  }

  function collectNodes(p: PositionedNode): PositionedNode[] {
    const result: PositionedNode[] = [p];
    for (const child of p.children) {
      result.push(...collectNodes(child));
    }
    return result;
  }

  type Edge = { x1: number; y1: number; x2: number; y2: number };

  function collectEdges(p: PositionedNode, isHorizontal: boolean): Edge[] {
    const edges: Edge[] = [];
    for (const child of p.children) {
      if (isHorizontal) {
        edges.push({
          x1: p.x + nodeWidth,
          y1: p.y + nodeHeight / 2,
          x2: child.x,
          y2: child.y + nodeHeight / 2,
        });
      } else {
        edges.push({
          x1: p.x + nodeWidth / 2,
          y1: p.y + nodeHeight,
          x2: child.x + nodeWidth / 2,
          y2: child.y,
        });
      }
      edges.push(...collectEdges(child, isHorizontal));
    }
    return edges;
  }

  function edgePath(e: Edge, isHorizontal: boolean): string {
    if (isHorizontal) {
      const midX = (e.x1 + e.x2) / 2;
      return `M${e.x1},${e.y1} L${midX},${e.y1} L${midX},${e.y2} L${e.x2},${e.y2}`;
    } else {
      const midY = (e.y1 + e.y2) / 2;
      return `M${e.x1},${e.y1} L${e.x1},${midY} L${e.x2},${midY} L${e.x2},${e.y2}`;
    }
  }

  let layoutRoot = $derived(
    layoutTree(root, 0, 0, direction === "horizontal"),
  );
  let allNodes = $derived(collectNodes(layoutRoot));
  let allEdges = $derived(
    collectEdges(layoutRoot, direction === "horizontal"),
  );

  $effect(() => {
    // Auto-fit viewBox
    if (allNodes.length === 0) return;
    const padding = 60;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const n of allNodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + nodeWidth > maxX) maxX = n.x + nodeWidth;
      if (n.y + nodeHeight > maxY) maxY = n.y + nodeHeight;
    }
    viewBox = {
      x: minX - padding,
      y: minY - padding,
      w: maxX - minX + padding * 2,
      h: maxY - minY + padding * 2,
    };
  });

  $effect(() => {
    if (!containerRef) return;
    const ro = new ResizeObserver(() => {
      // Trigger re-layout by reading dimensions (viewBox recalc happens via $derived)
    });
    ro.observe(containerRef);
    return () => ro.disconnect();
  });

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.1 : 0.9;
    const newW = viewBox.w * scale;
    const newH = viewBox.h * scale;
    const dx = (newW - viewBox.w) / 2;
    const dy = (newH - viewBox.h) / 2;
    viewBox = { x: viewBox.x - dx, y: viewBox.y - dy, w: newW, h: newH };
  }

  function handlePointerDown(e: PointerEvent) {
    if ((e.target as Element).closest(".cy-org__node-group")) return;
    isPanning = true;
    panStart = { x: e.clientX, y: e.clientY };
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isPanning || !svgRef) return;
    const rect = svgRef.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (e.clientX - panStart.x) * scaleX;
    const dy = (e.clientY - panStart.y) * scaleY;
    viewBox = { ...viewBox, x: viewBox.x - dx, y: viewBox.y - dy };
    panStart = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp() {
    isPanning = false;
  }

  function handleNodeClick(node: OrgNode) {
    if (selectedId === node.id && detailNode) {
      // Clicking same node again closes the panel
      detailNode = null;
    } else {
      selectedId = node.id;
      detailNode = node;
    }
    onnodeclick?.(node);
  }

  function closeDetail() {
    detailNode = null;
  }

  function hasChildren(node: OrgNode): boolean {
    return !!(node.children && node.children.length > 0);
  }
</script>

<div
  class="cy-org"
  style:width
  style:height
  bind:this={containerRef}
>
  <svg
    bind:this={svgRef}
    class="cy-org__svg"
    viewBox="{viewBox.x} {viewBox.y} {viewBox.w} {viewBox.h}"
    onwheel={handleWheel}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    role="img"
    aria-label="Organization chart"
  >
    <!-- Edges -->
    {#each allEdges as edge}
      <path
        class="cy-org__edge"
        d={edgePath(edge, direction === "horizontal")}
        fill="none"
      />
    {/each}

    <!-- Nodes -->
    {#each allNodes as pn (pn.node.id)}
      {@const node = pn.node}
      {@const isSelected = selectedId === node.id}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <g
        class="cy-org__node-group"
        transform="translate({pn.x}, {pn.y})"
        onclick={() => handleNodeClick(node)}
        onkeydown={(e) => { if (e.key === "Enter") handleNodeClick(node); }}
        tabindex="0"
        role="button"
        aria-label="{node.label}{node.title ? ', ' + node.title : ''}"
      >
        <!-- Card background -->
        <rect
          class="cy-org__node-bg"
          width={nodeWidth}
          height={nodeHeight}
          rx="8"
          ry="8"
          stroke={isSelected ? "var(--color-state-success)" : "var(--color-border-subtle)"}
          stroke-width={isSelected ? 2 : 1}
        />

        <!-- Colored left border -->
        {#if node.color}
          <rect
            x="0"
            y="4"
            width="4"
            rx="2"
            ry="2"
            height={nodeHeight - 8}
            fill={node.color}
          />
        {/if}

        <!-- Avatar circle -->
        {#if node.avatar}
          <clipPath id="avatar-clip-{node.id}">
            <circle cx={nodeWidth / 2} cy="18" r="12" />
          </clipPath>
          <image
            href={node.avatar}
            x={nodeWidth / 2 - 12}
            y="6"
            width="24"
            height="24"
            clip-path="url(#avatar-clip-{node.id})"
          />
        {:else}
          <circle
            class="cy-org__avatar"
            cx={nodeWidth / 2}
            cy="18"
            r="12"
          />
          <text
            class="cy-org__avatar-text"
            x={nodeWidth / 2}
            y="22"
            text-anchor="middle"
            font-size="9"
          >
            {getInitials(node.label)}
          </text>
        {/if}

        <!-- Label -->
        <text
          class="cy-org__label"
          x={nodeWidth / 2}
          y={nodeHeight / 2 + 8}
          text-anchor="middle"
          font-size="12"
          font-weight="600"
        >
          {node.label}
        </text>

        <!-- Title -->
        {#if node.title}
          <text
            class="cy-org__title"
            x={nodeWidth / 2}
            y={nodeHeight / 2 + 22}
            text-anchor="middle"
            font-size="10"
          >
            {node.title}
          </text>
        {/if}

        <!-- Collapse toggle -->
        {#if collapsible && hasChildren(node)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <g
            class="cy-org__toggle"
            transform={direction === "horizontal"
              ? `translate(${nodeWidth - 2}, ${nodeHeight / 2})`
              : `translate(${nodeWidth / 2}, ${nodeHeight - 2})`}
            onclick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
            onkeydown={(e) => { e.stopPropagation(); if (e.key === "Enter") toggleCollapse(node.id); }}
            role="button"
            tabindex="0"
            aria-label={isCollapsed(node.id) ? "Expand" : "Collapse"}
          >
            <circle r="8" class="cy-org__toggle-circle" />
            <text
              text-anchor="middle"
              dominant-baseline="central"
              font-size="12"
              font-weight="700"
              class="cy-org__toggle-text"
            >
              {isCollapsed(node.id) ? "+" : "\u2212"}
            </text>
          </g>
        {/if}
      </g>
    {/each}
  </svg>

  {#if detailNode}
    <div class="cy-org__detail" onclick={(e) => e.stopPropagation()}>
      <div class="cy-org__detail-header">
        <div class="cy-org__detail-avatar">
          {detailNode.label.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
        </div>
        <div class="cy-org__detail-identity">
          <div class="cy-org__detail-name">{detailNode.label}</div>
          {#if detailNode.title}
            <div class="cy-org__detail-title">{detailNode.title}</div>
          {/if}
        </div>
        <button class="cy-org__detail-close" onclick={closeDetail}>&#x2715;</button>
      </div>

      {#if detailNode.department}
        <div class="cy-org__detail-row">
          <span class="cy-org__detail-label">Department</span>
          <span class="cy-org__detail-value">{detailNode.department}</span>
        </div>
      {/if}

      {#if detailNode.email}
        <div class="cy-org__detail-row">
          <span class="cy-org__detail-label">Email</span>
          <a class="cy-org__detail-link" href="mailto:{detailNode.email}">{detailNode.email}</a>
        </div>
      {/if}

      {#if detailNode.description}
        <div class="cy-org__detail-desc">
          {detailNode.description}
        </div>
      {/if}

      {#if detailNode.links && detailNode.links.length > 0}
        <div class="cy-org__detail-links">
          <span class="cy-org__detail-label">Links</span>
          {#each detailNode.links as link}
            <a class="cy-org__detail-link" href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
          {/each}
        </div>
      {/if}

      {#if detailNode.children && detailNode.children.length > 0}
        <div class="cy-org__detail-row">
          <span class="cy-org__detail-label">Direct reports</span>
          <span class="cy-org__detail-value">{detailNode.children.length}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cy-org {
    --cy-bg: var(--orgchart-bg, var(--color-bg-primary));
    --cy-card-bg: var(--orgchart-card-bg, var(--color-surface-default));
    --cy-border: var(--orgchart-border, var(--color-border-subtle));
    --cy-text: var(--orgchart-text, var(--color-text-primary));
    --cy-text-dim: var(--orgchart-text-dim, var(--color-text-secondary));
    --cy-accent: var(--orgchart-accent, var(--color-action-brand-default));
    --cy-edge: var(--orgchart-edge, var(--color-border-subtle));
    --cy-avatar-bg: var(--orgchart-avatar-bg, var(--color-action-secondary-default));
    --cy-toggle-bg: var(--orgchart-toggle-bg, var(--color-surface-default));

    background: var(--cy-bg);
    border-radius: 12px;
    border: 1px solid var(--cy-border);
    overflow: hidden;
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
  }

  .cy-org__svg {
    width: 100%;
    height: 100%;
    cursor: grab;
    user-select: none;
  }

  .cy-org__svg:active {
    cursor: grabbing;
  }

  .cy-org__edge {
    stroke: var(--cy-edge);
    stroke-width: 1.5;
  }

  .cy-org__node-group {
    cursor: pointer;
    outline: none;
  }

  .cy-org__node-group:focus-visible .cy-org__node-bg {
    stroke: var(--cy-accent);
    stroke-width: 2;
  }

  .cy-org__node-bg {
    fill: var(--cy-card-bg);
    transition: stroke 0.15s ease;
  }

  .cy-org__node-group:hover .cy-org__node-bg {
    stroke: var(--cy-accent);
  }

  .cy-org__avatar {
    fill: var(--cy-avatar-bg);
  }

  .cy-org__avatar-text {
    fill: var(--cy-bg);
    font-weight: 700;
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
  }

  .cy-org__label {
    fill: var(--cy-text);
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
  }

  .cy-org__title {
    fill: var(--cy-text-dim);
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
  }

  .cy-org__toggle {
    cursor: pointer;
    outline: none;
  }

  .cy-org__toggle-circle {
    fill: var(--cy-toggle-bg);
    stroke: var(--cy-border);
    stroke-width: 1;
  }

  .cy-org__toggle:hover .cy-org__toggle-circle {
    stroke: var(--cy-accent);
  }

  .cy-org__toggle-text {
    fill: var(--cy-text);
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
  }

  /* Detail panel */
  .cy-org__detail {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 280px;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: 10px;
    padding: 16px;
    box-shadow: var(--shadow-lg);
    z-index: 10;
    font-family: var(--font-body);
    max-height: calc(100% - 24px);
    overflow-y: auto;
  }

  .cy-org__detail-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-org__detail-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--color-action-brand-default);
    color: var(--color-action-brand-text);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  .cy-org__detail-identity {
    flex: 1;
    min-width: 0;
  }

  .cy-org__detail-name {
    font-weight: 600;
    font-size: 0.9375rem;
    color: var(--color-text-primary);
  }

  .cy-org__detail-title {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    margin-top: 2px;
  }

  .cy-org__detail-close {
    background: none;
    border: none;
    color: var(--color-text-tertiary);
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .cy-org__detail-close:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-hover);
  }

  .cy-org__detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-org__detail-label {
    font-size: 0.6875rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-tertiary);
  }

  .cy-org__detail-value {
    font-size: 0.8125rem;
    color: var(--color-text-primary);
    font-family: var(--font-mono);
  }

  .cy-org__detail-desc {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin: 10px 0;
    padding: 8px;
    background: var(--color-surface-raised);
    border-radius: 6px;
    border-left: 3px solid var(--color-action-brand-default);
  }

  .cy-org__detail-links {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 0;
  }

  .cy-org__detail-link {
    font-size: 0.8125rem;
    color: var(--color-action-secondary-default);
    text-decoration: none;
  }

  .cy-org__detail-link:hover {
    text-decoration: underline;
  }
</style>

<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";

  type GraphNode = {
    id: string;
    label: string;
    group?: string;
    size?: number;
    color?: string;
    metadata?: Record<string, any>;
    x?: number;
    y?: number;
  };

  type GraphEdge = {
    source: string;
    target: string;
    label?: string;
    weight?: number;
    color?: string;
  };

  type GraphConfig = {
    showLabels?: boolean;
    showEdgeLabels?: boolean;
    enableZoom?: boolean;
    enablePan?: boolean;
    enableCommunityDetection?: boolean;
    minZoom?: number;
    maxZoom?: number;
    nodeRadius?: number;
    linkDistance?: number;
    chargeStrength?: number;
    centerStrength?: number;
  };

  type SimNode = GraphNode & {
    x: number;
    y: number;
    vx: number;
    vy: number;
    community?: string;
    communityColor?: string;
    pinned?: boolean;
  };

  let {
    nodes = [],
    edges = [],
    config = {},
    selectedNodeId = $bindable(null),
    width = "100%",
    height = "600px",
    onnodeclick,
    onnodehover,
    onsearch,
  }: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    config?: GraphConfig;
    selectedNodeId?: string | null;
    width?: string;
    height?: string;
    onnodeclick?: (node: GraphNode) => void;
    onnodehover?: (node: GraphNode | null) => void;
    onsearch?: (query: string) => void;
  } = $props();

  function getCSSVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  const COMMUNITY_COLORS_FALLBACK = [
    "#00ff41", "#00d4ff", "#a855f7", "#ff4444",
    "#ffb800", "#00cc99", "#ff6b9d", "#40e0d0",
  ];

  function getCommunityColors(): string[] {
    return [
      getCSSVar('--color-action-brand-default') || COMMUNITY_COLORS_FALLBACK[0],
      getCSSVar('--color-action-secondary-default') || COMMUNITY_COLORS_FALLBACK[1],
      COMMUNITY_COLORS_FALLBACK[2],
      getCSSVar('--color-state-error') || COMMUNITY_COLORS_FALLBACK[3],
      getCSSVar('--color-state-warning') || COMMUNITY_COLORS_FALLBACK[4],
      COMMUNITY_COLORS_FALLBACK[5],
      COMMUNITY_COLORS_FALLBACK[6],
      COMMUNITY_COLORS_FALLBACK[7],
    ];
  }

  let cfg = $derived({
    showLabels: config.showLabels ?? true,
    showEdgeLabels: config.showEdgeLabels ?? false,
    enableZoom: config.enableZoom ?? true,
    enablePan: config.enablePan ?? true,
    enableCommunityDetection: config.enableCommunityDetection ?? true,
    minZoom: config.minZoom ?? 0.1,
    maxZoom: config.maxZoom ?? 5,
    nodeRadius: config.nodeRadius ?? 8,
    linkDistance: config.linkDistance ?? 100,
    chargeStrength: config.chargeStrength ?? -300,
    centerStrength: config.centerStrength ?? 0.1,
  });

  let canvas: HTMLCanvasElement;
  let container: HTMLElement;
  let simNodes: SimNode[] = [];
  let animFrame = 0;
  let simulationRunning = false;
  let alpha = 1.0; // cooling factor — decays each frame
  const ALPHA_DECAY = 0.98;
  const ALPHA_MIN = 0.001;
  const VELOCITY_DAMPING = 0.82;
  const MAX_VELOCITY = 15;

  let transform = $state({ x: 0, y: 0, scale: 1 });
  let searchQuery = $state("");
  let hoveredNode = $state<SimNode | null>(null);
  let selectedNode = $state<SimNode | null>(null);
  let showCommunities = $state(true);
  let draggingNode: SimNode | null = null;
  let isPanning = false;
  let lastMouse = { x: 0, y: 0 };
  let canvasWidth = 0;
  let canvasHeight = 0;

  // adjacency for quick lookup
  let adjacency: Map<string, string[]> = new Map();

  function buildAdjacency() {
    adjacency.clear();
    for (const e of edges) {
      if (!adjacency.has(e.source)) adjacency.set(e.source, []);
      if (!adjacency.has(e.target)) adjacency.set(e.target, []);
      adjacency.get(e.source)!.push(e.target);
      adjacency.get(e.target)!.push(e.source);
    }
  }

  function labelPropagation(): Map<string, string> {
    const communities = new Map<string, string>();
    for (const n of simNodes) communities.set(n.id, n.id);

    for (let iter = 0; iter < 20; iter++) {
      let changed = false;
      const shuffled = [...simNodes].sort(() => Math.random() - 0.5);

      for (const node of shuffled) {
        const neighbors = adjacency.get(node.id) || [];
        if (neighbors.length === 0) continue;

        const freq = new Map<string, number>();
        for (const nid of neighbors) {
          const c = communities.get(nid)!;
          freq.set(c, (freq.get(c) || 0) + 1);
        }

        let maxCount = 0;
        let bestCommunity = communities.get(node.id)!;
        for (const [c, count] of freq) {
          if (count > maxCount) {
            maxCount = count;
            bestCommunity = c;
          }
        }

        if (communities.get(node.id) !== bestCommunity) {
          communities.set(node.id, bestCommunity);
          changed = true;
        }
      }
      if (!changed) break;
    }
    return communities;
  }

  function assignCommunityColors() {
    const COMMUNITY_COLORS = getCommunityColors();
    const brandDefault = getCSSVar('--color-action-brand-default') || "#00ff41";
    if (!cfg.enableCommunityDetection || !showCommunities) {
      for (const n of simNodes) {
        n.communityColor = n.color || brandDefault;
      }
      return;
    }

    const communities = labelPropagation();
    const uniqueCommunities = [...new Set(communities.values())];

    for (const n of simNodes) {
      const c = communities.get(n.id)!;
      const idx = uniqueCommunities.indexOf(c);
      n.community = c;
      n.communityColor = n.color || COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length];
    }
  }

  let initCount = 0;

  function initSimulation() {
    initCount++;
    const myInit = initCount;

    buildAdjacency();

    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;

    simNodes = nodes.map((n, i) => ({
      ...n,
      x: n.x ?? cx + (Math.random() - 0.5) * canvasWidth * 0.5,
      y: n.y ?? cy + (Math.random() - 0.5) * canvasHeight * 0.5,
      vx: 0,
      vy: 0,
    }));

    assignCommunityColors();
    alpha = 1.0;
    simulationRunning = true;
    cancelAnimationFrame(animFrame);

    // Guard: if another initSimulation was called while we were setting up, abort
    function guardedRun() {
      if (myInit !== initCount) return; // superseded by newer init
      runSimulation();
    }
    guardedRun();
  }

  function runSimulation() {
    if (!simulationRunning) return;

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const strength = cfg.chargeStrength;
    const linkDist = cfg.linkDistance;
    const centerStr = cfg.centerStrength;

    // Apply alpha cooling — all forces scaled by alpha
    alpha *= ALPHA_DECAY;

    // repulsion between all node pairs (scaled by alpha)
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const a = simNodes[i];
        const b = simNodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let force = (strength / (dist * dist)) * alpha;
        let fx = (dx / dist) * force;
        let fy = (dy / dist) * force;
        if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
        if (!b.pinned) { b.vx += fx; b.vy += fy; }
      }
    }

    // attraction along edges (scaled by alpha)
    for (const e of edges) {
      const a = nodeMap.get(e.source);
      const b = nodeMap.get(e.target);
      if (!a || !b) continue;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = (dist - linkDist) * 0.1 * alpha;
      let fx = (dx / dist) * force;
      let fy = (dy / dist) * force;
      if (!a.pinned) { a.vx += fx; a.vy += fy; }
      if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
    }

    // center gravity + velocity update with damping and capping
    for (const n of simNodes) {
      if (n.pinned) continue;
      n.vx += (cx - n.x) * centerStr * alpha;
      n.vy += (cy - n.y) * centerStr * alpha;
      n.vx *= VELOCITY_DAMPING;
      n.vy *= VELOCITY_DAMPING;
      // Cap velocity to prevent wild oscillations
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > MAX_VELOCITY) {
        n.vx = (n.vx / speed) * MAX_VELOCITY;
        n.vy = (n.vy / speed) * MAX_VELOCITY;
      }
      n.x += n.vx;
      n.y += n.vy;
    }

    render();

    // Stop when alpha is exhausted (simulation has cooled)
    if (alpha < ALPHA_MIN && !draggingNode) {
      simulationRunning = false;
      render(); // final render
      return;
    }

    animFrame = requestAnimationFrame(runSimulation);
  }

  function render() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = getCSSVar('--color-bg-primary') || "#0a0a0f";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
    const matchActive = searchQuery.length > 0;
    const matchSet = new Set<string>();
    if (matchActive) {
      const q = searchQuery.toLowerCase();
      for (const n of simNodes) {
        if (n.label.toLowerCase().includes(q)) matchSet.add(n.id);
      }
    }

    // edges
    for (const e of edges) {
      const a = nodeMap.get(e.source);
      const b = nodeMap.get(e.target);
      if (!a || !b) continue;

      const dimmed = matchActive && !matchSet.has(e.source) && !matchSet.has(e.target);
      const weight = e.weight ?? 1;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      const edgeDimmed = getCSSVar('--color-surface-active') || "rgba(58, 58, 74, 0.15)";
      const edgeDefault = getCSSVar('--color-border-default') || "rgba(58, 58, 74, 0.6)";
      ctx.strokeStyle = dimmed
        ? edgeDimmed
        : (e.color || edgeDefault);
      ctx.lineWidth = Math.min(weight * 1.5, 6);
      ctx.stroke();

      if (cfg.showEdgeLabels && e.label && !dimmed) {
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        ctx.font = "10px Inter, sans-serif";
        ctx.fillStyle = getCSSVar('--color-text-tertiary') || "rgba(255,255,255,0.5)";
        ctx.textAlign = "center";
        ctx.fillText(e.label, mx, my - 4);
      }
    }

    // nodes
    for (const n of simNodes) {
      const dimmed = matchActive && !matchSet.has(n.id);
      const isSelected = n.id === selectedNodeId;
      const isHovered = hoveredNode?.id === n.id;
      const radius = (n.size || cfg.nodeRadius) * (isHovered ? 1.3 : 1);
      const brandColor = getCSSVar('--color-action-brand-default') || "#00ff41";
      const color = (showCommunities && cfg.enableCommunityDetection)
        ? (n.communityColor || brandColor)
        : (n.color || brandColor);

      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);

      if (dimmed) {
        ctx.fillStyle = getCSSVar('--color-surface-active') || "rgba(58, 58, 74, 0.3)";
        ctx.fill();
        continue;
      }

      // glow
      ctx.shadowColor = color;
      ctx.shadowBlur = isSelected ? 20 : isHovered ? 14 : 8;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // stroke
      ctx.strokeStyle = isSelected ? (getCSSVar('--color-text-primary') || "#ffffff") : (getCSSVar('--color-border-default') || "rgba(255,255,255,0.2)");
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.stroke();

      // label
      if (cfg.showLabels) {
        const fontSize = Math.max(10, 12 / transform.scale);
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.strokeStyle = getCSSVar('--color-bg-primary') || "rgba(0,0,0,0.8)";
        ctx.lineWidth = 3;
        ctx.strokeText(n.label, n.x, n.y + radius + fontSize + 2);
        ctx.fillStyle = dimmed ? (getCSSVar('--color-text-tertiary') || "rgba(255,255,255,0.2)") : (getCSSVar('--color-text-primary') || "rgba(255,255,255,0.9)");
        ctx.fillText(n.label, n.x, n.y + radius + fontSize + 2);
      }
    }

    ctx.restore();

    // tooltip for hovered node
    if (hoveredNode && !draggingNode) {
      const sx = hoveredNode.x * transform.scale + transform.x;
      const sy = hoveredNode.y * transform.scale + transform.y;
      const connections = (adjacency.get(hoveredNode.id) || []).length;

      ctx.save();
      const tooltipW = 180;
      const tooltipH = 48;
      let tx = sx + 16;
      let ty = sy - 16;
      if (tx + tooltipW > canvasWidth) tx = sx - tooltipW - 16;
      if (ty + tooltipH > canvasHeight) ty = sy - tooltipH - 16;
      if (ty < 0) ty = 4;

      ctx.fillStyle = getCSSVar('--color-surface-default') || "rgba(18, 18, 26, 0.95)";
      ctx.strokeStyle = getCSSVar('--color-action-secondary-border') || "rgba(0, 212, 255, 0.3)";
      ctx.lineWidth = 1;
      roundRect(ctx, tx, ty, tooltipW, tooltipH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillStyle = getCSSVar('--color-text-primary') || "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(hoveredNode.label, tx + 10, ty + 18);
      ctx.font = "11px Inter, sans-serif";
      ctx.fillStyle = getCSSVar('--color-text-secondary') || "rgba(255,255,255,0.6)";
      ctx.fillText(`${connections} connection${connections !== 1 ? "s" : ""} · ${hoveredNode.group || "ungrouped"}`, tx + 10, ty + 36);
      ctx.restore();
    }
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function screenToWorld(sx: number, sy: number) {
    return {
      x: (sx - transform.x) / transform.scale,
      y: (sy - transform.y) / transform.scale,
    };
  }

  function getNodeAt(wx: number, wy: number): SimNode | null {
    for (let i = simNodes.length - 1; i >= 0; i--) {
      const n = simNodes[i];
      const r = (n.size || cfg.nodeRadius) + 4;
      const dx = n.x - wx;
      const dy = n.y - wy;
      if (dx * dx + dy * dy <= r * r) return n;
    }
    return null;
  }

  function getCanvasCoords(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleMouseDown(e: MouseEvent) {
    const { x, y } = getCanvasCoords(e);
    const world = screenToWorld(x, y);
    const node = getNodeAt(world.x, world.y);

    if (node) {
      draggingNode = node;
      node.pinned = true;
      canvas.style.cursor = "grabbing";
    } else if (cfg.enablePan) {
      isPanning = true;
    }
    lastMouse = { x, y };
  }

  function handleMouseMove(e: MouseEvent) {
    const { x, y } = getCanvasCoords(e);

    if (draggingNode) {
      // Move the dragged node directly — just re-render, no physics
      const world = screenToWorld(x, y);
      draggingNode.x = world.x;
      draggingNode.y = world.y;
      render();
    } else if (isPanning) {
      const dx = x - lastMouse.x;
      const dy = y - lastMouse.y;
      transform = { ...transform, x: transform.x + dx, y: transform.y + dy };
      render();
    } else {
      // Hover detection — just re-render to show tooltip, no simulation
      const world = screenToWorld(x, y);
      const node = getNodeAt(world.x, world.y);
      if (node !== hoveredNode) {
        hoveredNode = node;
        onnodehover?.(node);
        canvas.style.cursor = node ? "grab" : "default";
        render();
      }
    }
    lastMouse = { x, y };
  }

  function handleMouseUp(e: MouseEvent) {
    if (draggingNode) {
      draggingNode.pinned = false;
      // Gentle settle — very low alpha so neighbors adjust slightly
      alpha = 0.05;
      draggingNode = null;
      canvas.style.cursor = "default";
      if (!simulationRunning) {
        simulationRunning = true;
        runSimulation();
      }
    }
    if (!isPanning) {
      const { x, y } = getCanvasCoords(e);
      const world = screenToWorld(x, y);
      const node = getNodeAt(world.x, world.y);
      if (node) {
        selectedNodeId = node.id;
        selectedNode = node;
        onnodeclick?.(node);
      } else {
        selectedNodeId = null;
        selectedNode = null;
      }
      if (!simulationRunning) render();
    }
    isPanning = false;
  }

  function handleWheel(e: WheelEvent) {
    if (!cfg.enableZoom) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(cfg.maxZoom, Math.max(cfg.minZoom, transform.scale * delta));
    const ratio = newScale / transform.scale;
    transform = {
      x: x - (x - transform.x) * ratio,
      y: y - (y - transform.y) * ratio,
      scale: newScale,
    };
    if (!simulationRunning) render();
  }

  function fitToScreen() {
    if (simNodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of simNodes) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x);
      maxY = Math.max(maxY, n.y);
    }
    const padding = 60;
    const gw = maxX - minX || 1;
    const gh = maxY - minY || 1;
    const scale = Math.min(
      (canvasWidth - padding * 2) / gw,
      (canvasHeight - padding * 2) / gh,
      cfg.maxZoom
    );
    transform = {
      scale,
      x: canvasWidth / 2 - ((minX + maxX) / 2) * scale,
      y: canvasHeight / 2 - ((minY + maxY) / 2) * scale,
    };
    if (!simulationRunning) render();
  }

  function zoomIn() {
    const newScale = Math.min(cfg.maxZoom, transform.scale * 1.3);
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const ratio = newScale / transform.scale;
    transform = {
      x: cx - (cx - transform.x) * ratio,
      y: cy - (cy - transform.y) * ratio,
      scale: newScale,
    };
    if (!simulationRunning) render();
  }

  function zoomOut() {
    const newScale = Math.max(cfg.minZoom, transform.scale / 1.3);
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const ratio = newScale / transform.scale;
    transform = {
      x: cx - (cx - transform.x) * ratio,
      y: cy - (cy - transform.y) * ratio,
      scale: newScale,
    };
    if (!simulationRunning) render();
  }

  function toggleCommunities() {
    showCommunities = !showCommunities;
    assignCommunityColors();
    if (!simulationRunning) render();
  }

  function resetLayout() {
    transform = { x: 0, y: 0, scale: 1 };
    initSimulation();
  }

  function handleSearch(e: Event) {
    const input = e.target as HTMLInputElement;
    searchQuery = input.value;
    onsearch?.(searchQuery);
    if (!simulationRunning) render();
  }

  function resizeCanvas() {
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";
    if (!simulationRunning) render();
  }

  let resizeObserver: ResizeObserver;

  let mounted = false;

  onMount(() => {
    resizeCanvas();
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
    mounted = true;
    // initSimulation is triggered by the $effect below
  });

  onDestroy(() => {
    simulationRunning = false;
    cancelAnimationFrame(animFrame);
    resizeObserver?.disconnect();
    mounted = false;
  });

  // Init/re-init ONLY when nodes/edges data actually changes
  let lastNodesRef: any = null;
  let lastEdgesRef: any = null;
  $effect(() => {
    // Read the reactive props to create dependency
    const n = nodes;
    const e = edges;
    // Only re-init if the reference actually changed (new data passed in)
    untrack(() => {
      if (n === lastNodesRef && e === lastEdgesRef) return;
      lastNodesRef = n;
      lastEdgesRef = e;
      if (mounted && canvas && canvasWidth > 0) {
        initSimulation();
      }
    });
  });

  // sync selectedNode from external selectedNodeId changes
  $effect(() => {
    if (selectedNodeId) {
      const found = simNodes.find((n) => n.id === selectedNodeId);
      if (found) selectedNode = found;
    } else {
      selectedNode = null;
    }
  });

  let selectedConnections = $derived.by(() => {
    if (!selectedNode) return [];
    const neighbors = adjacency.get(selectedNode.id) || [];
    return neighbors
      .map((id) => simNodes.find((n) => n.id === id))
      .filter(Boolean)
      .slice(0, 5);
  });

  let zoomPercent = $derived(Math.round(transform.scale * 100));
</script>

<div
  class="cy-graph"
  style="width: {width}; height: {height};"
  bind:this={container}
>
  <div class="cy-graph__toolbar">
    <button class="cy-graph__toolbar-btn" onclick={zoomIn} title="Zoom in">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <button class="cy-graph__toolbar-btn" onclick={zoomOut} title="Zoom out">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <button class="cy-graph__toolbar-btn" onclick={fitToScreen} title="Fit to screen">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button
      class="cy-graph__toolbar-btn"
      class:cy-graph__toolbar-btn--active={showCommunities}
      onclick={toggleCommunities}
      title="Toggle communities"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.2"/>
        <circle cx="11" cy="5" r="2.5" stroke="currentColor" stroke-width="1.2"/>
        <circle cx="8" cy="11" r="2.5" stroke="currentColor" stroke-width="1.2"/>
      </svg>
    </button>
    <button class="cy-graph__toolbar-btn" onclick={resetLayout} title="Reset layout">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8a6 6 0 0 1 10.3-4.1M14 2v4h-4M14 8a6 6 0 0 1-10.3 4.1M2 14v-4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>

  <div class="cy-graph__search">
    <svg class="cy-graph__search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <input
      type="text"
      class="cy-graph__search-input"
      placeholder="Search nodes..."
      value={searchQuery}
      oninput={handleSearch}
    />
  </div>

  <canvas
    bind:this={canvas}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={() => {
      if (draggingNode) { draggingNode.pinned = false; }
      isPanning = false;
      draggingNode = null;
      hoveredNode = null;
      canvas.style.cursor = "default";
      render();
    }}
    onwheel={handleWheel}
  ></canvas>

  {#if selectedNode}
    <div class="cy-graph__info-panel">
      <div class="cy-graph__info-header">
        <span
          class="cy-graph__info-dot"
          style="background: {selectedNode.communityColor || 'var(--color-action-brand-default)'};"
        ></span>
        <span class="cy-graph__info-label">{selectedNode.label}</span>
      </div>
      <div class="cy-graph__info-row">
        <span class="cy-graph__info-key">Group</span>
        <span class="cy-graph__info-value">{selectedNode.group || "—"}</span>
      </div>
      <div class="cy-graph__info-row">
        <span class="cy-graph__info-key">Connections</span>
        <span class="cy-graph__info-value">{(adjacency.get(selectedNode.id) || []).length}</span>
      </div>
      {#if selectedConnections.length > 0}
        <div class="cy-graph__info-row cy-graph__info-row--col">
          <span class="cy-graph__info-key">Connected to</span>
          <div class="cy-graph__info-connections">
            {#each selectedConnections as conn}
              <span class="cy-graph__info-chip">{conn?.label}</span>
            {/each}
          </div>
        </div>
      {/if}
      {#if selectedNode.metadata}
        <div class="cy-graph__info-meta">
          {#each Object.entries(selectedNode.metadata) as [key, value]}
            <div class="cy-graph__info-row">
              <span class="cy-graph__info-key">{key}</span>
              <span class="cy-graph__info-value cy-graph__info-value--mono">{value}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <div class="cy-graph__zoom-indicator">{zoomPercent}%</div>
</div>

<style>
  .cy-graph {
    position: relative;
    background: var(--color-bg-primary);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--color-border-subtle);
  }

  .cy-graph canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* Toolbar */
  .cy-graph__toolbar {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 10;
  }

  .cy-graph__toolbar-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all 0.15s ease;
    padding: 0;
  }

  .cy-graph__toolbar-btn:hover {
    background: var(--color-surface-raised);
    color: var(--color-action-secondary-default);
    border-color: var(--color-action-secondary-border);
  }

  .cy-graph__toolbar-btn--active {
    color: var(--color-action-brand-default);
    border-color: var(--color-action-brand-border);
  }

  /* Search */
  .cy-graph__search {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
    padding: 0 10px;
    transition: border-color 0.15s ease;
  }

  .cy-graph__search:focus-within {
    border-color: var(--color-action-secondary-border);
  }

  .cy-graph__search-icon {
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .cy-graph__search-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-family: Inter, system-ui, sans-serif;
    font-size: 13px;
    padding: 8px 0;
    width: 180px;
  }

  .cy-graph__search-input::placeholder {
    color: var(--color-text-tertiary);
  }

  /* Info Panel */
  .cy-graph__info-panel {
    position: absolute;
    bottom: 12px;
    right: 12px;
    z-index: 10;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: 8px;
    padding: 14px;
    min-width: 220px;
    max-width: 280px;
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(12px);
  }

  .cy-graph__info-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-graph__info-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cy-graph__info-label {
    font-family: Inter, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cy-graph__info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 0;
  }

  .cy-graph__info-row--col {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .cy-graph__info-key {
    font-family: Inter, system-ui, sans-serif;
    font-size: 11px;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cy-graph__info-value {
    font-family: Inter, system-ui, sans-serif;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .cy-graph__info-value--mono {
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 12px;
  }

  .cy-graph__info-connections {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .cy-graph__info-chip {
    font-family: Inter, system-ui, sans-serif;
    font-size: 11px;
    color: var(--color-text-secondary);
    background: var(--color-surface-hover);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .cy-graph__info-meta {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--color-border-subtle);
  }

  /* Zoom Indicator */
  .cy-graph__zoom-indicator {
    position: absolute;
    bottom: 12px;
    left: 12px;
    z-index: 10;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 11px;
    color: var(--color-text-tertiary);
    background: var(--color-surface-default);
    padding: 4px 8px;
    border-radius: 4px;
  }
</style>

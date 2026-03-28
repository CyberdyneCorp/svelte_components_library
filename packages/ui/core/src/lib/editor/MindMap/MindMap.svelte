<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";

  type MindMapNode = {
    id: string;
    label: string;
    children?: MindMapNode[];
    collapsed?: boolean;
    color?: string;
  };

  type LayoutNode = {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    collapsed: boolean;
    color?: string;
    hasChildren: boolean;
    parentId: string | null;
    ref: MindMapNode;
  };

  let {
    root = $bindable({ id: "root", label: "Central Idea", children: [] }),
    width = "100%",
    height = "600px",
    readonly = false,
    onchange,
    onexport,
  }: {
    root?: MindMapNode;
    width?: string;
    height?: string;
    readonly?: boolean;
    onchange?: (root: MindMapNode) => void;
    onexport?: (markdown: string) => void;
  } = $props();

  let canvas: HTMLCanvasElement;
  let container: HTMLElement;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let transform = $state({ x: 0, y: 0, scale: 1 });
  let layoutNodes: LayoutNode[] = [];
  let selectedNodeId = $state<string | null>(null);
  let editingNodeId = $state<string | null>(null);
  let editValue = $state("");
  let editPos = $state({ x: 0, y: 0, w: 0, h: 0 });
  let contextMenu = $state<{ x: number; y: number; nodeId: string; showColorSub: boolean } | null>(null);
  type DropZone = {
    targetId: string;
    position: "before" | "after" | "child"; // insert before/after sibling, or as child
    x: number; // for visual indicator
    y: number;
    width: number;
  };

  let dragState = $state<{ nodeId: string; startX: number; startY: number; dragging: boolean; worldX: number; worldY: number } | null>(null);
  let fadeGhost = $state<{ worldX: number; worldY: number; width: number; height: number; label: string; opacity: number } | null>(null);
  let fadeAnimFrame = 0;
  let dropTargetId = $state<string | null>(null);
  let dropZone = $state<DropZone | null>(null);
  let isPanning = false;
  let lastMouse = { x: 0, y: 0 };
  let editInput = $state<HTMLInputElement | null>(null);
  let mounted = false;

  // CSS variable cache
  let cssCache: Record<string, string> = {};

  function refreshCSSCache() {
    const s = getComputedStyle(document.documentElement);
    cssCache = {
      bgPrimary: s.getPropertyValue("--color-bg-primary").trim() || "#0a0a0f",
      bgElevated: s.getPropertyValue("--color-bg-elevated").trim() || "#22222e",
      surfaceDefault: s.getPropertyValue("--color-surface-default").trim() || "#16161e",
      surfaceRaised: s.getPropertyValue("--color-surface-raised").trim() || "#1e1e2a",
      surfaceHover: s.getPropertyValue("--color-surface-hover").trim() || "#2a2a3a",
      borderDefault: s.getPropertyValue("--color-border-default").trim() || "rgba(58,58,74,0.6)",
      borderSubtle: s.getPropertyValue("--color-border-subtle").trim() || "#22222e",
      textPrimary: s.getPropertyValue("--color-text-primary").trim() || "#f0f0ff",
      textSecondary: s.getPropertyValue("--color-text-secondary").trim() || "#aaaabe",
      textTertiary: s.getPropertyValue("--color-text-tertiary").trim() || "rgba(255,255,255,0.5)",
      brandDefault: s.getPropertyValue("--color-action-brand-default").trim() || "#00ff41",
      brandBorder: s.getPropertyValue("--color-action-brand-border").trim() || "#00cc33",
      secondaryDefault: s.getPropertyValue("--color-action-secondary-default").trim() || "#00d4ff",
      secondaryBorder: s.getPropertyValue("--color-action-secondary-border").trim() || "#00a8cc",
      stateError: s.getPropertyValue("--color-state-error").trim() || "#ff4444",
      stateWarning: s.getPropertyValue("--color-state-warning").trim() || "#ffb800",
      stateSuccess: s.getPropertyValue("--color-state-success").trim() || "#00cc99",
    };
  }

  const COLOR_PALETTE = [
    "brand", "secondary", "error", "warning", "success", "purple",
  ];

  function getColorValue(colorKey: string): string {
    switch (colorKey) {
      case "brand": return cssCache.brandDefault;
      case "secondary": return cssCache.secondaryDefault;
      case "error": return cssCache.stateError;
      case "warning": return cssCache.stateWarning;
      case "success": return cssCache.stateSuccess;
      case "purple": return "#a855f7";
      default: return cssCache.brandDefault;
    }
  }

  // --- Deep clone helper ---
  function cloneTree(node: MindMapNode): MindMapNode {
    return {
      ...node,
      children: node.children?.map(cloneTree),
    };
  }

  // --- Tree traversal helpers ---
  function findNode(tree: MindMapNode, id: string): MindMapNode | null {
    if (tree.id === id) return tree;
    for (const child of tree.children || []) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  }

  function getDropZone(worldX: number, worldY: number, dragNodeId: string): DropZone | null {
    // Find the closest node and determine if we're above, below, or on it
    let best: DropZone | null = null;
    let bestDist = Infinity;

    for (const layoutNode of layoutNodes) {
      const id = layoutNode.id;
      if (id === dragNodeId) continue;

      const nx = layoutNode.x;
      const ny = layoutNode.y;
      const nw = layoutNode.width;
      const nh = layoutNode.height;

      // Check if cursor is near this node
      const dx = worldX - nx;
      const dy = worldY - ny;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 150) continue; // too far

      // Determine zone: top third = before, bottom third = after, center = child
      const relY = worldY - (ny - nh / 2);
      const thirdH = nh / 3;

      let position: "before" | "after" | "child";
      let indicatorY: number;

      if (relY < thirdH) {
        position = "before";
        indicatorY = ny - nh / 2 - 2;
      } else if (relY > thirdH * 2) {
        position = "after";
        indicatorY = ny + nh / 2 + 2;
      } else {
        position = "child";
        indicatorY = ny;
      }

      // Don't allow dropping as child of root from drag — use side detection instead
      // Don't allow making a node its own ancestor
      const srcNode = findNode(root, dragNodeId);
      if (srcNode && isDescendant(srcNode, id)) continue;

      if (dist < bestDist) {
        bestDist = dist;
        best = { targetId: id, position, x: nx, y: indicatorY, width: nw };
      }
    }

    // Special: if dragging near the root on the opposite side, allow side switch
    if (best && best.targetId === root.id) {
      best.position = "child"; // dropping on root always means add as child
    }

    return best;
  }

  function findParent(tree: MindMapNode, id: string): MindMapNode | null {
    for (const child of tree.children || []) {
      if (child.id === id) return tree;
      const found = findParent(child, id);
      if (found) return found;
    }
    return null;
  }

  function removeNode(tree: MindMapNode, id: string): boolean {
    if (!tree.children) return false;
    const idx = tree.children.findIndex((c) => c.id === id);
    if (idx >= 0) {
      tree.children.splice(idx, 1);
      return true;
    }
    for (const child of tree.children) {
      if (removeNode(child, id)) return true;
    }
    return false;
  }

  function generateId(): string {
    return "n" + Math.random().toString(36).slice(2, 9);
  }

  function notifyChange() {
    root = cloneTree(root);
    onchange?.(root);
    recalcLayout();
    render();
  }

  // --- Layout calculation ---
  function getSubtreeSize(node: MindMapNode): number {
    if (!node.children || node.children.length === 0 || node.collapsed) return 1;
    let total = 0;
    for (const child of node.children) {
      total += getSubtreeSize(child);
    }
    return Math.max(total, 1);
  }

  function getNodeDimensions(depth: number): { w: number; h: number } {
    if (depth === 0) return { w: 160, h: 44 };
    if (depth === 1) return { w: 140, h: 38 };
    return { w: 130, h: 34 };
  }

  const H_GAP = 180;
  const V_GAP = 40;

  function computeLayout() {
    layoutNodes = [];
    if (!root) return;

    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const { w, h } = getNodeDimensions(0);

    layoutNodes.push({
      id: root.id,
      label: root.label,
      x: cx,
      y: cy,
      width: w,
      height: h,
      depth: 0,
      collapsed: root.collapsed ?? false,
      color: root.color,
      hasChildren: (root.children?.length ?? 0) > 0,
      parentId: null,
      ref: root,
    });

    if (!root.children || root.children.length === 0 || root.collapsed) return;

    // Split children into left and right sides
    const children = root.children;
    const half = Math.ceil(children.length / 2);
    const rightChildren = children.slice(0, half);
    const leftChildren = children.slice(half);

    // Layout right side
    layoutSide(rightChildren, root.id, cx + w / 2, cy, 1, 1);
    // Layout left side
    layoutSide(leftChildren, root.id, cx - w / 2, cy, 1, -1);
  }

  function layoutSide(
    children: MindMapNode[],
    parentId: string,
    startX: number,
    centerY: number,
    depth: number,
    direction: number, // 1 = right, -1 = left
  ) {
    if (children.length === 0) return;

    const totalSize = children.reduce((sum, c) => sum + getSubtreeSize(c), 0);
    const totalHeight = totalSize * V_GAP;
    let currentY = centerY - totalHeight / 2;

    for (const child of children) {
      const subtreeSize = getSubtreeSize(child);
      const subtreeHeight = subtreeSize * V_GAP;
      const nodeY = currentY + subtreeHeight / 2;
      const { w, h } = getNodeDimensions(depth);
      const nodeX = startX + direction * H_GAP;

      layoutNodes.push({
        id: child.id,
        label: child.label,
        x: nodeX,
        y: nodeY,
        width: w,
        height: h,
        depth,
        collapsed: child.collapsed ?? false,
        color: child.color,
        hasChildren: (child.children?.length ?? 0) > 0,
        parentId,
        ref: child,
      });

      if (child.children && child.children.length > 0 && !child.collapsed) {
        const childStartX = direction > 0 ? nodeX + w / 2 : nodeX - w / 2;
        layoutSide(child.children, child.id, childStartX, nodeY, depth + 1, direction);
      }

      currentY += subtreeHeight;
    }
  }

  function recalcLayout() {
    computeLayout();
  }

  // --- Canvas rendering ---
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number,
  ) {
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

  function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 0 && ctx.measureText(t + "...").width > maxWidth) {
      t = t.slice(0, -1);
    }
    return t + "...";
  }

  function render() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = cssCache.bgPrimary;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // Draw connections first
    for (const node of layoutNodes) {
      if (!node.parentId) continue;
      const parent = layoutNodes.find((n) => n.id === node.parentId);
      if (!parent) continue;

      const direction = node.x > parent.x ? 1 : -1;
      const startX = parent.x + (direction * parent.width) / 2;
      const startY = parent.y;
      const endX = node.x - (direction * node.width) / 2;
      const endY = node.y;
      const cpOffset = Math.abs(endX - startX) * 0.5;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + direction * cpOffset, startY,
        endX - direction * cpOffset, endY,
        endX, endY,
      );
      ctx.strokeStyle = node.color ? getColorValue(node.color) : cssCache.borderDefault;
      ctx.lineWidth = Math.max(1.5, 2.5 - node.depth * 0.4);
      ctx.stroke();
    }

    // Draw nodes
    for (const node of layoutNodes) {
      const nx = node.x - node.width / 2;
      const ny = node.y - node.height / 2;
      const isSelected = node.id === selectedNodeId;
      const isDropTarget = node.id === dropTargetId;
      const isBeingDragged = dragState?.dragging && dragState.nodeId === node.id;

      // Dim the original node while it's being dragged
      if (isBeingDragged) {
        ctx.globalAlpha = 0.25;
      }

      // Node background
      if (node.depth === 0) {
        // Root node
        ctx.fillStyle = node.color ? getColorValue(node.color) : cssCache.brandDefault;
        roundRect(ctx, nx, ny, node.width, node.height, 10);
        ctx.fill();
      } else if (node.depth === 1) {
        // Level 1
        ctx.fillStyle = cssCache.surfaceRaised;
        roundRect(ctx, nx, ny, node.width, node.height, 8);
        ctx.fill();
        // Colored left border
        const borderColor = node.color ? getColorValue(node.color) : cssCache.secondaryDefault;
        ctx.fillStyle = borderColor;
        roundRect(ctx, nx, ny, 4, node.height, 2);
        ctx.fill();
      } else {
        // Level 2+
        ctx.fillStyle = cssCache.surfaceDefault;
        roundRect(ctx, nx, ny, node.width, node.height, 6);
        ctx.fill();
        ctx.strokeStyle = cssCache.borderDefault;
        ctx.lineWidth = 1;
        roundRect(ctx, nx, ny, node.width, node.height, 6);
        ctx.stroke();
      }

      // Selected highlight
      if (isSelected) {
        ctx.strokeStyle = cssCache.brandDefault;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = cssCache.brandDefault;
        ctx.shadowBlur = 12;
        roundRect(ctx, nx - 1, ny - 1, node.width + 2, node.height + 2, node.depth === 0 ? 11 : 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Drop target indicator
      if (isDropTarget && dropZone) {
        if (dropZone.position === "child") {
          // Highlight the whole node (adding as child)
          ctx.strokeStyle = cssCache.stateSuccess;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          roundRect(ctx, nx - 3, ny - 3, node.width + 6, node.height + 6, 10);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Draw a horizontal insertion line (before or after)
          const lineY = dropZone.position === "before"
            ? ny - 2
            : ny + node.height + 2;
          ctx.strokeStyle = cssCache.stateSuccess;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(nx, lineY);
          ctx.lineTo(nx + node.width, lineY);
          ctx.stroke();
          // Small circle at the start of the line
          ctx.fillStyle = cssCache.stateSuccess;
          ctx.beginPath();
          ctx.arc(nx, lineY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Text
      const fontSize = node.depth === 0 ? 14 : node.depth === 1 ? 13 : 12;
      ctx.font = `${node.depth === 0 ? "600" : "400"} ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = node.depth === 0 ? cssCache.bgPrimary : cssCache.textPrimary;
      const maxTextW = node.width - (node.depth === 1 ? 20 : 16);
      const displayText = truncateText(ctx, node.label, maxTextW);
      ctx.fillText(displayText, node.x, node.y);

      // Collapse/expand indicator
      if (node.hasChildren && !readonly) {
        const direction = node.x >= canvasWidth / 2 ? 1 : -1;
        const triX = node.x + (direction * node.width) / 2 - direction * 12;
        const triY = node.y;
        const triSize = 5;

        ctx.fillStyle = cssCache.textTertiary;
        ctx.beginPath();
        if (node.collapsed) {
          // Right-pointing triangle
          ctx.moveTo(triX, triY - triSize);
          ctx.lineTo(triX + triSize, triY);
          ctx.lineTo(triX, triY + triSize);
        } else {
          // Down-pointing triangle
          ctx.moveTo(triX - triSize, triY - triSize / 2);
          ctx.lineTo(triX + triSize, triY - triSize / 2);
          ctx.lineTo(triX, triY + triSize / 2);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Reset alpha after drawing a dragged node
      if (isBeingDragged) {
        ctx.globalAlpha = 1.0;
      }
    }

    // --- Ghost node while dragging ---
    if (dragState?.dragging) {
      const dragNode = layoutNodes.find(n => n.id === dragState.nodeId);
      if (dragNode) {
        const gx = dragState.worldX;
        const gy = dragState.worldY;
        const gw = dragNode.width;
        const gh = dragNode.height;

        // Semi-transparent ghost
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = cssCache.brandDefault;
        roundRect(ctx, gx - gw / 2, gy - gh / 2, gw, gh, 8);
        ctx.fill();

        // Ghost label
        ctx.globalAlpha = 0.7;
        const fontSize = dragNode.depth === 0 ? 14 : dragNode.depth === 1 ? 13 : 12;
        ctx.font = `${dragNode.depth === 0 ? "600" : "400"} ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = dragNode.depth === 0 ? cssCache.bgPrimary : cssCache.textPrimary;
        const maxTextW = gw - 16;
        const displayText = truncateText(ctx, dragNode.label, maxTextW);
        ctx.fillText(displayText, gx, gy);

        ctx.globalAlpha = 1.0;

        // Dashed line from ghost to drop target
        if (dropZone) {
          ctx.strokeStyle = cssCache.stateSuccess;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(dropZone.x, dropZone.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // --- Fading ghost (dropped on empty space) ---
    if (fadeGhost) {
      ctx.globalAlpha = fadeGhost.opacity;
      ctx.fillStyle = cssCache.brandDefault;
      roundRect(ctx, fadeGhost.worldX - fadeGhost.width / 2, fadeGhost.worldY - fadeGhost.height / 2, fadeGhost.width, fadeGhost.height, 8);
      ctx.fill();

      const fontSize = 13;
      ctx.font = `400 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = cssCache.bgPrimary;
      ctx.fillText(fadeGhost.label, fadeGhost.worldX, fadeGhost.worldY);

      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  // --- Hit testing ---
  function screenToWorld(sx: number, sy: number) {
    return {
      x: (sx - transform.x) / transform.scale,
      y: (sy - transform.y) / transform.scale,
    };
  }

  function getCanvasCoords(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function getNodeAt(wx: number, wy: number): LayoutNode | null {
    // Add padding to make nodes easier to click (especially at low zoom)
    const pad = 8;
    for (let i = layoutNodes.length - 1; i >= 0; i--) {
      const n = layoutNodes[i];
      const nx = n.x - n.width / 2 - pad;
      const ny = n.y - n.height / 2 - pad;
      if (wx >= nx && wx <= nx + n.width + pad * 2 && wy >= ny && wy <= ny + n.height + pad * 2) {
        return n;
      }
    }
    return null;
  }

  function isCollapseToggle(node: LayoutNode, wx: number, _wy: number): boolean {
    if (!node.hasChildren) return false;
    const direction = node.x >= canvasWidth / 2 ? 1 : -1;
    const triX = node.x + (direction * node.width) / 2 - direction * 12;
    return Math.abs(wx - triX) < 10;
  }

  // --- Interactions ---
  function handleMouseDown(e: MouseEvent) {
    if (contextMenu) {
      contextMenu = null;
      return;
    }
    if (editingNodeId) return;

    const { x, y } = getCanvasCoords(e);
    const world = screenToWorld(x, y);
    const node = getNodeAt(world.x, world.y);

    if (node && !readonly) {
      dragState = { nodeId: node.id, startX: x, startY: y, dragging: false, worldX: world.x, worldY: world.y };
    } else {
      isPanning = true;
    }
    lastMouse = { x, y };
  }

  function handleMouseMove(e: MouseEvent) {
    const { x, y } = getCanvasCoords(e);

    if (dragState && !readonly) {
      const dx = x - dragState.startX;
      const dy = y - dragState.startY;
      if (!dragState.dragging && Math.abs(dx) + Math.abs(dy) > 5) {
        dragState.dragging = true;
      }
      if (dragState.dragging) {
        const world = screenToWorld(x, y);
        dragState.worldX = world.x;
        dragState.worldY = world.y;
        dropZone = getDropZone(world.x, world.y, dragState.nodeId);
        dropTargetId = dropZone?.targetId ?? null;
        canvas.style.cursor = "grabbing";
        render();
      }
    } else if (isPanning) {
      const dx = x - lastMouse.x;
      const dy = y - lastMouse.y;
      transform = { ...transform, x: transform.x + dx, y: transform.y + dy };
      render();
    } else {
      const world = screenToWorld(x, y);
      const node = getNodeAt(world.x, world.y);
      canvas.style.cursor = node ? "pointer" : "default";
    }
    lastMouse = { x, y };
  }

  function handleMouseUp(e: MouseEvent) {
    const { x, y } = getCanvasCoords(e);
    const world = screenToWorld(x, y);

    if (dragState && !readonly) {
      if (dragState.dragging && !dropZone) {
        // Dropped on empty space — fade out the ghost
        const dragNode = layoutNodes.find(n => n.id === dragState.nodeId);
        if (dragNode) {
          fadeGhost = {
            worldX: dragState.worldX,
            worldY: dragState.worldY,
            width: dragNode.width,
            height: dragNode.height,
            label: dragNode.label,
            opacity: 0.5,
          };
          cancelAnimationFrame(fadeAnimFrame);
          function animateFade() {
            if (!fadeGhost || fadeGhost.opacity <= 0.02) {
              fadeGhost = null;
              render();
              return;
            }
            fadeGhost.opacity *= 0.85;
            render();
            fadeAnimFrame = requestAnimationFrame(animateFade);
          }
          animateFade();
        }
      }
      if (dragState.dragging && dropZone) {
        // Reparent with position awareness
        const srcId = dragState.nodeId;
        const targetId = dropZone.targetId;
        const position = dropZone.position;

        if (srcId !== root.id && targetId !== srcId) {
          const srcNode = findNode(root, srcId);
          if (srcNode && !isDescendant(srcNode, targetId)) {
            removeNode(root, srcId);

            if (position === "child") {
              // Add as child of target
              const target = findNode(root, targetId);
              if (target) {
                if (!target.children) target.children = [];
                target.children.push(srcNode);
              }
            } else {
              // Insert before or after the target as a sibling
              const parent = findParent(root, targetId);
              if (parent && parent.children) {
                const idx = parent.children.findIndex(c => c.id === targetId);
                if (idx !== -1) {
                  const insertIdx = position === "before" ? idx : idx + 1;
                  parent.children.splice(insertIdx, 0, srcNode);
                }
              }
            }
            notifyChange();
          }
        }
      } else if (!dragState.dragging) {
        // Click
        const node = getNodeAt(world.x, world.y);
        if (node) {
          if (isCollapseToggle(node, world.x, world.y)) {
            toggleCollapse(node.id);
          } else {
            selectedNodeId = node.id;
            render();
          }
        } else {
          selectedNodeId = null;
          render();
        }
      }
      dropTargetId = null;
      dropZone = null;
      dragState = null;
      canvas.style.cursor = "default";
    }

    isPanning = false;
  }

  function isDescendant(parent: MindMapNode, childId: string): boolean {
    if (parent.id === childId) return true;
    for (const c of parent.children || []) {
      if (isDescendant(c, childId)) return true;
    }
    return false;
  }

  function handleDblClick(e: MouseEvent) {
    if (readonly) return;
    const { x, y } = getCanvasCoords(e);
    const world = screenToWorld(x, y);
    const node = getNodeAt(world.x, world.y);
    if (node) {
      startEditing(node);
    }
  }

  function startEditing(node: LayoutNode) {
    editingNodeId = node.id;
    editValue = node.label;
    // Position the input at the node's screen position
    const sx = node.x * transform.scale + transform.x - (node.width * transform.scale) / 2;
    const sy = node.y * transform.scale + transform.y - (node.height * transform.scale) / 2;
    editPos = {
      x: sx,
      y: sy,
      w: node.width * transform.scale,
      h: node.height * transform.scale,
    };
    // Focus after the input renders
    requestAnimationFrame(() => {
      if (editInput) {
        editInput.focus();
        editInput.select();
      }
    });
  }

  function confirmEdit() {
    if (!editingNodeId) return;
    const node = findNode(root, editingNodeId);
    if (node && editValue.trim()) {
      node.label = editValue.trim();
      notifyChange();
    }
    editingNodeId = null;
  }

  function cancelEdit() {
    editingNodeId = null;
  }

  function handleContextMenu(e: MouseEvent) {
    if (readonly) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const world = screenToWorld(x, y);
    const node = getNodeAt(world.x, world.y);
    if (node) {
      selectedNodeId = node.id;
      contextMenu = { x: e.clientX, y: e.clientY, nodeId: node.id, showColorSub: false };
      render();
    }
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(5, Math.max(0.1, transform.scale * delta));
    const ratio = newScale / transform.scale;
    transform = {
      x: x - (x - transform.x) * ratio,
      y: y - (y - transform.y) * ratio,
      scale: newScale,
    };
    render();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (editingNodeId) return;
    if (readonly) return;
    if (!selectedNodeId) return;

    if (e.key === "Tab") {
      e.preventDefault();
      addChild(selectedNodeId);
    } else if (e.key === "Enter") {
      e.preventDefault();
      addSibling(selectedNodeId);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      deleteNode(selectedNodeId);
    } else if (e.key === "Escape") {
      selectedNodeId = null;
      render();
    }
  }

  // --- Node operations ---
  function addChild(parentId: string) {
    const parent = findNode(root, parentId);
    if (!parent) return;
    if (!parent.children) parent.children = [];
    parent.collapsed = false;
    const newId = generateId();
    parent.children.push({ id: newId, label: "New Node", children: [] });
    selectedNodeId = newId;
    notifyChange();
  }

  function addSibling(nodeId: string) {
    if (nodeId === root.id) return;
    const parent = findParent(root, nodeId);
    if (!parent) return;
    const idx = parent.children!.findIndex((c) => c.id === nodeId);
    const newId = generateId();
    parent.children!.splice(idx + 1, 0, { id: newId, label: "New Node", children: [] });
    selectedNodeId = newId;
    notifyChange();
  }

  function deleteNode(nodeId: string) {
    if (nodeId === root.id) return;
    removeNode(root, nodeId);
    selectedNodeId = null;
    notifyChange();
  }

  function toggleCollapse(nodeId: string) {
    const node = findNode(root, nodeId);
    if (!node) return;
    node.collapsed = !node.collapsed;
    notifyChange();
  }

  function collapseAll() {
    function collapse(node: MindMapNode) {
      if (node.children && node.children.length > 0) {
        node.collapsed = true;
        node.children.forEach(collapse);
      }
    }
    if (root.children) root.children.forEach(collapse);
    notifyChange();
  }

  function expandAll() {
    function expand(node: MindMapNode) {
      node.collapsed = false;
      if (node.children) node.children.forEach(expand);
    }
    expand(root);
    notifyChange();
  }

  function setNodeColor(nodeId: string, color: string) {
    const node = findNode(root, nodeId);
    if (!node) return;
    node.color = color;
    notifyChange();
    contextMenu = null;
  }

  // --- Markdown export ---
  export function getMarkdown(): string {
    return nodeToMarkdown(root, 0);
  }

  function nodeToMarkdown(node: MindMapNode, depth: number): string {
    let lines: string[] = [];

    if (depth === 0) {
      lines.push(`# ${node.label}`);
    } else if (depth === 1) {
      lines.push(`\n## ${node.label}`);
    } else if (depth === 2) {
      lines.push(`### ${node.label}`);
    } else {
      const indent = "  ".repeat(depth - 3);
      lines.push(`${indent}- ${node.label}`);
    }

    if (node.children && !node.collapsed) {
      for (const child of node.children) {
        lines.push(nodeToMarkdown(child, depth + 1));
      }
    }

    return lines.join("\n");
  }

  function handleExport() {
    const md = getMarkdown();
    onexport?.(md);
  }

  // --- Zoom controls ---
  function zoomIn() {
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const newScale = Math.min(5, transform.scale * 1.3);
    const ratio = newScale / transform.scale;
    transform = {
      x: cx - (cx - transform.x) * ratio,
      y: cy - (cy - transform.y) * ratio,
      scale: newScale,
    };
    render();
  }

  function zoomOut() {
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const newScale = Math.max(0.1, transform.scale / 1.3);
    const ratio = newScale / transform.scale;
    transform = {
      x: cx - (cx - transform.x) * ratio,
      y: cy - (cy - transform.y) * ratio,
      scale: newScale,
    };
    render();
  }

  function fitToScreen() {
    if (layoutNodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of layoutNodes) {
      minX = Math.min(minX, n.x - n.width / 2);
      minY = Math.min(minY, n.y - n.height / 2);
      maxX = Math.max(maxX, n.x + n.width / 2);
      maxY = Math.max(maxY, n.y + n.height / 2);
    }
    const padding = 60;
    const gw = maxX - minX || 1;
    const gh = maxY - minY || 1;
    const scale = Math.min(
      (canvasWidth - padding * 2) / gw,
      (canvasHeight - padding * 2) / gh,
      3,
    );
    transform = {
      scale,
      x: canvasWidth / 2 - ((minX + maxX) / 2) * scale,
      y: canvasHeight / 2 - ((minY + maxY) / 2) * scale,
    };
    render();
  }

  // --- Canvas sizing ---
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
  }

  let resizeObserver: ResizeObserver;

  onMount(() => {
    refreshCSSCache();
    resizeCanvas();
    computeLayout();
    fitToScreen();
    resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      recalcLayout();
      render();
    });
    resizeObserver.observe(container);
    mounted = true;
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
    mounted = false;
  });

  // Re-layout when root changes externally
  let lastRootRef: any = null;
  $effect(() => {
    const r = root;
    untrack(() => {
      if (r === lastRootRef) return;
      lastRootRef = r;
      if (mounted && canvas && canvasWidth > 0) {
        refreshCSSCache();
        recalcLayout();
        render();
      }
    });
  });

  function handleContainerKeydown(e: KeyboardEvent) {
    handleKeydown(e);
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  let zoomPercent = $derived(Math.round(transform.scale * 100));
</script>

<svelte:window onclick={closeContextMenu} onkeydown={(e) => { if (e.key === "Escape") closeContextMenu(); }} />

<div
  class="cy-mindmap"
  style="width: {width}; height: {height};"
  role="application"
  tabindex="-1"
  onkeydown={handleContainerKeydown}
>
  {#if !readonly}
    <div class="cy-mindmap__toolbar">
      <button class="cy-mindmap__toolbar-btn" onclick={() => selectedNodeId && addChild(selectedNodeId)} title="Add Child (Tab)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Add Child</span>
      </button>
      <button class="cy-mindmap__toolbar-btn" onclick={() => selectedNodeId && addSibling(selectedNodeId)} title="Add Sibling (Enter)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M8 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2"/>
        </svg>
        <span>Add Sibling</span>
      </button>
      <button class="cy-mindmap__toolbar-btn cy-mindmap__toolbar-btn--danger" onclick={() => selectedNodeId && deleteNode(selectedNodeId)} title="Delete (Del)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Delete</span>
      </button>
      <div class="cy-mindmap__toolbar-sep"></div>
      <button class="cy-mindmap__toolbar-btn" onclick={collapseAll} title="Collapse All">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Collapse</span>
      </button>
      <button class="cy-mindmap__toolbar-btn" onclick={expandAll} title="Expand All">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 10l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Expand</span>
      </button>
      <div class="cy-mindmap__toolbar-sep"></div>
      <button class="cy-mindmap__toolbar-btn" onclick={handleExport} title="Export to Markdown">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 10v3h10v-3M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Export</span>
      </button>
      <div class="cy-mindmap__toolbar-sep"></div>
      <button class="cy-mindmap__toolbar-btn" onclick={zoomIn} title="Zoom In">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M7 5v4M5 7h4M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="cy-mindmap__toolbar-btn" onclick={zoomOut} title="Zoom Out">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M5 7h4M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="cy-mindmap__toolbar-btn" onclick={fitToScreen} title="Fit to Screen">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="cy-mindmap__zoom-label">{zoomPercent}%</span>
    </div>
  {/if}

  <div class="cy-mindmap__canvas-wrap" bind:this={container}>
    <canvas
      bind:this={canvas}
      onmousedown={handleMouseDown}
      onmousemove={handleMouseMove}
      onmouseup={handleMouseUp}
      onmouseleave={() => {
        isPanning = false;
        if (dragState) {
          dropTargetId = null;
          dragState = null;
          canvas.style.cursor = "default";
          render();
        }
      }}
      ondblclick={handleDblClick}
      oncontextmenu={handleContextMenu}
      onwheel={handleWheel}
    ></canvas>

    {#if editingNodeId}
      <input
        bind:this={editInput}
        class="cy-mindmap__edit-input"
        style="left: {editPos.x}px; top: {editPos.y}px; width: {editPos.w}px; height: {editPos.h}px;"
        value={editValue}
        oninput={(e) => { editValue = (e.target as HTMLInputElement).value; }}
        onkeydown={(e) => {
          if (e.key === "Enter") confirmEdit();
          if (e.key === "Escape") cancelEdit();
          e.stopPropagation();
        }}
        onblur={confirmEdit}
      />
    {/if}
  </div>

  {#if contextMenu}
    <div
      class="cy-mindmap__context-menu"
      style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
      role="menu"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => { if (e.key === "Escape") closeContextMenu(); }}
    >
      <button class="cy-mindmap__context-item" role="menuitem" onclick={() => { addChild(contextMenu!.nodeId); contextMenu = null; }}>
        Add Child
      </button>
      {#if contextMenu.nodeId !== root.id}
        <button class="cy-mindmap__context-item" role="menuitem" onclick={() => { addSibling(contextMenu!.nodeId); contextMenu = null; }}>
          Add Sibling
        </button>
      {/if}
      {#if contextMenu.nodeId !== root.id}
        <button class="cy-mindmap__context-item cy-mindmap__context-item--danger" role="menuitem" onclick={() => { deleteNode(contextMenu!.nodeId); contextMenu = null; }}>
          Delete
        </button>
      {/if}
      <button class="cy-mindmap__context-item" role="menuitem" onclick={() => { toggleCollapse(contextMenu!.nodeId); contextMenu = null; }}>
        {findNode(root, contextMenu.nodeId)?.collapsed ? "Expand" : "Collapse"}
      </button>
      <div class="cy-mindmap__context-sep"></div>
      <button
        class="cy-mindmap__context-item"
        role="menuitem"
        onclick={(e) => { e.stopPropagation(); contextMenu = { ...contextMenu!, showColorSub: !contextMenu!.showColorSub }; }}
      >
        Set Color &#9654;
      </button>
      {#if contextMenu.showColorSub}
        <div class="cy-mindmap__color-sub">
          {#each COLOR_PALETTE as color}
            <button
              class="cy-mindmap__color-swatch"
              style="background: {getColorValue(color)};"
              title={color}
              onclick={(e) => { e.stopPropagation(); setNodeColor(contextMenu!.nodeId, color); }}
            ></button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cy-mindmap {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-subtle);
    border-radius: 8px;
    overflow: hidden;
  }

  .cy-mindmap__toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: var(--color-surface-default);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .cy-mindmap__toolbar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: transparent;
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
    color: var(--color-text-secondary);
    font-family: Inter, system-ui, sans-serif;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .cy-mindmap__toolbar-btn:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
    border-color: var(--color-action-secondary-border);
  }

  .cy-mindmap__toolbar-btn--danger:hover {
    color: var(--color-state-error);
    border-color: var(--color-state-error);
  }

  .cy-mindmap__toolbar-sep {
    width: 1px;
    height: 20px;
    background: var(--color-border-subtle);
    margin: 0 4px;
  }

  .cy-mindmap__zoom-label {
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 11px;
    color: var(--color-text-tertiary);
    margin-left: 4px;
  }

  .cy-mindmap__canvas-wrap {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }

  .cy-mindmap__canvas-wrap canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .cy-mindmap__edit-input {
    position: absolute;
    z-index: 20;
    background: var(--color-surface-default);
    border: 2px solid var(--color-action-brand-default);
    border-radius: 6px;
    color: var(--color-text-primary);
    font-family: Inter, system-ui, sans-serif;
    font-size: 13px;
    text-align: center;
    outline: none;
    box-sizing: border-box;
    padding: 0 8px;
  }

  .cy-mindmap__context-menu {
    position: fixed;
    z-index: 100;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: 8px;
    padding: 4px 0;
    min-width: 160px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .cy-mindmap__context-item {
    display: block;
    width: 100%;
    padding: 8px 14px;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-family: Inter, system-ui, sans-serif;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    transition: background 0.1s ease;
  }

  .cy-mindmap__context-item:hover {
    background: var(--color-surface-hover);
  }

  .cy-mindmap__context-item--danger {
    color: var(--color-state-error);
  }

  .cy-mindmap__context-item--danger:hover {
    background: var(--color-surface-hover);
  }

  .cy-mindmap__context-sep {
    height: 1px;
    background: var(--color-border-subtle);
    margin: 4px 0;
  }

  .cy-mindmap__color-sub {
    display: flex;
    gap: 6px;
    padding: 8px 14px;
  }

  .cy-mindmap__color-swatch {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--color-border-default);
    cursor: pointer;
    padding: 0;
    transition: transform 0.1s ease;
  }

  .cy-mindmap__color-swatch:hover {
    transform: scale(1.2);
    border-color: var(--color-text-primary);
  }
</style>

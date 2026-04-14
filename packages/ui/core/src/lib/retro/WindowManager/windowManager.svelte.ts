import type { ManagedWindow } from "./types.js";

export interface CreateWindowManagerOptions {
  baseZIndex?: number;
  cascadeOffset?: number;
  defaultWidth?: number;
  defaultHeight?: number;
}

/**
 * Headless, reactive multi-window controller. Backed by Svelte 5 runes
 * so consumers can use the `windows` getter directly in templates.
 */
export function createWindowManager(opts: CreateWindowManagerOptions = {}) {
  const base = opts.baseZIndex ?? 100;
  const cascade = opts.cascadeOffset ?? 24;
  const dw = opts.defaultWidth ?? 560;
  const dh = opts.defaultHeight ?? 360;

  let list = $state<ManagedWindow[]>([]);
  let topZ = $state(base);

  function nextPos() {
    const n = list.length;
    return { x: 60 + n * cascade, y: 60 + n * cascade };
  }

  function open(w: Partial<ManagedWindow> & { id: string; title: string }) {
    const existing = list.find((x) => x.id === w.id);
    if (existing) {
      focus(existing.id);
      if (existing.minimized) restore(existing.id);
      return existing;
    }
    const pos = nextPos();
    topZ += 1;
    const win: ManagedWindow = {
      x: pos.x,
      y: pos.y,
      width: dw,
      height: dh,
      zIndex: topZ,
      minimized: false,
      maximized: false,
      ...w,
    };
    list = [...list, win];
    return win;
  }

  function close(id: string) {
    list = list.filter((w) => w.id !== id);
  }

  function focus(id: string) {
    const w = list.find((x) => x.id === id);
    if (!w) return;
    topZ += 1;
    list = list.map((x) => (x.id === id ? { ...x, zIndex: topZ, minimized: false } : x));
  }

  function minimize(id: string) {
    list = list.map((w) => (w.id === id ? { ...w, minimized: true } : w));
  }

  function restore(id: string) {
    list = list.map((w) => (w.id === id ? { ...w, minimized: false } : w));
    focus(id);
  }

  function toggleMinimize(id: string) {
    const w = list.find((x) => x.id === id);
    if (!w) return;
    w.minimized ? restore(id) : minimize(id);
  }

  function toggleMaximize(id: string) {
    list = list.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w));
  }

  function update(id: string, patch: Partial<ManagedWindow>) {
    list = list.map((w) => (w.id === id ? { ...w, ...patch } : w));
  }

  function closeAll() {
    list = [];
  }

  function getActive(): ManagedWindow | undefined {
    const visible = list.filter((w) => !w.minimized);
    if (visible.length === 0) return undefined;
    return visible.reduce((a, b) => (a.zIndex >= b.zIndex ? a : b));
  }

  return {
    get windows() { return list; },
    get activeId() { return getActive()?.id; },
    open,
    close,
    focus,
    minimize,
    restore,
    toggleMinimize,
    toggleMaximize,
    update,
    closeAll,
  };
}

export type WindowManager = ReturnType<typeof createWindowManager>;

/**
 * Focus helpers shared by the modal overlays (Modal, Dialog, Drawer).
 *
 * The overlays keep keyboard focus inside their panel while open: Tab past
 * the last focusable element wraps to the first, Shift+Tab before the first
 * wraps to the last.
 */

const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/** Tabbable descendants of `container`, in document order. */
export function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

/**
 * Keep a Tab / Shift+Tab keypress inside `container`. Other keys are ignored.
 * With nothing focusable inside, focus stays on the container itself.
 */
export function trapTab(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== "Tab") return;
  const items = focusableElements(container);
  const active = document.activeElement;
  const outside = !container.contains(active);
  if (items.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (outside || active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (outside || active === last)) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Move focus to the first focusable element in `container`, or to the
 * container itself (give it `tabindex="-1"`). Returns a function that puts
 * focus back on the element that was focused before, if it is still in the
 * document.
 */
export function moveFocusInto(container: HTMLElement): () => void {
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  (focusableElements(container)[0] ?? container).focus();
  return () => {
    if (previous?.isConnected) previous.focus();
  };
}

import { getContext, setContext } from "svelte";
import type { ViewerAccessor } from "./types.js";

export const VIEWER_KEY = Symbol.for("cyberdyne.cesium.viewer");

/**
 * Publish the viewer accessor on the current component's context. Called once
 * by `<CesiumGlobe>` so descendant layer components can resolve the shared
 * Cesium.Viewer via `useCesiumViewer()`.
 */
export function provideCesiumViewer(accessor: ViewerAccessor): void {
  setContext(VIEWER_KEY, accessor);
}

/**
 * Resolve the parent `<CesiumGlobe>`'s viewer accessor. Throws when called
 * outside a `<CesiumGlobe>` subtree — that is always a programming error.
 *
 * The accessor returns `null` until the viewer has finished mounting; callers
 * should guard against that (and `<CesiumGlobe>` itself gates child rendering
 * on `ready`, so most consumers won't observe the null state).
 */
export function useCesiumViewer(): ViewerAccessor {
  const accessor = getContext<ViewerAccessor | undefined>(VIEWER_KEY);
  if (!accessor) {
    throw new Error(
      "useCesiumViewer() must be called inside a <CesiumGlobe> component tree.",
    );
  }
  return accessor;
}

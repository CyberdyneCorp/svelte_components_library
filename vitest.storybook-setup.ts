// Setup for the Storybook vitest *browser* project.
//
// Cesium stories mount a WebGL globe. A headless CI browser has no real GPU
// and reports a "supports WebGL, but initialization failed" zombie state:
// `new Cesium.Viewer()` constructs without throwing, CesiumGlobe flips its
// `ready` flag, and its layer children render against a half-dead context —
// hanging the story until the test times out (nondeterministically, since it
// depends on render timing).
//
// Force WebGL to be cleanly *absent* so viewer construction throws and
// CesiumGlobe's existing try/catch falls into the error overlay (its children
// are gated behind `ready`, so no layer component touches a null viewer). This
// makes the Cesium smoke tests deterministic and fast. 2D canvas contexts
// (used by the chart components) are left untouched.
//
// This only affects the automated test browser; `pnpm storybook` (dev) and the
// published Storybook still render the live globe.
const WEBGL_CONTEXTS = new Set(["webgl", "webgl2", "experimental-webgl"]);

const originalGetContext = HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.getContext = function getContext(
  this: HTMLCanvasElement,
  contextId: string,
  ...args: unknown[]
) {
  if (WEBGL_CONTEXTS.has(contextId)) return null;
  // @ts-expect-error — forward the original overloaded signature unchanged.
  return originalGetContext.call(this, contextId, ...args);
} as typeof HTMLCanvasElement.prototype.getContext;

---
"@cyberdynecorp/svelte-ui-core": minor
---

Add `ModelsLayer` for glTF / .glb on the globe, plus additive primitive
callbacks unblocking common app patterns.

**New components & examples**

- **`cesium/ModelsLayer`** — controlled list of 3D model entities at lng/lat
  with optional altitude, heading/pitch/roll, scale, `minimumPixelSize`,
  `maximumScale`, tint colour (blend) and silhouette. Diff-by-id
  reconciliation, bindable `selectedId`, `onclick`. Clamps the base to terrain
  when `altitudeM` is omitted.
- **`ModelEntity`** type exported from the package entry.
- **`cesium/Examples/UrbanCFD`** — composition story reproducing a CFD-over-
  buildings scene (OSM Buildings tinted by stress band + streamlines +
  pressure dots + numeric labels + wind-sim domain preview).

**Primitive additions** (all additive — no breaking changes)

- **`TextInput`** — `type` widened to also accept `"search"`, `"tel"`,
  `"date"`, `"datetime-local"`, `"time"`, `"month"`, `"week"`. New bindable
  `inputRef: HTMLInputElement | null` for imperative focus / `select()`.
  New `onchange`, `onfocus`, `onblur`, `onkeydown` callbacks.
- **`Checkbox`** — `ariaLabel` prop (used when `label` is omitted, e.g.
  row-select checkboxes) and `onchange: (checked, e) => void` callback.
- **`Slider`** (ml) — `oninput(value)` and `onchange(value)` callbacks for
  driving transforming setters / dispatching to a viewmodel.
- **`Button`** — `title` and `ariaLabel` props passed through to the
  underlying `<button>`.
- **`Icon`** — exported `IconName` string-literal union of the built-in icons
  and `BUILTIN_ICON_NAMES` array; `name` accepts `IconName | (string & {})`
  so consumers get autocomplete while keeping the unknown-name escape hatch.

## Context

Each component is a thin accessible layer over existing primitives (Button, IconButton, CopyButton, Dialog, TextInput, ProgressBar, ChartFrame, ChartLegend). Logic that can be tested without a DOM lives in a sibling `.ts` module: relative-time formatting, middle truncation, file-type classification and bar layout.

## Decisions

- **Timestamp uses `Intl.RelativeTimeFormat` with `numeric: "auto"`** ("yesterday", "in 3 minutes") and `Intl.DateTimeFormat` for the absolute form. Unit selection is a pure `relativeParts(date, now)` function. Relative mode refreshes on a timer chosen by distance: every 10 s under a minute, every minute under an hour, every hour beyond. `live={false}` disables it, and an injectable `now` keeps tests and SSR deterministic. The absolute string is the `title`, and `datetime` is always the ISO string.
- **HoverCard is placed next to its trigger in the DOM, not portalled**, so Tab moves from the trigger into links inside the card. The card has no `role`. It supplements content that is reachable elsewhere, because hover does not exist on touch. Open and close delays are timers cancelled by re-entry. Escape closes the card and keeps focus on the trigger.
- **ConfirmAction composes `Dialog`.** `level="type"` adds a TextInput, and `Dialog.confirmDisabled` stays true until the trimmed input equals `confirmText` exactly (case-sensitive). The input resets on every open. `onconfirm` is fire-and-forget.
- **CopyableValue hides the truncation from assistive tech.** The truncated text is `aria-hidden`, and a visually hidden span carries the full value, so screen readers never read "0x12…ef". Copy goes through `CopyButton` with its new `iconOnly` option, which keeps the text as the accessible name and drops the visible label.
- **MaskedValue keeps the secret out of the DOM while hidden.** The mask length is fixed (`maskLength`, default 8) so the length of the secret does not leak. Only the trailing `visibleEnd` characters are rendered. The reveal toggle is a button with `aria-pressed`. `autoHideAfter` re-masks after a delay. Copying works while hidden because the value lives in component state.
- **OptionCard is a `<label>` around a visually hidden native input**, so forms, arrow-key radio groups and validation work natively. Selected and focus styles use `:has(:checked)` and `:has(:focus-visible)`. The input's name comes from the title (`aria-labelledby`) and its description from `aria-describedby`, so the whole card text is not read as the name. Radios bind through `group` and checkboxes through `checked`, because a native radio is unchecked without its own change event when a sibling is selected.
- **FileTypeIcon is a pure SVG**: a page with a folded corner, a category-coloured band and the extension (at most 4 characters, uppercase). Categories map to existing state and accent tokens, so themes recolour them. `fileCategory()` and `fileExtension()` are exported.
- **FileCard renders the preview snippet, else an `<img>` from `previewSrc`, else a `FileTypeIcon`.** An image load error falls back to the icon. `onopen` turns the name into a button, and `onremove` adds a remove IconButton. They are separate controls, not nested.
- **BarChart layout moves into `barLayout.ts`.** One function returns rectangles for single, grouped and stacked data in either orientation. The template then draws rectangles instead of branching on orientation four times, which lowers the component's cognitive complexity. Single-series `data` renders exactly as before. Series bars draw their legend marker shape inside each segment when it fits, matching the PieChart rule for non-colour encoding.

## Risks

- Relative timestamps can differ between server and client render by a few seconds. Passing `now` from the server avoids a hydration mismatch.
- A hover card's content is unavailable on touch-only devices. The docs and story state that it must not hold the only copy of information.

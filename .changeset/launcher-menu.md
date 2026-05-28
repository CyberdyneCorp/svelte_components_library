---
"@cyberdynecorp/svelte-ui-core": minor
---

Add `LauncherMenu`: a sectioned OS-style launcher (header tile, ⌘K search, grouped sections with caller-defined accent colours via `--section-accent-<id>`, per-item hover submenus that render `position: fixed` and auto-flip on narrow viewports, and a pinned account/identity row). Two optional snippets make it fully configurable: an `icon` snippet to render custom per-entry icons (SVG/pixel-art) instead of the emoji-as-text default, and an `account` snippet to replace the built-in account row with a bespoke identity / connect-wallet widget. Additive — the existing flat `StartMenu` is unchanged.

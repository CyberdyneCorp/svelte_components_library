---
"@cyberdynecorp/svelte-ui-foundation": minor
"@cyberdynecorp/svelte-ui-core": minor
---

Define every foundation-namespaced token that core references (#17).

- Foundation adds `--color-action-{brand,secondary}-{bg,border}`, `--color-action-danger-*`, `--color-accent-*`, `--color-syntax-number`, `--shadow-glow-red`, `--nav-height` and `--video-*`, each in dark and light.
- Core now references existing tokens where it used synonyms, e.g. `--color-surface-base` → `--color-surface-default` and `--radius-full` → `--radius-pill`.
- A new unit test fails on any undefined token.

`Sidebar` and `BottomNav` accept an optional `ariaLabel` for their `<nav>` landmark (#16).

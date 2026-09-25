# @cyberdynecorp/svelte-ui-foundation

## 0.3.0

### Minor Changes

- 8d11e04: Define every foundation-namespaced token that core references (#17).
  - Foundation adds `--color-action-{brand,secondary}-{bg,border}`, `--color-action-danger-*`, `--color-accent-*`, `--color-syntax-number`, `--shadow-glow-red`, `--nav-height` and `--video-*`, each in dark and light.
  - Core now references existing tokens where it used synonyms, e.g. `--color-surface-base` → `--color-surface-default` and `--radius-full` → `--radius-pill`.
  - A new unit test fails on any undefined token.

  `Sidebar` and `BottomNav` accept an optional `ariaLabel` for their `<nav>` landmark (#16).

## 0.2.0

Not released from this repository. `0.2.0` was already taken on GitHub Packages by an earlier publish (2026-04-15) that predates the token work. The version is recorded here only so changesets skips it; the next release is `0.3.0`.

## Why

Core 0.7.0 referenced 28 foundation-namespaced tokens (`--color-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--nav-*`) that foundation never defined (#17; the issue listed 23, a full scan found 5 more). An undefined token falls back to the browser default or an inline literal, so no theme can reach it, and a custom theme such as calm leaks neon or unstyled values. Separately, `Sidebar` rendered an unlabelled `<nav>` and `BottomNav` hard-coded an English landmark name (#16), so pages could not provide distinct, translatable landmark names.

## What Changes

- Rename core references that were synonyms of existing tokens:
  - `--color-surface-base`→`--color-surface-default`, `--color-surface-elevated`→`--color-bg-elevated`
  - `--color-text-muted`→`--color-text-tertiary`, `--color-border-emphasis`→`--color-border-strong`
  - `--color-overlay`→`--color-bg-overlay`, `--color-text-on-brand`→`--color-action-brand-text`
  - `--radius-full`→`--radius-pill`, `--font-heading`→`--font-display`
  - `--font-sans`/`--font-caption`→`--font-body`, `--font-weight-normal`→`--font-weight-regular`
  - `--color-status-error`/`--color-text-on-emphasis`→`--color-action-danger-*`
  - `--color-state-{success,info,purple}-default`→`--color-accent-*`
  - `--color-surface-inset`→`--video-*`
- Define the genuinely new tokens in foundation, for dark and light:
  - `--color-action-{brand,secondary}-{bg,border}`
  - `--color-action-danger-{default,hover,active,text}`
  - `--color-accent-{green,cyan,violet}`
  - `--color-syntax-number`, `--shadow-glow-red`, `--nav-height`
  - `--video-{bg,scrim,control-text}`
- `--btn-danger-*` now alias `--color-action-danger-*`. The resolved values are unchanged.
- Add a unit test that fails when any foundation-namespaced `var()` in core is undefined.
- Add an optional `ariaLabel` prop to `Sidebar` (default: no label) and `BottomNav` (default: "Bottom navigation").

## Impact

- `@cyberdynecorp/svelte-ui-foundation`: minor (new tokens).
- `@cyberdynecorp/svelte-ui-core`: minor (new optional props; token references renamed internally).
- Visual changes, all intentional:
  - `Header` and `WelcomeText` titles now use `--font-display`.
  - `TokenSelector` and `TransactionConfirm` backdrops use `--color-bg-overlay`, matching `ModalBackdrop`.
  - Components that relied on missing tokens now get themed values instead of browser defaults.
- Consumers that defined any removed token name themselves must switch to the replacement.

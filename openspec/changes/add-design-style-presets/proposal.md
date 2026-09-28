## Why

Consumers want the library to cover the common UI design styles (glassmorphism, brutalism, neumorphism, Memphis, Art Deco…). Today a theme can only recolour, re-round and re-font components: gradients, textures, backdrop blur, hard offset or inset shadows, border weight and decorative type are hard-coded or absent. Styles that depend on those cannot be built from CSS alone, and each consumer would have to fork component styles.

## What Changes

- Add design-style token groups to the foundation. Every default is a no-op, so the default, light and calm themes render exactly as before.
  - Gradients: `--gradient-surface`, `--gradient-brand`, `--gradient-accent`, `--gradient-backdrop`.
  - Texture / pattern layers: `--texture-surface`, `--pattern-backdrop`.
  - Glass: `--surface-blur` (a `backdrop-filter` value).
  - Style shadows: `--shadow-offset`, `--shadow-raised`, `--shadow-pressed`, `--shadow-inset`.
  - Border shape: `--border-width`, `--border-width-strong`, `--border-style`.
  - Decorative type: `--font-decorative`, `--heading-transform`.
  - Multi-accent palette: `--color-accent-1` … `--color-accent-4`.
- Wire these tokens into the components that carry a style's look: Button, Badge, Card, TextInput, Textarea, Select, Modal, Dialog, Drawer, Popover, Tabs, NavBar, Header, Sidebar, BottomNav, Table, DataTable, PageHeader, PageShell, AppLayout, CommentThread, and the `body` rule in `base.css`.
- Ship 17 design-style presets as optional CSS files built only from tokens: minimal, flat, material, swiss, organic, maximalism, y2k, glass, neumorphism, skeuomorphism, brutalism, bento, clay, memphis, vaporwave, art-deco, editorial.
- Document which existing themes already cover the other styles:

  | Style | Covered by |
  |-------|------------|
  | Cyberpunk / neon | default `:root` theme |
  | Light / clean | `[data-theme="light"]` |
  | Corporate / calm | `themes/calm.css` (`calm`, `calm-dark`) |
  | Retro / pixel / CRT | the `retro/` component family |

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `design-foundation`: adds the design-style token contract and the design-style preset pack; widens the core token-surface namespaces.
- `core-components`: components expose the design-style tokens.
- `packaging-and-tooling`: adds a `./themes/<name>.css` subpath export for each preset.

## Impact

- `packages/ui/foundation`: new tokens in `styles/colors.css` (both blocks), `styles/radius.css` and `styles/typography.css`. `calm.css` declares them. `base.css` paints `body` with the backdrop layers. New `styles/style-tokens.test.ts`. `themes/<name>.css` presets with export entries; `themes/calm.test.ts` generalized into `themes/presets.test.ts`. Minor bump.
- `packages/ui/core`: component `<style>` blocks reference the new tokens. With the default values nothing renders differently. Minor bump.
- Brand, outline and danger Buttons now keep their hover glow while `:active`. Before, a press with the pointer over the button already showed that glow; the only difference is a keyboard press without hover.
- `.storybook/static-docs/DesignTokens.mdx` gains a Design-style tokens section.

## 1. Design-style tokens (groundwork)

- [x] 1.1 Add gradient, layer, glass, style-shadow and multi-accent tokens to `colors.css` (`:root` and `[data-theme="light"]`) with no-op defaults
- [x] 1.2 Add `--border-width`, `--border-width-strong`, `--border-style` to `radius.css`; `--font-decorative`, `--heading-transform` to `typography.css`
- [x] 1.3 Declare every style token in `calm.css`; add `--color-accent-1..4` to the calm contrast pairings
- [x] 1.4 Add `styles/style-tokens.test.ts` guarding the no-op defaults and light/calm declarations
- [x] 1.5 `base.css`: paint `body` with `--pattern-backdrop`, `--gradient-backdrop`

## 2. Wire components

- [x] 2.1 Button (gradient-brand, surface layers on secondary, offset/raised/pressed shadows, border shape)
- [x] 2.2 Card (surface layers, blur, offset/raised shadows, border shape)
- [x] 2.3 TextInput, Textarea, Select (inset shadow, border shape)
- [x] 2.4 Modal, Dialog, Drawer, Popover (surface layers, blur, offset shadow, border shape, decorative titles)
- [x] 2.5 Tabs, NavBar, Header, Sidebar, BottomNav (surface layers, blur, border shape, strong indicator)
- [x] 2.6 Badge, Table, DataTable headers, PageHeader, PageShell, AppLayout, CommentThread accents
- [x] 2.7 `DesignTokens.mdx` Design-style tokens section

## 3. Presets

- [x] 3.1 Add `themes/<name>.css` presets: minimal, flat, material, swiss, organic, maximalism, y2k, glass, neumorphism, skeuomorphism, brutalism, bento, clay, memphis, vaporwave, art-deco, editorial
- [x] 3.2 Preset guard test `themes/presets.test.ts` (generalizes calm.test.ts: completeness, WCAG AA on the calm pairing list, no primitives/video, foundation tokens only, motion)
- [x] 3.3 `./themes/<name>.css` exports; Storybook toolbar entries and a Style Switcher / Style Gallery in `Design Tokens/Themes`
- [x] 3.4 Document the style → theme mapping (neon = default, light, corporate = calm, retro = retro family) in `DesignTokens.mdx` and `README.md`

## 4. Release

- [x] 4.1 Changeset: foundation minor, core minor
- [ ] 4.2 Archive this change once released

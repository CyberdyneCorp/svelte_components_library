---
"@cyberdynecorp/svelte-ui-foundation": minor
"@cyberdynecorp/svelte-ui-core": minor
---

Add design-style tokens so theme presets can reach gradients, textures, glass blur, style shadows, border shape and decorative type.

- foundation: new tokens with no-op defaults: `--gradient-{surface,brand,accent,backdrop}`, `--texture-surface`, `--pattern-backdrop`, `--surface-blur`, `--shadow-{offset,raised,pressed,inset}`, `--border-width`, `--border-width-strong`, `--border-style`, `--font-decorative`, `--heading-transform`, `--color-accent-1..4`. The default, light and calm themes render unchanged. `body` paints the backdrop layers.
- core: Button, Badge, Card, TextInput, Textarea, Select, Modal, Dialog, Drawer, Popover, Tabs, NavBar, Header, Sidebar, BottomNav, Table, DataTable, PageHeader, PageShell, AppLayout and CommentThread consume the new tokens.

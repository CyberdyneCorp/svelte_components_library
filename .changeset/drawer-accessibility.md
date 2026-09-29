---
"@cyberdynecorp/svelte-ui-core": minor
---

Drawer accessibility: focus moves into the panel on open (first focusable element, else the panel), Tab / Shift+Tab stay inside, Escape / backdrop click / close button close it, and focus returns to the opener. New optional props `closeLabel` (default "Close drawer") and `onclose` (called for user-initiated closes; `bind:open` keeps working). Drawer, Modal and Dialog overlays now stack on `--z-overlay`, above `BottomNav` (`--z-nav`), so the nav no longer covers an open drawer's footer on phones. Modal and Dialog share the new focus-trap helper, which also skips disabled controls.

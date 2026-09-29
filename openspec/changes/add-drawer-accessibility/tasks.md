## 1. Foundation

- [x] 1.1 Add `--z-nav` and `--z-overlay` to `spacing.css` (overlay above nav)
- [x] 1.2 Test that both are integers and that `--z-overlay` is greater than `--z-nav`

## 2. Focus trap

- [x] 2.1 Add `overlay/focusTrap.ts` with `focusableElements`, `trapTab` and `moveFocusInto`, with unit tests
- [x] 2.2 Replace the inline Tab traps in `Modal` and `Dialog` with `trapTab`

## 3. Drawer

- [x] 3.1 Move focus into the panel on open and restore it to the opener on close
- [x] 3.2 Trap Tab / Shift+Tab inside the panel
- [x] 3.3 Add `closeLabel` and `onclose` (Escape, backdrop, close button)
- [x] 3.4 Layer `Drawer`, `Modal` and `Dialog` on `--z-overlay`, `BottomNav` on `--z-nav`, guarded by `style-contract.test.ts`
- [x] 3.5 Keyboard and callback tests
- [x] 3.6 Stories: axe in `error` mode, keyboard play story, phone story with `BottomNav`

## 4. Release

- [x] 4.1 Update README, TRD and the design-token docs
- [x] 4.2 Add changesets (minor core, minor foundation)
- [ ] 4.3 Archive this change once released

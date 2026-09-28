---
"@cyberdynecorp/svelte-ui-foundation": minor
---

Add 17 design-style theme presets, each an optional CSS file activated with `data-theme="<id>"`: `minimal`, `flat`, `material`, `swiss`, `organic`, `maximalism`, `y2k`, `glass`, `neumorphism`, `skeuomorphism`, `brutalism`, `bento`, `clay`, `memphis`, `vaporwave`, `art-deco` and `editorial`.

- Import with `@cyberdynecorp/svelte-ui-foundation/themes/<id>.css` after the foundation styles.
- Every preset defines all Layer 2/3 and design-style tokens, never touches primitives or `--video-*`, meets WCAG AA on the calm pairing list and keeps motion at 200ms or less. `themes/presets.test.ts` (generalized from `calm.test.ts`) guards calm and every new preset.
- Presets name their web fonts (see each file's header) but do not load them; system fallbacks apply otherwise.

## Context

The foundation themes components through three token layers (primitives → semantic → component). A theme is a `[data-theme]` block that remaps Layer 2 and Layer 3. That is enough for colour, radius, type and motion. Many design styles also depend on properties that components hard-code today:

| Style | Needs |
|-------|-------|
| Glass | sheen and rim highlight on tinted surfaces; `backdrop-filter` blur on floating overlays only |
| Neumorphism, Clay, Skeuomorphism | paired light/dark raised shadows, inset wells, pressed state |
| Brutalism, Memphis | thick borders, hard offset shadows, multi-accent colour |
| Vaporwave, Y2K, Maximalism | gradients on surfaces, brand and backdrop, background patterns |
| Art Deco, Editorial | decorative display face, heading case, rules |
| Material | elevation shadows, raised buttons |
| Swiss, Bento, Minimal, Flat | border weight/style, zero shadows, radius |

## Goals / Non-Goals

**Goals**
- Any listed style can be written as a pure-CSS `[data-theme]` preset.
- Zero visual change for the existing default, light and calm themes.
- Token names consistent with the existing namespaces.

**Non-Goals**
- No component markup, prop or JavaScript changes (apart from CommentThread's accent map).
- No per-component style variants (`variant="glass"`); styles are themes.
- Charts keep their own series palettes; the retro family keeps its own look.

## Decisions

### Background tokens are non-final layers

Consumers write `background: var(--texture-surface), var(--gradient-surface), <surface colour>`. A layer token can therefore hold `none`, a gradient, or several comma-separated layers with their own `position / size`, repeat and attachment. For example, `radial-gradient(#000 1px, transparent 1px) 0 0 / 12px 12px`. No separate size tokens are needed. The `none` default leaves only the colour, identical to today's rendering. The shorthand is used on purpose: hover rules that already reset `background` keep the same cascade.

Alternative considered: `background-image` plus separate size tokens. Rejected, because each hover rule's `background` shorthand would reset the image, and every consumer would need extra `background-size` lines.

### Shadow tokens default to a transparent zero shadow

`box-shadow` lists cannot contain `none`. The style shadows therefore default to `0 0 0 0 transparent`, which paints nothing. That lets them combine with the existing elevation and glow shadows, for example `box-shadow: var(--shadow-offset), var(--shadow-lg)`, without changing today's look.

Roles:
- `--shadow-offset`: a hard offset under raised things (Brutalism, Memphis), on Button, Card and the overlay panels.
- `--shadow-raised`: the resting elevation of Button and Card (Neumorphism, Clay, Material).
- `--shadow-pressed`: Button `:active` (inset wells, sinking).
- `--shadow-inset`: input wells (TextInput, Textarea, Select).

### Border shape tokens

`--border-width` (1px), `--border-width-strong` (2px) and `--border-style` (solid) replace the literal `1px solid` / `2px solid` pairs in the wired components. Focus outlines are left out on purpose, because focus-ring visibility is an accessibility guarantee, not a style.

### Glass is blur plus existing surface colours

`--surface-blur` feeds `backdrop-filter` (and `-webkit-backdrop-filter`) on Card, the overlay panels and the navigation bars. Translucency comes from setting the existing surface tokens (`--card-bg`, `--color-surface-*`, `--nav-bg`) to `rgba()`, so no separate opacity token is needed. The default is `none`: a non-`none` backdrop filter creates a containing block, and the default must not add one.

### Decorative type

`--font-decorative` defaults to `var(--font-display)`. It is used by the overlay, Header and PageHeader titles, which used `--font-display` before. `--heading-transform` (default `none`) feeds `text-transform` on the same titles. `var()` resolves where a token is declared, so a theme that changes `--font-display` on a subtree also redeclares `--font-decorative`. `calm.css` does this.

### Where the tokens live

- Themed visual tokens (gradients, layers, blur, style shadows, accents) go in `colors.css`, in both `:root` and `[data-theme="light"]`. They join the calm completeness guard automatically.
- Shape tokens go in `radius.css`; type tokens go in `typography.css`.
- No new stylesheet is added, so the aggregation order is unchanged.
- `tokens.ts` mirrors only primitives, so it does not change.

### Multi-accent palette

`--color-accent-1..3` alias the existing green, cyan and violet accents. `--color-accent-4` aliases amber (`--primitive-amber-10` dark, `-40` light; calm uses its ochre). Every theme redeclares them, so subtree theming never inherits another theme's value. CommentThread depth markers now read `--color-accent-1..3`.

### Presets

Each preset lives in `packages/ui/foundation/src/lib/themes/<name>.css`, next to `calm.css`. It defines `[data-theme="<name>"]`, plus `[data-theme="<name>-dark"]` where the style has a natural dark variant. It builds on the default Layer 2/3 tokens and overrides only what the style needs. A shared guard test checks every preset for:
- WCAG AA on the calm pairing list;
- no redefined primitives or `--video-*`;
- only foundation-namespace tokens.

## Risks / Trade-offs

- **`transition: all` now interpolates `box-shadow` lists instead of `none` → shadow.** The rendering is identical and the interpolation is visually equivalent.
- **Brand, outline and danger Buttons now keep their glow while pressed**, so pointer presses look the same as before. A keyboard press without hover shows the glow where it did not before. Accepted.
- **Backdrop blur costs performance** on large surfaces. Presets opt in, and the default is `none`.
- **Thicker `--border-width` also thickens table cell dividers.** This is intended for Swiss and Brutalism. A preset that wants only heavy outer borders can use `--border-width-strong` on a later token.

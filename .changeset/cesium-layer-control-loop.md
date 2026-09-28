---
"@cyberdynecorp/svelte-ui-core": patch
---

CesiumLayerControl: fix an infinite effect loop (`effect_update_depth_exceeded`) whenever `groups` were passed. Group open state now falls back to each group's `defaultOpen` instead of being seeded by an effect.

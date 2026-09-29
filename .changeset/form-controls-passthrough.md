---
"@cyberdynecorp/svelte-ui-core": minor
"@cyberdynecorp/svelte-ui-foundation": minor
---

Form control passthrough and themeable form labels (#61).

- `TextInput` forwards `autocomplete`, `spellcheck`, `maxlength`, `name`, `inputmode` and any `aria-*` / `data-*` attribute to the native input; a consumer `aria-describedby` is appended after the hint / error id.
- `Select` accepts `placeholder={null}` to render only its options (the default placeholder is unchanged), skips the placeholder when `options` already contain a `""` option, and adds `id`, `ariaLabel` and `data-*` passthrough.
- `Button` forwards any `aria-*` / `data-*` attribute (`aria-expanded`, `aria-controls`…) and supports `bind:ref`.
- `NumberInput` adds `decreaseLabel` / `increaseLabel` for its step buttons.
- Checkbox / Radio docs explain how to drive them from Playwright (`.check()` on the label text).
- New foundation tokens `--input-label-font`, `--input-label-size`, `--input-label-weight`, `--input-label-transform`, `--input-label-letter-spacing`, used by every form field label. Defaults keep the mono uppercase label; `calm` / `calm-dark` use sentence case in the body font.

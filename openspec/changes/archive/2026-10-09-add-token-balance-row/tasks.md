## 1. NetworkBadge

- [x] 1.1 Make `chainId` optional; render `#id` only when set
- [x] 1.2 Add `showStatus` (default `true`) gating the dot and the disconnected dimming
- [x] 1.3 Tests: no `chainId`, `chainId={0}`, `showStatus={false}`, defaults unchanged; `LabelOnly` story

## 2. TokenBalanceRow

- [x] 2.1 Add `crypto/TokenBalanceRow` with `symbol`, `name`, `amount`, `decimals`, `value`, `unpricedLabel`, `chain`, `locale`, `as`, `icon`
- [x] 2.2 Format amount and value with `CurrencyDisplay`
- [x] 2.3 Export from `src/lib/index.ts`
- [x] 2.4 Tests: exact 18-decimal amount (en-US, pt-BR), value, unpriced default and custom label, chain badge, `as="li"`, icon hidden from assistive technology
- [x] 2.5 Stories: "Watch-only wallet list" in the default and calm themes with `a11y.test = "error"`

## 3. Docs and release

- [x] 3.1 README Crypto list and `documentation/TRD.md`
- [x] 3.2 Changeset (minor bump of `@cyberdynecorp/svelte-ui-core`)
- [x] 3.3 Archive this change once released

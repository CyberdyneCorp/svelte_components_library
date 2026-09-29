## ADDED Requirements

### Requirement: TokenBalanceRow contract

The system SHALL provide a `TokenBalanceRow` crypto component for token lists. It SHALL:

- Take a required `symbol`, a required decimal-string `amount` and a required `decimals`, plus optional `name`, `value` (`{ amount: string; currency: string }`, an ISO 4217 amount), `unpricedLabel` (default `"No price available"`), `chain`, `locale`, `icon` (snippet) and `as` (`"div"` | `"li"`, default `"div"`).
- Render the amount through `CurrencyDisplay` in asset mode (`currency` = `symbol`, the given `decimals`) and the value through `CurrencyDisplay` in ISO mode, so neither is converted to a JS `number`.
- Render `unpricedLabel` as text in place of the value when `value` is absent.
- Render `chain`, when set, as a `NetworkBadge` without chain id and without status dot.
- Render the `icon` inside an element with `aria-hidden="true"`.
- Use `as` as the root element, so the row is a list item inside `<ul>`/`<ol>` with `as="li"` and a plain block elsewhere (e.g. a table cell).
- Have no hover lift or glow and use a dense layout built from foundation tokens.

(src: packages/ui/core/src/lib/crypto/TokenBalanceRow/TokenBalanceRow.svelte)

#### Scenario: Exact 18-decimal amount

- **GIVEN** `symbol="ETH"`, `decimals={18}`, `amount="123456789012345678.123456789012345678"`, `locale="en-US"`
- **WHEN** it renders
- **THEN** the amount SHALL display `123,456,789,012,345,678.123456789012345678 ETH`
- **AND** `amount="0.000000000000000001"` with `locale="pt-BR"` SHALL display `0,000000000000000001 ETH`

#### Scenario: Priced token

- **GIVEN** `value={{ amount: "4512.3", currency: "USD" }}` and `locale="en-US"`
- **WHEN** it renders
- **THEN** the value SHALL display `$4,512.30`
- **AND** no unpriced text SHALL be rendered

#### Scenario: Unpriced token

- **GIVEN** no `value`
- **WHEN** it renders
- **THEN** it SHALL display `No price available`
- **AND** with `unpricedLabel="Sem cotação"` it SHALL display `Sem cotação` instead

#### Scenario: Row in a list

- **GIVEN** a `<ul>` containing a `TokenBalanceRow` with `as="li"` and `chain="Base"`
- **WHEN** it renders
- **THEN** the row SHALL be an `li` exposed as a `listitem`
- **AND** the chain SHALL be shown as `Base` without a chain id or status dot
- **AND** without `as` the root SHALL be a `div`

### Requirement: NetworkBadge label-only display

`NetworkBadge` SHALL accept an optional `chainId` and an optional `showStatus` (default `true`). It SHALL render `#{chainId}` after the network name only when `chainId` is defined (including `0`). When `showStatus` is `false` it SHALL render neither the connection dot nor the disconnected dimming. With `chainId` set and `showStatus` omitted it SHALL render as before: name, `#{chainId}` and a status dot that reflects `connected`.

(src: packages/ui/core/src/lib/crypto/NetworkBadge/NetworkBadge.svelte)

#### Scenario: Name only

- **GIVEN** `network="Base"` and no `chainId`
- **WHEN** it renders
- **THEN** it SHALL display `Base` and no `#` chain id
- **AND** `chainId={0}` SHALL display `#0`

#### Scenario: Status hidden

- **GIVEN** `network="Ethereum"`, `showStatus={false}` and `connected={false}`
- **WHEN** it renders
- **THEN** no status dot SHALL be rendered and the badge SHALL NOT be dimmed

#### Scenario: Defaults unchanged

- **GIVEN** `network="Ethereum"`, `chainId={1}`
- **WHEN** it renders
- **THEN** it SHALL display `Ethereum`, `#1` and a connected status dot
- **AND** with `connected={false}` the dot SHALL show the disconnected state and the badge SHALL be dimmed

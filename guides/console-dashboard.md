# Console dashboard presentation

`@cyberdynecorp/svelte-ui-core` provides the building blocks of a hosting or cloud control panel: a product rail beside a grouped server menu, a page header with a split action, a strip of copyable facts, resource KPIs, an upsell banner, detail lists with edit affordances, settings rows and a filterable domain table. See **Console / Dashboard** in Storybook for runnable examples with synthetic data (hostnames under `example.cloud`, IPs from `203.0.113.0/24`, invented prices).

The example uses NavBar, PageShell, Sidebar (collapsed rail and grouped menu), Breadcrumb, PageHeader, SplitButton, Button, StatusBadge, KeyValueStrip, Alert, KpiCard with Sparkline and ProgressRing, PromoBanner with PriceTag, DescriptionList with IconButton, EmptyState, Card, PasswordInput, SettingsRow, Switch, SearchInput, Select, DataTable, Dropdown and Accordion. Every story passes the axe check with `a11y: { test: "error" }`.

## Adoption

1. **Shell.** Put `NavBar` in PageShell's `header` snippet and two `Sidebar`s in its `sidebar` snippet: a `collapsed` rail for products and a `groups` sidebar for the current server. Give each `<nav>` a distinct `ariaLabel`. Rail items with `children` open a flyout on hover, focus or click; items can carry `badge`, `external` (with `externalLabel`) and `disabled`. Handle routing in `onnavigate`; default navigation is not prevented.
2. **Trail and header.** `Breadcrumb` items accept `icon` and `iconOnly`, so the home crumb can be an icon whose label stays available to assistive technology. Put the status (`StatusBadge`), the `SplitButton` (primary action plus a menu of secondary actions) and any outline `Button` in `PageHeader`'s children. Translate `menuLabel`.
3. **Facts and alerts.** `KeyValueStrip` shows "label: value" facts with `copy` (through `CopyButton`, named "{copyLabel} {label}") and `href` items. Use `Alert` with `inline` for a one-line error that links to details; keep `role="alert"` for errors that need announcing.
4. **Metrics.** `KpiCard` takes a `sparkline` snippet under the value and a `visual` snippet beside it (a `ProgressRing` for disk usage). Cards with `href` work as quick links. Values are preformatted strings supplied by the application.
5. **Upsell.** `PromoBanner` is a `role="region"` named by its title, not an alert. Render the offer with `PriceTag` (both prices through `CurrencyDisplay` from decimal strings, `originalLabel` translated) in the `price` snippet and the call to action in `actions`. Persist the dismissal in the application through `ondismiss`.
6. **Details and settings.** `DescriptionList` renders a real `<dl>`; use the `action` snippet for an edit `IconButton` named "Editar {label}" and the `value` snippet for rich values such as a `StatusBadge`. `SettingsRow` with `as="li"` inside a `<ul>` lays out icon, title, description, badge and actions (Buttons or a `Switch`). `PasswordInput` never generates passwords: pass your own secure generator in `ongenerate` and translate `generateLabel`, `showLabel` and `hideLabel`.
7. **Lists.** Pair `SearchInput` and `Select` with a `DataTable` in a labelled, focusable overflow region. Use `selectable` with translated `selectAllLabel`/`selectRowLabel`, a `Switch` cell for per-row toggles and a `Dropdown` whose trigger is an `Icon` plus visually hidden text for the row's actions. Use `EmptyState` with a `Button` when a resource has no items yet.

```svelte
<script lang="ts">
  import {
    Button,
    DescriptionList,
    IconButton,
    KeyValueStrip,
    PriceTag,
    PromoBanner,
    SplitButton,
    type DescriptionListItem,
  } from "@cyberdynecorp/svelte-ui-core";
  // Synthetic examples. Server actions and prices belong to the application.
  const facts = [
    { id: "user", label: "Nome de usuário SSH", value: "root", copy: true },
    { id: "ipv4", label: "IPv4", value: "203.0.113.10", copy: true },
    { id: "reset", label: "Esqueceu a senha root?", value: "", href: "/reset", linkLabel: "Redefinir senha" },
  ];
  const details: DescriptionListItem[] = [
    { id: "location", label: "Localização do servidor", value: "Brazil - São Paulo" },
    { id: "hostname", label: "Nome do host", value: "srv-example.cloud" },
  ];
</script>

<SplitButton
  label="Reiniciar"
  menuLabel="Mais ações"
  items={[
    { label: "Desligar", value: "stop" },
    { label: "Iniciar", value: "start" },
  ]}
  onclick={() => restart()}
  onselect={(value) => run(value)}
/>
<KeyValueStrip items={facts} ariaLabel="Acesso SSH" copyLabel="Copiar" />
<PromoBanner title="Faça upgrade para backups diários" dismissible dismissLabel="Fechar">
  {#snippet price()}
    <PriceTag amount="19.99" originalAmount="39.99" currency="BRL" locale="pt-BR" period="/mês" savings="Economize 50%" originalLabel="Preço original" />
  {/snippet}
  {#snippet actions()}<Button onclick={() => upgrade()}>Fazer Upgrade</Button>{/snippet}
</PromoBanner>
<DescriptionList items={details} columns={2}>
  {#snippet action(item)}
    <IconButton icon="edit" size="sm" label="Editar {item.label}" onclick={() => edit(item.id)} />
  {/snippet}
</DescriptionList>
```

## Notes

- `SplitButton` composes `Button` twice (primary action and caret) and renders its own `role="menu"` list with the Dropdown item shape and keyboard model (arrows wrap, Home/End, Escape returns focus to the caret). It does not embed `Dropdown`, whose fixed `role="button"` trigger wrapper cannot host the caret's `aria-expanded` state.
- Button's `danger` variant and the `--color-action-danger-*` token pair fail the 4.5:1 contrast ratio for small text in the default theme; the SplitButton "Danger" story is marked `a11y: "todo"` until the token changes.
- The Storybook example checks that the document does not scroll horizontally at the default viewport. PageShell hides the sidebars below 768px through a viewport media query, so a 390px check needs a real narrow viewport (Playwright), not a narrow wrapper.

## Verification

Run the focused unit tests for each component and `pnpm exec vitest run --project=storybook packages/ui/core/src/stories/ConsoleDashboard.stories.svelte` for the composed screens. These tests validate synthetic presentation, not the deployed application's provisioning, billing or DNS services.

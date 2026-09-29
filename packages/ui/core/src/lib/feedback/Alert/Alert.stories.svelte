<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Alert from "./Alert.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Alert",
    component: Alert,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for the alert.
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            "Banner, card or inline message. `role` picks the semantics: `\"alert\"` (default, assertive: interrupts the screen reader), `\"status\"` (polite live region for non-urgent updates) or `\"note\"` (static advisory content, not announced).",
        },
      },
    },
  });
</script>

<Story name="Success">
  <Alert variant="success" title="Operation Successful">
    Transaction confirmed on-chain. Block #14,203,891.
  </Alert>
</Story>

<Story name="Warning">
  <Alert variant="warning" title="High Gas Fees">
    Current gas prices are elevated. Consider delaying non-urgent transactions.
  </Alert>
</Story>

<Story name="Error">
  <Alert variant="error" title="Transaction Failed">
    Insufficient funds for gas. Please top up your wallet balance.
  </Alert>
</Story>

<Story name="Info">
  <Alert variant="info" title="Model Training">
    Your ML pipeline is currently processing epoch 42/100.
  </Alert>
</Story>

<Story name="Dismissible">
  <Alert variant="info" title="Dismissible Alert" dismissible ondismiss={() => console.log('dismissed')}>
    This alert can be dismissed by clicking the X button.
  </Alert>
</Story>

<Story name="Inline">
  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <Alert variant="error" inline>Connection timeout (504) after 30s.</Alert>
    <Alert variant="warning" inline>NDVI tiles unavailable for this date.</Alert>
    <Alert variant="success" inline>Saved.</Alert>
  </div>
</Story>

<Story name="SeverityCards">
  <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 480px;">
    <Alert severity="critical" card title="Coastal Zone A · 2.1m gap">
      Sea-wall breach risk — dispatch inspection crew.
    </Alert>
    <Alert severity="warn" card title="Zone B · 0.8m gap">
      Monitor tide gauge; review in 6h.
    </Alert>
    <Alert severity="caution" card title="Zone C · 0.3m gap">
      Within tolerance — log and continue.
    </Alert>
    <Alert severity="good" card title="Zone D · nominal">
      All readings nominal.
    </Alert>
  </div>
</Story>

<Story name="SeverityTopBorder">
  <Alert severity="critical" card borderSide="top" title="Critical">
    Top-bordered severity card variant.
  </Alert>
</Story>

<Story name="Roles">
  <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 520px;">
    <Alert variant="error" title="Payment failed">
      role="alert" (default): announced immediately.
    </Alert>
    <Alert variant="success" role="status" title="Draft saved">
      role="status": announced politely when the screen reader is idle.
    </Alert>
    <Alert variant="info" role="note" title="About imported balances">
      role="note": advisory text, not announced.
    </Alert>
  </div>
</Story>

<Story name="CalmNote" globals={{ theme: "calm" }}>
  <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 520px;">
    <Alert variant="info" role="note" title="Watch-only wallet">
      Balances are read from the chain. Nothing here can move funds.
    </Alert>
    <Alert variant="success" role="status" title="Budget updated">
      Your changes were saved.
    </Alert>
    <Alert variant="warning" role="note" card title="Unpriced assets">
      Two tokens have no price source and are left out of the total.
    </Alert>
  </div>
</Story>

<Story name="CalmDarkNote" globals={{ theme: "calm-dark" }}>
  <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 520px;">
    <Alert variant="info" role="note" title="Watch-only wallet">
      Balances are read from the chain. Nothing here can move funds.
    </Alert>
    <Alert variant="error" title="Sync failed">
      The RPC endpoint did not answer. Retrying in 30 s.
    </Alert>
  </div>
</Story>

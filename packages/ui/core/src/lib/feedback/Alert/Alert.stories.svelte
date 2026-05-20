<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Alert from "./Alert.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Alert",
    component: Alert,
    tags: ["autodocs"],
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

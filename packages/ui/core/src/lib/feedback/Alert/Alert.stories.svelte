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

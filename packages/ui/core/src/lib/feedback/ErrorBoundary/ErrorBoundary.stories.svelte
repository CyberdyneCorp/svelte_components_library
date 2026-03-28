<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ErrorBoundary from "./ErrorBoundary.svelte";

  const { Story } = defineMeta({
    title: "Feedback/ErrorBoundary",
    component: ErrorBoundary,
    tags: ["autodocs"],
  });

  const stackTrace = `TypeError: Cannot read properties of undefined (reading 'predict')
    at ModelRunner.run (model-runner.ts:42:18)
    at InferencePipeline.execute (pipeline.ts:128:22)
    at async BatchProcessor.process (batch.ts:56:14)
    at async WorkerPool.dispatch (pool.ts:89:8)
    at async main (index.ts:23:3)`;
</script>

<Story name="WithError" args={{
  title: "Transaction Failed",
  description: "The smart contract execution reverted during the swap operation.",
  error: "Error: execution reverted: INSUFFICIENT_OUTPUT_AMOUNT",
}} />

<Story name="WithStack" args={{
  title: "Runtime Exception",
  description: "An unexpected error occurred during model inference.",
  error: "TypeError: Cannot read properties of undefined (reading 'predict')",
  showStack: true,
  stack: stackTrace,
}} />

<Story name="WithRetry" args={{
  title: "Connection Lost",
  description: "Failed to establish WebSocket connection to the RPC endpoint.",
  error: "WebSocket connection to 'wss://rpc.example.com' failed",
  onretry: () => console.log('Retrying...'),
}} />

<Story name="NoError">
  <ErrorBoundary error="">
    {#snippet children()}
      <div style="padding: 24px; background: var(--color-bg-primary); border: 1px solid var(--color-border-subtle); border-radius: 8px; color: var(--color-text-primary); font-family: monospace;">
        Application content renders normally when no error is present.
      </div>
    {/snippet}
  </ErrorBoundary>
</Story>

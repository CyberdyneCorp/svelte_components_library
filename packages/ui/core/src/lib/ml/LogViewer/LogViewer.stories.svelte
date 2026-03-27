<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LogViewer from "./LogViewer.svelte";

  const { Story } = defineMeta({
    title: "ML/LogViewer",
    component: LogViewer,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <LogViewer
    logs={[
      { timestamp: "10:23:01.123", level: "info", message: "Training pipeline initialized" },
      { timestamp: "10:23:01.456", level: "debug", message: "Loading dataset from /data/train.csv" },
      { timestamp: "10:23:03.789", level: "info", message: "Dataset loaded: 50,000 samples" },
      { timestamp: "10:23:04.012", level: "info", message: "Starting epoch 1/100" },
      { timestamp: "10:23:14.567", level: "warn", message: "Learning rate may be too high, loss oscillating" },
      { timestamp: "10:23:15.890", level: "info", message: "Epoch 1 complete - loss: 0.6934, acc: 0.5012" },
      { timestamp: "10:23:16.001", level: "debug", message: "Checkpoint saved to ./checkpoints/epoch_1.pt" },
      { timestamp: "10:24:01.234", level: "error", message: "CUDA out of memory. Reduce batch size." },
    ]}
  />
</Story>

<Story name="FilteredByError">
  <LogViewer
    filter="error"
    logs={[
      { timestamp: "10:23:01.123", level: "info", message: "Server started on port 3000" },
      { timestamp: "10:23:05.456", level: "error", message: "Connection refused: database unreachable" },
      { timestamp: "10:23:06.789", level: "warn", message: "Retrying connection in 5s..." },
      { timestamp: "10:23:11.012", level: "error", message: "Max retries exceeded for database connection" },
      { timestamp: "10:23:11.345", level: "info", message: "Falling back to cache" },
    ]}
  />
</Story>

<Story name="WithSource">
  <LogViewer
    logs={[
      { timestamp: "14:00:01", level: "info", message: "Request received: GET /api/models", source: "api-gateway" },
      { timestamp: "14:00:01", level: "debug", message: "Auth token validated", source: "auth-service" },
      { timestamp: "14:00:02", level: "info", message: "Query executed in 45ms", source: "model-service" },
      { timestamp: "14:00:02", level: "warn", message: "Cache miss for key: models_list", source: "cache-layer" },
      { timestamp: "14:00:03", level: "info", message: "Response sent: 200 OK (128ms)", source: "api-gateway" },
      { timestamp: "14:00:15", level: "error", message: "Timeout waiting for inference result", source: "ml-worker" },
    ]}
  />
</Story>

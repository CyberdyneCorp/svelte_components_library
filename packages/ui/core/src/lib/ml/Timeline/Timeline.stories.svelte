<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Timeline from "./Timeline.svelte";

  const { Story } = defineMeta({
    title: "ML/Timeline",
    component: Timeline,
    tags: ["autodocs"],
  });

  const defaultItems = [
    { title: "Model v1.0 deployed", timestamp: "2025-03-15 14:30", description: "Initial release of the classification model to production." },
    { title: "Training data updated", timestamp: "2025-03-10 09:15", description: "Added 10,000 new labeled samples from Q1 batch." },
    { title: "Project initialized", timestamp: "2025-03-01 11:00", description: "Repository created and base architecture defined." },
  ];

  const variantItems = [
    { title: "Deployment successful", timestamp: "14:32:01", variant: "success", description: "Model pushed to production endpoint." },
    { title: "High latency detected", timestamp: "14:28:45", variant: "warning", description: "p99 latency exceeded 500ms threshold." },
    { title: "Inference failure", timestamp: "14:15:22", variant: "error", description: "OOM error on batch prediction request." },
    { title: "Scaling triggered", timestamp: "14:10:00", variant: "default", description: "Auto-scaler added 2 GPU instances." },
    { title: "Pipeline started", timestamp: "14:00:00", variant: "success", description: "Scheduled retraining pipeline kicked off." },
  ];

  const manyItems = [
    { title: "Epoch 10 complete", timestamp: "10:45", variant: "success", description: "Loss: 0.0312, Acc: 98.7%" },
    { title: "Epoch 9 complete", timestamp: "10:40", variant: "success", description: "Loss: 0.0387, Acc: 98.2%" },
    { title: "Epoch 8 complete", timestamp: "10:35", variant: "success", description: "Loss: 0.0456, Acc: 97.8%" },
    { title: "LR reduced", timestamp: "10:33", variant: "warning", description: "Learning rate reduced to 0.0001" },
    { title: "Epoch 7 complete", timestamp: "10:30", description: "Loss: 0.0891, Acc: 95.1%" },
    { title: "Epoch 6 complete", timestamp: "10:25", description: "Loss: 0.1203, Acc: 93.4%" },
    { title: "Epoch 5 complete", timestamp: "10:20", description: "Loss: 0.1678, Acc: 90.2%" },
    { title: "Training started", timestamp: "10:00", variant: "default", description: "Batch size: 32, LR: 0.001" },
  ];
</script>

<Story name="Default" args={{ items: defaultItems }} />

<Story name="WithVariants" args={{ items: variantItems }} />

<Story name="ManyItems" args={{ items: manyItems }} />

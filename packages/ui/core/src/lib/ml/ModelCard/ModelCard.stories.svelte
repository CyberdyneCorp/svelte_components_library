<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ModelCard from "./ModelCard.svelte";

  const { Story } = defineMeta({
    title: "ML/ModelCard",
    component: ModelCard,
    tags: ["autodocs"],
  });

  const deployedMetrics = [
    { label: "Accuracy", value: "98.4%" },
    { label: "F1", value: "0.976" },
    { label: "Latency", value: "12ms" },
  ];

  const trainingMetrics = [
    { label: "Epoch", value: "23/50" },
    { label: "Loss", value: "0.0341" },
  ];

  const fullMetrics = [
    { label: "Accuracy", value: "97.2%" },
    { label: "Precision", value: "0.968" },
    { label: "Recall", value: "0.971" },
    { label: "F1", value: "0.969" },
    { label: "AUC", value: "0.994" },
  ];
</script>

<Story name="Deployed" args={{
  name: "Fraud Detector",
  version: "3.2.1",
  description: "Real-time transaction fraud detection model using gradient boosted trees with feature engineering from transaction patterns.",
  metrics: deployedMetrics,
  status: "deployed",
  framework: "XGBoost",
  size: "24 MB",
  ondeploy: () => {},
  ondetails: () => {},
}} />

<Story name="Training" args={{
  name: "Sentiment Analyzer",
  version: "2.0.0-beta",
  description: "Fine-tuned transformer model for multi-language sentiment analysis on financial documents.",
  metrics: trainingMetrics,
  status: "training",
  framework: "PyTorch",
  size: "340 MB",
  ondetails: () => {},
}} />

<Story name="WithMetrics" args={{
  name: "Customer Churn Predictor",
  version: "1.4.0",
  description: "Predicts customer churn probability using behavioral features and engagement metrics.",
  metrics: fullMetrics,
  status: "draft",
  framework: "scikit-learn",
  size: "8.2 MB",
  ondeploy: () => {},
  ondetails: () => {},
}} />

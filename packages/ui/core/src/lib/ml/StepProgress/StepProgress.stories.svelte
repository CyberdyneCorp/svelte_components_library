<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StepProgress from "./StepProgress.svelte";

  const { Story } = defineMeta({
    title: "ML/StepProgress",
    component: StepProgress,
    tags: ["autodocs"],
  });
</script>

<Story name="Horizontal">
  <StepProgress
    currentStep={3}
    steps={[
      { label: "Data Ingestion", description: "Load raw data" },
      { label: "Preprocessing", description: "Clean & transform" },
      { label: "Training", description: "Fit model" },
      { label: "Evaluation", description: "Validate metrics" },
      { label: "Deployment", description: "Push to prod" },
    ]}
  />
</Story>

<Story name="Vertical">
  <StepProgress
    variant="vertical"
    currentStep={2}
    steps={[
      { label: "Configure Environment", description: "Set up GPU and dependencies" },
      { label: "Load Dataset", description: "Import and validate training data" },
      { label: "Train Model", description: "Run training loop" },
      { label: "Export Model", description: "Save weights and config" },
    ]}
  />
</Story>

<Story name="MidProgress">
  <StepProgress
    currentStep={1}
    steps={[
      { label: "Upload" },
      { label: "Process" },
      { label: "Review" },
      { label: "Complete" },
    ]}
  />
</Story>

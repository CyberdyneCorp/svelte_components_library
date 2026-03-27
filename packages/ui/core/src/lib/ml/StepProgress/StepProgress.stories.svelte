<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StepProgress from "./StepProgress.svelte";

  const { Story } = defineMeta({
    title: "ML/StepProgress",
    component: StepProgress,
    tags: ["autodocs"],
  });

  const horizontalSteps = [
    { label: "Data Ingestion", description: "Load raw data" },
    { label: "Preprocessing", description: "Clean & transform" },
    { label: "Training", description: "Fit model" },
    { label: "Evaluation", description: "Validate metrics" },
    { label: "Deployment", description: "Push to prod" },
  ];

  const verticalSteps = [
    { label: "Configure Environment", description: "Set up GPU and dependencies" },
    { label: "Load Dataset", description: "Import and validate training data" },
    { label: "Train Model", description: "Run training loop" },
    { label: "Export Model", description: "Save weights and config" },
  ];

  const midSteps = [
    { label: "Upload" },
    { label: "Process" },
    { label: "Review" },
    { label: "Complete" },
  ];
</script>

<Story name="Horizontal" args={{ currentStep: 3, steps: horizontalSteps }} />

<Story name="Vertical" args={{ variant: "vertical", currentStep: 2, steps: verticalSteps }} />

<Story name="MidProgress" args={{ currentStep: 1, steps: midSteps }} />

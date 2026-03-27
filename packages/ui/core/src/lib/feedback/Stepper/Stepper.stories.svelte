<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Stepper from "./Stepper.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Stepper",
    component: Stepper,
    tags: ["autodocs"],
  });

  const horizontalSteps = [
    { title: "Connect Wallet", description: "Link your web3 wallet" },
    { title: "Configure", description: "Set parameters" },
    { title: "Deploy", description: "Push to network" },
    { title: "Verify", description: "Confirm on-chain" },
  ];

  const verticalSteps = [
    { title: "Initialize", description: "Set up project scaffold" },
    { title: "Train Model", description: "Run training pipeline" },
    { title: "Evaluate", description: "Validate metrics" },
    { title: "Deploy", description: "Push to production" },
  ];

  const completedSteps = [
    { title: "Connect" },
    { title: "Configure" },
    { title: "Deploy" },
    { title: "Verify" },
  ];
</script>

<Story name="Horizontal" args={{
  steps: horizontalSteps,
  currentStep: 1,
  completedSteps: [0],
  onstepcick: (step) => console.log('Clicked step', step),
}} />

<Story name="Vertical" args={{
  orientation: "vertical",
  steps: verticalSteps,
  currentStep: 2,
  completedSteps: [0, 1],
  onstepcick: (step) => console.log('Clicked step', step),
}} />

<Story name="AllCompleted" args={{
  steps: completedSteps,
  currentStep: 3,
  completedSteps: [0, 1, 2, 3],
}} />

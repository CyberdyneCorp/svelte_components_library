<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Stepper from "./Stepper.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Stepper",
    component: Stepper,
    tags: ["autodocs"],
  });
</script>

<Story name="Horizontal">
  <div style="padding: 24px; background: #0a0a0f;">
    <Stepper
      steps={[
        { title: "Connect Wallet", description: "Link your web3 wallet" },
        { title: "Configure", description: "Set parameters" },
        { title: "Deploy", description: "Push to network" },
        { title: "Verify", description: "Confirm on-chain" },
      ]}
      currentStep={1}
      completedSteps={[0]}
      onstepcick={(step) => console.log('Clicked step', step)}
    />
  </div>
</Story>

<Story name="Vertical">
  <div style="padding: 24px; background: #0a0a0f; max-width: 320px;">
    <Stepper
      orientation="vertical"
      steps={[
        { title: "Initialize", description: "Set up project scaffold" },
        { title: "Train Model", description: "Run training pipeline" },
        { title: "Evaluate", description: "Validate metrics" },
        { title: "Deploy", description: "Push to production" },
      ]}
      currentStep={2}
      completedSteps={[0, 1]}
      onstepcick={(step) => console.log('Clicked step', step)}
    />
  </div>
</Story>

<Story name="AllCompleted">
  <div style="padding: 24px; background: #0a0a0f;">
    <Stepper
      steps={[
        { title: "Connect" },
        { title: "Configure" },
        { title: "Deploy" },
        { title: "Verify" },
      ]}
      currentStep={3}
      completedSteps={[0, 1, 2, 3]}
    />
  </div>
</Story>

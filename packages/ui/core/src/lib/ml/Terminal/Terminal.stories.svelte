<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Terminal from "./Terminal.svelte";
  import { deploymentTerminal } from "../../_testdata/index.js";

  const { Story } = defineMeta({
    title: "ML/Terminal",
    component: Terminal,
    tags: ["autodocs"],
  });

  const defaultLines = [
    { text: "python train.py --epochs 100", type: "command" },
    { text: "Loading dataset... done (3.2s)", type: "info" },
    { text: "Epoch 1/100 - loss: 0.6934 - acc: 0.5012", type: "stdout" },
    { text: "Epoch 2/100 - loss: 0.4521 - acc: 0.7845", type: "stdout" },
    { text: "Epoch 3/100 - loss: 0.3102 - acc: 0.8721", type: "stdout" },
    { text: "Training complete. Model saved to ./output/model.pt", type: "info" },
  ];

  const errorLines = [
    { text: "npm run build", type: "command" },
    { text: "Compiling TypeScript...", type: "info" },
    { text: "src/model.ts:42 - error TS2345: Argument of type 'string' is not assignable.", type: "stderr" },
    { text: "src/model.ts:87 - error TS7006: Parameter 'x' implicitly has an 'any' type.", type: "stderr" },
    { text: "Found 2 errors. Build failed.", type: "stderr" },
  ];

  const commandLines = [
    { text: "nvidia-smi", type: "command" },
    { text: "GPU 0: NVIDIA A100 80GB | 72C | 285W / 300W", type: "stdout" },
    { text: "Memory: 67542MiB / 81920MiB (82%)", type: "stdout" },
    { text: "GPU utilization: 97%", type: "info" },
    { text: "", type: "stdout" },
    { text: "htop --sort-key PERCENT_MEM", type: "command" },
    { text: "PID   USER    %CPU  %MEM   COMMAND", type: "stdout" },
    { text: "1234  train   387.2  82.4  python train.py", type: "stdout" },
    { text: "5678  root      2.1   0.3  nvidia-persistenced", type: "stdout" },
  ];
</script>

<Story name="Default" args={{ lines: defaultLines }} />

<Story name="WithErrors" args={{ title: "Build Output", lines: errorLines }} />

<Story name="CommandOutput" args={{ title: "System Monitor", lines: commandLines }} />

<Story name="Smart Contract Deployment" args={{ title: "Cyberdyne Deploy", lines: deploymentTerminal }} />

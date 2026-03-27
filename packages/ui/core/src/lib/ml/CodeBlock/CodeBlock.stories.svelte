<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CodeBlock from "./CodeBlock.svelte";

  const { Story } = defineMeta({
    title: "ML/CodeBlock",
    component: CodeBlock,
    tags: ["autodocs"],
  });

  const typescriptCode = `interface Model {
  name: string;
  accuracy: number;
  layers: number[];
}

const trainModel = async (config: Model): Promise<void> => {
  // Initialize training pipeline
  const pipeline = new Pipeline(config);
  await pipeline.fit(trainingData);
  console.log("Training complete");
};`;

  const pythonCode = `import torch
import torch.nn as nn

class NeuralNet(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        # Output layer
        self.fc2 = nn.Linear(hidden_size, 1)

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))`;

  const jsonCode = `{
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 2048,
  "training": {
    "epochs": 100,
    "batch_size": 32,
    "learning_rate": 0.001
  },
  "active": true
}`;
</script>

<Story name="TypeScript" args={{ language: "typescript", code: typescriptCode }} />

<Story name="Python" args={{ language: "python", code: pythonCode }} />

<Story name="JSON" args={{ language: "json", code: jsonCode }} />

<Story name="WithCopy" args={{ language: "typescript", copyable: true, code: "npm install @cyberdyne/ml-core" }} />

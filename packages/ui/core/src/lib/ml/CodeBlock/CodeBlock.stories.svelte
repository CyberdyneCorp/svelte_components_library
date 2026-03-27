<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CodeBlock from "./CodeBlock.svelte";

  const { Story } = defineMeta({
    title: "ML/CodeBlock",
    component: CodeBlock,
    tags: ["autodocs"],
  });
</script>

<Story name="TypeScript">
  <CodeBlock
    language="typescript"
    code={`interface Model {
  name: string;
  accuracy: number;
  layers: number[];
}

const trainModel = async (config: Model): Promise<void> => {
  // Initialize training pipeline
  const pipeline = new Pipeline(config);
  await pipeline.fit(trainingData);
  console.log("Training complete");
};`}
  />
</Story>

<Story name="Python">
  <CodeBlock
    language="python"
    code={`import torch
import torch.nn as nn

class NeuralNet(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        # Output layer
        self.fc2 = nn.Linear(hidden_size, 1)

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))`}
  />
</Story>

<Story name="JSON">
  <CodeBlock
    language="json"
    code={`{
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 2048,
  "training": {
    "epochs": 100,
    "batch_size": 32,
    "learning_rate": 0.001
  },
  "active": true
}`}
  />
</Story>

<Story name="WithCopy">
  <CodeBlock
    language="typescript"
    copyable={true}
    code={`npm install @cyberdyne/ml-core`}
  />
</Story>

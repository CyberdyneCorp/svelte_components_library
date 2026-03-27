<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Accordion from "./Accordion.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Accordion",
    component: Accordion,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="max-width: 600px; padding: 1rem;">
    <Accordion items={[
      { id: "1", title: "System Requirements", content: "Minimum 16GB RAM, NVIDIA GPU with CUDA 12.0+ support, 100GB available storage. Recommended: 64GB RAM, RTX 4090 or A100 GPU." },
      { id: "2", title: "Network Configuration", content: "The system operates on port 8443 by default. Ensure firewall rules allow inbound connections on this port. TLS 1.3 is enforced for all communications." },
      { id: "3", title: "Data Retention Policy", content: "Training data is retained for 90 days after model deployment. Inference logs are kept for 30 days. All data is encrypted at rest using AES-256." },
    ]} />
  </div>
</Story>

<Story name="MultipleOpen">
  <div style="max-width: 600px; padding: 1rem;">
    <Accordion
      multiple={true}
      items={[
        { id: "a", title: "Input Layer", content: "Accepts tokenized input sequences with a maximum context length of 8192 tokens. Embeddings dimension: 4096." },
        { id: "b", title: "Hidden Layers", content: "24 transformer blocks with multi-head attention (32 heads). Feed-forward dimension: 16384. Dropout rate: 0.1." },
        { id: "c", title: "Output Layer", content: "Softmax over vocabulary size of 50,257 tokens. Supports nucleus sampling (top-p) and temperature-based generation." },
      ]}
    />
  </div>
</Story>

<Story name="DefaultOpen">
  <div style="max-width: 600px; padding: 1rem;">
    <Accordion
      defaultOpen={["first"]}
      items={[
        { id: "first", title: "Getting Started", content: "Initialize your project with 'cyb init' and follow the interactive setup wizard. Configuration will be stored in .cybdyne.config.ts." },
        { id: "second", title: "Authentication", content: "Generate an API key from the dashboard. Store it in your environment variables as CYB_API_KEY. Never commit API keys to version control." },
        { id: "third", title: "Deployment", content: "Run 'cyb deploy --target production' to deploy your model. The system will automatically handle scaling and load balancing." },
      ]}
    />
  </div>
</Story>

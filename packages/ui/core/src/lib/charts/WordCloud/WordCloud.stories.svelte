<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WordCloud from "./WordCloud.svelte";

  const { Story } = defineMeta({
    title: "Charts/WordCloud",
    component: WordCloud,
    tags: ["autodocs"],
  });

  const defaultWords = [
    { text: "Svelte", weight: 100 },
    { text: "TypeScript", weight: 85 },
    { text: "Vite", weight: 75 },
    { text: "Components", weight: 70 },
    { text: "Reactive", weight: 65 },
    { text: "Storybook", weight: 55 },
    { text: "Testing", weight: 50 },
    { text: "Rust", weight: 45 },
    { text: "WebAssembly", weight: 40 },
    { text: "SSR", weight: 35 },
    { text: "Signals", weight: 30 },
    { text: "Runes", weight: 25 },
    { text: "Stores", weight: 20 },
    { text: "Actions", weight: 15 },
  ];

  const mlWords = [
    { text: "Transformer", weight: 100 },
    { text: "Attention", weight: 90 },
    { text: "Embeddings", weight: 80 },
    { text: "Fine-tuning", weight: 70 },
    { text: "RLHF", weight: 65 },
    { text: "Tokenizer", weight: 55 },
    { text: "Inference", weight: 50 },
    { text: "Quantization", weight: 40 },
    { text: "LoRA", weight: 35 },
    { text: "Diffusion", weight: 30 },
  ];
</script>

<Story name="Default" args={{ words: defaultWords }} />

<Story name="ML Keywords" args={{ words: mlWords, colorScheme: ["#bf5af2", "#00d4ff", "#ff6b6b", "#ffd93d", "#22d3ee"] }} />

<Story name="Custom Size" args={{ words: defaultWords, width: 800, height: 400, minFontSize: 10, maxFontSize: 64 }} />

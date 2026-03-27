<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SearchInput from "./SearchInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/SearchInput",
    component: SearchInput,
    tags: ["autodocs"],
  });

  const mlResults = [
    { id: "gpt4", label: "GPT-4 Turbo", description: "128k context, multimodal LLM", icon: "🧠" },
    { id: "claude", label: "Claude 3 Opus", description: "200k context, advanced reasoning", icon: "🧠" },
    { id: "gemini", label: "Gemini Ultra", description: "Google DeepMind flagship model", icon: "🧠" },
    { id: "llama", label: "Llama 3 70B", description: "Open-source Meta model", icon: "🦙" },
    { id: "mistral", label: "Mistral Large", description: "European AI frontier model", icon: "🌀" },
  ];

  const groupedResults = [
    { id: "gpt4", label: "GPT-4 Turbo", description: "Multimodal LLM", group: "Language Models", icon: "🧠" },
    { id: "claude", label: "Claude 3 Opus", description: "Advanced reasoning", group: "Language Models", icon: "🧠" },
    { id: "sd3", label: "Stable Diffusion 3", description: "Text-to-image generation", group: "Image Models", icon: "🎨" },
    { id: "dall-e", label: "DALL-E 3", description: "OpenAI image generation", group: "Image Models", icon: "🎨" },
    { id: "whisper", label: "Whisper v3", description: "Speech recognition", group: "Audio Models", icon: "🎤" },
    { id: "bark", label: "Bark", description: "Text-to-speech synthesis", group: "Audio Models", icon: "🔊" },
  ];
</script>

<Story name="Default" args={{
  placeholder: "Search ML models...",
  value: "GPT",
  results: mlResults,
}} />

<Story name="Loading" args={{
  placeholder: "Search models...",
  value: "transformer",
  loading: true,
  results: [],
}} />

<Story name="Empty" args={{
  placeholder: "Search models...",
  value: "nonexistent-model-xyz",
  results: [],
  showResults: true,
}} />

<Story name="WithGroups" args={{
  placeholder: "Search all AI models...",
  value: "",
  results: groupedResults,
  showResults: true,
}} />

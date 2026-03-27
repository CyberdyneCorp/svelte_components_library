<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WelcomeText from "./WelcomeText.svelte";

  const { Story } = defineMeta({
    title: "Chat/WelcomeText",
    component: WelcomeText,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ subtitle: "Ask me anything about Web3, DeFi, or blockchain technology." }} />

<Story name="CustomTitle" args={{ title: "Welcome to Cyberdyne", subtitle: "Your AI assistant for decentralized operations." }} />

<Story name="WithPrompts">
  <WelcomeText subtitle="Try one of these suggestions to get started.">
    <button style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; background: transparent; color: #fff; cursor: pointer; text-align: left;">Check gas prices</button>
    <button style="padding: 0.75rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; background: transparent; color: #fff; cursor: pointer; text-align: left;">View portfolio</button>
  </WelcomeText>
</Story>

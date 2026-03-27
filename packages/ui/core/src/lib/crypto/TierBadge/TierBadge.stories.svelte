<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TierBadge from "./TierBadge.svelte";

  const { Story } = defineMeta({
    title: "Crypto/TierBadge",
    component: TierBadge,
    tags: ["autodocs"],
  });
</script>

<Story name="AllTiers">
  <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start;">
    <TierBadge tier={1} />
    <TierBadge tier={2} />
    <TierBadge tier={3} />
    <TierBadge tier={4} />
    <TierBadge tier={5} />
    <TierBadge tier={6} />
  </div>
</Story>

<Story name="SingleTier">
  <div style="display: flex; gap: 1rem; align-items: center;">
    <TierBadge tier={4} label="Expert Node" />
    <TierBadge tier={6} label="Founder" />
    <TierBadge tier={2} showLevel={false} />
  </div>
</Story>

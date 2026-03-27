<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NFTCard from "./NFTCard.svelte";

  const { Story } = defineMeta({
    title: "Crypto/NFTCard",
    component: NFTCard,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  name: "CyberPunk #1337",
  collection: "CyberdyneDAO",
  tokenId: "1337",
  price: "0.85",
  currency: "ETH",
}} />

<Story name="WithImage" args={{
  name: "Neural Interface v2",
  image: "https://picsum.photos/seed/nft1/400/400",
  collection: "CyberdyneDAO",
  tokenId: "42",
  price: "2.5",
  currency: "ETH",
}} />

<Story name="WithRarity">
  <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
    <div style="width: 240px;">
      <NFTCard
        name="Legendary Core"
        collection="CyberdyneDAO"
        tokenId="7"
        rarity="Legendary"
        price="15.0"
        currency="ETH"
      />
    </div>
    <div style="width: 240px;">
      <NFTCard
        name="Rare Module"
        collection="CyberdyneDAO"
        tokenId="256"
        rarity="Rare"
        price="1.2"
        currency="ETH"
      />
    </div>
  </div>
</Story>

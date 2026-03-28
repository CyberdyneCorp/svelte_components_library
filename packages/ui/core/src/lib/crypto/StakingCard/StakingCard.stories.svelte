<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StakingCard from "./StakingCard.svelte";

  const { Story } = defineMeta({
    title: "Crypto/StakingCard",
    component: StakingCard,
    tags: ["autodocs"],
  });
</script>

<Story name="Active" args={{
  token: "ETH",
  stakedAmount: "32.00",
  apy: "4.2%",
  rewards: "1.245",
  status: "active",
}} />

<Story name="Locked" args={{
  token: "ETH",
  stakedAmount: "32.00",
  apy: "4.2%",
  rewards: "0.832",
  lockPeriod: "90 days",
  unlockDate: "2026-06-15",
  status: "locked",
}} />

<Story name="Claimable" args={{
  token: "SOL",
  stakedAmount: "500.00",
  apy: "7.1%",
  rewards: "18.750",
  status: "claimable",
}} />

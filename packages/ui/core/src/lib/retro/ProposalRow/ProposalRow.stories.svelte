<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ProposalRow from "./ProposalRow.svelte";
  const { Story } = defineMeta({ title: "Retro/ProposalRow", component: ProposalRow, tags: ["autodocs"] });
</script>

<Story name="Active" args={{ id: 23, title: "Upgrade Neural Network", progress: 88, votesFor: 8900, votesAgainst: 1200, date: "Jan 11, 2025" }} />
<Story name="Passed" args={{ id: 22, title: "Treasury Rebalance", progress: 100, status: "passed", votesFor: 15200, votesAgainst: 800 }} />
<Story name="Rejected" args={{ id: 21, title: "Remove Voting Quorum", progress: 34, status: "rejected", votesFor: 400, votesAgainst: 9500 }} />

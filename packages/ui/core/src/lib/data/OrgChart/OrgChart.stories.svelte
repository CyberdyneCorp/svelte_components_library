<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OrgChart from "./OrgChart.svelte";

  const companyRoot = {
    id: "ceo",
    label: "Alex Morgan",
    title: "CEO",
    color: "var(--color-state-warning)",
    children: [
      {
        id: "vp-eng",
        label: "Jordan Kim",
        title: "VP Engineering",
        color: "var(--color-action-brand-default)",
        children: [
          {
            id: "dir-backend",
            label: "Sam Patel",
            title: "Dir Backend",
            color: "var(--color-action-secondary-default)",
            children: [
              { id: "lead-api", label: "Taylor Wu", title: "Lead API" },
              { id: "lead-ml", label: "Casey Lin", title: "Lead ML" },
            ],
          },
          {
            id: "dir-frontend",
            label: "Riley Chen",
            title: "Dir Frontend",
            color: "var(--color-action-secondary-default)",
            children: [
              { id: "lead-ui", label: "Morgan Lee", title: "Lead UI" },
            ],
          },
        ],
      },
      {
        id: "vp-product",
        label: "Avery Scott",
        title: "VP Product",
        color: "var(--color-state-success)",
        children: [
          { id: "pm-platform", label: "Dana Reeves", title: "PM Platform" },
          { id: "pm-defi", label: "Quinn Torres", title: "PM DeFi" },
        ],
      },
      {
        id: "vp-ops",
        label: "Blake Harper",
        title: "VP Operations",
        color: "var(--color-state-error)",
        children: [
          { id: "devops-lead", label: "Jesse Ruiz", title: "DevOps Lead" },
          { id: "security-lead", label: "Rowan Nash", title: "Security Lead" },
        ],
      },
    ],
  };

  const smallRoot = {
    id: "ceo",
    label: "Alex Morgan",
    title: "CEO",
    children: [
      { id: "cto", label: "Jordan Kim", title: "CTO" },
      { id: "cfo", label: "Avery Scott", title: "CFO" },
    ],
  };

  const { Story } = defineMeta({
    title: "Data/OrgChart",
    component: OrgChart,
    tags: ["autodocs"],
  });
</script>

<Story name="Company" args={{ root: companyRoot, height: "600px" }} />

<Story name="Horizontal" args={{ root: companyRoot, direction: "horizontal", height: "600px" }} />

<Story name="Small" args={{ root: smallRoot, height: "350px" }} />

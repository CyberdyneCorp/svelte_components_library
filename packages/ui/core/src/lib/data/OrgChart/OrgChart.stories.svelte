<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OrgChart from "./OrgChart.svelte";

  const companyRoot = {
    id: "ceo",
    label: "Alex Morgan",
    title: "CEO",
    color: "var(--color-state-warning)",
    department: "Executive",
    email: "alex@cyberdyne.io",
    description: "Founder and CEO of Cyberdyne Corp. Drives the vision for decentralized AI and blockchain infrastructure.",
    children: [
      {
        id: "vp-eng",
        label: "Jordan Kim",
        title: "VP Engineering",
        color: "var(--color-action-brand-default)",
        department: "Engineering",
        email: "jordan@cyberdyne.io",
        description: "Leads all engineering efforts including backend, frontend, ML infrastructure, and blockchain integrations. Manages a team of 30+ engineers.",
        links: [{ label: "GitHub", url: "https://github.com" }, { label: "LinkedIn", url: "https://linkedin.com" }],
        children: [
          {
            id: "dir-backend",
            label: "Sam Patel",
            title: "Dir Backend",
            color: "var(--color-action-secondary-default)",
            department: "Backend Engineering",
            description: "Oversees API development, database architecture, and ML service infrastructure.",
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
    title: "Data Display/OrgChart",
    component: OrgChart,
    tags: ["autodocs"],
  });
</script>

<Story name="Company" args={{ root: companyRoot, height: "600px" }} />

<Story name="Horizontal" args={{ root: companyRoot, direction: "horizontal", height: "600px" }} />

<Story name="Small" args={{ root: smallRoot, height: "350px" }} />

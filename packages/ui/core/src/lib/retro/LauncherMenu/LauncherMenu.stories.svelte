<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LauncherMenu from "./LauncherMenu.svelte";

  const { Story } = defineMeta({
    title: "Retro/LauncherMenu",
    component: LauncherMenu,
    tags: ["autodocs"],
    parameters: {
      backgrounds: { default: "dark" },
    },
  });

  /** A realistic Cyberdyne-OS section set: CORE / ECOSYSTEM / LEARN / SYSTEM,
   *  with a Products entry that has a "View all" submenu footer. */
  const sections = [
    {
      id: "core",
      label: "CORE",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "🛰️", subtitle: "Mission control" },
        { id: "agents", label: "Agents", icon: "🤖", subtitle: "Autonomous workers" },
        { id: "cart", label: "Cart", icon: "🛒", subtitle: "Pending orders", badge: 3 },
      ],
    },
    {
      id: "ecosystem",
      label: "ECOSYSTEM",
      items: [
        {
          id: "products",
          label: "Products",
          icon: "📦",
          subtitle: "Browse the catalog",
          children: [
            { id: "wallet", label: "Wallet", icon: "👛", subtitle: "Custody & keys" },
            { id: "swap", label: "Swap", icon: "🔁", subtitle: "Token exchange" },
            { id: "stake", label: "Stake", icon: "🔒", subtitle: "Earn yield" },
            { id: "products", label: "View all products", icon: "↗" },
          ],
        },
        { id: "dao", label: "DAO", icon: "🏛️", subtitle: "Governance" },
        { id: "news", label: "News", icon: "📰" },
      ],
    },
    {
      id: "learn",
      label: "LEARN",
      items: [
        { id: "docs", label: "Docs", icon: "📚" },
        { id: "matlab", label: "MATLAB", icon: "📈", subtitle: "Notebooks & sims" },
      ],
    },
    {
      id: "system",
      label: "SYSTEM",
      items: [
        { id: "settings", label: "Settings", icon: "⚙️" },
        { id: "logout", label: "Disconnect", icon: "⏻", subtitle: "Log out of Cyberdyne" },
      ],
    },
  ];

  const manySections = [
    ...sections,
    {
      id: "extra",
      label: "EXTRA",
      items: Array.from({ length: 10 }, (_, i) => ({
        id: `extra-${i}`,
        label: `Extra App ${i + 1}`,
        icon: "🧩",
        subtitle: "Fills the scroll container",
      })),
    },
  ];
</script>

<!-- Closed by default; click "Start" to open. -->
<Story name="Default" args={{ sections }} />

<!-- Signed in: green dot, identity pill, copy button. -->
<Story
  name="Signed in"
  args={{
    sections,
    open: true,
    connected: true,
    identity: "0x7aF…9c3B",
    identityFull: "0x7aF1c0Dd5e2B4a9f0123456789abcdef0009c3B",
  }}
/>

<!-- Signed out: grey dot, "NOT SIGNED IN", no identity. -->
<Story name="Signed out" args={{ sections, open: true, connected: false }} />

<!-- Enough sections to exercise the inner scroll container. -->
<Story name="Many sections" args={{ sections: manySections, open: true }} />

<!-- Empty: no sections supplied. -->
<Story name="Empty" args={{ sections: [], open: true }} />

<!-- No search badge / shortcut disabled. -->
<Story name="No search shortcut" args={{ sections, open: true, shortcut: null }} />

<!-- Narrow viewport: the submenu auto-flips to the left of the item.
     View at a small width to see the flip. -->
<Story
  name="Narrow viewport"
  args={{ sections, open: true }}
  parameters={{ viewport: { defaultViewport: "mobile1" } }}
/>

<!-- Custom icon snippet: render a pixel-art square per entry instead of
     the emoji-as-text default. The snippet receives the full entry. -->
<Story name="Custom icon snippet" args={{ sections, open: true }}>
  {#snippet template(args)}
    <LauncherMenu {...args}>
      {#snippet icon(entry)}
        <span
          style="display:inline-grid;place-items:center;width:100%;height:18px;background:linear-gradient(135deg,#4338ca,#818cf8);border:1px solid #1e1b4b;font-size:0.7rem;color:#fff;"
        >
          {entry.label.charAt(0)}
        </span>
      {/snippet}
    </LauncherMenu>
  {/snippet}
</Story>

<!-- Custom account snippet: replace the built-in row with a bespoke
     identity widget / connect-wallet button driven by `connected`. -->
<Story name="Custom account snippet" args={{ sections, open: true, connected: false }}>
  {#snippet template(args)}
    <LauncherMenu {...args}>
      {#snippet account({ connected, identity })}
        <div
          style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;background:#050a25;border:1px solid #312e81;"
        >
          <span style="font-size:0.7rem;color:#c7d2fe;">
            {connected ? `Signed in as ${identity}` : "Bring your own widget"}
          </span>
          <button
            type="button"
            style="font:inherit;font-size:0.7rem;padding:4px 10px;background:#4338ca;color:#fff;border:1px solid #1e1b4b;cursor:pointer;"
          >
            {connected ? "Account" : "Connect Wallet"}
          </button>
        </div>
      {/snippet}
    </LauncherMenu>
  {/snippet}
</Story>

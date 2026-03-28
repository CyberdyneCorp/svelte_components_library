<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Sparkline from "./Sparkline.svelte";

  const { Story } = defineMeta({
    title: "Charts/Sparkline",
    component: Sparkline,
    tags: ["autodocs"],
  });

  const uptrendData = [42, 45, 43, 48, 52, 50, 55, 58, 62, 65];
  const downtrendData = [95, 90, 88, 82, 78, 75, 70, 68, 63, 58];
  const areaData = [30, 35, 32, 40, 38, 45, 50, 48, 55, 60];
  const tableRows = [
    { name: "ETH", price: "$3,245", change: "+4.2%", data: [42, 45, 43, 48, 52, 50, 55, 58, 62, 65] },
    { name: "BTC", price: "$67,890", change: "-1.1%", data: [95, 90, 88, 92, 88, 85, 82, 80, 78, 75] },
    { name: "SOL", price: "$142", change: "+8.7%", data: [20, 22, 25, 28, 26, 30, 35, 38, 42, 48] },
  ];
</script>

<Story name="Default" args={{ data: uptrendData }} />

<Story name="Downtrend" args={{ data: downtrendData, color: "var(--color-state-error)" }} />

<Story name="WithArea" args={{ data: areaData, showArea: true, width: 160, height: 40 }} />

<Story name="InTable">
  <div style="font-family: var(--font-body); color: var(--color-text-primary);">
    <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
      <thead>
        <tr style="border-bottom: 1px solid var(--color-border-subtle);">
          <th style="text-align: left; padding: 8px; font-size: 0.75rem; color: var(--color-text-tertiary);">Token</th>
          <th style="text-align: right; padding: 8px; font-size: 0.75rem; color: var(--color-text-tertiary);">Price</th>
          <th style="text-align: right; padding: 8px; font-size: 0.75rem; color: var(--color-text-tertiary);">24h</th>
          <th style="text-align: center; padding: 8px; font-size: 0.75rem; color: var(--color-text-tertiary);">7d Chart</th>
        </tr>
      </thead>
      <tbody>
        {#each tableRows as row}
          <tr style="border-bottom: 1px solid var(--color-border-subtle);">
            <td style="padding: 8px; font-size: 0.875rem; font-family: var(--font-mono);">{row.name}</td>
            <td style="padding: 8px; font-size: 0.875rem; text-align: right; font-family: var(--font-mono);">{row.price}</td>
            <td style="padding: 8px; font-size: 0.875rem; text-align: right; font-family: var(--font-mono);">{row.change}</td>
            <td style="padding: 8px; text-align: center;">
              <Sparkline data={row.data} width={100} height={28} showArea={true} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Story>

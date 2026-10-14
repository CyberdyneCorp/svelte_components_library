<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import HoverCard from "./HoverCard.svelte";
  import Avatar from "../../primitives/Avatar/Avatar.svelte";

  const { Story } = defineMeta({
    title: "Overlay/HoverCard",
    component: HoverCard,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            "A preview that opens on hover or keyboard focus of a link or button. Touch devices have no hover, so the card must only repeat information that is reachable elsewhere (e.g. on the linked page).",
        },
      },
    },
  });
</script>

<!-- Open by default so the card is visible in docs and visual tests. -->
<Story name="User preview" asChild>
  <div style="padding: 1rem 1rem 10rem;">
    Assigned to
    <HoverCard open>
      {#snippet trigger()}<a href="#ada">@ada</a>{/snippet}
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <Avatar initials="AL" size="md" />
        <div>
          <strong>Ada Lovelace</strong>
          <div style="color: var(--color-text-secondary);">Analyst · London</div>
        </div>
      </div>
      <p style="margin: 0.75rem 0 0;">Owns the billing pipeline and 12 open tasks.</p>
      <a href="#ada-profile">View profile</a>
    </HoverCard>
  </div>
</Story>

<Story name="Positions" asChild>
  <div style="display: flex; gap: 6rem; padding: 8rem 12rem; flex-wrap: wrap;">
    {#each ["top", "right", "bottom", "left"] as const as position (position)}
      <HoverCard {position} openDelay={150}>
        {#snippet trigger()}<button type="button">{position}</button>{/snippet}
        Card on the {position}.
      </HoverCard>
    {/each}
  </div>
</Story>

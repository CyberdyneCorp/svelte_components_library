<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AvatarGroup from "./AvatarGroup.svelte";

  const { Story } = defineMeta({
    title: "Primitives/AvatarGroup",
    component: AvatarGroup,
    tags: ["autodocs"],
  });

  const teamAvatars = [
    { initials: "JC", alt: "John Connor" },
    { initials: "SK", alt: "Sarah Kyle" },
    { initials: "MR", alt: "Miles Reese" },
    { initials: "TD", alt: "T-800 Dyson" },
    { initials: "KR", alt: "Kate Reese" },
  ];

  const manyAvatars = [
    { initials: "JC", alt: "John Connor" },
    { initials: "SK", alt: "Sarah Kyle" },
    { initials: "MR", alt: "Miles Reese" },
    { initials: "TD", alt: "T-800 Dyson" },
    { initials: "KR", alt: "Kate Reese" },
    { initials: "AB", alt: "Alex Burns" },
    { initials: "LP", alt: "Lisa Park" },
    { initials: "DW", alt: "Dan White" },
  ];
</script>

<Story name="Default" args={{ avatars: teamAvatars }} />

<Story name="WithOverflow" args={{ avatars: manyAvatars, max: 4 }} />

<Story name="SmallSize" args={{ avatars: teamAvatars, size: "sm" }} />

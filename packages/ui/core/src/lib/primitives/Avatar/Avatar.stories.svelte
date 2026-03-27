<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Avatar from "./Avatar.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Avatar",
    component: Avatar,
    tags: ["autodocs"],
  });
</script>

<Story name="WithImage">
  <Avatar
    src="https://i.pravatar.cc/128?img=3"
    alt="User avatar"
    size="lg"
  />
</Story>

<Story name="WithInitials">
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <Avatar initials="CY" size="sm" />
    <Avatar initials="JD" size="md" />
    <Avatar initials="ML" size="lg" />
    <Avatar initials="AI" size="xl" />
  </div>
</Story>

<Story name="WithStatus">
  <div style="display: flex; align-items: center; gap: 1rem;">
    <Avatar initials="ON" size="lg" status="online" />
    <Avatar initials="OF" size="lg" status="offline" />
    <Avatar initials="BS" size="lg" status="busy" />
  </div>
</Story>

<Story name="Sizes">
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <Avatar initials="SM" size="sm" status="online" />
    <Avatar initials="MD" size="md" status="online" />
    <Avatar initials="LG" size="lg" status="online" />
    <Avatar initials="XL" size="xl" status="online" />
  </div>
</Story>

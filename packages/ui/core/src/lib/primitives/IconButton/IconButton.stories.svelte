<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import IconButton from "./IconButton.svelte";

  const { Story } = defineMeta({
    title: "Primitives/IconButton",
    component: IconButton,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });
</script>

<Story name="Ghost" asChild>
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <IconButton icon="settings" label="Settings" variant="ghost" />
    <IconButton icon="search" label="Search" variant="ghost" />
    <IconButton icon="menu" label="Menu" variant="ghost" />
    <IconButton icon="x" label="Close" variant="ghost" />
  </div>
</Story>

<Story name="Outline" asChild>
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <IconButton icon="plus" label="Add" variant="outline" />
    <IconButton icon="copy" label="Copy" variant="outline" />
    <IconButton icon="external-link" label="Open" variant="outline" />
  </div>
</Story>

<Story name="Sizes" asChild>
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <IconButton icon="zap" label="Small" variant="outline" size="sm" />
    <IconButton icon="zap" label="Medium" variant="outline" size="md" />
    <IconButton icon="zap" label="Large" variant="outline" size="lg" />
  </div>
</Story>

<Story name="WithBadge" asChild>
  <div style="display: flex; align-items: center; gap: 0.75rem;">
    <IconButton icon="bell" label="Notifications" badge={1} badgeLabel="1 unread" />
    <IconButton
      icon="bell"
      label="Notifications"
      badge={12}
      badgeLabel="12 unread"
      variant="outline"
    />
    <IconButton
      icon="bell"
      label="Notifications"
      badge="99+"
      badgeLabel="More than 99 unread"
      size="lg"
    />
    <IconButton
      icon="bell"
      label="Notifications"
      badge={3}
      badgeLabel="3 unread"
      size="sm"
      variant="outline"
    />
  </div>
</Story>

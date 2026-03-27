<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Textarea from "./Textarea.svelte";

  const { Story } = defineMeta({
    title: "Forms/Textarea",
    component: Textarea,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <Textarea placeholder="Enter your message..." />
</Story>

<Story name="WithLabel">
  <Textarea label="Description" placeholder="Describe your model architecture..." rows={6} />
</Story>

<Story name="WithError">
  <Textarea label="Notes" value="Too short" error="Description must be at least 50 characters" />
</Story>

<Story name="WithMaxLength">
  <Textarea label="Bio" placeholder="Write a short bio..." maxlength={280} hint="Keep it brief" />
</Story>

<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Textarea from "./Textarea.svelte";

  const { Story } = defineMeta({
    title: "Forms/Textarea",
    component: Textarea,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ placeholder: "Enter your message..." }} />

<Story name="WithLabel" args={{ label: "Description", placeholder: "Describe your model architecture...", rows: 6 }} />

<Story name="WithError" args={{ label: "Notes", value: "Too short", error: "Description must be at least 50 characters" }} />

<Story name="WithMaxLength" args={{ label: "Bio", placeholder: "Write a short bio...", maxlength: 280, hint: "Keep it brief" }} />

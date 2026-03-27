<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FileDropzone from "./FileDropzone.svelte";

  const { Story } = defineMeta({
    title: "Forms/FileDropzone",
    component: FileDropzone,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ accept: ".csv,.json", maxSize: 10, onfiles: (files) => console.log("Files:", files) }} />

<Story name="MultipleFiles" args={{ multiple: true, accept: "image/*", maxSize: 5, onfiles: (files) => console.log("Files:", files) }} />

<Story name="Disabled" args={{ disabled: true }} />

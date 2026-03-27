<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FileDropzone from "./FileDropzone.svelte";

  const { Story } = defineMeta({
    title: "Forms/FileDropzone",
    component: FileDropzone,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <FileDropzone accept=".csv,.json" maxSize={10} onfiles={(files) => console.log("Files:", files)} />
</Story>

<Story name="MultipleFiles">
  <FileDropzone multiple accept="image/*" maxSize={5} onfiles={(files) => console.log("Files:", files)} />
</Story>

<Story name="Disabled">
  <FileDropzone disabled />
</Story>

<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelFileIcon from "./PixelFileIcon.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelFileIcon", component: PixelFileIcon, tags: ["autodocs"] });
</script>

<Story name="File" args={{ name: "readme.md", size: 48 }} />
<Story name="Folder" args={{ kind: "folder", size: 48, name: "Documents" }} />
<Story name="CustomExt" args={{ extension: "zip", size: 48 }} />

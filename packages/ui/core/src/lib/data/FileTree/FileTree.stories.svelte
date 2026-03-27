<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FileTree from "./FileTree.svelte";

  const { Story } = defineMeta({
    title: "Data Display/FileTree",
    component: FileTree,
    tags: ["autodocs"],
  });

  const projectItems = [
    {
      name: "src",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "lib",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "components",
              type: "folder",
              children: [
                { name: "Button.svelte", type: "file" },
                { name: "Toggle.svelte", type: "file" },
                { name: "Avatar.svelte", type: "file" },
              ],
            },
            {
              name: "utils",
              type: "folder",
              children: [
                { name: "format.ts", type: "file" },
                { name: "helpers.ts", type: "file" },
              ],
            },
            { name: "index.ts", type: "file" },
          ],
        },
        { name: "app.css", type: "file" },
        { name: "main.ts", type: "file" },
      ],
    },
    { name: "package.json", type: "file" },
    { name: "README.md", type: "file" },
    { name: "tsconfig.json", type: "file" },
  ];

  const deepItems = [
    {
      name: "cyberdyne",
      type: "folder",
      expanded: true,
      children: [
        {
          name: "core",
          type: "folder",
          expanded: true,
          children: [
            {
              name: "neural",
              type: "folder",
              expanded: true,
              children: [
                {
                  name: "processors",
                  type: "folder",
                  children: [
                    { name: "cortex.ts", type: "file" },
                    { name: "synapse.ts", type: "file" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const flatItems = [
    { name: "index.ts", type: "file" },
    { name: "styles.css", type: "file" },
    { name: "config.json", type: "file" },
    { name: "App.svelte", type: "file" },
    { name: "README.md", type: "file" },
  ];
</script>

<Story name="ProjectStructure" args={{ items: projectItems }} />

<Story name="DeepNesting" args={{ items: deepItems }} />

<Story name="SingleLevel" args={{ items: flatItems }} />

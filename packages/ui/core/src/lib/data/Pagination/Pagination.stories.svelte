<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Pagination from "./Pagination.svelte";

  const { Story } = defineMeta({
    title: "Data Display/Pagination",
    component: Pagination,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ currentPage: 1, totalPages: 5 }} />

<Story name="ManyPages" args={{ currentPage: 5, totalPages: 42 }} />

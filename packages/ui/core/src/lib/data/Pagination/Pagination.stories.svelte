<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Pagination from "./Pagination.svelte";

  const { Story } = defineMeta({
    title: "Data Display/Pagination",
    component: Pagination,
    tags: ["autodocs"],
  });
</script>

<script>
  let page1 = $state(1);
  let page2 = $state(5);
</script>

<Story name="Default">
  <Pagination bind:currentPage={page1} totalPages={5} />
  <p style="color: var(--color-text-tertiary); margin-top: 1rem; font-family: var(--font-mono); font-size: 0.75rem;">
    Page: {page1}
  </p>
</Story>

<Story name="ManyPages">
  <Pagination bind:currentPage={page2} totalPages={42} />
  <p style="color: var(--color-text-tertiary); margin-top: 1rem; font-family: var(--font-mono); font-size: 0.75rem;">
    Page: {page2} / 42
  </p>
</Story>

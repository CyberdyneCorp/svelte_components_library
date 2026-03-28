<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StarRating from "./StarRating.svelte";

  const { Story } = defineMeta({
    title: "Primitives/StarRating",
    component: StarRating,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  value: 3,
  max: 5,
  size: "md",
  readonly: false,
  onchange: (v) => console.log("Rating:", v),
}} />

<Story name="Readonly" args={{
  value: 4.5,
  max: 5,
  readonly: true,
  showValue: true,
  allowHalf: true,
}} />

<Story name="HalfStars" args={{
  value: 3.5,
  max: 5,
  allowHalf: true,
  onchange: (v) => console.log("Rating:", v),
}} />

<Story name="Small" args={{
  value: 3,
  max: 5,
  size: "sm",
  onchange: (v) => console.log("Rating:", v),
}} />

<Story name="WithLabel" args={{
  value: 0,
  max: 5,
  label: "How satisfied are you with this tool?",
  onchange: (v) => console.log("Rating:", v),
}} />

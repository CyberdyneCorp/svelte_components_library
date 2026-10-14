<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import QueryBuilder from "./QueryBuilder.svelte";
  import type { Query, QueryField } from "./query.js";

  const fields: QueryField[] = [
    { key: "name", label: "Name", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "enum",
      options: [
        { value: "active", label: "Active" },
        { value: "paused", label: "Paused" },
        { value: "archived", label: "Archived" },
      ],
    },
    { key: "price", label: "Price", type: "number" },
    { key: "created", label: "Created", type: "date" },
    { key: "featured", label: "Featured", type: "boolean" },
  ];

  const filled: Query = {
    combinator: "and",
    conditions: [
      { id: "c1", field: "status", operator: "in", value: ["active", "paused"] },
      { id: "c2", field: "price", operator: "between", value: [10, 50] },
      { id: "c3", field: "created", operator: "after", value: "2026-01-01" },
    ],
  };

  const { Story } = defineMeta({
    title: "Forms/QueryBuilder",
    component: QueryBuilder,
    tags: ["autodocs"],
    parameters: { a11y: { test: "error" } },
  });
</script>

<Story
  name="Empty"
  args={{ fields }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Add condition" }));
    await expect(canvas.getByRole("group", { name: "Condition 1" })).toBeInTheDocument();
  }}
/>

<Story name="With conditions" args={{ fields, query: filled }} />

<Story name="Match any, max three" args={{ fields, query: { ...filled, combinator: "or" }, maxConditions: 3 }} />

<!-- Every string is overridable; here in Portuguese. -->
<Story
  name="Localized (pt-BR)"
  args={{
    fields: [
      { key: "nome", label: "Nome", type: "text" },
      { key: "valor", label: "Valor", type: "number" },
    ],
    query: { combinator: "and", conditions: [{ id: "c1", field: "nome", operator: "contains", value: "ana" }] },
    ariaLabel: "Condições de filtro",
    labels: {
      addCondition: "Adicionar condição",
      removeCondition: (n: number) => `Remover condição ${n}`,
      condition: (n: number) => `Condição ${n}`,
      field: "Campo",
      operator: "Operador",
      value: "Valor",
      operators: { contains: "contém", not_contains: "não contém", eq: "é", neq: "não é" },
    },
  }}
/>

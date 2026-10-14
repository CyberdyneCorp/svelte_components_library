<svelte:options runes={true} />

<script lang="ts">
  import TextInput from "../TextInput/TextInput.svelte";
  import Checkbox from "../Checkbox/Checkbox.svelte";
  import {
    valueShape,
    type QueryField,
    type QueryLabels,
    type QueryOperator,
    type QueryScalar,
    type QueryValue,
  } from "./query.js";

  /** The value control of one QueryBuilder row, chosen by operator shape and field type. */
  let {
    field,
    operator,
    value,
    labels,
    onchange,
  }: {
    field: QueryField;
    operator: QueryOperator;
    value: QueryValue | undefined;
    labels: QueryLabels;
    onchange: (value: QueryValue | undefined) => void;
  } = $props();

  let shape = $derived(valueShape(operator));
  let inputType = $derived<"number" | "date" | "text">(
    field.type === "number" || field.type === "date" ? field.type : "text",
  );
  let range = $derived<[QueryScalar | undefined, QueryScalar | undefined]>(
    Array.isArray(value) && shape === "range" ? (value as [QueryScalar, QueryScalar]) : [undefined, undefined],
  );
  let list = $derived<string[]>(Array.isArray(value) && shape === "list" ? (value as string[]) : []);

  /** Text from an input → the typed scalar (numbers parse; empty is undefined). */
  function parse(text: string): QueryScalar | undefined {
    if (text.trim() === "") return undefined;
    if (field.type !== "number") return text;
    const n = Number(text);
    return Number.isFinite(n) ? n : undefined;
  }

  function inputText(v: unknown): string {
    return v === undefined || v === null ? "" : String(v);
  }

  function setRange(index: 0 | 1, text: string) {
    const next: [QueryScalar | undefined, QueryScalar | undefined] = [...range];
    next[index] = parse(text);
    onchange(next);
  }

  function toggleOption(option: string, checked: boolean) {
    const next = checked ? [...list, option] : list.filter((v) => v !== option);
    onchange(next.length ? next : undefined);
  }

  const read = (e: Event) => (e.currentTarget as HTMLInputElement).value;
</script>

{#if shape === "single"}
  <div class="cy-query-value">
    <TextInput
      type={inputType}
      value={inputText(value)}
      aria-label={labels.value}
      oninput={(e) => onchange(parse(read(e)))}
    />
  </div>
{:else if shape === "range"}
  <div class="cy-query-value cy-query-value--range">
    <TextInput
      type={inputType}
      value={inputText(range[0])}
      aria-label={labels.from}
      oninput={(e) => setRange(0, read(e))}
    />
    <span class="cy-query-value__join" aria-hidden="true">{labels.rangeJoin}</span>
    <TextInput
      type={inputType}
      value={inputText(range[1])}
      aria-label={labels.to}
      oninput={(e) => setRange(1, read(e))}
    />
  </div>
{:else if shape === "list"}
  <fieldset class="cy-query-value cy-query-value--list">
    <legend class="cy-query-value__sr-only">{labels.values}</legend>
    {#each field.options ?? [] as option (option.value)}
      <Checkbox
        label={option.label}
        checked={list.includes(option.value)}
        onchange={(checked) => toggleOption(option.value, checked)}
      />
    {/each}
  </fieldset>
{/if}

<style>
  .cy-query-value {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
    flex: 1 1 12rem;
  }

  .cy-query-value--range :global(.cy-text-input) {
    flex: 1 1 0;
  }

  .cy-query-value--list {
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    margin: 0;
    padding: 0;
    border: none;
  }

  .cy-query-value__join {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .cy-query-value__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>

<svelte:options runes={true} />

<script lang="ts">
  import { tick } from "svelte";
  import Select from "../Select/Select.svelte";
  import Button from "../../primitives/Button/Button.svelte";
  import IconButton from "../../primitives/IconButton/IconButton.svelte";
  import Icon from "../../primitives/Icon/Icon.svelte";
  import QueryValueInput from "./QueryValueInput.svelte";
  import {
    createCondition,
    defaultOperator,
    emptyQuery,
    mergeQueryLabels,
    operatorsFor,
    valueShape,
    type Query,
    type QueryCondition,
    type QueryField,
    type QueryLabelsInput,
    type QueryOperator,
    type QueryValue,
  } from "./query.js";

  let {
    fields,
    query = $bindable(emptyQuery()),
    onchange,
    maxConditions,
    labels = {},
    ariaLabel = "Filter conditions",
  }: {
    /** Fields a condition can test. */
    fields: QueryField[];
    /** The edited query; every edit replaces it with a new object. */
    query?: Query;
    /** Called with the new query after every edit, including incomplete rows. */
    onchange?: (query: Query) => void;
    /** Disables "Add condition" once this many conditions exist. */
    maxConditions?: number;
    /** Localized strings; each key falls back to English. */
    labels?: QueryLabelsInput;
    /** Accessible name of the builder group. */
    ariaLabel?: string;
  } = $props();

  const uid = `cy-qb-${Math.random().toString(36).slice(2, 9)}`;

  let l = $derived(mergeQueryLabels(labels));
  let addRef: HTMLButtonElement | null = $state(null);
  let fieldOptions = $derived(fields.map((f) => ({ value: f.key, label: f.label })));
  let atLimit = $derived(maxConditions !== undefined && query.conditions.length >= maxConditions);
  let combinatorOptions = $derived([
    { value: "and", label: l.matchAll },
    { value: "or", label: l.matchAny },
  ]);

  const fieldSelectId = (id: string) => `${uid}-${id}-field`;
  const fieldOf = (key: string) => fields.find((f) => f.key === key);
  const selectValue = (e: Event) => (e.currentTarget as HTMLSelectElement).value;

  function operatorOptions(condition: QueryCondition) {
    const field = fieldOf(condition.field);
    return field ? operatorsFor(field.type).map((op) => ({ value: op, label: l.operators[op] })) : [];
  }

  function commit(next: Partial<Query>) {
    query = { ...query, ...next };
    onchange?.(query);
  }

  function replace(index: number, condition: QueryCondition) {
    commit({ conditions: query.conditions.map((c, i) => (i === index ? condition : c)) });
  }

  /** The condition with `value` set, or without the key when `value` is undefined. */
  function withValue(condition: QueryCondition, value: QueryValue | undefined): QueryCondition {
    const { value: _old, ...rest } = condition;
    return value === undefined ? rest : { ...rest, value };
  }

  function setField(index: number, key: string) {
    const field = fieldOf(key);
    if (!field) return;
    const { id } = query.conditions[index];
    replace(index, { id, field: key, operator: defaultOperator(field.type) });
  }

  function setOperator(index: number, operator: QueryOperator) {
    const condition = query.conditions[index];
    const keep = valueShape(condition.operator) === valueShape(operator);
    replace(index, withValue({ ...condition, operator }, keep ? condition.value : undefined));
  }

  async function focusField(condition: QueryCondition | undefined) {
    await tick();
    const target = condition ? document.getElementById(fieldSelectId(condition.id)) : addRef;
    target?.focus();
  }

  function add() {
    if (atLimit || fields.length === 0) return;
    const condition = createCondition(fields[0]);
    commit({ conditions: [...query.conditions, condition] });
    focusField(condition);
  }

  function remove(index: number) {
    const conditions = query.conditions.filter((_, i) => i !== index);
    commit({ conditions });
    focusField(conditions[index] ?? conditions[index - 1]);
  }
</script>

<div class="cy-query-builder" role="group" aria-label={ariaLabel}>
  {#if query.conditions.length >= 2}
    <div class="cy-query-builder__combinator">
      <Select
        ariaLabel={l.combinator}
        placeholder={null}
        value={query.combinator}
        options={combinatorOptions}
        onchange={(e) => commit({ combinator: selectValue(e) as Query["combinator"] })}
      />
    </div>
  {/if}

  {#each query.conditions as condition, i (condition.id)}
    {@const field = fieldOf(condition.field)}
    <fieldset class="cy-query-builder__row">
      <legend class="cy-query-builder__sr-only">{l.condition(i + 1)}</legend>
      <div class="cy-query-builder__select">
        <Select
          id={fieldSelectId(condition.id)}
          ariaLabel={l.field}
          placeholder={null}
          value={condition.field}
          options={fieldOptions}
          onchange={(e) => setField(i, selectValue(e))}
        />
      </div>
      <div class="cy-query-builder__select">
        <Select
          ariaLabel={l.operator}
          placeholder={null}
          value={condition.operator}
          options={operatorOptions(condition)}
          onchange={(e) => setOperator(i, selectValue(e) as QueryOperator)}
        />
      </div>
      {#if field}
        <QueryValueInput
          {field}
          operator={condition.operator}
          value={condition.value}
          labels={l}
          onchange={(value) => replace(i, withValue(condition, value))}
        />
      {/if}
      <span class="cy-query-builder__remove">
        <IconButton icon="x" label={l.removeCondition(i + 1)} size="sm" onclick={() => remove(i)} />
      </span>
    </fieldset>
  {/each}

  <div class="cy-query-builder__add">
    <Button variant="ghost" size="sm" disabled={atLimit} bind:ref={addRef} onclick={add}>
      <Icon name="plus" size={14} />
      {l.addCondition}
    </Button>
  </div>
</div>

<style>
  .cy-query-builder {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-family: var(--font-body);
  }

  .cy-query-builder__combinator {
    max-width: 14rem;
  }

  .cy-query-builder__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    padding: var(--space-2);
    border: var(--border-width) var(--border-style) var(--color-border-subtle);
    border-radius: var(--radius-md);
    background: var(--color-surface-default);
  }

  .cy-query-builder__select {
    flex: 0 1 11rem;
    min-width: 8rem;
  }

  .cy-query-builder__remove {
    margin-inline-start: auto;
  }

  .cy-query-builder__add {
    display: flex;
  }

  .cy-query-builder__sr-only {
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

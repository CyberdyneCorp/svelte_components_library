<svelte:options runes={true} />

<script lang="ts" generics="T">
  import Select from "../../forms/Select/Select.svelte";
  import TextInput from "../../forms/TextInput/TextInput.svelte";
  import Badge from "../../primitives/Badge/Badge.svelte";
  import SplitButton from "../../primitives/SplitButton/SplitButton.svelte";
  import type { SplitButtonItem } from "../../primitives/SplitButton/types.js";
  import Dialog from "../../feedback/Dialog/Dialog.svelte";
  import { DEFAULT_SAVED_VIEWS_LABELS, type SavedView, type SavedViewsLabels } from "./types.js";

  let {
    views,
    activeId = $bindable(),
    dirty = false,
    onselect,
    onsave,
    onupdate,
    onrename,
    ondelete,
    labels = {},
    label = "View",
  }: {
    /** Views to choose from; storage is the application's. */
    views: SavedView<T>[];
    /** Id of the active view. */
    activeId?: string;
    /** The current state differs from the active view's (computed by the application). */
    dirty?: boolean;
    /** Called when a view is chosen; the application restores `view.state`. */
    onselect: (view: SavedView<T>) => void;
    /** Save the current state as a new view with this (trimmed) name. */
    onsave: (name: string) => void;
    /** Save the current state into the active, non-built-in view. */
    onupdate?: (view: SavedView<T>) => void;
    onrename?: (view: SavedView<T>, name: string) => void;
    ondelete?: (view: SavedView<T>) => void;
    /** Localized strings; each key falls back to English. */
    labels?: Partial<SavedViewsLabels>;
    /** Visible label of the view select. */
    label?: string;
  } = $props();

  type NameMode = "save" | "rename";

  let l = $derived({ ...DEFAULT_SAVED_VIEWS_LABELS, ...labels });
  let active = $derived(views.find((v) => v.id === activeId));
  let editable = $derived(!!active && !active.builtin);
  let primaryUpdates = $derived(editable && dirty && !!onupdate);

  let nameMode = $state<NameMode | null>(null);
  let name = $state("");
  let deleteOpen = $state(false);

  let trimmed = $derived(name.trim());
  let duplicate = $derived(
    views.some((v) => v.name.trim().toLowerCase() === trimmed.toLowerCase() && !(nameMode === "rename" && v.id === activeId)),
  );
  let nameValid = $derived(trimmed !== "" && !duplicate);

  let menuItems = $derived.by(() => {
    const items: SplitButtonItem[] = [{ label: l.saveAsNew, value: "save" }];
    if (editable && onrename) items.push({ label: l.rename, value: "rename" });
    if (editable && ondelete) items.push({ label: l.delete, value: "delete", variant: "danger" });
    return items;
  });

  function choose(id: string) {
    const view = views.find((v) => v.id === id);
    if (!view) return;
    activeId = id;
    onselect(view);
  }

  function openName(mode: NameMode) {
    name = mode === "rename" ? (active?.name ?? "") : "";
    nameMode = mode;
  }

  const menuActions: Record<string, () => void> = {
    save: () => openName("save"),
    rename: () => openName("rename"),
    delete: () => (deleteOpen = true),
  };

  function primary() {
    if (primaryUpdates && active) onupdate?.(active);
    else openName("save");
  }

  function confirmName() {
    if (!nameValid) return;
    if (nameMode === "rename" && active) onrename?.(active, trimmed);
    else if (nameMode === "save") onsave(trimmed);
    nameMode = null;
  }

  function handleNameKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && nameValid) {
      e.preventDefault();
      confirmName();
    }
  }
</script>

<div class="cy-saved-views">
  <div class="cy-saved-views__select">
    <Select
      {label}
      value={activeId ?? ""}
      placeholder={l.placeholder}
      options={views.map((v) => ({ value: v.id, label: v.name }))}
      onchange={(e) => choose((e.currentTarget as HTMLSelectElement).value)}
    />
  </div>
  {#if dirty}
    <Badge variant="info" size="sm">{l.modified}</Badge>
  {/if}
  <SplitButton
    label={primaryUpdates ? l.saveChanges : l.saveAsNew}
    onclick={primary}
    items={menuItems}
    onselect={(value) => menuActions[value]?.()}
    variant="secondary"
    size="sm"
    menuLabel={l.actions}
    align="right"
  />
</div>

<Dialog
  open={nameMode !== null}
  title={nameMode === "rename" && active ? l.renameTitle(active.name) : l.saveAsNew}
  confirmLabel={l.save}
  cancelLabel={l.cancel}
  confirmDisabled={!nameValid}
  onconfirm={confirmName}
  oncancel={() => (nameMode = null)}
>
  <TextInput
    label={l.viewName}
    bind:value={name}
    error={duplicate ? l.duplicateName : ""}
    autocomplete="off"
    onkeydown={handleNameKeydown}
  />
</Dialog>

<Dialog
  bind:open={deleteOpen}
  variant="danger"
  title={active ? l.deleteTitle(active.name) : l.delete}
  confirmLabel={l.delete}
  cancelLabel={l.cancel}
  onconfirm={() => active && ondelete?.(active)}
>
  <p class="cy-saved-views__body">{l.deleteBody}</p>
</Dialog>

<style>
  .cy-saved-views {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--space-2);
    font-family: var(--font-body);
  }

  .cy-saved-views__select {
    flex: 0 1 16rem;
    min-width: 10rem;
  }

  .cy-saved-views__body {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
</style>

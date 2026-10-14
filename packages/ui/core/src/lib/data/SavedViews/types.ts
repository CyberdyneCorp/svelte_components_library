/** One named view; `state` is whatever the application restores on select. */
export interface SavedView<T = unknown> {
  id: string;
  name: string;
  state: T;
  /** Built-in views cannot be updated, renamed or deleted. */
  builtin?: boolean;
}

/** User-visible strings of `SavedViews`, English by default. */
export interface SavedViewsLabels {
  placeholder: string;
  modified: string;
  saveChanges: string;
  saveAsNew: string;
  rename: string;
  delete: string;
  actions: string;
  viewName: string;
  save: string;
  cancel: string;
  duplicateName: string;
  renameTitle: (name: string) => string;
  deleteTitle: (name: string) => string;
  deleteBody: string;
}

export const DEFAULT_SAVED_VIEWS_LABELS: SavedViewsLabels = {
  placeholder: "Choose a view",
  modified: "Modified",
  saveChanges: "Save changes",
  saveAsNew: "Save as new view",
  rename: "Rename",
  delete: "Delete",
  actions: "View actions",
  viewName: "View name",
  save: "Save",
  cancel: "Cancel",
  duplicateName: "A view with this name already exists",
  renameTitle: (name) => `Rename “${name}”`,
  deleteTitle: (name) => `Delete “${name}”?`,
  deleteBody: "This view will be removed. The data it shows is not affected.",
};

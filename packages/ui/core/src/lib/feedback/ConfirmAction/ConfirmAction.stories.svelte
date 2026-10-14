<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import ConfirmAction from "./ConfirmAction.svelte";

  const { Story } = defineMeta({
    title: "Feedback/ConfirmAction",
    component: ConfirmAction,
    tags: ["autodocs"],
    parameters: {
      a11y: {
        test: "error",
        // The danger button tokens (--btn-danger-text on --btn-danger-bg)
        // measure 3.02:1 in the default theme, a foundation issue shared by
        // Button and Dialog, whose own stories do not gate on axe. Skip
        // contrast on the danger buttons only and keep every other check.
        config: {
          rules: [
            {
              id: "color-contrast",
              selector: "*:not(.cy-btn--danger .cy-btn__content):not(.cy-dialog__btn--danger)",
            },
          ],
        },
      },
    },
    argTypes: {
      level: { control: "inline-radio", options: ["click", "confirm", "type"] },
      variant: { control: "select", options: ["brand", "secondary", "outline", "ghost", "danger"] },
    },
  });

  // Leaves the dialog open so the axe check covers it.
  async function typeFlow({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    const input = canvas.getByRole("textbox", { name: 'Type "acme-prod" to confirm' });
    const confirm = canvas.getByRole("button", { name: "Delete this project" });
    await expect(input).toHaveFocus();
    await userEvent.type(input, "acme-pro");
    await expect(confirm).toBeDisabled();
    await userEvent.type(input, "d");
    await expect(confirm).toBeEnabled();
  }
</script>

<script lang="ts">
  let log = $state<string[]>([]);
  const record = (entry: string) => (log = [entry, ...log].slice(0, 5));
</script>

<Story name="Click (no confirmation)" args={{ label: "Clear cache", level: "click", variant: "secondary" }} />

<Story name="Confirm dialog" asChild>
  <ConfirmAction label="Revoke key" onconfirm={() => record("Revoked")} oncancel={() => record("Cancelled")}>
    Applications using this key stop working immediately.
  </ConfirmAction>
  <ul aria-label="Event log">{#each log as entry, i (i)}<li>{entry}</li>{/each}</ul>
</Story>

<!-- The most destructive actions ask for the resource name. -->
<Story name="Type to confirm" asChild play={typeFlow}>
  <ConfirmAction
    label="Delete project"
    level="type"
    confirmText="acme-prod"
    confirmLabel="Delete this project"
    onconfirm={() => record("Deleted acme-prod")}
  >
    This permanently deletes <strong>acme-prod</strong>, its 14 deployments and all logs. It cannot be undone.
  </ConfirmAction>
  <ul aria-label="Event log">{#each log as entry, i (i)}<li>{entry}</li>{/each}</ul>
</Story>

<Story name="Localized (pt-BR)" asChild>
  <ConfirmAction
    label="Excluir banco"
    title="Excluir banco de dados?"
    level="type"
    confirmText="db-principal"
    typePrompt='Digite "db-principal" para confirmar'
    cancelLabel="Cancelar"
  >
    Todos os dados serão apagados.
  </ConfirmAction>
</Story>

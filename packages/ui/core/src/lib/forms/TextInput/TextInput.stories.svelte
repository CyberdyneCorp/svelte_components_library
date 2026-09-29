<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import TextInput from "./TextInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/TextInput",
    component: TextInput,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Text field. Native attributes `autocomplete`, `spellcheck`, `maxlength`, `name` and `inputmode`, plus any `aria-*` / `data-*` attribute, reach the native `<input>`. A consumer `aria-describedby` is appended after the component's own hint / error id. Label typography comes from the `--input-label-*` tokens (mono uppercase by default, sentence case in the calm themes).",
        },
      },
    },
  });

  /** Default labels stay mono uppercase; calm labels switch via the --input-label-* tokens. */
  async function labelTypography({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const style = async (text: string) => getComputedStyle(await canvas.findByText(text));
    const standard = await style("Default label");
    await expect(standard.textTransform).toBe("uppercase");
    await expect(standard.fontFamily).toContain("JetBrains Mono");
    const calm = await style("Full name");
    await expect(calm.textTransform).toBe("none");
    await expect(calm.letterSpacing).toBe("normal");
    await expect(calm.fontFamily).toMatch(/^"?Inter/);
  }
</script>

<Story name="Default" args={{ placeholder: "Enter text..." }} />

<Story name="WithLabel" args={{ label: "Wallet Address", placeholder: "0x..." }} />

<Story name="WithHint" args={{ label: "API Key", placeholder: "Enter your key", hint: "Found in your dashboard settings" }} />

<Story name="WithError" args={{ label: "Email", value: "not-an-email", error: "Please enter a valid email address" }} />

<Story name="Disabled" args={{ label: "Node ID", value: "node-0x4f2a", disabled: true }} />

<Story name="Types">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <TextInput label="Text" type="text" placeholder="Plain text" />
    <TextInput label="Email" type="email" placeholder="user@cyberdyne.io" />
    <TextInput label="URL" type="url" placeholder="https://..." />
    <TextInput label="Number" type="number" placeholder="0" />
  </div>
</Story>

<Story name="NativeAttributes">
  {#snippet template()}
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <p id="address-help" style="margin: 0; font-size: 0.75rem; color: var(--color-text-tertiary);">
        Watch-only: paste a public address, never a seed phrase.
      </p>
      <TextInput
        label="Wallet address"
        name="address"
        placeholder="0x…"
        autocomplete="off"
        spellcheck={false}
        maxlength={42}
        hint="42 characters, starting with 0x"
        aria-describedby="address-help"
        data-testid="wallet-address"
      />
      <TextInput label="Verification code" name="otp" inputmode="numeric" autocomplete="one-time-code" maxlength={6} />
    </div>
  {/snippet}
</Story>

<Story name="CalmLabels" play={labelTypography}>
  {#snippet template()}
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <TextInput label="Default label" placeholder="Mono uppercase" />
      <div data-theme="calm" style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; background: var(--color-bg-primary);">
        <TextInput label="Full name" placeholder="Ada Lovelace" />
        <TextInput label="Email" type="email" placeholder="ada@example.com" hint="Calm labels use sentence case in the body font." />
      </div>
    </div>
  {/snippet}
</Story>

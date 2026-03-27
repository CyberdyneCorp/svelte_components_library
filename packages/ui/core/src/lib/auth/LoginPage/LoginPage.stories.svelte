<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LoginPage from "./LoginPage.svelte";

  const { Story } = defineMeta({
    title: "Auth/LoginPage",
    component: LoginPage,
    tags: ["autodocs"],
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<Story name="Both (Credentials + Wallet)" args={{
  onsubmit: (data) => console.log("Login:", data),
  onsignup: () => console.log("Sign up"),
  onforgotpassword: () => console.log("Forgot password"),
}} />

<Story name="Credentials Only" args={{
  mode: "credentials",
  onsubmit: (data) => console.log("Login:", data),
}} />

<Story name="Wallet Only" args={{
  mode: "wallet",
  title: "Connect to Cyberdyne",
  subtitle: "Choose your preferred wallet",
}} />

<Story name="With Error" args={{
  error: "Invalid credentials. Please check your email and password.",
  email: "user@cyberdyne.io",
  onsubmit: (data) => console.log("Login:", data),
}} />

<Story name="Loading" args={{
  loading: true,
  email: "satoshi@cyberdyne.io",
  onsubmit: (data) => console.log("Login:", data),
}} />

<Story name="With Custom Wallet Section">
  <LoginPage onsubmit={(data) => console.log("Login:", data)}>
    {#snippet walletSection()}
      <div style="text-align: center; padding: 1rem; border: 1px dashed var(--color-border-default); border-radius: 8px; color: var(--color-text-tertiary); font-size: 0.875rem;">
        Custom wallet integration goes here (e.g., WalletConnect component)
      </div>
    {/snippet}
  </LoginPage>
</Story>

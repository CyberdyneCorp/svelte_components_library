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

<Story name="Both (Credentials + Wallet)">
  <LoginPage
    onsubmit={(data) => console.log("Login:", data)}
    onsignup={() => console.log("Sign up")}
    onforgotpassword={() => console.log("Forgot password")}
  />
</Story>

<Story name="Credentials Only">
  <LoginPage
    mode="credentials"
    onsubmit={(data) => console.log("Login:", data)}
  />
</Story>

<Story name="Wallet Only">
  <LoginPage
    mode="wallet"
    title="Connect to Cyberdyne"
    subtitle="Choose your preferred wallet"
  />
</Story>

<Story name="With Error">
  <LoginPage
    error="Invalid credentials. Please check your email and password."
    email="user@cyberdyne.io"
    onsubmit={(data) => console.log("Login:", data)}
  />
</Story>

<Story name="Loading">
  <LoginPage
    loading={true}
    email="satoshi@cyberdyne.io"
    onsubmit={(data) => console.log("Login:", data)}
  />
</Story>

<Story name="With Custom Wallet Section">
  {#snippet walletSection()}
    <div style="text-align: center; padding: 1rem; border: 1px dashed var(--color-border-default); border-radius: 8px; color: var(--color-text-tertiary); font-size: 0.875rem;">
      Custom wallet integration goes here (e.g., WalletConnect component)
    </div>
  {/snippet}
  <LoginPage
    {walletSection}
    onsubmit={(data) => console.log("Login:", data)}
  />
</Story>

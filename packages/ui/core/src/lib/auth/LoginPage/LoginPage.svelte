<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  type LoginMode = "credentials" | "wallet" | "both";

  let {
    mode = "both",
    title = "Welcome back",
    subtitle = "Sign in to Cyberdyne",
    logoText = "CYBERDYNE",
    email = $bindable(""),
    password = $bindable(""),
    error = "",
    loading = false,
    showSignUp = true,
    showForgotPassword = true,
    walletSection,
    onsubmit,
    onsignup,
    onforgotpassword,
  }: {
    mode?: LoginMode;
    title?: string;
    subtitle?: string;
    logoText?: string;
    email?: string;
    password?: string;
    error?: string;
    loading?: boolean;
    showSignUp?: boolean;
    showForgotPassword?: boolean;
    walletSection?: Snippet;
    onsubmit?: (data: { email: string; password: string }) => void;
    onsignup?: () => void;
    onforgotpassword?: () => void;
  } = $props();

  let showPassword = $state(false);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onsubmit?.({ email, password });
  }
</script>

<div class="cy-login">
  <div class="cy-login__backdrop">
    <div class="cy-login__grid-lines"></div>
  </div>

  <div class="cy-login__card">
    <!-- Logo -->
    <div class="cy-login__logo">
      <div class="cy-login__logo-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <span class="cy-login__logo-text">{logoText}</span>
    </div>

    <!-- Header -->
    <div class="cy-login__header">
      <h1 class="cy-login__title">{title}</h1>
      <p class="cy-login__subtitle">{subtitle}</p>
    </div>

    <!-- Error -->
    {#if error}
      <div class="cy-login__error" role="alert">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {error}
      </div>
    {/if}

    <!-- Credential Login -->
    {#if mode === "credentials" || mode === "both"}
      <form class="cy-login__form" onsubmit={handleSubmit}>
        <div class="cy-login__field">
          <label class="cy-login__label" for="login-email">Email</label>
          <input
            id="login-email"
            class="cy-login__input"
            type="email"
            placeholder="satoshi@cyberdyne.io"
            bind:value={email}
            required
            disabled={loading}
            autocomplete="email"
          />
        </div>

        <div class="cy-login__field">
          <div class="cy-login__label-row">
            <label class="cy-login__label" for="login-password">Password</label>
            {#if showForgotPassword}
              <button type="button" class="cy-login__link" onclick={() => onforgotpassword?.()}>
                Forgot?
              </button>
            {/if}
          </div>
          <div class="cy-login__password-wrapper">
            <input
              id="login-password"
              class="cy-login__input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              bind:value={password}
              required
              disabled={loading}
              autocomplete="current-password"
            />
            <button
              type="button"
              class="cy-login__password-toggle"
              onclick={() => showPassword = !showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {#if showPassword}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              {:else}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <button class="cy-login__submit" type="submit" disabled={loading}>
          {#if loading}
            <span class="cy-login__spinner"></span>
            Signing in...
          {:else}
            Sign In
          {/if}
        </button>
      </form>
    {/if}

    <!-- Divider -->
    {#if mode === "both"}
      <div class="cy-login__divider">
        <span>or continue with</span>
      </div>
    {/if}

    <!-- Wallet Section -->
    {#if mode === "wallet" || mode === "both"}
      <div class="cy-login__wallets">
        {#if walletSection}
          {@render walletSection()}
        {:else}
          <div class="cy-login__wallet-grid">
            {#each [
              { id: "metamask", name: "MetaMask" },
              { id: "walletconnect", name: "WalletConnect" },
              { id: "coinbase", name: "Coinbase" },
              { id: "phantom", name: "Phantom" },
            ] as wallet}
              <button class="cy-login__wallet-btn" disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
                  <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor">{wallet.name.charAt(0)}</text>
                </svg>
                <span>{wallet.name}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Sign Up -->
    {#if showSignUp}
      <p class="cy-login__signup">
        Don't have an account?
        <button type="button" class="cy-login__link cy-login__link--brand" onclick={() => onsignup?.()}>
          Create account
        </button>
      </p>
    {/if}
  </div>
</div>

<style>
  .cy-login {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--space-4);
    background: var(--color-bg-primary);
    overflow: hidden;
  }

  .cy-login__backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .cy-login__grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .cy-login__card {
    position: relative;
    width: 100%;
    max-width: 400px;
    padding: var(--space-8);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
  }

  .cy-login__logo {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
  }

  .cy-login__logo-icon {
    color: var(--color-action-brand-default);
    display: flex;
  }

  .cy-login__logo-text {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: 0.15em;
  }

  .cy-login__header {
    margin-bottom: var(--space-6);
  }

  .cy-login__title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: var(--space-1);
  }

  .cy-login__subtitle {
    font-family: var(--font-body);
    font-size: 0.9375rem;
    color: var(--color-text-tertiary);
  }

  .cy-login__error {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-state-error-bg);
    border: 1px solid rgba(255, 68, 68, 0.3);
    border-radius: var(--radius-md);
    color: var(--color-state-error);
    font-family: var(--font-body);
    font-size: 0.875rem;
    margin-bottom: var(--space-4);
  }

  .cy-login__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .cy-login__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .cy-login__label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cy-login__label {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .cy-login__input {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    color: var(--input-text);
    font-family: var(--font-body);
    font-size: 0.9375rem;
    transition: border-color var(--transition-default), box-shadow var(--transition-default);
    outline: none;
  }

  .cy-login__input::placeholder {
    color: var(--input-placeholder);
  }

  .cy-login__input:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-login__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-login__password-wrapper {
    position: relative;
  }

  .cy-login__password-wrapper .cy-login__input {
    padding-right: 3rem;
  }

  .cy-login__password-toggle {
    position: absolute;
    right: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--color-text-tertiary);
    cursor: pointer;
    padding: var(--space-1);
    display: flex;
    transition: color var(--transition-fast);
  }

  .cy-login__password-toggle:hover {
    color: var(--color-text-secondary);
  }

  .cy-login__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: var(--btn-brand-bg);
    border: none;
    border-radius: var(--radius-md);
    color: var(--btn-brand-text);
    font-family: var(--font-body);
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-default);
    margin-top: var(--space-2);
  }

  .cy-login__submit:hover:not(:disabled) {
    background: var(--btn-brand-bg-hover);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-login__submit:active:not(:disabled) {
    background: var(--btn-brand-bg-active);
  }

  .cy-login__submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cy-login__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-top-color: var(--btn-brand-text);
    border-radius: 50%;
    animation: cy-spinner 0.6s linear infinite;
  }

  .cy-login__divider {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin: var(--space-6) 0;
  }

  .cy-login__divider::before,
  .cy-login__divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--color-border-subtle);
  }

  .cy-login__divider span {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    white-space: nowrap;
  }

  .cy-login__wallet-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }

  .cy-login__wallet-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-family: var(--font-body);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-login__wallet-btn:hover:not(:disabled) {
    background: var(--color-surface-hover);
    border-color: var(--color-border-default);
    color: var(--color-text-primary);
  }

  .cy-login__wallet-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .cy-login__signup {
    text-align: center;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
    margin-top: var(--space-6);
  }

  .cy-login__link {
    background: none;
    border: none;
    color: var(--color-text-tertiary);
    font-family: var(--font-body);
    font-size: 0.75rem;
    cursor: pointer;
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .cy-login__link:hover {
    color: var(--color-text-link);
  }

  .cy-login__link--brand {
    color: var(--color-action-brand-default);
    font-size: inherit;
    font-weight: 500;
  }

  .cy-login__link--brand:hover {
    color: var(--color-action-brand-hover);
    text-decoration: underline;
  }
</style>

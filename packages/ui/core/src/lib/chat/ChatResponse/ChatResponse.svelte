<svelte:options runes={true} />

<script lang="ts">
  let {
    role = "user",
    content = "",
    timestamp = "",
    avatar = "",
  }: {
    role?: "user" | "assistant" | "system";
    content?: string;
    timestamp?: string;
    avatar?: string;
  } = $props();
</script>

<div class="cy-chat-response cy-chat-response--{role}">
  {#if role !== "system"}
    <div class="cy-chat-response__avatar">
      {#if avatar}
        <img src={avatar} alt={role} class="cy-chat-response__avatar-img" />
      {:else}
        <span class="cy-chat-response__avatar-fallback">
          {role === "user" ? "U" : "A"}
        </span>
      {/if}
    </div>
  {/if}

  <div class="cy-chat-response__bubble">
    <p class="cy-chat-response__content">{content}</p>
    {#if timestamp}
      <time class="cy-chat-response__time">{timestamp}</time>
    {/if}
  </div>
</div>

<style>
  .cy-chat-response {
    display: flex;
    gap: var(--space-3);
    max-width: 80%;
  }

  .cy-chat-response--user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .cy-chat-response--assistant {
    align-self: flex-start;
  }

  .cy-chat-response--system {
    align-self: center;
    max-width: 60%;
    justify-content: center;
  }

  .cy-chat-response__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--color-surface-raised);
  }

  .cy-chat-response__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cy-chat-response__avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .cy-chat-response__bubble {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    line-height: 1.5;
  }

  .cy-chat-response--user .cy-chat-response__bubble {
    background: var(--color-state-success-bg);
    border: 1px solid var(--color-border-default);
  }

  .cy-chat-response--assistant .cy-chat-response__bubble {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
  }

  .cy-chat-response--system .cy-chat-response__bubble {
    background: transparent;
    border: none;
    text-align: center;
  }

  .cy-chat-response__content {
    margin: 0;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .cy-chat-response--system .cy-chat-response__content {
    color: var(--color-text-tertiary);
    font-size: 0.8125rem;
  }

  .cy-chat-response__time {
    display: block;
    margin-top: var(--space-1);
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
  }

  .cy-chat-response--user .cy-chat-response__time {
    text-align: right;
  }
</style>

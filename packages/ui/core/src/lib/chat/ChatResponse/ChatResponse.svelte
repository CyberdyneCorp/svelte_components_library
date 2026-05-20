<svelte:options runes={true} />

<script lang="ts">
  import MarkdownPreview from "../../editor/MarkdownPreview/MarkdownPreview.svelte";
  import { type Attachment, type ToolCall, formatChatBytes } from "../types.js";

  let {
    role = "user",
    content = "",
    timestamp = "",
    avatar = "",
    markdown = false,
    /** Inline images / downloads attached to this message. */
    attachments = [],
    /** Tool-call indicators rendered as small pills above the content. */
    toolCalls = [],
    /** Error message rendered at the bottom of the bubble. */
    error = "",
    /** Show a streaming cursor (▍) at the end of the content. */
    streaming = false,
    /** Click handler for image attachments. Falls back to opening the URL in a new tab. */
    onattachmentclick,
  }: {
    role?: "user" | "assistant" | "system";
    content?: string;
    timestamp?: string;
    avatar?: string;
    markdown?: boolean;
    attachments?: Attachment[];
    toolCalls?: ToolCall[];
    error?: string;
    streaming?: boolean;
    onattachmentclick?: (attachment: Attachment) => void;
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
    {#if toolCalls.length > 0}
      <div class="cy-chat-response__tools">
        {#each toolCalls as call, i (call.id ?? `${call.name}-${i}`)}
          <span
            class="cy-chat-response__tool cy-chat-response__tool--{call.status ?? 'ok'}"
            title={call.argumentsPreview != null
              ? JSON.stringify(call.argumentsPreview, null, 2)
              : undefined}
          >
            <span class="cy-chat-response__tool-icon" aria-hidden="true">⚙</span>
            {call.name}
          </span>
        {/each}
      </div>
    {/if}

    {#if content || streaming}
      {#if markdown && role === "assistant"}
        <div class="cy-chat-response__content cy-chat-response__content--markdown">
          <MarkdownPreview {content} />
          {#if streaming}<span class="cy-chat-response__cursor" aria-hidden="true">▍</span>{/if}
        </div>
      {:else}
        <p class="cy-chat-response__content">
          {content}{#if streaming}<span class="cy-chat-response__cursor" aria-hidden="true">▍</span>{/if}
        </p>
      {/if}
    {/if}

    {#if attachments.length > 0}
      <div class="cy-chat-response__artifacts">
        {#each attachments as art, i (i)}
          {#if art.kind === "image"}
            <a
              class="cy-chat-response__artifact cy-chat-response__artifact--image"
              href={art.url}
              target="_blank"
              rel="noopener"
              title={art.title ?? "Open image"}
              onclick={onattachmentclick ? (e) => {
                e.preventDefault();
                onattachmentclick(art);
              } : undefined}
            >
              <img
                src={art.url}
                alt={art.alt ?? art.title ?? "image attachment"}
                loading="lazy"
              />
              {#if art.title}
                <span class="cy-chat-response__artifact-meta">
                  <span class="cy-chat-response__artifact-name">{art.title}</span>
                  <span class="cy-chat-response__artifact-hint">click to open</span>
                </span>
              {/if}
            </a>
          {:else}
            <a
              class="cy-chat-response__artifact cy-chat-response__artifact--file"
              href={art.url}
              download={art.filename}
              onclick={onattachmentclick ? (e) => {
                e.preventDefault();
                onattachmentclick(art);
              } : undefined}
            >
              <span class="cy-chat-response__artifact-icon" aria-hidden="true">⤓</span>
              <span class="cy-chat-response__artifact-meta">
                <span class="cy-chat-response__artifact-name">{art.filename}</span>
                {#if art.byteSize || art.producedBy}
                  <span class="cy-chat-response__artifact-hint">
                    {art.byteSize ? formatChatBytes(art.byteSize) : ""}
                    {art.byteSize && art.producedBy ? " · " : ""}
                    {art.producedBy ?? ""}
                  </span>
                {/if}
              </span>
            </a>
          {/if}
        {/each}
      </div>
    {/if}

    {#if error}
      <div class="cy-chat-response__error" role="alert">{error}</div>
    {/if}

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
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
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

  .cy-chat-response__cursor {
    display: inline-block;
    margin-left: 2px;
    animation: cy-chat-blink 1s steps(1) infinite;
    color: var(--color-action-brand-default);
  }
  @keyframes cy-chat-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  .cy-chat-response__tools {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .cy-chat-response__tool {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--color-border-subtle);
    background: var(--color-bg-elevated);
    color: var(--color-text-secondary);
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
  }
  .cy-chat-response__tool-icon {
    color: var(--color-action-secondary-default);
  }
  .cy-chat-response__tool--running {
    border-color: var(--color-action-secondary-default);
    color: var(--color-action-secondary-default);
  }
  .cy-chat-response__tool--error {
    border-color: var(--color-state-error);
    color: var(--color-state-error);
  }

  .cy-chat-response__artifacts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .cy-chat-response__artifact {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    text-decoration: none;
    color: inherit;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    background: var(--color-bg-elevated);
    overflow: hidden;
    max-width: 100%;
    transition: border-color var(--transition-default);
  }
  .cy-chat-response__artifact:hover {
    border-color: var(--color-action-secondary-default);
  }

  .cy-chat-response__artifact--image {
    flex-direction: column;
    align-items: stretch;
    padding: 0;
    max-width: 280px;
  }
  .cy-chat-response__artifact--image img {
    width: 100%;
    height: auto;
    max-height: 240px;
    object-fit: cover;
    display: block;
  }

  .cy-chat-response__artifact--file {
    padding: 8px 12px;
  }

  .cy-chat-response__artifact-icon {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm, 4px);
    background: var(--color-surface-raised);
    color: var(--color-action-secondary-default);
    font-size: 1rem;
    flex-shrink: 0;
  }

  .cy-chat-response__artifact-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .cy-chat-response__artifact--image .cy-chat-response__artifact-meta {
    padding: 6px 10px;
  }
  .cy-chat-response__artifact-name {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cy-chat-response__artifact-hint {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
  }

  .cy-chat-response__error {
    color: var(--color-state-error);
    font-size: 0.8125rem;
    background: var(--color-state-error-bg, transparent);
    border-radius: var(--radius-sm, 4px);
    padding: 4px 8px;
  }

  .cy-chat-response__time {
    display: block;
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
  }

  .cy-chat-response--user .cy-chat-response__time {
    text-align: right;
  }

  .cy-chat-response__content--markdown {
    margin: 0;
  }

  .cy-chat-response__content--markdown :global(.cy-md-preview) {
    font-size: 0.875rem;
  }
</style>

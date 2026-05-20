<svelte:options runes={true} />

<script lang="ts">
  import { type Attachment, type ToolCall, formatChatBytes } from "../types.js";

  let {
    content = "",
    typing = false,
    variant = "default",
    /** Inline images / downloadable files attached to the bot answer. */
    attachments = [],
    /** Tool-call indicators (e.g. "⚙ retrieve_docs") rendered above the content. */
    toolCalls = [],
    /** Show a streaming cursor (▍) at the end of the content. */
    streaming = false,
    /** Click handler for any attachment. Falls back to the anchor's default behaviour. */
    onattachmentclick,
  }: {
    content?: string;
    typing?: boolean;
    variant?: "default" | "surface";
    attachments?: Attachment[];
    toolCalls?: ToolCall[];
    streaming?: boolean;
    onattachmentclick?: (attachment: Attachment) => void;
  } = $props();

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  let formattedContent = $derived(
    escapeHtml(content).replace(
      /`([^`]+)`/g,
      '<code class="cy-bot-answer__code">$1</code>',
    ),
  );
</script>

<div class="cy-bot-answer cy-bot-answer--{variant}">
  {#if toolCalls.length > 0}
    <div class="cy-bot-answer__tools">
      {#each toolCalls as call, i (call.id ?? `${call.name}-${i}`)}
        <span
          class="cy-bot-answer__tool cy-bot-answer__tool--{call.status ?? 'ok'}"
          title={call.argumentsPreview != null
            ? JSON.stringify(call.argumentsPreview, null, 2)
            : undefined}
        >
          <span class="cy-bot-answer__tool-icon" aria-hidden="true">⚙</span>
          {call.name}
        </span>
      {/each}
    </div>
  {/if}

  {#if typing}
    <div class="cy-bot-answer__typing">
      <span class="cy-bot-answer__dot"></span>
      <span class="cy-bot-answer__dot"></span>
      <span class="cy-bot-answer__dot"></span>
    </div>
  {:else if content || streaming}
    <div class="cy-bot-answer__content">
      {@html formattedContent}{#if streaming}<span class="cy-bot-answer__cursor" aria-hidden="true">▍</span>{/if}
    </div>
  {/if}

  {#if attachments.length > 0}
    <div class="cy-bot-answer__artifacts">
      {#each attachments as art, i (i)}
        {#if art.kind === "image"}
          <a
            class="cy-bot-answer__artifact cy-bot-answer__artifact--image"
            href={art.url}
            target="_blank"
            rel="noopener"
            title={art.title ?? "Open image"}
            onclick={onattachmentclick ? (e) => {
              e.preventDefault();
              onattachmentclick(art);
            } : undefined}
          >
            <img src={art.url} alt={art.alt ?? art.title ?? "image attachment"} loading="lazy" />
            {#if art.title}
              <span class="cy-bot-answer__artifact-meta">
                <span class="cy-bot-answer__artifact-name">{art.title}</span>
                <span class="cy-bot-answer__artifact-hint">click to open</span>
              </span>
            {/if}
          </a>
        {:else}
          <a
            class="cy-bot-answer__artifact cy-bot-answer__artifact--file"
            href={art.url}
            download={art.filename}
            onclick={onattachmentclick ? (e) => {
              e.preventDefault();
              onattachmentclick(art);
            } : undefined}
          >
            <span class="cy-bot-answer__artifact-icon" aria-hidden="true">⤓</span>
            <span class="cy-bot-answer__artifact-meta">
              <span class="cy-bot-answer__artifact-name">{art.filename}</span>
              {#if art.byteSize || art.producedBy}
                <span class="cy-bot-answer__artifact-hint">
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
</div>

<style>
  .cy-bot-answer {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cy-bot-answer--default {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
  }

  .cy-bot-answer--surface {
    background: var(--color-surface-raised);
    border: 1px solid transparent;
  }

  .cy-bot-answer__content {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .cy-bot-answer__content :global(.cy-bot-answer__code) {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    background: var(--color-state-success-bg);
    color: var(--color-action-brand-default);
    padding: 0.125em 0.375em;
    border-radius: var(--radius-xs);
  }

  .cy-bot-answer__cursor {
    display: inline-block;
    margin-left: 2px;
    animation: cy-bot-answer-blink 1s steps(1) infinite;
    color: var(--color-action-brand-default);
  }
  @keyframes cy-bot-answer-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  .cy-bot-answer__tools {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .cy-bot-answer__tool {
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
  .cy-bot-answer__tool-icon {
    color: var(--color-action-secondary-default);
  }
  .cy-bot-answer__tool--running {
    border-color: var(--color-action-secondary-default);
    color: var(--color-action-secondary-default);
  }
  .cy-bot-answer__tool--error {
    border-color: var(--color-state-error);
    color: var(--color-state-error);
  }

  .cy-bot-answer__artifacts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .cy-bot-answer__artifact {
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
  .cy-bot-answer__artifact:hover {
    border-color: var(--color-action-secondary-default);
  }

  .cy-bot-answer__artifact--image {
    flex-direction: column;
    align-items: stretch;
    padding: 0;
    max-width: 280px;
  }
  .cy-bot-answer__artifact--image img {
    width: 100%;
    height: auto;
    max-height: 240px;
    object-fit: cover;
    display: block;
  }

  .cy-bot-answer__artifact--file {
    padding: 8px 12px;
  }

  .cy-bot-answer__artifact-icon {
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

  .cy-bot-answer__artifact-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .cy-bot-answer__artifact--image .cy-bot-answer__artifact-meta {
    padding: 6px 10px;
  }
  .cy-bot-answer__artifact-name {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cy-bot-answer__artifact-hint {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
  }

  .cy-bot-answer__typing {
    display: flex;
    gap: 4px;
    padding: var(--space-1) 0;
  }

  .cy-bot-answer__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-text-tertiary);
    animation: cy-typing 1.4s infinite;
  }

  .cy-bot-answer__dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .cy-bot-answer__dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes cy-typing {
    0%, 60%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    30% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
</style>

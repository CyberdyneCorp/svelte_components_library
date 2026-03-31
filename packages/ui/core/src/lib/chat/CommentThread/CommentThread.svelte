<svelte:options runes={true} />

<script module lang="ts">
  export type CommentType = {
    id: string;
    author: string;
    avatar?: string;
    content: string;
    timestamp: string;
    replies?: CommentType[];
    reactions?: Array<{ emoji: string; count: number }>;
  };
</script>

<script lang="ts">
  let {
    comments = [],
    onreply = (_parentId: string, _content: string) => {},
    onreact = (_commentId: string, _emoji: string) => {},
    maxDepth = 3,
  }: {
    comments?: CommentType[];
    onreply?: (parentId: string, content: string) => void;
    onreact?: (commentId: string, emoji: string) => void;
    maxDepth?: number;
  } = $props();

  let replyingTo = $state<string | null>(null);
  let replyText = $state("");

  function formatRelativeTime(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function openReply(commentId: string) {
    replyingTo = commentId;
    replyText = "";
  }

  function cancelReply() {
    replyingTo = null;
    replyText = "";
  }

  function submitReply(parentId: string) {
    if (replyText.trim()) {
      onreply(parentId, replyText.trim());
      cancelReply();
    }
  }

  const depthColors: Record<number, string> = {
    1: "var(--color-state-success-default, var(--color-accent-green, #22c55e))",
    2: "var(--color-state-info-default, var(--color-accent-cyan, #06b6d4))",
    3: "var(--color-state-purple-default, var(--color-accent-violet, #8b5cf6))",
  };

  function getBorderColor(depth: number): string {
    return depthColors[depth] || depthColors[3];
  }
</script>

{#snippet commentNode(comment: CommentType, depth: number)}
  <div
    class="cy-comment-thread__comment"
    class:cy-comment-thread__comment--nested={depth > 0}
    style={depth > 0 ? `border-left-color: ${getBorderColor(depth)}` : ""}
  >
    <div class="cy-comment-thread__header">
      <div class="cy-comment-thread__avatar">
        {#if comment.avatar}
          <img
            class="cy-comment-thread__avatar-img"
            src={comment.avatar}
            alt={comment.author}
          />
        {:else}
          <span class="cy-comment-thread__avatar-initials">
            {getInitials(comment.author)}
          </span>
        {/if}
      </div>
      <span class="cy-comment-thread__author">{comment.author}</span>
      <span class="cy-comment-thread__timestamp">
        {formatRelativeTime(comment.timestamp)}
      </span>
    </div>

    <div class="cy-comment-thread__content">{comment.content}</div>

    {#if comment.reactions && comment.reactions.length > 0}
      <div class="cy-comment-thread__reactions">
        {#each comment.reactions as reaction}
          <button
            class="cy-comment-thread__reaction-pill"
            onclick={() => onreact(comment.id, reaction.emoji)}
          >
            <span>{reaction.emoji}</span>
            <span class="cy-comment-thread__reaction-count">{reaction.count}</span>
          </button>
        {/each}
      </div>
    {/if}

    <div class="cy-comment-thread__actions">
      <button
        class="cy-comment-thread__action-btn"
        onclick={() => openReply(comment.id)}
      >
        Reply
      </button>
      <button
        class="cy-comment-thread__action-btn"
        onclick={() => onreact(comment.id, "👍")}
      >
        React
      </button>
    </div>

    {#if replyingTo === comment.id}
      <div class="cy-comment-thread__reply-input">
        <textarea
          class="cy-comment-thread__textarea"
          placeholder="Write a reply..."
          bind:value={replyText}
          rows="2"
        ></textarea>
        <div class="cy-comment-thread__reply-actions">
          <button
            class="cy-comment-thread__submit-btn"
            onclick={() => submitReply(comment.id)}
            disabled={!replyText.trim()}
          >
            Submit
          </button>
          <button
            class="cy-comment-thread__cancel-btn"
            onclick={cancelReply}
          >
            Cancel
          </button>
        </div>
      </div>
    {/if}

    {#if comment.replies && comment.replies.length > 0}
      <div class="cy-comment-thread__replies">
        {#if depth < maxDepth}
          {#each comment.replies as reply}
            {@render commentNode(reply, depth + 1)}
          {/each}
        {:else}
          <button
            class="cy-comment-thread__view-more"
            onclick={() => openReply(comment.id)}
          >
            View more replies ({comment.replies.length})
          </button>
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

<div class="cy-comment-thread">
  {#if comments.length === 0}
    <div class="cy-comment-thread__empty">No comments yet.</div>
  {:else}
    {#each comments as comment}
      {@render commentNode(comment, 0)}
    {/each}
  {/if}
</div>

<style>
  .cy-comment-thread {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    font-family: var(--font-body, sans-serif);
  }

  .cy-comment-thread__empty {
    text-align: center;
    padding: var(--space-6, 1.5rem);
    color: var(--color-text-tertiary);
    font-size: 0.875rem;
  }

  .cy-comment-thread__comment {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .cy-comment-thread__comment--nested {
    margin-left: var(--space-4, 1rem);
    padding-left: var(--space-3, 0.75rem);
    border-left: 2px solid;
  }

  .cy-comment-thread__header {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .cy-comment-thread__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-raised, #2a2a2e);
  }

  .cy-comment-thread__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cy-comment-thread__avatar-initials {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    user-select: none;
  }

  .cy-comment-thread__author {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .cy-comment-thread__timestamp {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
  }

  .cy-comment-thread__content {
    font-size: 0.875rem;
    color: var(--color-text-primary);
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .cy-comment-thread__reactions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1, 0.25rem);
  }

  .cy-comment-thread__reaction-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    font-size: 0.75rem;
    border-radius: var(--radius-full, 9999px);
    border: 1px solid var(--color-border-default);
    background: var(--color-surface-default);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .cy-comment-thread__reaction-pill:hover {
    background: var(--color-surface-raised);
  }

  .cy-comment-thread__reaction-count {
    font-weight: 600;
  }

  .cy-comment-thread__actions {
    display: flex;
    gap: var(--space-2, 0.5rem);
  }

  .cy-comment-thread__action-btn {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: var(--font-body, sans-serif);
    transition: color 0.15s ease;
  }

  .cy-comment-thread__action-btn:hover {
    color: var(--color-text-primary);
  }

  .cy-comment-thread__reply-input {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
    margin-top: var(--space-1, 0.25rem);
  }

  .cy-comment-thread__textarea {
    width: 100%;
    padding: var(--space-2, 0.5rem);
    font-size: 0.8125rem;
    font-family: var(--font-body, sans-serif);
    color: var(--color-text-primary);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md, 6px);
    resize: vertical;
    outline: none;
    transition: border-color 0.15s ease;
    box-sizing: border-box;
  }

  .cy-comment-thread__textarea:focus {
    border-color: var(--color-action-brand-default);
  }

  .cy-comment-thread__reply-actions {
    display: flex;
    gap: var(--space-2, 0.5rem);
  }

  .cy-comment-thread__submit-btn {
    font-size: 0.75rem;
    font-family: var(--font-body, sans-serif);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-md, 6px);
    border: none;
    background: var(--color-action-brand-default);
    color: var(--color-text-on-brand);
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  .cy-comment-thread__submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-comment-thread__cancel-btn {
    font-size: 0.75rem;
    font-family: var(--font-body, sans-serif);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-md, 6px);
    border: 1px solid var(--color-border-default);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .cy-comment-thread__cancel-btn:hover {
    background: var(--color-surface-raised);
  }

  .cy-comment-thread__replies {
    display: flex;
    flex-direction: column;
    gap: var(--space-3, 0.75rem);
    margin-top: var(--space-1, 0.25rem);
  }

  .cy-comment-thread__view-more {
    font-size: 0.75rem;
    color: var(--color-action-brand-default);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-left: var(--space-4, 1rem);
    font-family: var(--font-body, sans-serif);
    text-decoration: underline;
  }

  .cy-comment-thread__view-more:hover {
    opacity: 0.8;
  }
</style>

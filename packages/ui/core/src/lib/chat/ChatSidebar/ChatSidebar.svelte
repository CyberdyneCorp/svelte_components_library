<svelte:options runes={true} />

<script lang="ts">
  type Conversation = {
    id: string;
    title: string;
    messageCount: number;
    folderId?: string;
  };

  type Folder = {
    id: string;
    name: string;
  };

  let {
    conversations = [],
    folders = [],
    selectedId = "",
    onselect,
    ondelete,
    oncreate,
    oncreatefolder,
    ondeletefolder,
    onmove,
    class: className = "",
  }: {
    conversations?: Conversation[];
    folders?: Folder[];
    selectedId?: string;
    onselect?: (id: string) => void;
    ondelete?: (id: string) => void;
    oncreate?: () => void;
    oncreatefolder?: (name: string) => void;
    ondeletefolder?: (id: string) => void;
    onmove?: (convId: string, folderId: string) => void;
    class?: string;
  } = $props();

  let newFolderName = $state("");
  let showFolderInput = $state(false);

  function folderedConversations(folderId: string): Conversation[] {
    return conversations.filter((c) => c.folderId === folderId);
  }

  let unfolderedConversations = $derived(
    conversations.filter((c) => !c.folderId)
  );

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (name && oncreatefolder) {
      oncreatefolder(name);
      newFolderName = "";
      showFolderInput = false;
    }
  }

  function handleFolderKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") handleCreateFolder();
    if (e.key === "Escape") {
      showFolderInput = false;
      newFolderName = "";
    }
  }
</script>

<aside class="cy-chat-sidebar {className}" data-testid="chat-sidebar">
  <div class="cy-chat-sidebar__actions">
    <button
      class="cy-chat-sidebar__btn cy-chat-sidebar__btn--new"
      onclick={() => oncreate?.()}
      data-testid="new-chat-btn"
    >
      + New Chat
    </button>
    <button
      class="cy-chat-sidebar__btn cy-chat-sidebar__btn--folder"
      onclick={() => (showFolderInput = !showFolderInput)}
      title="Create folder"
    >
      +F
    </button>
  </div>

  {#if showFolderInput}
    <div class="cy-chat-sidebar__folder-input">
      <input
        type="text"
        bind:value={newFolderName}
        placeholder="Folder name..."
        onkeydown={handleFolderKeydown}
        class="cy-chat-sidebar__input"
      />
      <button
        class="cy-chat-sidebar__btn cy-chat-sidebar__btn--confirm"
        onclick={handleCreateFolder}
      >
        OK
      </button>
    </div>
  {/if}

  <div class="cy-chat-sidebar__list">
    {#each folders as folder (folder.id)}
      {@const folderConvs = folderedConversations(folder.id)}
      <div class="cy-chat-sidebar__folder" data-testid="folder-{folder.id}">
        <div class="cy-chat-sidebar__folder-header">
          <span class="cy-chat-sidebar__folder-name" title={folder.name}>
            {folder.name}
          </span>
          <span class="cy-chat-sidebar__folder-count">
            {folderConvs.length}
          </span>
          <button
            class="cy-chat-sidebar__delete-btn"
            onclick={() => ondeletefolder?.(folder.id)}
            title="Delete folder"
            data-testid="delete-folder-{folder.id}"
          >
            x
          </button>
        </div>
        {#each folderConvs as conv (conv.id)}
          <div
            class="cy-chat-sidebar__item cy-chat-sidebar__item--indented"
            class:cy-chat-sidebar__item--selected={conv.id === selectedId}
            onclick={() => onselect?.(conv.id)}
            role="button"
            tabindex="0"
            data-testid="conversation-{conv.id}"
          >
            <span class="cy-chat-sidebar__item-title" title={conv.title}>
              {conv.title}
            </span>
            <span class="cy-chat-sidebar__item-count">
              {conv.messageCount}
            </span>
            <button
              class="cy-chat-sidebar__delete-btn"
              onclick={(e: MouseEvent) => { e.stopPropagation(); ondelete?.(conv.id); }}
              title="Delete"
              data-testid="delete-{conv.id}"
            >
              x
            </button>
          </div>
        {/each}
      </div>
    {/each}

    {#each unfolderedConversations as conv (conv.id)}
      <div
        class="cy-chat-sidebar__item"
        class:cy-chat-sidebar__item--selected={conv.id === selectedId}
        onclick={() => onselect?.(conv.id)}
        role="button"
        tabindex="0"
        data-testid="conversation-{conv.id}"
      >
        <span class="cy-chat-sidebar__item-title" title={conv.title}>
          {conv.title}
        </span>
        <span class="cy-chat-sidebar__item-count">{conv.messageCount}</span>
        <span class="cy-chat-sidebar__item-actions">
          {#if folders.length > 0}
            <select
              class="cy-chat-sidebar__move-select"
              onchange={(e) => {
                const target = e.currentTarget;
                if (target.value && onmove) {
                  onmove(conv.id, target.value);
                  target.value = "";
                }
              }}
              onclick={(e: MouseEvent) => e.stopPropagation()}
              title="Move to folder"
            >
              <option value="">Move</option>
              {#each folders as folder (folder.id)}
                <option value={folder.id}>{folder.name}</option>
              {/each}
            </select>
          {/if}
          <button
            class="cy-chat-sidebar__delete-btn"
            onclick={(e: MouseEvent) => { e.stopPropagation(); ondelete?.(conv.id); }}
            title="Delete"
            data-testid="delete-{conv.id}"
          >
            x
          </button>
        </span>
      </div>
    {/each}

    {#if conversations.length === 0}
      <div class="cy-chat-sidebar__empty" data-testid="empty-state">
        No conversations yet
      </div>
    {/if}
  </div>
</aside>

<style>
  .cy-chat-sidebar {
    width: 18rem;
    display: flex;
    flex-direction: column;
    background: var(--color-surface-default, #12121a);
    border-right: 1px solid var(--color-border-subtle, #2a2a3a);
    height: 100%;
    overflow: hidden;
    font-family: var(--font-body, "Inter", sans-serif);
  }

  .cy-chat-sidebar__actions {
    display: flex;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-3, 0.75rem);
    border-bottom: 1px solid var(--color-border-subtle, #2a2a3a);
  }

  .cy-chat-sidebar__btn {
    border: 1px solid var(--color-border-default, #3a3a4a);
    background: var(--color-surface-raised, #1a1a24);
    color: var(--color-text-primary, #f0f0ff);
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-md, 6px);
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .cy-chat-sidebar__btn:hover {
    background: var(--color-surface-overlay, #222232);
    border-color: var(--color-action-brand-default, #00ff41);
  }

  .cy-chat-sidebar__btn--new {
    flex: 1;
  }

  .cy-chat-sidebar__btn--folder {
    flex-shrink: 0;
  }

  .cy-chat-sidebar__btn--confirm {
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    font-size: 0.6875rem;
  }

  .cy-chat-sidebar__folder-input {
    display: flex;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border-bottom: 1px solid var(--color-border-subtle, #2a2a3a);
  }

  .cy-chat-sidebar__input {
    flex: 1;
    background: var(--color-surface-raised, #1a1a24);
    border: 1px solid var(--color-border-default, #3a3a4a);
    color: var(--color-text-primary, #f0f0ff);
    font-family: var(--font-body, "Inter", sans-serif);
    font-size: 0.75rem;
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    border-radius: var(--radius-sm, 4px);
    outline: none;
  }

  .cy-chat-sidebar__input:focus {
    border-color: var(--color-action-brand-default, #00ff41);
  }

  .cy-chat-sidebar__list {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-2, 0.5rem) 0;
  }

  .cy-chat-sidebar__folder {
    margin-bottom: var(--space-1, 0.25rem);
  }

  .cy-chat-sidebar__folder-header {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-tertiary, #707080);
  }

  .cy-chat-sidebar__folder-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-chat-sidebar__folder-count {
    font-size: 0.625rem;
    color: var(--color-text-tertiary, #707080);
    flex-shrink: 0;
  }

  .cy-chat-sidebar__item {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    width: 100%;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    background: none;
    border: none;
    color: var(--color-text-secondary, #a0a0b0);
    font-family: var(--font-body, "Inter", sans-serif);
    font-size: 0.8125rem;
    text-align: left;
    cursor: pointer;
    transition: background 150ms ease;
  }

  .cy-chat-sidebar__item:hover {
    background: var(--color-surface-raised, #1a1a24);
  }

  .cy-chat-sidebar__item--selected {
    background: var(--color-state-success-bg, #00ff4110);
    color: var(--color-text-primary, #f0f0ff);
    border-left: 2px solid var(--color-action-brand-default, #00ff41);
  }

  .cy-chat-sidebar__item--indented {
    padding-left: calc(var(--space-3, 0.75rem) + 1rem);
  }

  .cy-chat-sidebar__item-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .cy-chat-sidebar__item-count {
    font-family: var(--font-mono, monospace);
    font-size: 0.625rem;
    color: var(--color-text-tertiary, #707080);
    flex-shrink: 0;
  }

  .cy-chat-sidebar__item-actions {
    display: none;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    flex-shrink: 0;
  }

  .cy-chat-sidebar__item:hover .cy-chat-sidebar__item-actions {
    display: flex;
  }

  .cy-chat-sidebar__delete-btn {
    display: none;
    background: none;
    border: none;
    color: var(--color-text-tertiary, #707080);
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0 var(--space-1, 0.25rem);
    line-height: 1;
    flex-shrink: 0;
  }

  .cy-chat-sidebar__delete-btn:hover {
    color: var(--color-state-error, #ff4444);
  }

  .cy-chat-sidebar__item:hover > .cy-chat-sidebar__delete-btn,
  .cy-chat-sidebar__folder-header:hover > .cy-chat-sidebar__delete-btn {
    display: inline;
  }

  .cy-chat-sidebar__move-select {
    background: var(--color-surface-raised, #1a1a24);
    border: 1px solid var(--color-border-subtle, #2a2a3a);
    color: var(--color-text-tertiary, #707080);
    font-family: var(--font-mono, monospace);
    font-size: 0.625rem;
    padding: 0 var(--space-1, 0.25rem);
    border-radius: var(--radius-sm, 4px);
    cursor: pointer;
  }

  .cy-chat-sidebar__empty {
    padding: var(--space-6, 1.5rem) var(--space-3, 0.75rem);
    text-align: center;
    color: var(--color-text-tertiary, #707080);
    font-size: 0.8125rem;
  }
</style>

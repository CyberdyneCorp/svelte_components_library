<svelte:options runes={true} />

<script lang="ts">
  import BlockEditorBlock from "./BlockEditorBlock.svelte";
  import BlockEditorToolbar from "./BlockEditorToolbar.svelte";
  import BlockEditorSlashMenu from "./BlockEditorSlashMenu.svelte";
  import {
    parseMarkdownToBlocks,
    serializeBlocksToMarkdown,
    createBlock,
    detectBlockType,
    type Block,
    type BlockType,
  } from "./block-utils.js";

  let {
    value = $bindable(""),
    placeholder = "Type '/' for commands...",
    readonly = false,
    showToolbar = true,
    height = "auto",
    minHeight = "200px",
    class: className = "",
    slashMenuItems,
    toolbarActions,
    onchange,
    onblockcommit,
    onblockcreate,
    onblockdelete,
    onblockreorder,
  }: {
    value?: string;
    placeholder?: string;
    readonly?: boolean;
    showToolbar?: boolean;
    height?: string;
    minHeight?: string;
    class?: string;
    slashMenuItems?: Array<{ label: string; type: BlockType; template: string; icon: string; description: string }>;
    toolbarActions?: Array<{ label: string; icon: string; action: (textarea: HTMLTextAreaElement) => void }>;
    onchange?: (value: string) => void;
    onblockcommit?: (block: Block) => void;
    onblockcreate?: (block: Block) => void;
    onblockdelete?: (block: Block) => void;
    onblockreorder?: (blocks: Block[]) => void;
  } = $props();

  let blocks: Block[] = $state(parseMarkdownToBlocks(value));
  let activeBlockId: string | null = $state(null);
  let activeTextarea: HTMLTextAreaElement | null = $state(null);
  let lastSerialized = $state(value);
  let containerEl: HTMLDivElement | undefined = $state();

  // Slash menu state
  let slashMenuOpen = $state(false);
  let slashFilter = $state("");
  let slashPosition = $state({ top: 0, left: 0 });
  let slashBlockId: string | null = $state(null);

  // Drag state
  let dragIndex: number | null = $state(null);

  // Sync blocks -> value
  function syncToValue() {
    const md = serializeBlocksToMarkdown(blocks);
    lastSerialized = md;
    value = md;
    onchange?.(md);
  }

  // Sync value -> blocks when value changes externally
  $effect(() => {
    if (value !== lastSerialized) {
      blocks = parseMarkdownToBlocks(value);
      lastSerialized = value;
      activeBlockId = null;
      activeTextarea = null;
    }
  });

  function findBlockIndex(id: string): number {
    return blocks.findIndex((b) => b.id === id);
  }

  function commitBlock(id: string, content: string) {
    const idx = findBlockIndex(id);
    if (idx === -1) return;
    blocks[idx] = {
      ...blocks[idx],
      content,
      type: detectBlockType(content),
    };
    activeBlockId = null;
    activeTextarea = null;
    onblockcommit?.(blocks[idx]);
    syncToValue();
  }

  function activateBlock(id: string) {
    if (readonly) return;
    closeSlashMenu();
    activeBlockId = id;
  }

  function createBlockAfter(id: string, content: string = "") {
    const idx = findBlockIndex(id);
    if (idx === -1) return;
    const newBlock = createBlock(content);
    blocks = [...blocks.slice(0, idx + 1), newBlock, ...blocks.slice(idx + 1)];
    activeBlockId = newBlock.id;
    onblockcreate?.(newBlock);
    syncToValue();
  }

  function deleteBlock(id: string) {
    const idx = findBlockIndex(id);
    if (idx === -1) return;
    const deletedBlock = blocks[idx];

    // Don't delete the last block
    if (blocks.length <= 1) {
      blocks[0] = { ...blocks[0], content: "", type: "paragraph" };
      activeBlockId = blocks[0].id;
      syncToValue();
      return;
    }

    const prevId = idx > 0 ? blocks[idx - 1].id : blocks[idx + 1]?.id;
    blocks = blocks.filter((b) => b.id !== id);
    activeBlockId = prevId ?? null;
    onblockdelete?.(deletedBlock);
    syncToValue();
  }

  function mergeWithPrevious(id: string) {
    const idx = findBlockIndex(id);
    if (idx <= 0) return;

    const prevBlock = blocks[idx - 1];
    const currentBlock = blocks[idx];
    const mergedContent = prevBlock.content + (prevBlock.content && currentBlock.content ? "\n" : "") + currentBlock.content;

    blocks[idx - 1] = {
      ...prevBlock,
      content: mergedContent,
      type: detectBlockType(mergedContent),
    };
    blocks = blocks.filter((b) => b.id !== id);
    activeBlockId = prevBlock.id;
    syncToValue();
  }

  function focusPrev(id: string) {
    const idx = findBlockIndex(id);
    if (idx > 0) {
      activeBlockId = blocks[idx - 1].id;
    }
  }

  function focusNext(id: string) {
    const idx = findBlockIndex(id);
    if (idx < blocks.length - 1) {
      activeBlockId = blocks[idx + 1].id;
    }
  }

  // Slash menu
  function openSlashMenu(blockId: string, filter: string, pos: { top: number; left: number }) {
    slashBlockId = blockId;
    slashFilter = filter;
    slashPosition = pos;
    slashMenuOpen = true;
  }

  function closeSlashMenu() {
    slashMenuOpen = false;
    slashFilter = "";
    slashBlockId = null;
  }

  function handleSlashSelect(template: string, _type: BlockType) {
    if (!slashBlockId) return;
    const idx = findBlockIndex(slashBlockId);
    if (idx === -1) return;

    // Replace the "/" and any filter text with the template
    blocks[idx] = {
      ...blocks[idx],
      content: template,
      type: detectBlockType(template),
    };
    closeSlashMenu();
    // Re-activate the block so the user can continue editing
    activeBlockId = blocks[idx].id;
    syncToValue();
  }

  // Drag and drop
  function handleDragStart(index: number, e: DragEvent) {
    dragIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    }
    // Commit if block is being edited
    if (activeBlockId === blocks[index].id) {
      activeBlockId = null;
      activeTextarea = null;
    }
  }

  function handleDragOver(index: number, e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  }

  function handleDrop(index: number, _e: DragEvent) {
    if (dragIndex === null || dragIndex === index) {
      dragIndex = null;
      return;
    }

    const moved = blocks[dragIndex];
    const newBlocks = blocks.filter((_, i) => i !== dragIndex);
    const insertAt = dragIndex < index ? index - 1 : index;
    newBlocks.splice(insertAt, 0, moved);
    blocks = newBlocks;
    dragIndex = null;
    onblockreorder?.(blocks);
    syncToValue();
  }

  function handleDragEnd() {
    dragIndex = null;
  }

  // Toolbar insert callback
  function handleToolbarInsert(newValue: string) {
    if (!activeBlockId) return;
    const idx = findBlockIndex(activeBlockId);
    if (idx === -1) return;
    blocks[idx] = {
      ...blocks[idx],
      content: newValue,
      type: detectBlockType(newValue),
    };
    syncToValue();
  }

  function handleTextareaReady(el: HTMLTextAreaElement) {
    activeTextarea = el;
  }

  function handleContentChange(blockId: string, content: string) {
    const idx = findBlockIndex(blockId);
    if (idx === -1) return;
    blocks[idx] = {
      ...blocks[idx],
      content,
      type: detectBlockType(content),
    };
  }

  // Click on empty area to create/focus last block
  function handleContainerClick(e: MouseEvent) {
    if (readonly) return;
    const target = e.target as HTMLElement;
    if (target === containerEl || target.classList.contains("cy-block-editor__blocks")) {
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock) {
        if (lastBlock.content.trim() === "") {
          activeBlockId = lastBlock.id;
        } else {
          createBlockAfter(lastBlock.id);
        }
      }
    }
  }
</script>

<div
  class="cy-block-editor {className}"
  class:cy-block-editor--readonly={readonly}
  style="height: {height}; min-height: {minHeight}"
  bind:this={containerEl}
  onclick={handleContainerClick}
  role="presentation"
>
  {#if showToolbar && !readonly}
    <BlockEditorToolbar
      bind:textarea={activeTextarea}
      disabled={!activeBlockId}
      oninsert={handleToolbarInsert}
      customActions={toolbarActions}
    />
  {/if}

  <div class="cy-block-editor__blocks">
    {#each blocks as block, index (block.id)}
      <BlockEditorBlock
        {block}
        active={activeBlockId === block.id}
        {readonly}
        {placeholder}
        oncommit={(content) => commitBlock(block.id, content)}
        oncreateafter={(content) => createBlockAfter(block.id, content)}
        ondelete={() => deleteBlock(block.id)}
        onmerge={() => mergeWithPrevious(block.id)}
        onactivate={() => activateBlock(block.id)}
        onfocusprev={() => focusPrev(block.id)}
        onfocusnext={() => focusNext(block.id)}
        ondragstart={(e) => handleDragStart(index, e)}
        ondragover={(e) => handleDragOver(index, e)}
        ondrop={(e) => handleDrop(index, e)}
        ondragend={handleDragEnd}
        onslashopen={(filter, rect) => openSlashMenu(block.id, filter, rect)}
        onslashclose={closeSlashMenu}
        ontextareaready={handleTextareaReady}
        oncontentchange={(content) => handleContentChange(block.id, content)}
      />
    {/each}
  </div>

  {#if slashMenuOpen}
    <BlockEditorSlashMenu
      filter={slashFilter}
      position={slashPosition}
      items={slashMenuItems}
      onselect={handleSlashSelect}
      onclose={closeSlashMenu}
    />
  {/if}
</div>

<style>
  .cy-block-editor {
    display: flex;
    flex-direction: column;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }

  .cy-block-editor--readonly {
    opacity: 0.9;
  }

  .cy-block-editor__blocks {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    min-height: 150px;
  }
</style>

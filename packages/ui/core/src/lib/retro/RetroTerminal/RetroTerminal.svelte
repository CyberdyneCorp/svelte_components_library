<svelte:options runes={true} />

<script lang="ts">
  import type { RetroTerminalLine } from "./types.js";

  let {
    welcome = [],
    lines = $bindable([] as RetroTerminalLine[]),
    prompt = "user@CyberdyneOS $",
    placeholder = "",
    onCommand,
    autoFocus = true,
    readOnly = false,
  }: {
    welcome?: string[];
    lines?: RetroTerminalLine[];
    prompt?: string;
    placeholder?: string;
    onCommand?: (cmd: string) => void | Promise<void>;
    autoFocus?: boolean;
    readOnly?: boolean;
  } = $props();

  let inputEl: HTMLInputElement | undefined = $state();
  let current = $state("");
  let history: string[] = $state([]);
  let historyIndex = $state(-1);
  let outputEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (autoFocus && inputEl) inputEl.focus();
  });

  $effect(() => {
    // auto-scroll on new lines
    if (outputEl && lines.length >= 0) {
      outputEl.scrollTop = outputEl.scrollHeight;
    }
  });

  function submit() {
    const cmd = current.trim();
    if (!cmd) return;
    lines = [...lines, { text: `${prompt} ${cmd}`, kind: "in" }];
    history = [...history, cmd];
    historyIndex = history.length;
    onCommand?.(cmd);
    current = "";
  }

  function onKey(e: KeyboardEvent) {
    if (readOnly) return;
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "ArrowUp") {
      if (history.length === 0) return;
      historyIndex = Math.max(0, historyIndex - 1);
      current = history[historyIndex] ?? "";
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (history.length === 0) return;
      historyIndex = Math.min(history.length, historyIndex + 1);
      current = history[historyIndex] ?? "";
      e.preventDefault();
    }
  }
</script>

<div class="cy-rterm" role="region" aria-label="Terminal">
  <div class="cy-rterm__output" bind:this={outputEl} data-testid="cy-rterm-output">
    {#each welcome as line}
      <div class="cy-rterm__line cy-rterm__line--sys">{line}</div>
    {/each}
    {#each lines as line, i (i)}
      <div class="cy-rterm__line cy-rterm__line--{line.kind ?? 'out'}">{line.text}</div>
    {/each}
  </div>
  <div class="cy-rterm__prompt-row">
    <span class="cy-rterm__prompt">{prompt}</span>
    <input
      class="cy-rterm__input"
      bind:this={inputEl}
      bind:value={current}
      onkeydown={onKey}
      aria-label="Terminal input"
      placeholder={placeholder}
      readonly={readOnly}
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
    />
  </div>
</div>

<style>
  .cy-rterm {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 240px;
    background: #000;
    color: #00ff41;
    font-family: "Courier New", monospace;
    font-size: 0.875rem;
    line-height: 1.4;
    padding: 8px 12px;
  }
  .cy-rterm__output {
    flex: 1;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .cy-rterm__line--err { color: #ff4444; }
  .cy-rterm__line--sys { color: #00d4ff; }
  .cy-rterm__line--in { color: #00ff41; font-weight: bold; }
  .cy-rterm__prompt-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding-top: 4px;
    border-top: 1px solid rgba(0, 255, 65, 0.15);
    margin-top: 4px;
  }
  .cy-rterm__prompt {
    white-space: nowrap;
    font-weight: bold;
  }
  .cy-rterm__input {
    flex: 1;
    background: transparent;
    border: 0;
    color: inherit;
    font: inherit;
    outline: none;
    caret-color: #00ff41;
  }
</style>

<svelte:options runes={true} />

<script lang="ts">
  let {
    content = "",
    class: className = "",
  }: {
    content?: string;
    class?: string;
  } = $props();

  let containerEl: HTMLDivElement | undefined = $state();

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function parseMarkdown(md: string): string {
    if (!md) return "";

    let html = md;

    // 1. Extract code blocks first to protect them from further processing
    const codeBlocks: string[] = [];
    const mermaidBlocks: string[] = [];

    // Fenced code blocks (with optional language)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang: string, code: string) => {
      if (lang === "mermaid") {
        const idx = mermaidBlocks.length;
        mermaidBlocks.push(code.trim());
        return `\x00MERMAIDBLOCK${idx}\x00`;
      }
      const idx = codeBlocks.length;
      const langClass = lang ? ` class="language-${lang}"` : "";
      codeBlocks.push(`<pre class="cy-md-pre"><code${langClass}>${escapeHtml(code.trimEnd())}</code></pre>`);
      return `\x00CODEBLOCK${idx}\x00`;
    });

    // Inline code (protect from further processing)
    const inlineCodeBlocks: string[] = [];
    html = html.replace(/`([^`\n]+?)`/g, (_match, code: string) => {
      const idx = inlineCodeBlocks.length;
      inlineCodeBlocks.push(`<code class="cy-md-inline-code">${escapeHtml(code)}</code>`);
      return `\x00INLINECODE${idx}\x00`;
    });

    // 4. Headings
    html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
    html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
    html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

    // 13. Horizontal rules (before list processing)
    html = html.replace(/^(\*{3,}|-{3,}|_{3,})$/gm, "<hr>");

    // 14. Tables
    html = html.replace(/^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)*)/gm, (_match, headerRow: string, _separator: string, bodyRows: string) => {
      const headers = headerRow.split("|").filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join("");
      const rows = bodyRows.trim().split("\n").map((row: string) => {
        const cells = row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      return `<table class="cy-md-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // 10. Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n");

    // 16. Task lists (before regular lists)
    html = html.replace(/^(\s*)[-*]\s+\[x\]\s+(.+)$/gm, '$1<li class="cy-md-task"><input type="checkbox" checked disabled> $2</li>');
    html = html.replace(/^(\s*)[-*]\s+\[\s\]\s+(.+)$/gm, '$1<li class="cy-md-task"><input type="checkbox" disabled> $2</li>');

    // 11. Unordered lists
    html = html.replace(/^(\s*)[-*]\s+(.+)$/gm, (_match, indent: string, text: string) => {
      const level = Math.floor(indent.length / 2);
      return `<li data-ul-level="${level}">${text}</li>`;
    });

    // 12. Ordered lists
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li data-ol>$1</li>');

    // Wrap consecutive <li> in <ul> or <ol>
    html = html.replace(/((?:<li class="cy-md-task">.*<\/li>\n?)+)/g, '<ul class="cy-md-task-list">$1</ul>');
    html = html.replace(/((?:<li data-ul-level="\d+">.*<\/li>\n?)+)/g, (_match, block: string) => {
      const items = block.replace(/ data-ul-level="\d+"/g, "");
      return `<ul>${items}</ul>`;
    });
    html = html.replace(/((?:<li data-ol>.*<\/li>\n?)+)/g, (_match, block: string) => {
      const items = block.replace(/ data-ol/g, "");
      return `<ol>${items}</ol>`;
    });

    // 9. Images (before links to avoid conflict)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="cy-md-img">');

    // 8. Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // 5. Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // 6. Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.+?)_/g, "<em>$1</em>");

    // 7. Strikethrough
    html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

    // 15. Paragraphs - wrap lines that aren't already block elements
    const lines = html.split("\n\n");
    html = lines.map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|table|blockquote|hr|pre|div)/.test(trimmed)) return trimmed;
      if (/\x00CODEBLOCK\d+\x00/.test(trimmed)) return trimmed;
      if (/\x00MERMAIDBLOCK\d+\x00/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    }).join("\n");

    // Restore inline code
    inlineCodeBlocks.forEach((block, idx) => {
      html = html.replace(`\x00INLINECODE${idx}\x00`, block);
    });

    // Restore code blocks
    codeBlocks.forEach((block, idx) => {
      html = html.replace(`\x00CODEBLOCK${idx}\x00`, block);
    });

    // Restore mermaid blocks (use data-idx, raw text stored in mermaidBlocksRef)
    mermaidBlocks.forEach((block, idx) => {
      html = html.replace(
        `\x00MERMAIDBLOCK${idx}\x00`,
        `<div class="cy-md-mermaid" data-mermaid-idx="${idx}"></div>`
      );
    });

    // Store mermaid source for the $effect to pick up
    mermaidBlocksRef = mermaidBlocks;

    return html;
  }

  let mermaidBlocksRef: string[] = [];
  let renderedHtml = $derived(parseMarkdown(content));

  // Mermaid rendering
  let mermaidLoaded = $state(false);
  let mermaidModule: any = $state(null);

  async function loadMermaid() {
    if (mermaidLoaded) return mermaidModule;

    // Check if already loaded globally
    if (typeof window !== "undefined" && (window as any).mermaid) {
      const m = (window as any).mermaid;
      m.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#00ff41",
          primaryTextColor: "#f0f0ff",
          primaryBorderColor: "#00ff41",
          lineColor: "#00d4ff",
          secondaryColor: "#12121a",
          tertiaryColor: "#1a1a24",
        },
      });
      mermaidModule = m;
      mermaidLoaded = true;
      return m;
    }

    // Load via script tag (dynamic import doesn't work with CDN URLs in Vite)
    return new Promise<any>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
      script.onload = () => {
        const m = (window as any).mermaid;
        if (m) {
          m.initialize({
            startOnLoad: false,
            theme: "dark",
            themeVariables: {
              primaryColor: "#00ff41",
              primaryTextColor: "#f0f0ff",
              primaryBorderColor: "#00ff41",
              lineColor: "#00d4ff",
              secondaryColor: "#12121a",
              tertiaryColor: "#1a1a24",
            },
          });
          mermaidModule = m;
          mermaidLoaded = true;
          resolve(m);
        } else {
          resolve(null);
        }
      };
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }

  $effect(() => {
    // Track renderedHtml to re-run when content changes
    void renderedHtml;

    if (!containerEl) return;

    const mermaidEls = containerEl.querySelectorAll<HTMLElement>(".cy-md-mermaid");
    if (mermaidEls.length === 0) return;

    // Use a microtask to ensure DOM is updated with innerHTML first
    queueMicrotask(() => {
      loadMermaid().then(async (mermaid) => {
        if (!mermaid) return;

        for (const el of mermaidEls) {
          const idxStr = el.getAttribute("data-mermaid-idx");
          if (idxStr === null) continue;
          const idx = parseInt(idxStr, 10);
          const diagramDef = mermaidBlocksRef[idx];
          if (!diagramDef || el.querySelector("svg")) continue;

          try {
            const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`;
            const { svg } = await mermaid.render(id, diagramDef);
            el.innerHTML = svg;
          } catch (err: any) {
            el.innerHTML = `<div class="cy-md-mermaid-error">Diagram error: ${escapeHtml(err?.message || "Invalid syntax")}</div>`;
          }
        }
      });
    });
  });
</script>

<div
  class="cy-md-preview {className}"
  bind:this={containerEl}
>
  {@html renderedHtml}
</div>

<style>
  .cy-md-preview {
    font-family: var(--font-body, "Inter", sans-serif);
    color: var(--color-text-primary, #f0f0ff);
    line-height: 1.7;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .cy-md-preview :global(h1),
  .cy-md-preview :global(h2),
  .cy-md-preview :global(h3),
  .cy-md-preview :global(h4),
  .cy-md-preview :global(h5),
  .cy-md-preview :global(h6) {
    font-family: var(--font-display, "Orbitron", sans-serif);
    color: var(--color-text-primary, #f0f0ff);
    margin: 1.5em 0 0.5em;
    line-height: 1.3;
  }

  .cy-md-preview :global(h1) {
    font-size: 2rem;
    padding-bottom: 0.3em;
    border-bottom: 2px solid #00ff41;
  }

  .cy-md-preview :global(h2) {
    font-size: 1.5rem;
    padding-bottom: 0.25em;
    border-bottom: 1px solid rgba(0, 255, 65, 0.3);
  }

  .cy-md-preview :global(h3) {
    font-size: 1.25rem;
  }

  .cy-md-preview :global(h4) {
    font-size: 1.1rem;
  }

  .cy-md-preview :global(h5) {
    font-size: 1rem;
  }

  .cy-md-preview :global(h6) {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #a0a0b0);
  }

  .cy-md-preview :global(p) {
    margin: 0.75em 0;
  }

  .cy-md-preview :global(strong) {
    color: #f0f0ff;
    font-weight: 700;
  }

  .cy-md-preview :global(em) {
    font-style: italic;
  }

  .cy-md-preview :global(del) {
    text-decoration: line-through;
    opacity: 0.6;
  }

  .cy-md-preview :global(a) {
    color: #00d4ff;
    text-decoration: none;
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    transition: border-color 150ms ease;
  }

  .cy-md-preview :global(a:hover) {
    border-bottom-color: #00d4ff;
  }

  .cy-md-preview :global(.cy-md-inline-code) {
    background: #1a1a24;
    color: #00ff41;
    padding: 0.15em 0.4em;
    border-radius: 4px;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.875em;
  }

  .cy-md-preview :global(.cy-md-pre) {
    background: #1a1a24;
    border: 1px solid rgba(0, 255, 65, 0.15);
    border-radius: 8px;
    padding: 1em;
    overflow-x: auto;
    margin: 1em 0;
  }

  .cy-md-preview :global(.cy-md-pre code) {
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.875rem;
    color: #e0e0f0;
    background: none;
    padding: 0;
    line-height: 1.6;
  }

  .cy-md-preview :global(blockquote) {
    border-left: 3px solid #00ff41;
    margin: 1em 0;
    padding: 0.5em 1em;
    background: rgba(0, 255, 65, 0.04);
    color: var(--color-text-secondary, #c0c0d0);
  }

  .cy-md-preview :global(ul),
  .cy-md-preview :global(ol) {
    margin: 0.75em 0;
    padding-left: 1.5em;
  }

  .cy-md-preview :global(ul) {
    list-style: none;
  }

  .cy-md-preview :global(ul > li) {
    position: relative;
    padding-left: 0.5em;
  }

  .cy-md-preview :global(ul > li::before) {
    content: "\25B8";
    color: #00ff41;
    position: absolute;
    left: -1em;
    font-size: 0.8em;
  }

  .cy-md-preview :global(.cy-md-task-list) {
    list-style: none;
    padding-left: 0;
  }

  .cy-md-preview :global(.cy-md-task) {
    padding-left: 0;
  }

  .cy-md-preview :global(.cy-md-task::before) {
    content: none;
  }

  .cy-md-preview :global(.cy-md-task input[type="checkbox"]) {
    appearance: none;
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid #00ff41;
    border-radius: 3px;
    background: transparent;
    vertical-align: middle;
    margin-right: 0.5em;
    position: relative;
    cursor: default;
  }

  .cy-md-preview :global(.cy-md-task input[type="checkbox"]:checked) {
    background: rgba(0, 255, 65, 0.2);
  }

  .cy-md-preview :global(.cy-md-task input[type="checkbox"]:checked::after) {
    content: "\2713";
    color: #00ff41;
    font-size: 12px;
    position: absolute;
    top: -1px;
    left: 2px;
  }

  .cy-md-preview :global(ol) {
    list-style: decimal;
  }

  .cy-md-preview :global(li) {
    margin: 0.25em 0;
  }

  .cy-md-preview :global(hr) {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00ff41, #00d4ff, #00ff41, transparent);
    margin: 2em 0;
  }

  .cy-md-preview :global(.cy-md-table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 0.875rem;
  }

  .cy-md-preview :global(.cy-md-table th) {
    background: #1a1a24;
    padding: 0.6em 1em;
    text-align: left;
    font-family: var(--font-display, "Orbitron", sans-serif);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #00ff41;
    border-bottom: 2px solid rgba(0, 255, 65, 0.3);
  }

  .cy-md-preview :global(.cy-md-table td) {
    padding: 0.5em 1em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .cy-md-preview :global(.cy-md-table tr:hover td) {
    background: rgba(0, 255, 65, 0.04);
  }

  .cy-md-preview :global(.cy-md-img) {
    max-width: 100%;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin: 1em 0;
  }

  .cy-md-preview :global(.cy-md-mermaid) {
    margin: 1.5em 0;
    padding: 1em;
    background: #12121a;
    border: 1px solid rgba(0, 255, 65, 0.15);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    overflow-x: auto;
  }

  .cy-md-preview :global(.cy-md-mermaid svg) {
    max-width: 100%;
  }

  .cy-md-preview :global(.cy-md-mermaid-error) {
    color: #ff4444;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.875rem;
    padding: 0.5em;
  }
</style>

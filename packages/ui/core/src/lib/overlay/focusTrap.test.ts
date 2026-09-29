import { afterEach, describe, expect, it } from "vitest";
import { focusableElements, moveFocusInto, trapTab } from "./focusTrap.js";

function panel(html: string): HTMLElement {
  const el = document.createElement("div");
  el.tabIndex = -1;
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

/** Run a Tab keypress through the trap; the trap reads document.activeElement. */
function tab(container: HTMLElement, shiftKey = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey, cancelable: true });
  trapTab(container, event);
  return event;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("focusTrap", () => {
  it("lists tabbable elements in order and skips disabled or tabindex=-1 ones", () => {
    const el = panel(`
      <a href="#a">a</a><a>no href</a><button disabled>x</button>
      <input /><span tabindex="0">s</span><span tabindex="-1">n</span>`);
    expect(focusableElements(el).map((e) => e.tagName)).toEqual(["A", "INPUT", "SPAN"]);
  });

  it("ignores keys other than Tab", () => {
    const el = panel(`<button>a</button>`);
    const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
    trapTab(el, event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("pulls focus back in when it sits outside the container", () => {
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    const el = panel(`<button id="a">a</button><button id="b">b</button>`);
    outside.focus();
    expect(tab(el).defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe("a");
    outside.focus();
    tab(el, true);
    expect(document.activeElement?.id).toBe("b");
  });

  it("wraps Shift+Tab from the focused container to the last element", () => {
    const el = panel(`<button id="a">a</button><button id="b">b</button>`);
    el.focus();
    tab(el, true);
    expect(document.activeElement?.id).toBe("b");
  });

  it("keeps focus on the container when nothing inside is focusable", () => {
    const el = panel(`<p>text</p>`);
    moveFocusInto(el);
    expect(document.activeElement).toBe(el);
    expect(tab(el).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(el);
  });

  it("restores focus to the previous element only while it is still attached", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const el = panel(`<button>a</button>`);
    const restore = moveFocusInto(el);
    expect(document.activeElement).not.toBe(opener);
    restore();
    expect(document.activeElement).toBe(opener);

    const restoreAgain = moveFocusInto(el);
    opener.remove();
    restoreAgain();
    expect(document.activeElement).toBe(el.querySelector("button"));
  });
});

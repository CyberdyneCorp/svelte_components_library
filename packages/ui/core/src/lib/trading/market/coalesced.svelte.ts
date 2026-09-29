/**
 * Rune wrapper around `createFrameCoalescer`: returns a value that follows
 * `read()` but updates at most once per animation frame. The first value is
 * used synchronously so the initial render is never delayed.
 *
 * Call during component initialisation (it registers effects).
 */
import { untrack } from "svelte";
import { createFrameCoalescer, type FrameScheduler } from "./coalesce.js";

export function coalesced<T>(read: () => T, scheduler?: FrameScheduler): { readonly current: T } {
  let current = $state.raw(untrack(read));
  const coalescer = createFrameCoalescer<T>((value) => (current = value), scheduler);
  let first = true;

  $effect(() => {
    const value = read();
    if (first) {
      first = false;
      return;
    }
    coalescer.push(value);
  });

  $effect(() => () => coalescer.cancel());

  return {
    get current() {
      return current;
    },
  };
}

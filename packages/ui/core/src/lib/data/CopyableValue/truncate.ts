/**
 * Keep the first `head` and last `tail` characters joined by "…". Text no
 * longer than `head + tail + 1` is returned unchanged, since the ellipsis
 * would save nothing.
 */
export function truncateMiddle(text: string, head = 6, tail = 4): string {
  const chars = Array.from(text);
  const keepHead = Math.max(0, Math.floor(head));
  const keepTail = Math.max(0, Math.floor(tail));
  if (chars.length <= keepHead + keepTail + 1) return text;
  return `${chars.slice(0, keepHead).join("")}…${keepTail ? chars.slice(-keepTail).join("") : ""}`;
}

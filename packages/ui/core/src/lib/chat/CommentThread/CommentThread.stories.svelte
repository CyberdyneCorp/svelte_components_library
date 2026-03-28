<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CommentThread from "./CommentThread.svelte";

  const now = Date.now();

  const defaultComments = [
    {
      id: "1",
      author: "Alice Chen",
      content: "Has anyone tested the new gas estimation logic on Polygon? I'm seeing inconsistent results on testnet.",
      timestamp: new Date(now - 1000 * 60 * 12).toISOString(),
      reactions: [
        { emoji: "👍", count: 3 },
        { emoji: "🔥", count: 1 },
      ],
      replies: [
        {
          id: "1-1",
          author: "Bob Rivera",
          avatar: "https://i.pravatar.cc/64?u=bob",
          content: "Yeah, same here. It seems to underestimate by about 15% on complex contract calls.",
          timestamp: new Date(now - 1000 * 60 * 8).toISOString(),
          reactions: [{ emoji: "👀", count: 2 }],
          replies: [
            {
              id: "1-1-1",
              author: "Alice Chen",
              content: "I opened an issue for this. We should add a buffer multiplier as a workaround.",
              timestamp: new Date(now - 1000 * 60 * 3).toISOString(),
            },
          ],
        },
      ],
    },
    {
      id: "2",
      author: "Carol Park",
      avatar: "https://i.pravatar.cc/64?u=carol",
      content: "The new token balance component looks great. Nice work on the loading skeleton!",
      timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      reactions: [
        { emoji: "❤️", count: 5 },
        { emoji: "🎉", count: 2 },
      ],
    },
    {
      id: "3",
      author: "Dave Nakamura",
      content: "Reminder: we're doing a design review tomorrow at 10am. Please have your component PRs ready.",
      timestamp: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      replies: [
        {
          id: "3-1",
          author: "Eve Zhang",
          avatar: "https://i.pravatar.cc/64?u=eve",
          content: "Will do. I still need to finalize the dark mode variants for the chart components.",
          timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
        },
      ],
    },
  ];

  const deepComments = [
    {
      id: "d1",
      author: "Frank Müller",
      content: "Should we migrate the state management to runes across all components?",
      timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
      reactions: [{ emoji: "🤔", count: 4 }],
      replies: [
        {
          id: "d1-1",
          author: "Grace Li",
          avatar: "https://i.pravatar.cc/64?u=grace",
          content: "Absolutely. Runes are much cleaner for reactive state.",
          timestamp: new Date(now - 1000 * 60 * 25).toISOString(),
          replies: [
            {
              id: "d1-1-1",
              author: "Henry Okafor",
              content: "Agreed. I already started converting the form components.",
              timestamp: new Date(now - 1000 * 60 * 20).toISOString(),
              replies: [
                {
                  id: "d1-1-1-1",
                  author: "Frank Müller",
                  content: "Perfect. Let's track progress in the migration issue.",
                  timestamp: new Date(now - 1000 * 60 * 15).toISOString(),
                  replies: [
                    {
                      id: "d1-1-1-1-1",
                      author: "Grace Li",
                      content: "This reply should be hidden behind a 'View more' link since it exceeds max depth.",
                      timestamp: new Date(now - 1000 * 60 * 10).toISOString(),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const { Story } = defineMeta({
    title: "Chat/CommentThread",
    component: CommentThread,
    tags: ["autodocs"],
  });
</script>

<Story
  name="Default"
  args={{
    comments: defaultComments,
    onreply: (parentId, content) => console.log("Reply to", parentId, ":", content),
    onreact: (commentId, emoji) => console.log("React", emoji, "on", commentId),
  }}
/>

<Story
  name="Deep"
  args={{
    comments: deepComments,
    maxDepth: 3,
    onreply: (parentId, content) => console.log("Reply to", parentId, ":", content),
    onreact: (commentId, emoji) => console.log("React", emoji, "on", commentId),
  }}
/>

<Story
  name="Empty"
  args={{
    comments: [],
    onreply: (parentId, content) => console.log("Reply to", parentId, ":", content),
    onreact: (commentId, emoji) => console.log("React", emoji, "on", commentId),
  }}
/>

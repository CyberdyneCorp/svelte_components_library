<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import VideoPlayer from "./VideoPlayer.svelte";

  const { Story } = defineMeta({
    title: "Feedback/VideoPlayer",
    component: VideoPlayer,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  src: "",
  poster: "",
  width: "100%",
  showControls: true,
}} />

<Story name="WithPoster" args={{
  src: "",
  poster: "https://placehold.co/1280x720/1a1a2e/e0e0ff?text=Video+Poster",
  width: "100%",
  showControls: true,
}} />

<Story name="Autoplay" args={{
  src: "",
  poster: "https://placehold.co/1280x720/0d1117/58a6ff?text=Autoplay+Muted",
  autoplay: true,
  muted: true,
  width: "100%",
  showControls: true,
}} />

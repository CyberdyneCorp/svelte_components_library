import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
  // runes enabled per-component via <svelte:options runes={true} />
  // Global runes: true breaks Storybook 8.x internals
};

export default config;

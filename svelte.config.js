import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Pure client-side chat (ssr: false, prerender: true in +layout.ts) — emit
    // a fully static bundle that can be served from any CDN / S3 / GitHub
    // Pages. `fallback: 200.html` gives SPA behavior for unknown routes
    // without overwriting the prerendered index.html (Netlify/Vercel/etc.
    // recognize 200.html automatically; for other hosts, configure them to
    // serve 200.html on 404).
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '200.html',
      precompress: false,
      strict: true,
    }),
    alias: {
      $components: 'src/lib/components',
    },
  },
}

export default config

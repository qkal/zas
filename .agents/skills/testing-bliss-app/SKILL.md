# Testing the Bliss SvelteKit app

Client-only SvelteKit chat UI (pure runes, `ssr: false`, `prerender: true`). No backend, no auth. Dev data is seeded in-memory in `src/routes/+page.svelte`.

## Devin Secrets Needed

None. The app has no network calls, no auth, no secrets.

## Start the app

```
pnpm install
pnpm dev   # http://localhost:5173
```

Vite 6 + `@tailwindcss/vite`. First start re-optimizes deps (~2s). `pnpm build` uses `@sveltejs/adapter-auto` and will warn on local — that's expected; pick `adapter-static` or `adapter-node` when actually deploying.

## Lint / typecheck

```
pnpm lint         # oxlint (primary, fast)
pnpm lint:svelte  # svelte-check (types + .svelte diagnostics)
pnpm lint:all     # both
pnpm check        # alias for svelte-check
```

Warnings in vendored `src/lib/components/ui/**` (shadcn-svelte) are expected — don't try to "fix" them in this repo.

## Smoke test checklist (run when changing anything in `src/routes/+page.svelte`, `src/lib/components/bliss/**`, `src/lib/theme.svelte.ts`, `src/app.html`, or `src/app.css`)

These three are the highest-risk surfaces that any migration or refactor can break silently:

1. **Chat send lifecycle** — open a session, type any text, press **Enter** (not Shift+Enter). A user bubble should appear, "Thinking… **Ns**" should tick upwards once per second (proves `$effect`/`setInterval` reactivity), then after ~3s a `TaskCard` + assistant reply should appear. If the counter is stuck at `0s` or never appears, the `$effect` dependency tracking is broken.
2. **Theme persistence** — click the moon/sun icon in the chat header → full UI should recolor. Press **Ctrl+Shift+R** → page must repaint directly in the saved theme with no light/dark flash. A flash means the inline anti-FOUC `<script>` in `src/app.html` is broken (it reads `localStorage.getItem('bliss-theme')` and sets `html.classList.add('dark')` before hydration).
3. **Sidebar collapse** — click the toggle at sidebar top-right. Width should animate 248 → ~30px in ~300ms with labels fading out and the chat column re-padding. The animation is driven by the `data-collapsed` attribute + CSS width transition — if it snaps instantly, the attribute binding is wrong.

Seed session titles ("Premium landing page plan", "Review onboarding copy") reset on every reload because state is purely in-memory — only the `bliss-theme` localStorage key persists.

## Chrome launch workaround (only if `google-chrome <url>` silently does nothing)

The `google-chrome` binary in `$PATH` is a wrapper that POSTs to a running Chrome's CDP at `localhost:29229`. If no Chrome is running, it exits with code 7 and nothing appears. Launch a real Chrome with CDP enabled:

```
nohup /opt/.devin/chrome/chrome/linux-137.0.7118.2/chrome-linux64/chrome \
  --user-data-dir=/home/ubuntu/.browser_data_dir \
  --remote-debugging-port=29229 \
  --no-first-run --no-default-browser-check \
  --start-maximized \
  http://localhost:5173/ >/tmp/chrome.log 2>&1 &
```

The exact Chrome version path may change over time — check `ls /opt/.devin/chrome/chrome/` for the current build.

## browser_console tool known-flaky on Chrome-for-Testing

`browser_console` may repeatedly return `Chrome is not in the foreground.` even when `xdotool getactivewindow getwindowname` confirms the Chrome window is active. If it keeps failing, fall back to visual verification (take a screenshot after the action) rather than trying to script around it — for `localStorage` inspection specifically, a hard-reload test (does state persist?) is equivalent proof.

## What lives where (for editing)

- Chat lifecycle logic, session mutations, scroll detection: `src/routes/+page.svelte`
- Chat components: `src/lib/components/bliss/*.svelte` (not the `ui/` folder — that's vendored shadcn-svelte and unused by the chat today)
- Theme store + `$effect` that toggles `html.dark`: `src/lib/theme.svelte.ts`
- Anti-FOUC inline script + `<head>` metadata: `src/app.html`
- Design tokens (oklch cream palette, bubble/chip colors, custom scrollbar, Tailwind v4 `@theme inline`): `src/app.css`
- oxlint config: `.oxlintrc.json`

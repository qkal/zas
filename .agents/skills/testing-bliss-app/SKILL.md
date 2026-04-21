# Testing the Bliss Next.js app

Client-rendered Next.js 16 chat UI (React 19, `"use client"` page). No backend, no auth. Dev data is seeded in-memory in `app/page.tsx`.

## Devin Secrets Needed

None. The app has no network calls, no auth, no secrets.

## Start the app

```bash
pnpm install
pnpm dev   # http://localhost:3000
```

Next.js 16 + Tailwind CSS 4 via `@tailwindcss/postcss`. First start compiles the app (~2s). `pnpm build` produces a production build; `pnpm start` serves it.

## Lint / typecheck

```bash
pnpm lint   # eslint (the only lint script defined)
```

Warnings in vendored `components/ui/**` (shadcn/ui) are expected — don't try to "fix" them in this repo.

## Smoke test checklist (run when changing anything in `app/page.tsx`, `components/bliss/**`, `components/theme-provider.tsx`, `app/layout.tsx`, or `app/globals.css`)

These three are the highest-risk surfaces that any migration or refactor can break silently:

1. **Chat send lifecycle** — open a session, type any text, press **Enter** (not Shift+Enter). A user bubble should appear, "Thinking… **Ns**" should tick upwards once per second (proves `useEffect`/`setInterval` reactivity in `app/page.tsx`), then after ~3s a `TaskCard` + assistant reply should appear. If the counter is stuck at `0s` or never appears, the state update logic is broken.
2. **Theme persistence** — click the moon/sun icon in the chat header → full UI should recolor. Press **Ctrl+Shift+R** → page must repaint directly in the saved theme with no light/dark flash. Theme is managed by `next-themes` (`ThemeProvider` in `app/layout.tsx`), which injects an inline script to set the `class` attribute on `<html>` before hydration.
3. **Sidebar collapse** — click the toggle at sidebar top-right. Width should animate 248 → 60px in ~300ms with labels fading out and the chat column re-padding. The animation is driven by the `data-collapsed` attribute on `<aside>` in `components/bliss/sidebar.tsx` + CSS `transition-[width]` — if it snaps instantly, the attribute binding is wrong.

Seed session titles ("Premium landing page plan", "Review onboarding copy") reset on every reload because state is purely in-memory — only the `next-themes` localStorage key persists.

## Chrome launch workaround (only if `google-chrome <url>` silently does nothing)

The `google-chrome` binary in `$PATH` is a wrapper that POSTs to a running Chrome's CDP at `localhost:29229`. If no Chrome is running, it exits with code 7 and nothing appears. Launch a real Chrome with CDP enabled:

```bash
nohup /opt/.devin/chrome/chrome/linux-137.0.7118.2/chrome-linux64/chrome \
  --user-data-dir=/home/ubuntu/.browser_data_dir \
  --remote-debugging-port=29229 \
  --no-first-run --no-default-browser-check \
  --start-maximized \
  http://localhost:3000/ >/tmp/chrome.log 2>&1 &
```

The exact Chrome version path may change over time — check `ls /opt/.devin/chrome/chrome/` for the current build.

## browser_console tool known-flaky on Chrome-for-Testing

`browser_console` may repeatedly return `Chrome is not in the foreground.` even when `xdotool getactivewindow getwindowname` confirms the Chrome window is active. If it keeps failing, fall back to visual verification (take a screenshot after the action) rather than trying to script around it — for `localStorage` inspection specifically, a hard-reload test (does state persist?) is equivalent proof.

## What lives where (for editing)

- Chat lifecycle logic, session mutations, scroll detection: `app/page.tsx`
- Chat components: `components/bliss/*.tsx` (sidebar collapse lives in `components/bliss/sidebar.tsx`)
- Theme provider (wraps `next-themes`): `components/theme-provider.tsx`
- Root layout, fonts, `<ThemeProvider>` setup: `app/layout.tsx`
- Design tokens (oklch cream palette, bubble/chip colors, custom scrollbar, Tailwind v4 `@theme inline`): `app/globals.css`
- Vendored UI primitives (shadcn/ui — generally don't edit): `components/ui/`

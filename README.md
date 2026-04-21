# Bliss — chat UI

Chat interface for **Bliss**, an autonomous coding agent. This repository contains the Next.js frontend used as the conversational surface of the Bliss product.

## Tech stack

- [Next.js 16](https://nextjs.org/) with the App Router and Turbopack
- React 19
- Tailwind CSS 4 (via `@tailwindcss/postcss`) with a warm-cream design token set
- [shadcn/ui](https://ui.shadcn.com/) (new-york style) primitives under `components/ui/`
- [lucide-react](https://lucide.dev/) icons
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark theming
- [`@vercel/analytics`](https://vercel.com/analytics) (production only)

## Getting started

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command      | What it does                                 |
| ------------ | -------------------------------------------- |
| `pnpm dev`   | Start Next.js in development mode            |
| `pnpm build` | Production build with type checking          |
| `pnpm start` | Start the production server                  |
| `pnpm lint`  | Run ESLint across the project                |

## Project structure

```
app/
  globals.css      # Tailwind layers + Bliss design tokens (oklch palette)
  layout.tsx       # Root layout with Geist fonts + ThemeProvider
  page.tsx         # Chat page — sessions state, message flow, empty state

components/
  bliss/           # Product-specific chat surface (sidebar, composer,
                   # messages, task cards, logo, empty state, …)
  ui/              # shadcn primitives (button, dialog, tooltip, …)
  theme-provider.tsx

hooks/             # Shared hooks (e.g. use-mobile)
lib/utils.ts       # `cn()` helper (clsx + tailwind-merge)
public/            # Static assets (icons, placeholders)
```

## Chat behaviour

The current page is self-contained and does not call out to a real backend:

- Sessions live in React state. The sidebar lists them and the title updates
  from the first user message.
- Sending a message inserts a user bubble, shows a "Thinking…" indicator with a
  live second counter, then renders a mocked assistant reply with a task card.
- The **New session** button in the sidebar creates a fresh empty session and
  switches to it; the empty state offers a handful of starter prompts.
- Theme toggle (moon/sun in the header) is wired to `next-themes` with
  `attribute="class"` so the Tailwind `.dark` variant applies.

When wiring this into Bliss, replace the mocked `handleSend` in
`app/page.tsx` with a call to your agent runtime and stream assistant tokens
into the `Message.text` / task card fields.

## Design tokens

Colour tokens are defined in `app/globals.css` using the `oklch()` colour space
for a warm cream light theme and a neutral dark theme. Typography uses Geist
and Geist Mono loaded via `next/font/google` and exposed as
`--font-geist-sans` / `--font-geist-mono`.

"use client"

import { BlissLogo } from "@/components/bliss/bliss-logo"

const STARTER_PROMPTS = [
  "Set up a new Next.js app with TypeScript and Tailwind",
  "Find and fix the failing tests in this repo",
  "Refactor this component into smaller pieces",
  "Write a README for this project",
]

export function EmptyState({
  onSuggestion,
}: {
  onSuggestion?: (prompt: string) => void
}) {
  return (
    <div className="mx-auto mt-24 flex max-w-[640px] flex-col items-center gap-6 text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-500 ease-out">
      <BlissLogo className="h-11 w-11" />
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-medium tracking-[-0.015em] text-foreground">
          What should Bliss build next?
        </h1>
        <p className="text-[14.5px] leading-[1.6] text-foreground/60">
          Describe a task — a feature, a bug, a refactor — and Bliss will plan,
          run and report back. Start with a prompt below or type your own.
        </p>
      </div>
      <div className="mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSuggestion?.(prompt)}
            className="rounded-xl border border-border/70 bg-card/60 px-4 py-3 text-left text-[13px] leading-snug text-foreground/80 transition-all duration-200 ease-out hover:-translate-y-px hover:border-border hover:bg-foreground/5 hover:text-foreground hover:shadow-sm active:translate-y-0 active:scale-[0.99]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

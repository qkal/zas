"use client"

import { Copy, CornerUpLeft, MoreHorizontal, ThumbsDown, ThumbsUp } from "lucide-react"

export function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[760px] animate-in fade-in-0 slide-in-from-bottom-1 duration-500 ease-out">
      <div className="text-[14.5px] leading-[1.65] text-foreground/85 [&_code]:rounded [&_code]:border [&_code]:border-border/70 [&_code]:bg-foreground/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground/80">
        {children}
      </div>
      <div className="mt-4 flex items-center gap-1">
        <ActionButton label="Reply">
          <CornerUpLeft className="h-4 w-4" strokeWidth={1.6} />
        </ActionButton>
        <ActionButton label="Good response">
          <ThumbsUp className="h-4 w-4" strokeWidth={1.6} />
        </ActionButton>
        <ActionButton label="Bad response">
          <ThumbsDown className="h-4 w-4" strokeWidth={1.6} />
        </ActionButton>
        <ActionButton label="Copy">
          <Copy className="h-4 w-4" strokeWidth={1.6} />
        </ActionButton>
        <ActionButton label="More">
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.6} />
        </ActionButton>
      </div>
    </div>
  )
}

function ActionButton({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="rounded-md p-1.5 text-foreground/45 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground/80 active:scale-90"
    >
      {children}
    </button>
  )
}

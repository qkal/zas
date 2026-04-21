interface ThoughtIndicatorProps {
  seconds: number
  pending?: boolean
}

export function ThoughtIndicator({ seconds, pending = false }: ThoughtIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-[13.5px] text-foreground/55 animate-in fade-in duration-500">
      {pending && (
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-foreground/45"
        />
      )}
      <span>
        {pending
          ? `Thinking… ${seconds}s`
          : `Thought for ${seconds}s`}
      </span>
    </div>
  )
}

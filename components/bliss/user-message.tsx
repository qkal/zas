"use client"

import { useState } from "react"

interface UserMessageProps {
  timestamp?: string
  children: React.ReactNode
  collapsible?: boolean
}

export function UserMessage({ timestamp, children, collapsible = false }: UserMessageProps) {
  const [expanded, setExpanded] = useState(!collapsible)

  return (
    <div className="flex flex-col items-end animate-in fade-in-0 slide-in-from-bottom-2 duration-500 ease-out">
      {timestamp && (
        <div className="mb-3 text-[12px] text-foreground/45 tabular-nums">
          {timestamp}
        </div>
      )}
      <div className="max-w-[560px] rounded-2xl bg-bubble px-5 py-4 text-[14.5px] leading-[1.55] text-bubble-foreground">
        <div
          className={
            collapsible && !expanded
              ? "line-clamp-6 [&>p]:mb-3 [&>p:last-child]:mb-0"
              : "[&>p]:mb-3 [&>p:last-child]:mb-0"
          }
        >
          {children}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 text-[13px] text-foreground/50 transition-colors duration-200 ease-out hover:text-foreground/80"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  )
}

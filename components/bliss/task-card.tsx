"use client"

import { useState } from "react"
import { Bookmark, CheckCircle2, ChevronsUpDown } from "lucide-react"

interface TaskItem {
  label: string
  done: boolean
}

interface TaskCardProps {
  title: string
  tasks?: TaskItem[]
  highlighted?: boolean
  onDetails?: () => void
  onPreview?: () => void
}

export function TaskCard({
  title,
  tasks = [],
  highlighted = false,
  onDetails,
  onPreview,
}: TaskCardProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`w-full max-w-[400px] rounded-2xl bg-card transition-all duration-500 ease-out animate-in fade-in-0 slide-in-from-bottom-2 ${
        highlighted
          ? "border border-[#7aa8ff]/60 ring-2 ring-[#7aa8ff]/25 shadow-[0_0_0_1px_rgba(122,168,255,0.15)]"
          : "border border-border/70"
      }`}
    >
      {/* Title row */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h3 className="text-[14.5px] font-medium tracking-[-0.005em] text-foreground">
          {title}
        </h3>
        <button
          type="button"
          aria-label="Bookmark"
          className="rounded-md p-1 text-foreground/45 hover:bg-foreground/5 hover:text-foreground/80 transition-colors"
        >
          <Bookmark className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Task list */}
      {tasks.length > 0 && !collapsed && (
        <div className="px-5 pb-3">
          <ul className="rounded-lg">
            {tasks.map((task, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between py-1.5 text-[13.5px] text-foreground/80"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4 text-foreground/40"
                    strokeWidth={1.75}
                  />
                  <span>{task.label}</span>
                </span>
                {idx === 0 && (
                  <button
                    type="button"
                    aria-label="Toggle"
                    onClick={() => setCollapsed((c) => !c)}
                    className="rounded p-0.5 text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5 transition-colors"
                  >
                    <ChevronsUpDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 px-5 pb-4 pt-1">
        <button
          type="button"
          onClick={onDetails}
          className="rounded-lg border border-border/80 bg-background/60 px-4 py-2 text-[13px] font-medium text-foreground/85 transition-all duration-200 ease-out hover:border-border hover:bg-foreground/5 active:scale-[0.98]"
        >
          Details
        </button>
        <button
          type="button"
          onClick={onPreview}
          className="rounded-lg border border-border/80 bg-background/60 px-4 py-2 text-[13px] font-medium text-foreground/85 transition-all duration-200 ease-out hover:border-border hover:bg-foreground/5 active:scale-[0.98]"
        >
          Preview
        </button>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Minimize2, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface ChatHeaderProps {
  title?: string
}

export function ChatHeader({ title = "Bliss" }: ChatHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <header className="flex h-14 w-full items-center justify-between px-5">
      <button
        type="button"
        className="group flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-foreground/85 transition-all duration-200 ease-out hover:bg-foreground/5 active:scale-[0.98]"
      >
        <span className="truncate tracking-[-0.01em]">{title}</span>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 text-foreground/45 transition-transform duration-200 ease-out group-hover:text-foreground/70 group-data-[open=true]:rotate-180"
          strokeWidth={2}
        />
      </button>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="rounded-md p-1.5 text-foreground/55 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-95"
        >
          {mounted ? (
            isDark ? (
              <Sun className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.75} />
            )
          ) : (
            <span className="block h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          aria-label="Minimize"
          className="rounded-md p-1.5 text-foreground/55 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-95"
        >
          <Minimize2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  )
}

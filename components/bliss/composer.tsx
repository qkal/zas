"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ChevronDown, Mic, Plus } from "lucide-react"

const MODES = ["Build", "Plan", "Review"] as const
type Mode = (typeof MODES)[number]

interface ComposerProps {
  onSend: (value: string) => void
  onScrollDown?: () => void
  showScrollDown?: boolean
}

export function Composer({ onSend, onScrollDown, showScrollDown = false }: ComposerProps) {
  const [value, setValue] = useState("")
  const [mode, setMode] = useState<Mode>("Build")
  const [modeOpen, setModeOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the textarea as the user types, capped at ~8 lines.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center">
      <div className="pointer-events-auto w-full max-w-[780px] px-5 pb-5">
        {/* Scroll-down indicator — only visible when the user has scrolled up. */}
        <div
          aria-hidden={!showScrollDown}
          className={[
            "relative mb-3 flex justify-center transition-all duration-200 ease-out",
            showScrollDown
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1 opacity-0",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onScrollDown}
            aria-label="Scroll to bottom"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border/80 bg-background text-foreground/55 shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:text-foreground hover:shadow-md active:translate-y-0 active:scale-95"
          >
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Input box */}
        <div className="rounded-2xl border border-border/80 bg-background/95 shadow-[0_6px_30px_-10px_rgba(60,40,20,0.12)] backdrop-blur transition-colors focus-within:border-foreground/25">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask Bliss…"
            rows={1}
            className="block max-h-[200px] w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[14.5px] leading-[1.55] text-foreground placeholder:text-foreground/40 focus:outline-none"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <button
              type="button"
              aria-label="Add attachment"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 text-foreground/55 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <div className="flex items-center gap-1.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModeOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={modeOpen}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] font-medium text-foreground/65 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-[0.97]"
                >
                  {mode}
                  <ChevronDown
                    className={[
                      "h-3 w-3 transition-transform duration-200",
                      modeOpen ? "rotate-180" : "",
                    ].join(" ")}
                    strokeWidth={2}
                  />
                </button>
                {modeOpen && (
                  <div
                    role="menu"
                    className="absolute bottom-full right-0 z-30 mb-2 w-32 overflow-hidden rounded-md border border-border/80 bg-background shadow-[0_10px_30px_-12px_rgba(60,40,20,0.18)]"
                  >
                    {MODES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="menuitemradio"
                        aria-checked={m === mode}
                        onClick={() => {
                          setMode(m)
                          setModeOpen(false)
                        }}
                        className={[
                          "flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] transition-colors",
                          m === mode
                            ? "bg-foreground/5 font-medium text-foreground"
                            : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
                        ].join(" ")}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label="Voice"
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/55 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90"
              >
                <Mic className="h-4 w-4" strokeWidth={1.75} />
              </button>

              <button
                type="button"
                aria-label="Send"
                onClick={handleSend}
                disabled={!value.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5aa0ff] text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:scale-[1.04] hover:brightness-105 hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:brightness-100 disabled:hover:shadow-sm"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

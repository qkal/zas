"use client"

import { useState } from "react"
import {
  BookOpen,
  ChevronDown,
  GitPullRequest,
  HelpCircle,
  MessageSquare,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  Settings,
} from "lucide-react"

type NavKey = "sessions" | "ask" | "wiki" | "review"

const NAV_ITEMS: { key: NavKey; label: string; icon: typeof MessageSquare }[] = [
  { key: "sessions", label: "Sessions", icon: MessageSquare },
  { key: "ask", label: "Ask", icon: HelpCircle },
  { key: "wiki", label: "Wiki", icon: BookOpen },
  { key: "review", label: "Review", icon: GitPullRequest },
]

type SessionItem = { id: string; title: string; time: string }

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
  sessions: SessionItem[]
  activeSessionId?: string
  onSelectSession: (id: string) => void
  onNewSession: () => void
}

export function Sidebar({
  collapsed,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: SidebarProps) {
  const [active, setActive] = useState<NavKey>("sessions")
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  const filteredRecent = query
    ? sessions.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()),
      )
    : sessions

  return (
    <aside
      id="primary-sidebar"
      data-collapsed={collapsed}
      aria-label="Primary"
      className="group/sidebar fixed inset-y-0 left-0 z-40 flex h-screen flex-col overflow-hidden border-r border-border/70 bg-[oklch(0.965_0.008_82)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[collapsed=true]:w-[60px] data-[collapsed=false]:w-[248px] motion-reduce:transition-none"
    >
      {/*
        Toggle button — fixed-anchored to the top-right of the sidebar.
        Stays at top:10px, right:10px in both states, layered above all
        sidebar content with z-50 so it never shifts or gets overlapped.
      */}
      <button
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        aria-controls="primary-sidebar"
        onClick={onToggle}
        className="absolute right-[10px] top-[10px] z-50 flex h-8 w-8 items-center justify-center rounded-md text-foreground/55 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90 motion-reduce:transition-none"
      >
        <PanelLeft
          aria-hidden="true"
          className="h-[17px] w-[17px] transition-transform duration-300 ease-out group-data-[collapsed=true]/sidebar:rotate-180"
          strokeWidth={1.75}
        />
      </button>

      {/* Workspace row — fades/slides out on collapse but preserves row height */}
      <div className="flex h-14 shrink-0 items-center pl-3 pr-12">
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[13px] font-medium text-foreground/85 transition-all duration-200 ease-out hover:bg-foreground/5 active:scale-[0.98] group-data-[collapsed=true]/sidebar:pointer-events-none group-data-[collapsed=true]/sidebar:-translate-x-1 group-data-[collapsed=true]/sidebar:opacity-0"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-[oklch(0.88_0.015_80)] text-[11px] font-semibold text-foreground/80">
            K
          </span>
          <span className="whitespace-nowrap tracking-[-0.01em]">kal</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground/45" strokeWidth={2} />
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5 px-2 pt-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? label : undefined}
              className={[
                "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-all duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none",
                isActive
                  ? "bg-[oklch(0.92_0.012_80)] font-medium text-foreground"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-[15px] w-[15px] shrink-0 transition-colors duration-200",
                  isActive ? "text-foreground" : "text-foreground/60",
                ].join(" ")}
                strokeWidth={1.75}
              />
              <span className="whitespace-nowrap tracking-[-0.005em] transition-opacity duration-200 group-data-[collapsed=true]/sidebar:opacity-0">
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Recent header */}
      <div className="mt-6 flex items-center justify-between px-4 transition-opacity duration-200 group-data-[collapsed=true]/sidebar:pointer-events-none group-data-[collapsed=true]/sidebar:opacity-0">
        <span className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-foreground/45">
          Recent
        </span>
        <div className="flex items-center gap-0.5 text-foreground/50">
          <button
            type="button"
            aria-label="Search recent"
            onClick={() => setSearchOpen((s) => !s)}
            className={[
              "rounded p-1 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90",
              searchOpen ? "bg-foreground/5 text-foreground" : "",
            ].join(" ")}
          >
            <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="New session"
            onClick={onNewSession}
            className="rounded p-1 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="More"
            className="rounded p-1 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90"
          >
            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Search input */}
      <div
        className={[
          "overflow-hidden px-2 transition-all duration-300 ease-out group-data-[collapsed=true]/sidebar:opacity-0",
          searchOpen ? "mt-2 max-h-10 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <input
          autoFocus={searchOpen}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sessions"
          className="w-full rounded-md border border-border/70 bg-background/70 px-2.5 py-1.5 text-[12.5px] text-foreground placeholder:text-foreground/40 transition-colors focus:border-foreground/30 focus:outline-none"
        />
      </div>

      {/* Recent items */}
      <div className="mt-2 flex flex-col gap-0.5 px-2 transition-opacity duration-200 group-data-[collapsed=true]/sidebar:pointer-events-none group-data-[collapsed=true]/sidebar:opacity-0">
        {filteredRecent.length === 0 && (
          <div className="px-2 py-1.5 text-[12.5px] text-foreground/45">
            No matches
          </div>
        )}
        {filteredRecent.map((r) => {
          const isActive = activeSessionId === r.id
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectSession(r.id)}
              className={[
                "group/item flex flex-col gap-0.5 rounded-md px-2 py-1.5 text-left transition-all duration-200 ease-out active:scale-[0.99]",
                isActive
                  ? "bg-[oklch(0.92_0.012_80)]"
                  : "hover:bg-foreground/5",
              ].join(" ")}
            >
              <span
                className={[
                  "line-clamp-1 text-[13px] leading-snug transition-colors",
                  isActive ? "text-foreground" : "text-foreground/85",
                ].join(" ")}
              >
                {r.title}
              </span>
              <span className="text-[11.5px] text-foreground/45">{r.time}</span>
            </button>
          )
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <div className="border-t border-border/50 px-2 py-2">
        <button
          type="button"
          title={collapsed ? "Settings" : undefined}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-foreground/75 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-[0.98]"
        >
          <Settings className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
          <span className="whitespace-nowrap tracking-[-0.005em] transition-opacity duration-200 group-data-[collapsed=true]/sidebar:opacity-0">
            Settings
          </span>
        </button>
      </div>
    </aside>
  )
}

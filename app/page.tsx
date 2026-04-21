"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { AssistantMessage } from "@/components/bliss/assistant-message"
import { ChatHeader } from "@/components/bliss/chat-header"
import { Composer } from "@/components/bliss/composer"
import { EmptyState } from "@/components/bliss/empty-state"
import { Sidebar } from "@/components/bliss/sidebar"
import { TaskCard } from "@/components/bliss/task-card"
import { ThoughtIndicator } from "@/components/bliss/thought-indicator"
import { Timestamp } from "@/components/bliss/timestamp"
import { UserMessage } from "@/components/bliss/user-message"

type Task = { label: string; done: boolean }

type Message =
  | {
      id: string
      role: "user"
      text: string
      createdAt: number
    }
  | {
      id: string
      role: "assistant"
      text: string
      createdAt: number
      thinkingSeconds: number
      task?: { title: string; tasks: Task[] }
      pending?: boolean
    }

type Session = {
  id: string
  title: string
  createdAt: number
  messages: Message[]
}

const INITIAL_SESSIONS: Session[] = [
  {
    id: "seed-1",
    title: "Premium landing page plan",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    messages: [
      {
        id: "m1",
        role: "user",
        text: "Draft a landing page plan for Bliss — an autonomous coding agent focused on product engineers.",
        createdAt: Date.now() - 1000 * 60 * 60 * 48,
      },
      {
        id: "m2",
        role: "assistant",
        text: "Drafted a structured plan covering hero, value props, product demo, pricing and trust sections. Each section has a short brief you can iterate on — tell me which to expand first.",
        createdAt: Date.now() - 1000 * 60 * 60 * 48 + 9000,
        thinkingSeconds: 9,
        task: {
          title: "Landing page plan — 6 sections",
          tasks: [
            { label: "Define narrative and positioning", done: true },
            { label: "Outline each section with goals", done: true },
          ],
        },
      },
    ],
  },
  {
    id: "seed-2",
    title: "Review onboarding copy",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    messages: [],
  },
]

function formatTimeAgo(ms: number) {
  const diff = Date.now() - ms
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

function formatTimestampLabel(ms: number) {
  const d = new Date(ms)
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function Page() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [collapsed, setCollapsed] = useState(false)
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS)
  const [activeSessionId, setActiveSessionId] = useState<string>(
    INITIAL_SESSIONS[0].id,
  )
  const [showScrollDown, setShowScrollDown] = useState(false)

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? sessions[0],
    [sessions, activeSessionId],
  )

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  // Auto-scroll when active session changes or a new message appears.
  useEffect(() => {
    scrollToBottom("auto")
  }, [activeSessionId, scrollToBottom])

  useEffect(() => {
    scrollToBottom("smooth")
  }, [activeSession?.messages.length, scrollToBottom])

  // Track whether the user is at the bottom so we can toggle the scroll-down button.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight
      setShowScrollDown(distanceFromBottom > 120)
    }
    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [activeSessionId])

  // Clean up any pending timers when unmounting.
  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current)
    }
  }, [])

  const updateSession = useCallback(
    (id: string, updater: (session: Session) => Session) => {
      setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)))
    },
    [],
  )

  const handleSend = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || !activeSession) return

      const now = Date.now()
      const userMessage: Message = {
        id: `u-${now}`,
        role: "user",
        text,
        createdAt: now,
      }

      const assistantId = `a-${now}`
      const pendingAssistant: Message = {
        id: assistantId,
        role: "assistant",
        text: "",
        createdAt: now,
        thinkingSeconds: 0,
        pending: true,
      }

      const sessionId = activeSession.id
      const shouldRetitle = activeSession.messages.length === 0

      updateSession(sessionId, (s) => ({
        ...s,
        title: shouldRetitle ? text.slice(0, 48) : s.title,
        messages: [...s.messages, userMessage, pendingAssistant],
      }))

      // Simulate the assistant "thinking" and then delivering a reply.
      if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current)
      const startedAt = Date.now()
      thinkingIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        updateSession(sessionId, (s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === assistantId && m.role === "assistant" && m.pending
              ? { ...m, thinkingSeconds: elapsed }
              : m,
          ),
        }))
      }, 1000)

      window.setTimeout(() => {
        if (thinkingIntervalRef.current) {
          clearInterval(thinkingIntervalRef.current)
          thinkingIntervalRef.current = null
        }
        updateSession(sessionId, (s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === assistantId && m.role === "assistant"
              ? {
                  ...m,
                  pending: false,
                  thinkingSeconds: Math.max(
                    m.thinkingSeconds,
                    Math.floor((Date.now() - startedAt) / 1000),
                  ),
                  text: `Got it — I'll work through "${text.slice(0, 120)}${
                    text.length > 120 ? "…" : ""
                  }" step by step. I'll flag anything risky before I touch it and share a preview once I have something to look at.`,
                  task: {
                    title: "Plan next actions",
                    tasks: [
                      { label: "Understand the request", done: true },
                      { label: "Outline the approach", done: true },
                    ],
                  },
                }
              : m,
          ),
        }))
      }, 3200)
    },
    [activeSession, updateSession],
  )

  const handleNewSession = useCallback(() => {
    const id = `s-${Date.now()}`
    const session: Session = {
      id,
      title: "New session",
      createdAt: Date.now(),
      messages: [],
    }
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(id)
  }, [])

  const sidebarSessions = useMemo(
    () =>
      sessions.map((s) => ({
        id: s.id,
        title: s.title,
        time: formatTimeAgo(s.createdAt),
      })),
    [sessions],
  )

  return (
    <main className="relative min-h-screen w-full bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        sessions={sidebarSessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
      />

      {/* Chat column — padded left by exactly the sidebar's current width. */}
      <div
        style={{ paddingLeft: collapsed ? 60 : 248 }}
        className="relative flex h-screen flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      >
        <ChatHeader title={activeSession?.title ?? "Bliss"} />

        <div
          ref={scrollRef}
          className="bliss-scroll relative flex-1 overflow-y-auto"
        >
          <div className="mx-auto flex w-full max-w-[820px] flex-col gap-8 px-5 pb-[220px] pt-4">
            {activeSession && activeSession.messages.length === 0 ? (
              <EmptyState onSuggestion={handleSend} />
            ) : (
              activeSession?.messages.map((message, idx) => {
                const prev = idx > 0 ? activeSession.messages[idx - 1] : null
                const showTimestamp =
                  !prev || message.createdAt - prev.createdAt > 1000 * 60 * 15
                return (
                  <div key={message.id} className="flex flex-col gap-6">
                    {showTimestamp && (
                      <Timestamp label={formatTimestampLabel(message.createdAt)} />
                    )}
                    {message.role === "user" ? (
                      <UserMessage collapsible={message.text.length > 280}>
                        <p>{message.text}</p>
                      </UserMessage>
                    ) : (
                      <div className="flex flex-col gap-5">
                        <ThoughtIndicator
                          seconds={message.thinkingSeconds}
                          pending={message.pending}
                        />
                        {message.task && (
                          <TaskCard
                            title={message.task.title}
                            tasks={message.task.tasks}
                            highlighted={message.pending}
                          />
                        )}
                        {message.text && (
                          <AssistantMessage>
                            <p>{message.text}</p>
                          </AssistantMessage>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <Composer
          onSend={handleSend}
          onScrollDown={() => scrollToBottom("smooth")}
          showScrollDown={showScrollDown}
        />
      </div>
    </main>
  )
}

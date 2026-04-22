<script lang="ts">
  import AssistantMessage from '$lib/components/bliss/AssistantMessage.svelte'
  import ChatHeader from '$lib/components/bliss/ChatHeader.svelte'
  import Composer from '$lib/components/bliss/Composer.svelte'
  import EmptyState from '$lib/components/bliss/EmptyState.svelte'
  import Sidebar from '$lib/components/bliss/Sidebar.svelte'
  import TaskCard from '$lib/components/bliss/TaskCard.svelte'
  import ThoughtIndicator from '$lib/components/bliss/ThoughtIndicator.svelte'
  import Timestamp from '$lib/components/bliss/Timestamp.svelte'
  import UserMessage from '$lib/components/bliss/UserMessage.svelte'

  type Task = { label: string; done: boolean }

  type UserMsg = {
    id: string
    role: 'user'
    text: string
    createdAt: number
  }

  type AssistantMsg = {
    id: string
    role: 'assistant'
    text: string
    createdAt: number
    thinkingSeconds: number
    task?: { title: string; tasks: Task[] }
    pending?: boolean
  }

  type Message = UserMsg | AssistantMsg

  type Session = {
    id: string
    title: string
    createdAt: number
    messages: Message[]
  }

  const now0 = Date.now()
  const INITIAL_SESSIONS: Session[] = [
    {
      id: 'seed-1',
      title: 'Premium landing page plan',
      createdAt: now0 - 1000 * 60 * 60 * 48,
      messages: [
        {
          id: 'm1',
          role: 'user',
          text: 'Draft a landing page plan for Bliss — an autonomous coding agent focused on product engineers.',
          createdAt: now0 - 1000 * 60 * 60 * 48,
        },
        {
          id: 'm2',
          role: 'assistant',
          text: 'Drafted a structured plan covering hero, value props, product demo, pricing and trust sections. Each section has a short brief you can iterate on — tell me which to expand first.',
          createdAt: now0 - 1000 * 60 * 60 * 48 + 9000,
          thinkingSeconds: 9,
          task: {
            title: 'Landing page plan — 6 sections',
            tasks: [
              { label: 'Define narrative and positioning', done: true },
              { label: 'Outline each section with goals', done: true },
            ],
          },
        },
      ],
    },
    {
      id: 'seed-2',
      title: 'Review onboarding copy',
      createdAt: now0 - 1000 * 60 * 60 * 48,
      messages: [],
    },
  ]

  function formatTimeAgo(ms: number) {
    const diff = Date.now() - ms
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} h ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  function formatTimestampLabel(ms: number) {
    const d = new Date(ms)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  let scrollEl: HTMLDivElement | null = $state(null)
  let thinkingIntervalId: ReturnType<typeof setInterval> | null = null

  let collapsed = $state(false)
  let sessions = $state<Session[]>(INITIAL_SESSIONS)
  let activeSessionId = $state<string>(INITIAL_SESSIONS[0].id)
  let showScrollDown = $state(false)

  const activeSession = $derived(sessions.find((s) => s.id === activeSessionId) ?? sessions[0])

  const sidebarSessions = $derived(
    sessions.map((s) => ({ id: s.id, title: s.title, time: formatTimeAgo(s.createdAt) })),
  )

  function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    const el = scrollEl
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  // Auto-scroll when the active session changes (jump) or a new message appears (smooth).
  $effect(() => {
    // depend on activeSessionId
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    activeSessionId
    scrollToBottom('auto')
  })

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    activeSession?.messages.length
    scrollToBottom('smooth')
  })

  // Track whether the user is at the bottom so we can toggle the scroll-down button.
  $effect(() => {
    const el = scrollEl
    if (!el) return
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    activeSessionId
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      showScrollDown = distanceFromBottom > 120
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  })

  // Clean up any pending timers when unmounting.
  $effect(() => {
    return () => {
      if (thinkingIntervalId) clearInterval(thinkingIntervalId)
    }
  })

  function updateSession(id: string, updater: (session: Session) => Session) {
    sessions = sessions.map((s) => (s.id === id ? updater(s) : s))
  }

  function handleSend(raw: string) {
    const text = raw.trim()
    if (!text || !activeSession) return

    const now = Date.now()
    const userMessage: Message = {
      id: `u-${now}`,
      role: 'user',
      text,
      createdAt: now,
    }

    const assistantId = `a-${now}`
    const pendingAssistant: Message = {
      id: assistantId,
      role: 'assistant',
      text: '',
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
    if (thinkingIntervalId) clearInterval(thinkingIntervalId)
    const startedAt = Date.now()
    thinkingIntervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      updateSession(sessionId, (s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === assistantId && m.role === 'assistant' && m.pending
            ? { ...m, thinkingSeconds: elapsed }
            : m,
        ),
      }))
    }, 1000)

    window.setTimeout(() => {
      if (thinkingIntervalId) {
        clearInterval(thinkingIntervalId)
        thinkingIntervalId = null
      }
      updateSession(sessionId, (s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === assistantId && m.role === 'assistant'
            ? {
                ...m,
                pending: false,
                thinkingSeconds: Math.max(
                  m.thinkingSeconds,
                  Math.floor((Date.now() - startedAt) / 1000),
                ),
                text: `Got it — I'll work through "${text.slice(0, 120)}${
                  text.length > 120 ? '…' : ''
                }" step by step. I'll flag anything risky before I touch it and share a preview once I have something to look at.`,
                task: {
                  title: 'Plan next actions',
                  tasks: [
                    { label: 'Understand the request', done: true },
                    { label: 'Outline the approach', done: true },
                  ],
                },
              }
            : m,
        ),
      }))
    }, 3200)
  }

  function handleNewSession() {
    const id = `s-${Date.now()}`
    const session: Session = {
      id,
      title: 'New session',
      createdAt: Date.now(),
      messages: [],
    }
    sessions = [session, ...sessions]
    activeSessionId = id
  }
</script>

<main class="relative min-h-screen w-full bg-background">
  <Sidebar
    {collapsed}
    onToggle={() => (collapsed = !collapsed)}
    sessions={sidebarSessions}
    {activeSessionId}
    onSelectSession={(id) => (activeSessionId = id)}
    onNewSession={handleNewSession}
  />

  <!-- Chat column — padded left by exactly the sidebar's current width. -->
  <div
    style:padding-left="{collapsed ? 60 : 248}px"
    class="relative flex h-screen flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
  >
    <ChatHeader title={activeSession?.title ?? 'Bliss'} />

    <div bind:this={scrollEl} class="bliss-scroll relative flex-1 overflow-y-auto">
      <div class="mx-auto flex w-full max-w-[820px] flex-col gap-8 px-5 pb-[220px] pt-4">
        {#if activeSession && activeSession.messages.length === 0}
          <EmptyState onSuggestion={handleSend} />
        {:else if activeSession}
          {#each activeSession.messages as message, idx (message.id)}
            {@const prev = idx > 0 ? activeSession.messages[idx - 1] : null}
            {@const showTimestamp = !prev || message.createdAt - prev.createdAt > 1000 * 60 * 15}
            <div class="flex flex-col gap-6">
              {#if showTimestamp}
                <Timestamp label={formatTimestampLabel(message.createdAt)} />
              {/if}
              {#if message.role === 'user'}
                <UserMessage collapsible={message.text.length > 280}>
                  <p>{message.text}</p>
                </UserMessage>
              {:else}
                <div class="flex flex-col gap-5">
                  <ThoughtIndicator seconds={message.thinkingSeconds} pending={message.pending} />
                  {#if message.task}
                    <TaskCard
                      title={message.task.title}
                      tasks={message.task.tasks}
                      highlighted={message.pending}
                    />
                  {/if}
                  {#if message.text}
                    <AssistantMessage>
                      <p>{message.text}</p>
                    </AssistantMessage>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <Composer
      onSend={handleSend}
      onScrollDown={() => scrollToBottom('smooth')}
      {showScrollDown}
    />
  </div>
</main>

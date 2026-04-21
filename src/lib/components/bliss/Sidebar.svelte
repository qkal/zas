<script lang="ts">
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
  } from '@lucide/svelte'

  type NavKey = 'sessions' | 'ask' | 'wiki' | 'review'
  type SessionItem = { id: string; title: string; time: string }

  type Props = {
    collapsed: boolean
    onToggle: () => void
    sessions: SessionItem[]
    activeSessionId?: string
    onSelectSession: (id: string) => void
    onNewSession: () => void
  }

  let { collapsed, onToggle, sessions, activeSessionId, onSelectSession, onNewSession }: Props = $props()

  const NAV_ITEMS = [
    { key: 'sessions' as NavKey, label: 'Sessions', icon: MessageSquare },
    { key: 'ask' as NavKey, label: 'Ask', icon: HelpCircle },
    { key: 'wiki' as NavKey, label: 'Wiki', icon: BookOpen },
    { key: 'review' as NavKey, label: 'Review', icon: GitPullRequest },
  ]

  let active = $state<NavKey>('sessions')
  let query = $state('')
  let searchOpen = $state(false)

  const filteredRecent = $derived(
    query ? sessions.filter((r) => r.title.toLowerCase().includes(query.toLowerCase())) : sessions,
  )
</script>

<aside
  id="primary-sidebar"
  data-collapsed={collapsed}
  aria-label="Primary"
  class="group/sidebar fixed inset-y-0 left-0 z-40 flex h-screen flex-col overflow-hidden border-r border-border/70 bg-[oklch(0.965_0.008_82)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[collapsed=true]:w-[60px] data-[collapsed=false]:w-[248px] motion-reduce:transition-none"
>
  <!--
    Toggle button — fixed-anchored to the top-right of the sidebar.
    Stays at top:10px, right:10px in both states, layered above all
    sidebar content with z-50 so it never shifts or gets overlapped.
  -->
  <button
    type="button"
    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    aria-expanded={!collapsed}
    aria-controls="primary-sidebar"
    onclick={onToggle}
    class="absolute right-[10px] top-[10px] z-50 flex h-8 w-8 items-center justify-center rounded-md text-foreground/55 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90 motion-reduce:transition-none"
  >
    <PanelLeft
      aria-hidden="true"
      class="h-[17px] w-[17px] transition-transform duration-300 ease-out group-data-[collapsed=true]/sidebar:rotate-180"
      strokeWidth={1.75}
    />
  </button>

  <!-- Workspace row — fades/slides out on collapse but preserves row height -->
  <div class="flex h-14 shrink-0 items-center pl-3 pr-12">
    <button
      type="button"
      class="flex items-center gap-2 rounded-md px-1.5 py-1 text-[13px] font-medium text-foreground/85 transition-all duration-200 ease-out hover:bg-foreground/5 active:scale-[0.98] group-data-[collapsed=true]/sidebar:pointer-events-none group-data-[collapsed=true]/sidebar:-translate-x-1 group-data-[collapsed=true]/sidebar:opacity-0"
    >
      <span
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-[oklch(0.88_0.015_80)] text-[11px] font-semibold text-foreground/80"
      >
        K
      </span>
      <span class="whitespace-nowrap tracking-[-0.01em]">kal</span>
      <ChevronDown class="h-3.5 w-3.5 shrink-0 text-foreground/45" strokeWidth={2} />
    </button>
  </div>

  <!-- Primary nav -->
  <nav class="flex flex-col gap-0.5 px-2 pt-1">
    {#each NAV_ITEMS as item (item.key)}
      {@const isActive = active === item.key}
      {@const Icon = item.icon}
      <button
        type="button"
        onclick={() => (active = item.key)}
        aria-current={isActive ? 'page' : undefined}
        title={collapsed ? item.label : undefined}
        class={[
          'relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-all duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none',
          isActive
            ? 'bg-[oklch(0.92_0.012_80)] font-medium text-foreground'
            : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground',
        ].join(' ')}
      >
        <Icon
          class={[
            'h-[15px] w-[15px] shrink-0 transition-colors duration-200',
            isActive ? 'text-foreground' : 'text-foreground/60',
          ].join(' ')}
          strokeWidth={1.75}
        />
        <span
          class="whitespace-nowrap tracking-[-0.005em] transition-opacity duration-200 group-data-[collapsed=true]/sidebar:opacity-0"
        >
          {item.label}
        </span>
      </button>
    {/each}
  </nav>

  <!-- Recent header -->
  <div
    class="mt-6 flex items-center justify-between px-4 transition-opacity duration-200 group-data-[collapsed=true]/sidebar:pointer-events-none group-data-[collapsed=true]/sidebar:opacity-0"
  >
    <span class="text-[11.5px] font-medium uppercase tracking-[0.06em] text-foreground/45">Recent</span>
    <div class="flex items-center gap-0.5 text-foreground/50">
      <button
        type="button"
        aria-label="Search recent"
        onclick={() => (searchOpen = !searchOpen)}
        class={[
          'rounded p-1 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90',
          searchOpen ? 'bg-foreground/5 text-foreground' : '',
        ].join(' ')}
      >
        <Search class="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="New session"
        onclick={onNewSession}
        class="rounded p-1 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90"
      >
        <Plus class="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="More"
        class="rounded p-1 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90"
      >
        <MoreHorizontal class="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  </div>

  <!-- Search input -->
  <div
    class={[
      'overflow-hidden px-2 transition-all duration-300 ease-out group-data-[collapsed=true]/sidebar:opacity-0',
      searchOpen ? 'mt-2 max-h-10 opacity-100' : 'max-h-0 opacity-0',
    ].join(' ')}
  >
    <!-- svelte-ignore a11y_autofocus -->
    <input
      autofocus={searchOpen}
      bind:value={query}
      placeholder="Search sessions"
      class="w-full rounded-md border border-border/70 bg-background/70 px-2.5 py-1.5 text-[12.5px] text-foreground placeholder:text-foreground/40 transition-colors focus:border-foreground/30 focus:outline-none"
    />
  </div>

  <!-- Recent items -->
  <div
    class="mt-2 flex flex-col gap-0.5 px-2 transition-opacity duration-200 group-data-[collapsed=true]/sidebar:pointer-events-none group-data-[collapsed=true]/sidebar:opacity-0"
  >
    {#if filteredRecent.length === 0}
      <div class="px-2 py-1.5 text-[12.5px] text-foreground/45">No matches</div>
    {/if}
    {#each filteredRecent as r (r.id)}
      {@const isActive = activeSessionId === r.id}
      <button
        type="button"
        onclick={() => onSelectSession(r.id)}
        class={[
          'group/item flex flex-col gap-0.5 rounded-md px-2 py-1.5 text-left transition-all duration-200 ease-out active:scale-[0.99]',
          isActive ? 'bg-[oklch(0.92_0.012_80)]' : 'hover:bg-foreground/5',
        ].join(' ')}
      >
        <span
          class={[
            'line-clamp-1 text-[13px] leading-snug transition-colors',
            isActive ? 'text-foreground' : 'text-foreground/85',
          ].join(' ')}
        >
          {r.title}
        </span>
        <span class="text-[11.5px] text-foreground/45">{r.time}</span>
      </button>
    {/each}
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Settings -->
  <div class="border-t border-border/50 px-2 py-2">
    <button
      type="button"
      title={collapsed ? 'Settings' : undefined}
      class="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-foreground/75 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-[0.98]"
    >
      <Settings class="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
      <span
        class="whitespace-nowrap tracking-[-0.005em] transition-opacity duration-200 group-data-[collapsed=true]/sidebar:opacity-0"
      >
        Settings
      </span>
    </button>
  </div>
</aside>

<script lang="ts">
  import { ArrowDown, ArrowUp, ChevronDown, Mic, Plus } from '@lucide/svelte'

  const MODES = ['Build', 'Plan', 'Review'] as const
  type Mode = (typeof MODES)[number]

  type Props = {
    onSend: (value: string) => void
    onScrollDown?: () => void
    showScrollDown?: boolean
  }

  let { onSend, onScrollDown, showScrollDown = false }: Props = $props()

  let value = $state('')
  let mode = $state<Mode>('Build')
  let modeOpen = $state(false)
  let textareaEl: HTMLTextAreaElement | null = $state(null)

  // Auto-grow the textarea as the user types, capped at ~8 lines.
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    value
    if (!textareaEl) return
    textareaEl.style.height = 'auto'
    textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, 200)}px`
  })

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    value = ''
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }
</script>

<div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center">
  <div class="pointer-events-auto w-full max-w-[780px] px-5 pb-5">
    <!-- Scroll-down indicator — only visible when the user has scrolled up. -->
    <div
      aria-hidden={!showScrollDown}
      class={[
        'relative mb-3 flex justify-center transition-all duration-200 ease-out',
        showScrollDown
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-1 opacity-0',
      ].join(' ')}
    >
      <button
        type="button"
        onclick={onScrollDown}
        aria-label="Scroll to bottom"
        class="flex h-7 w-7 items-center justify-center rounded-full border border-border/80 bg-background text-foreground/55 shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:text-foreground hover:shadow-md active:translate-y-0 active:scale-95"
      >
        <ArrowDown class="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>

    <!-- Input box -->
    <div
      class="rounded-2xl border border-border/80 bg-background/95 shadow-[0_6px_30px_-10px_rgba(60,40,20,0.12)] backdrop-blur transition-colors focus-within:border-foreground/25"
    >
      <textarea
        bind:this={textareaEl}
        bind:value
        onkeydown={onKeyDown}
        placeholder="Ask Bliss…"
        rows={1}
        class="block max-h-[200px] w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[14.5px] leading-[1.55] text-foreground placeholder:text-foreground/40 focus:outline-none"
      ></textarea>
      <div class="flex items-center justify-between px-3 pb-3">
        <button
          type="button"
          aria-label="Add attachment"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 text-foreground/55 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90"
        >
          <Plus class="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div class="flex items-center gap-1.5">
          <div class="relative">
            <button
              type="button"
              onclick={() => (modeOpen = !modeOpen)}
              aria-haspopup="menu"
              aria-expanded={modeOpen}
              class="flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] font-medium text-foreground/65 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-[0.97]"
            >
              {mode}
              <ChevronDown
                class={['h-3 w-3 transition-transform duration-200', modeOpen ? 'rotate-180' : ''].join(' ')}
                strokeWidth={2}
              />
            </button>
            {#if modeOpen}
              <div
                role="menu"
                class="absolute bottom-full right-0 z-30 mb-2 w-32 overflow-hidden rounded-md border border-border/80 bg-background shadow-[0_10px_30px_-12px_rgba(60,40,20,0.18)]"
              >
                {#each MODES as m (m)}
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={m === mode}
                    onclick={() => {
                      mode = m
                      modeOpen = false
                    }}
                    class={[
                      'flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] transition-colors',
                      m === mode
                        ? 'bg-foreground/5 font-medium text-foreground'
                        : 'text-foreground/75 hover:bg-foreground/5 hover:text-foreground',
                    ].join(' ')}
                  >
                    {m}
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <button
            type="button"
            aria-label="Voice"
            class="flex h-8 w-8 items-center justify-center rounded-full text-foreground/55 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-90"
          >
            <Mic class="h-4 w-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            aria-label="Send"
            onclick={handleSend}
            disabled={!value.trim()}
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#5aa0ff] text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:scale-[1.04] hover:brightness-105 hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:brightness-100 disabled:hover:shadow-sm"
          >
            <ArrowUp class="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

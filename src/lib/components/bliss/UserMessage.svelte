<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    timestamp?: string
    collapsible?: boolean
    children: Snippet
  }

  let { timestamp, collapsible = false, children }: Props = $props()

  let manuallyExpanded = $state(false)
  const expanded = $derived(!collapsible || manuallyExpanded)
</script>

<div class="flex flex-col items-end animate-in fade-in-0 slide-in-from-bottom-2 duration-500 ease-out">
  {#if timestamp}
    <div class="mb-3 text-[12px] text-foreground/45 tabular-nums">{timestamp}</div>
  {/if}
  <div class="max-w-[560px] rounded-2xl bg-bubble px-5 py-4 text-[14.5px] leading-[1.55] text-bubble-foreground">
    <div
      class={collapsible && !expanded
        ? 'line-clamp-6 [&>p]:mb-3 [&>p:last-child]:mb-0'
        : '[&>p]:mb-3 [&>p:last-child]:mb-0'}
    >
      {@render children()}
    </div>
    {#if collapsible}
      <button
        type="button"
        onclick={() => (manuallyExpanded = !manuallyExpanded)}
        class="mt-2 text-[13px] text-foreground/50 transition-colors duration-200 ease-out hover:text-foreground/80"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    {/if}
  </div>
</div>

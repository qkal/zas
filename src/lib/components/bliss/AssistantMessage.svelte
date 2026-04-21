<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Copy, CornerUpLeft, MoreHorizontal, ThumbsDown, ThumbsUp } from '@lucide/svelte'

  type Props = { children: Snippet }
  let { children }: Props = $props()
</script>

{#snippet actionButton(label: string, icon: Snippet)}
  <button
    type="button"
    aria-label={label}
    class="rounded-md p-1.5 text-foreground/45 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground/80 active:scale-90"
  >
    {@render icon()}
  </button>
{/snippet}

<div class="max-w-[760px] animate-in fade-in-0 slide-in-from-bottom-1 duration-500 ease-out">
  <div
    class="text-[14.5px] leading-[1.65] text-foreground/85 [&_code]:rounded [&_code]:border [&_code]:border-border/70 [&_code]:bg-foreground/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-foreground/80"
  >
    {@render children()}
  </div>
  <div class="mt-4 flex items-center gap-1">
    {#snippet replyIcon()}<CornerUpLeft class="h-4 w-4" strokeWidth={1.6} />{/snippet}
    {@render actionButton('Reply', replyIcon)}
    {#snippet goodIcon()}<ThumbsUp class="h-4 w-4" strokeWidth={1.6} />{/snippet}
    {@render actionButton('Good response', goodIcon)}
    {#snippet badIcon()}<ThumbsDown class="h-4 w-4" strokeWidth={1.6} />{/snippet}
    {@render actionButton('Bad response', badIcon)}
    {#snippet copyIcon()}<Copy class="h-4 w-4" strokeWidth={1.6} />{/snippet}
    {@render actionButton('Copy', copyIcon)}
    {#snippet moreIcon()}<MoreHorizontal class="h-4 w-4" strokeWidth={1.6} />{/snippet}
    {@render actionButton('More', moreIcon)}
  </div>
</div>

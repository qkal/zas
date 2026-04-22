<script lang="ts">
  type Props = {
    seconds: number
    pending?: boolean
  }

  let { seconds, pending = false }: Props = $props()
</script>

<div class="flex items-center gap-2 text-[13.5px] text-foreground/55 animate-in fade-in duration-500">
  {#if pending}
    <span aria-hidden="true" class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-foreground/45"></span>
  {/if}
  <span>
    {pending ? `Thinking… ${seconds}s` : `Thought for ${seconds}s`}
  </span>
</div>

<script lang="ts">
  import { ChevronDown, Minimize2 } from '@lucide/svelte'

  type Props = {
    title?: string
  }

  let { title = 'Bliss' }: Props = $props()
</script>

<header class="flex h-14 w-full items-center justify-between px-5">
  <button
    type="button"
    class="group flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-foreground/85 transition-all duration-200 ease-out hover:bg-foreground/5 active:scale-[0.98]"
  >
    <span class="truncate tracking-[-0.01em]">{title}</span>
    <ChevronDown
      class="h-3.5 w-3.5 shrink-0 text-foreground/45 transition-transform duration-200 ease-out group-hover:text-foreground/70 group-data-[open=true]:rotate-180"
      strokeWidth={2}
    />
  </button>

  <div class="flex items-center gap-0.5">
    <button
      type="button"
      aria-label="Minimize"
      class="rounded-md p-1.5 text-foreground/55 transition-all duration-200 ease-out hover:bg-foreground/5 hover:text-foreground active:scale-95"
    >
      <Minimize2 class="h-4 w-4" strokeWidth={1.75} />
    </button>
  </div>
</header>

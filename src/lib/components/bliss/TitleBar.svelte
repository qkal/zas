<script lang="ts">
  import { onMount } from 'svelte'
  import BlissLogo from './BlissLogo.svelte'
  import { Minus, Square, X, Copy } from '@lucide/svelte'

  let isMaximized = $state(false)

  onMount(() => {
    if (window.electronAPI) {
      window.electronAPI.window.isMaximized().then((v: boolean) => {
        isMaximized = v
      })
      const unsubscribe = window.electronAPI.window.onMaximizeChange((v: boolean) => {
        isMaximized = v
      })
      return unsubscribe
    }
  })

  function handleMinimize() {
    window.electronAPI?.window.minimize()
  }

  function handleMaximize() {
    window.electronAPI?.window.maximize()
  }

  function handleClose() {
    window.electronAPI?.window.close()
  }
</script>

<div
  class="flex h-10 items-center justify-between border-b border-border bg-background select-none"
  style="-webkit-app-region: drag;"
>
  <div class="flex items-center gap-2 px-3" style="-webkit-app-region: no-drag;">
    <BlissLogo class="h-[18px] w-[18px]" />
    <span class="text-sm font-semibold text-foreground">Bliss</span>
  </div>

  <div class="flex items-center" style="-webkit-app-region: no-drag;">
    <button
      class="flex h-10 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      onclick={handleMinimize}
      aria-label="Minimize"
    >
      <Minus size={16} />
    </button>
    <button
      class="flex h-10 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      onclick={handleMaximize}
      aria-label={isMaximized ? 'Restore' : 'Maximize'}
    >
      {#if isMaximized}
        <Copy size={14} />
      {:else}
        <Square size={14} />
      {/if}
    </button>
    <button
      class="flex h-10 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
      onclick={handleClose}
      aria-label="Close"
    >
      <X size={16} />
    </button>
  </div>
</div>

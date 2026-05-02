<script lang="ts">
  import '../app.css'
  import TitleBar from '$lib/components/bliss/TitleBar.svelte'
  import type { Snippet } from 'svelte'

  type Props = { children: Snippet }
  let { children }: Props = $props()
</script>

<div class="flex h-screen flex-col">
  <TitleBar />
  <div class="flex-1 overflow-hidden">
    {@render children()}
  </div>
</div>

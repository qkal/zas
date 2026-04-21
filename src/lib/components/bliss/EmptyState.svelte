<script lang="ts">
  import BlissLogo from './BlissLogo.svelte'

  type Props = {
    onSuggestion?: (prompt: string) => void
  }

  let { onSuggestion }: Props = $props()

  const STARTER_PROMPTS = [
    'Set up a new Next.js app with TypeScript and Tailwind',
    'Find and fix the failing tests in this repo',
    'Refactor this component into smaller pieces',
    'Write a README for this project',
  ]
</script>

<div
  class="mx-auto mt-24 flex max-w-[640px] flex-col items-center gap-6 text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-500 ease-out"
>
  <BlissLogo class="h-11 w-11" />
  <div class="flex flex-col gap-2">
    <h1 class="text-[28px] font-medium tracking-[-0.015em] text-foreground">
      What should Bliss build next?
    </h1>
    <p class="text-[14.5px] leading-[1.6] text-foreground/60">
      Describe a task — a feature, a bug, a refactor — and Bliss will plan, run and report back.
      Start with a prompt below or type your own.
    </p>
  </div>
  <div class="mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
    {#each STARTER_PROMPTS as prompt (prompt)}
      <button
        type="button"
        onclick={() => onSuggestion?.(prompt)}
        class="rounded-xl border border-border/70 bg-card/60 px-4 py-3 text-left text-[13px] leading-snug text-foreground/80 transition-all duration-200 ease-out hover:-translate-y-px hover:border-border hover:bg-foreground/5 hover:text-foreground hover:shadow-sm active:translate-y-0 active:scale-[0.99]"
      >
        {prompt}
      </button>
    {/each}
  </div>
</div>

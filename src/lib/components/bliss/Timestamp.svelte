<script lang="ts">
  type Props = { label: string }
  let { label }: Props = $props()
</script>

<div class="flex w-full justify-center py-2">
  <span class="text-[12px] text-foreground/45 tabular-nums">{label}</span>
</div>

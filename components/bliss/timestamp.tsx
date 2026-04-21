export function Timestamp({ label }: { label: string }) {
  return (
    <div className="flex w-full justify-center py-2">
      <span className="text-[12px] text-foreground/45 tabular-nums">
        {label}
      </span>
    </div>
  )
}

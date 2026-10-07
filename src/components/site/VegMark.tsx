export function VegMark({ veg = true }: { veg?: boolean }) {
  return (
    <span
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 bg-card ${veg ? "border-leaf" : "border-chilli"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${veg ? "bg-leaf" : "bg-chilli"}`} />
    </span>
  );
}

export function SpiceMark({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="text-xs font-semibold text-chilli" aria-label={`Spice level ${level} of 3`}>
      {"🌶".repeat(Math.min(3, level))}
    </span>
  );
}

interface BadgeProps {
  count: number
  pulse?: boolean
  size?: "sm" | "md" | "lg"
}

export function Badge({ count, pulse = false, size = "md" }: BadgeProps) {
  if (count === 0) return null

  const sizeClasses = {
    sm: "min-w-4 h-4 text-[10px]",
    md: "min-w-5 h-5 text-xs",
    lg: "min-w-6 h-6 text-sm"
  }

  const displayCount = count > 99 ? "99+" : count.toString()

  return (
    <span
      className={`${sizeClasses[size]} bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold px-1 ${
        pulse ? "animate-badge-pulse" : ""
      }`}
    >
      {displayCount}
    </span>
  )
}

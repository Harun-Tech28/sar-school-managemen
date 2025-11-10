import React from "react"

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  showLabel?: boolean
  color?: "red" | "yellow" | "gradient" | "green"
  animated?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  color = "red",
  animated = true,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const colorClasses = {
    red: "bg-[#E31E24]",
    yellow: "bg-[#FFD100]",
    green: "bg-green-500",
    gradient: "bg-gradient-to-r from-[#E31E24] to-[#FFD100]",
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-[#E31E24]">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${colorClasses[color]} ${animated ? "transition-all duration-500 ease-out" : ""}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

import React from "react"

interface SpinnerProps {
  size?: number
  color?: "red" | "yellow" | "white" | "gray"
  speed?: "slow" | "normal" | "fast"
}

export function Spinner({ size = 24, color = "red", speed = "normal" }: SpinnerProps) {
  const colors = {
    red: "#E31E24",
    yellow: "#FFD100",
    white: "#FFFFFF",
    gray: "#6B7280",
  }

  const speeds = {
    slow: "1.5s",
    normal: "1s",
    fast: "0.6s",
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: `spin-sar ${speeds[speed]} linear infinite`,
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={colors[color]}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="60 20"
        opacity="0.8"
      />
    </svg>
  )
}

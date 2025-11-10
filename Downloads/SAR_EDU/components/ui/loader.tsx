import React from "react"
import Image from "next/image"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

export function Loader({ size = "md", text, fullScreen = false }: LoaderProps) {
  const sizes = {
    sm: { logo: 40, ring: 60 },
    md: { logo: 60, ring: 90 },
    lg: { logo: 80, ring: 120 },
  }

  const currentSize = sizes[size]

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Logo with rotating ring */}
      <div className="relative" style={{ width: currentSize.ring, height: currentSize.ring }}>
        {/* Rotating ring */}
        <div className="absolute inset-0 animate-rotate-ring">
          <svg
            width={currentSize.ring}
            height={currentSize.ring}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="60"
              cy="60"
              r="55"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="20 10"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E31E24" />
                <stop offset="50%" stopColor="#FFD100" />
                <stop offset="100%" stopColor="#E31E24" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Pulsing logo */}
        <div
          className="absolute inset-0 flex items-center justify-center animate-pulse-sar"
          style={{
            width: currentSize.ring,
            height: currentSize.ring,
          }}
        >
          <div
            className="relative rounded-xl overflow-hidden shadow-lg ring-2 ring-[#FFD100]"
            style={{ width: currentSize.logo, height: currentSize.logo }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sarlogo-xxAG87QJUVXBfV9KkmRbyQ4NK6e1Dm.jpg"
              alt="SAR Logo"
              width={currentSize.logo}
              height={currentSize.logo}
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Loading text */}
      {text && (
        <div className="text-center">
          <p className="text-sm font-semibold text-[#E31E24] animate-pulse-sar">{text}</p>
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
        {loaderContent}
      </div>
    )
  }

  return loaderContent
}

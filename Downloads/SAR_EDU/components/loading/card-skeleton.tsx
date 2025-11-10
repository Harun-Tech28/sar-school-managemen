import React from "react"

interface CardSkeletonProps {
  count?: number
}

export function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 animate-pulse"
        >
          {/* Label skeleton */}
          <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
          
          {/* Value and icon row */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 bg-gray-300 rounded w-16"></div>
            <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
          </div>
          
          {/* Progress bar skeleton */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-2 bg-gray-200 rounded w-16"></div>
              <div className="h-2 bg-gray-200 rounded w-8"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gray-300 h-2 rounded-full w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

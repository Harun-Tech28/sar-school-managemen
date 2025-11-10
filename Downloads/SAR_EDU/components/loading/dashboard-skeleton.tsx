import React from "react"
import { CardSkeleton } from "./card-skeleton"

export function DashboardSkeleton() {
  return (
    <div className="flex-1 p-8 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-3xl p-8 mb-8 shadow-xl animate-pulse">
          <div className="h-10 bg-white/30 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-white/20 rounded w-1/2"></div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CardSkeleton count={4} />
        </div>

        {/* Quick actions skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded w-48 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 animate-pulse"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

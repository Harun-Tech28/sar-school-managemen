"use client"

import { useEffect, useState } from "react"
import { Activity as ActivityIcon } from "lucide-react"
import { Activity } from "@/lib/types/notification"
import { getActivities, getRelativeTime, initializeDemoActivities } from "@/lib/notifications/activity-service"

interface ActivityFeedProps {
  userRole: string
  maxItems?: number
  showHeader?: boolean
}

export function ActivityFeed({ userRole, maxItems = 10, showHeader = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Initialize demo activities if none exist
    initializeDemoActivities(userRole)
    
    // Load activities
    const loadActivities = () => {
      const userActivities = getActivities(userRole, maxItems)
      setActivities(userActivities)
    }

    loadActivities()

    // Refresh every 60 seconds
    const interval = setInterval(loadActivities, 60000)

    return () => clearInterval(interval)
  }, [userRole, maxItems])

  const getColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600"
      case "green":
        return "bg-green-100 text-green-600"
      case "purple":
        return "bg-purple-100 text-purple-600"
      case "yellow":
        return "bg-yellow-100 text-yellow-600"
      case "orange":
        return "bg-orange-100 text-orange-600"
      case "red":
        return "bg-red-100 text-red-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      {showHeader && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#FFD100] rounded-xl flex items-center justify-center shadow-lg">
            <ActivityIcon size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <p className="text-xs text-gray-600">Latest updates and events</p>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ActivityIcon size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No recent activity</p>
          <p className="text-sm text-gray-500 mt-1">Activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(activity.color)}`}>
                <span className="text-lg">{activity.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {getRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

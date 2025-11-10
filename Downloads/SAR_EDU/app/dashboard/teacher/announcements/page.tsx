"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Clock, Users } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  target: string
  createdDate: string
  createdBy: string
}

export default function TeacherAnnouncementsPage() {
  const [userName, setUserName] = useState("")
  const [announcements] = useState<Announcement[]>([
    {
      id: "1",
      title: "School Reopens After Holiday",
      content: "School will reopen on January 15, 2025. All students and staff are expected to resume activities.",
      target: "all",
      createdDate: "2024-12-20",
      createdBy: "Principal",
    },
    {
      id: "2",
      title: "Parent-Teacher Conference",
      content: "Parents are invited for a conference on January 25, 2025 at 2:00 PM to discuss student progress.",
      target: "parents",
      createdDate: "2024-12-18",
      createdBy: "Admin",
    },
    {
      id: "3",
      title: "Sports Day Cancelled",
      content: "Due to weather conditions, the scheduled sports day has been postponed to February 1, 2025.",
      target: "all",
      createdDate: "2024-12-15",
      createdBy: "Admin",
    },
  ])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="teacher" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Teacher" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">School Announcements</h1>
              <p className="text-muted-foreground mt-1">Latest updates from the school administration</p>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="p-6 bg-card border-border hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{announcement.title}</h3>
                  <p className="text-muted-foreground mb-4">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {announcement.target.charAt(0).toUpperCase() + announcement.target.slice(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(announcement.createdDate).toLocaleDateString()}
                    </span>
                    <span>By {announcement.createdBy}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

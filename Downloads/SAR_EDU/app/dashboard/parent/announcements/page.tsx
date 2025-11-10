"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Clock, AlertCircle, Info } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  type: "important" | "info"
  createdDate: string
  createdBy: string
}

export default function ParentAnnouncementsPage() {
  const [userName, setUserName] = useState("")
  const [announcements] = useState<Announcement[]>([
    {
      id: "1",
      title: "School Reopens After Holiday",
      content: "School will reopen on January 15, 2025. All students and staff are expected to resume activities.",
      type: "important",
      createdDate: "2024-12-20",
      createdBy: "Principal",
    },
    {
      id: "2",
      title: "Parent-Teacher Conference",
      content:
        "Parents are invited for a conference on January 25, 2025 at 2:00 PM to discuss student progress. Please mark your calendars.",
      type: "important",
      createdDate: "2024-12-18",
      createdBy: "Admin",
    },
    {
      id: "3",
      title: "School Activity Updates",
      content:
        "New extracurricular activities will be introduced in the new term. Students can sign up starting January 15.",
      type: "info",
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
      <Sidebar userRole="parent" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Parent" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">School Announcements</h1>
              <p className="text-muted-foreground mt-1">Important updates for parents and guardians</p>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className={`p-6 border-l-4 ${
                    announcement.type === "important"
                      ? "bg-card border-l-destructive border-border"
                      : "bg-card border-l-primary border-border"
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      {announcement.type === "important" ? (
                        <AlertCircle size={20} className="text-destructive flex-shrink-0" />
                      ) : (
                        <Info size={20} className="text-primary flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{announcement.title}</h3>
                      <p className="text-muted-foreground mb-4">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(announcement.createdDate).toLocaleDateString()}
                        </span>
                        <span>By {announcement.createdBy}</span>
                      </div>
                    </div>
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

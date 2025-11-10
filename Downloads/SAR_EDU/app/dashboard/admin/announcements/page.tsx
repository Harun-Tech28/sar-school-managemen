"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Edit2, Clock } from "lucide-react"
import Link from "next/link"

interface Announcement {
  id: string
  title: string
  content: string
  target: "all" | "teachers" | "parents" | "students"
  createdDate: string
  createdBy: string
  status: "active" | "archived"
}

export default function AnnouncementsPage() {
  const [userName, setUserName] = useState("")
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "School Reopens After Holiday",
      content: "School will reopen on January 15, 2025. All students and staff are expected to resume activities.",
      target: "all",
      createdDate: "2024-12-20",
      createdBy: "Principal",
      status: "active",
    },
    {
      id: "2",
      title: "Parent-Teacher Conference",
      content: "Parents are invited for a conference on January 25, 2025 at 2:00 PM to discuss student progress.",
      target: "parents",
      createdDate: "2024-12-18",
      createdBy: "Admin",
      status: "active",
    },
    {
      id: "3",
      title: "Sports Day Cancelled",
      content: "Due to weather conditions, the scheduled sports day has been postponed to February 1, 2025.",
      target: "all",
      createdDate: "2024-12-15",
      createdBy: "Admin",
      status: "active",
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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements(announcements.filter((a) => a.id !== id))
    }
  }

  const handleArchive = (id: string) => {
    setAnnouncements(announcements.map((a) => (a.id === id ? { ...a, status: "archived" } : a)))
  }

  const activeAnnouncements = announcements.filter((a) => a.status === "active")

  const getTargetBadge = (target: string) => {
    const colors: Record<string, string> = {
      all: "bg-primary text-primary-foreground",
      teachers: "bg-secondary text-secondary-foreground",
      parents: "bg-accent text-accent-foreground",
      students: "bg-chart-2 text-foreground",
    }
    return colors[target] || "bg-muted text-foreground"
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
                <p className="text-muted-foreground mt-1">Manage school announcements and communications</p>
              </div>
              <Link href="/dashboard/admin/announcements/create">
                <Button className="gap-2">
                  <Plus size={18} />
                  Create Announcement
                </Button>
              </Link>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {activeAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="p-6 bg-card border-border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{announcement.title}</h3>
                      <p className="text-muted-foreground mb-4">{announcement.content}</p>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTargetBadge(
                            announcement.target,
                          )}`}
                        >
                          {announcement.target.charAt(0).toUpperCase() + announcement.target.slice(1)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={14} />
                          {new Date(announcement.createdDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">By {announcement.createdBy}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/admin/announcements/${announcement.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Edit2 size={16} />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(announcement.id)}
                        className="text-muted-foreground"
                      >
                        Archive
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {activeAnnouncements.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active announcements</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

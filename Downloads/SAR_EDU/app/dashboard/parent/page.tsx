"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BookOpen, TrendingUp, Calendar, Award } from "lucide-react"

export default function ParentDashboard() {
  const [userName, setUserName] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const userString = localStorage.getItem("user")

    if (!userString) {
      window.location.href = "/auth/login"
      return
    }

    try {
      const user = JSON.parse(userString)

      if (!user.email || !user.role) {
        localStorage.removeItem("user")
        window.location.href = "/auth/login"
        return
      }

      if (user.role !== "parent") {
        window.location.href = `/dashboard/${user.role}`
        return
      }

      setUserName(user.fullName || user.email.split("@")[0])
      setIsAuthenticated(true)
    } catch (error) {
      localStorage.removeItem("user")
      window.location.href = "/auth/login"
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we verify your credentials</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="parent" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Parent" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Child Info */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-2xl text-primary-foreground font-bold">AB</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Ama Boateng</p>
                    <p className="text-sm text-muted-foreground">Form 2A</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Average Score</p>
                    <p className="text-3xl font-bold text-foreground">84%</p>
                  </div>
                  <div className="bg-primary p-3 rounded-lg">
                    <Award size={24} className="text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Attendance</p>
                    <p className="text-3xl font-bold text-foreground">96%</p>
                  </div>
                  <div className="bg-secondary p-3 rounded-lg">
                    <Calendar size={24} className="text-secondary-foreground" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Rank in Class</p>
                    <p className="text-3xl font-bold text-foreground">8/35</p>
                  </div>
                  <div className="bg-accent p-3 rounded-lg">
                    <TrendingUp size={24} className="text-accent-foreground" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Subjects</p>
                    <p className="text-3xl font-bold text-foreground">8</p>
                  </div>
                  <div className="bg-chart-1 p-3 rounded-lg">
                    <BookOpen size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Latest Updates</h3>
              <div className="space-y-4">
                {[
                  { title: "New assignment posted", subject: "Mathematics", date: "2 hours ago" },
                  { title: "Attendance marked present", subject: "All Classes", date: "1 day ago" },
                  { title: "New grades posted", subject: "English", date: "2 days ago" },
                  { title: "School announcement", subject: "Holiday notice", date: "3 days ago" },
                ].map((update, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                    <div className="w-3 h-3 mt-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{update.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {update.subject} · {update.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

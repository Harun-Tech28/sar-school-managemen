"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { BookOpen, Calendar, CheckCircle, FileText, TrendingUp, Award } from "lucide-react"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { ActivityFeed } from "@/components/notifications/activity-feed"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { initializeDemoNotifications } from "@/lib/notifications/demo-data"

export default function StudentDashboard() {
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
    setUserId(user.id || user.email)
    
    // Initialize demo notifications
    initializeDemoNotifications(user.id || user.email, "student")
  }, [])

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="student" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Student" userId={userId} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {userName}! 👋</h1>
              <p className="text-muted-foreground">Here's your academic overview</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Grade</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedNumber value={85} duration={1500} />%
                    </p>
                  </div>
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <p className="text-xs text-accent flex items-center gap-1">
                  <TrendingUp size={14} />
                  +5% from last term
                </p>
              </Card>

              <Card className="p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedNumber value={96} duration={1500} />%
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
                <p className="text-xs text-muted-foreground">Excellent attendance!</p>
              </Card>

              <Card className="p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                    <p className="text-3xl font-bold text-foreground">8/10</p>
                  </div>
                  <FileText className="h-10 w-10 text-secondary" />
                </div>
                <p className="text-xs text-muted-foreground">2 pending submissions</p>
              </Card>

              <Card className="p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Class Rank</p>
                    <p className="text-3xl font-bold text-foreground">5th</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-chart-3" />
                </div>
                <p className="text-xs text-muted-foreground">Out of 45 students</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Grades */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen size={20} />
                  Recent Grades
                </h3>
                <div className="space-y-3">
                  {[
                    { subject: "Mathematics", grade: 92, color: "text-accent" },
                    { subject: "English", grade: 88, color: "text-accent" },
                    { subject: "Science", grade: 85, color: "text-accent" },
                    { subject: "History", grade: 78, color: "text-chart-3" },
                    { subject: "Geography", grade: 82, color: "text-accent" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium text-foreground">{item.subject}</span>
                      <span className={`text-lg font-bold ${item.color}`}>{item.grade}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Assignments */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Upcoming Assignments
                </h3>
                <div className="space-y-3">
                  {[
                    { title: "Math Homework - Chapter 5", due: "Tomorrow", urgent: true },
                    { title: "English Essay", due: "In 3 days", urgent: false },
                    { title: "Science Lab Report", due: "In 5 days", urgent: false },
                    { title: "History Project", due: "Next week", urgent: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">Due: {item.due}</p>
                      </div>
                      {item.urgent && (
                        <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded">
                          Urgent
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/student/grades">
                  <Card className="p-4 hover-lift cursor-pointer text-center">
                    <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">View Grades</p>
                  </Card>
                </Link>
                <Link href="/dashboard/student/homework">
                  <Card className="p-4 hover-lift cursor-pointer text-center">
                    <FileText className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Assignments</p>
                  </Card>
                </Link>
                <Link href="/dashboard/student/timetable">
                  <Card className="p-4 hover-lift cursor-pointer text-center">
                    <Calendar className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Timetable</p>
                  </Card>
                </Link>
                <Link href="/dashboard/student/attendance">
                  <Card className="p-4 hover-lift cursor-pointer text-center">
                    <CheckCircle className="h-8 w-8 text-chart-3 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Attendance</p>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed userRole="student" maxItems={10} />
          </div>
        </main>
      </div>
    </div>
  )
}

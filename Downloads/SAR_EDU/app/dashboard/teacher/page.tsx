"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { getUserCounts, getAllClasses } from "@/lib/user-storage"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { Loader } from "@/components/ui/loader"
import { ActivityFeed } from "@/components/notifications/activity-feed"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { initializeDemoNotifications } from "@/lib/notifications/demo-data"

export default function TeacherDashboard() {
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalClasses, setTotalClasses] = useState(0)

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

      if (user.role !== "teacher") {
        window.location.href = `/dashboard/${user.role}`
        return
      }

      setUserName(user.fullName || user.email.split("@")[0])
      setUserId(user.id || user.email)
      setIsAuthenticated(true)
      
      // Initialize demo notifications
      initializeDemoNotifications(user.id || user.email, "teacher")
      
      // Get real counts
      const userCounts = getUserCounts()
      const classes = getAllClasses()
      
      // Calculate total students across all classes
      const studentsInClasses = classes.reduce((sum, cls) => sum + cls.studentIds.length, 0)
      
      setTotalStudents(studentsInClasses || userCounts.students)
      setTotalClasses(classes.length)
    } catch (error) {
      localStorage.removeItem("user")
      window.location.href = "/auth/login"
    }
  }, [])

  if (!isAuthenticated) {
    return <Loader size="lg" text="Loading Dashboard..." fullScreen />
  }

  const classesInfo = [
    { name: "Form 1A", students: 38, nextClass: "10:30 AM" },
    { name: "Form 2B", students: 35, nextClass: "1:00 PM" },
    { name: "Form 3C", students: 40, nextClass: "2:30 PM" },
  ]

  const statCards = [
    { 
      label: "STUDENTS TODAY", 
      value: totalStudents.toString(), 
      icon: "👨‍🎓", 
      bgColor: "bg-blue-500",
      progressColor: "bg-blue-500",
      percentage: Math.min((totalStudents / 50) * 100, 100),
      trend: "+3",
      trendUp: true
    },
    { 
      label: "CLASSES TODAY", 
      value: totalClasses.toString(), 
      icon: "📚", 
      bgColor: "bg-green-500",
      progressColor: "bg-green-500",
      percentage: Math.min((totalClasses / 5) * 100, 100),
      trend: "Same",
      trendUp: false
    },
    { 
      label: "ATTENDANCE RATE", 
      value: "94%", 
      icon: "✅", 
      bgColor: "bg-purple-500",
      progressColor: "bg-purple-500",
      percentage: 94,
      trend: "+2%",
      trendUp: true
    },
    { 
      label: "PENDING TASKS", 
      value: "5", 
      icon: "⏰", 
      bgColor: "bg-orange-500",
      progressColor: "bg-orange-500",
      percentage: 50,
      trend: "-2",
      trendUp: true
    },
  ]

  const quickActions = [
    { label: "Mark Attendance", icon: "✅📝", href: "/dashboard/teacher/attendance" },
    { label: "Enter Grades", icon: "📊✏️", href: "/dashboard/teacher/grades" },
    { label: "Create Homework", icon: "📝➕", href: "/dashboard/teacher/homework" },
    { label: "View Classes", icon: "👥📚", href: "/dashboard/teacher/attendance" },
  ]

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar userRole="teacher" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-3xl p-8 mb-8 shadow-xl relative">
              <div className="absolute top-6 right-6">
                <NotificationBell userId={userId} userRole="teacher" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, <span className="text-yellow-200">{userName}</span>
              </h1>
              <p className="text-white/90 text-lg">Ready to inspire young minds today? 📚</p>
            </div>

            {/* Stats Grid with Visual Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover-lift border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-xs font-semibold tracking-wide">{stat.label}</p>
                    <span className={`text-xs font-bold flex items-center gap-1 ${stat.trendUp ? 'text-green-600' : 'text-gray-500'}`}>
                      {stat.trendUp ? '↗' : '→'} {stat.trend}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-5xl font-bold text-gray-800">
                      {stat.value.includes('%') ? (
                        <><AnimatedNumber value={parseInt(stat.value)} duration={1500} />%</>
                      ) : (
                        <AnimatedNumber value={parseInt(stat.value)} duration={1500} />
                      )}
                    </h3>
                    <div className={`${stat.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span className="font-semibold">{stat.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${stat.progressColor} h-2 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover-lift border border-gray-100 text-center group cursor-pointer">
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{action.icon}</div>
                      <p className="text-gray-800 font-semibold">{action.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Analytics & Reports */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/teacher/performance-analysis">
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover-lift border border-gray-100 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                        <span className="text-4xl">📊</span>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Performance
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Class Performance</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      View student grades, rankings, and trends
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 font-semibold">82% Average</span>
                      <span className="text-gray-500">My classes</span>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/teacher/grades">
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover-lift border border-gray-100 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-green-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                        <span className="text-4xl">📝</span>
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        Grades
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Grade Management</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Enter and manage student grades
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-semibold">12 Pending</span>
                      <span className="text-gray-500">To grade</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Today's Classes */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Classes</h2>
              <div className="space-y-4">
                {classesInfo.map((classInfo, index) => (
                  <Link key={index} href="/dashboard/teacher/attendance">
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{classInfo.name}</p>
                        <p className="text-sm text-gray-600">{classInfo.students} students</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{classInfo.nextClass}</p>
                        <p className="text-xs text-gray-500">Next class</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed userRole="teacher" maxItems={10} />
          </div>
        </main>
      </div>
    </div>
  )
}

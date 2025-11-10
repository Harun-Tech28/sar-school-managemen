"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Users, BookOpen, Calendar, TrendingUp } from "lucide-react"
import { GhanaSchoolMetrics } from "@/components/ghana-school-metrics"
import { getUserCounts, getAllClasses, initializeDemoData } from "@/lib/user-storage"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { Loader } from "@/components/ui/loader"
import { ActivityFeed } from "@/components/notifications/activity-feed"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { initializeDemoNotifications } from "@/lib/notifications/demo-data"

export default function AdminDashboard() {
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    parents: 0,
    classes: 0
  })

  useEffect(() => {
    const userString = localStorage.getItem("user")

    if (!userString) {
      console.log("[v0] No user found, redirecting to login")
      window.location.href = "/auth/login"
      return
    }

    try {
      const user = JSON.parse(userString)

      // Verify user has required fields
      if (!user.email || !user.role) {
        console.log("[v0] Invalid user data, redirecting to login")
        localStorage.removeItem("user")
        window.location.href = "/auth/login"
        return
      }

      // Check if user is admin
      if (user.role !== "admin") {
        console.log("[v0] User is not admin, redirecting to their dashboard")
        window.location.href = `/dashboard/${user.role}`
        return
      }

      setUserName(user.fullName || user.email.split("@")[0])
      setUserId(user.id || user.email)
      setIsAuthenticated(true)
      
      // Initialize demo data if needed
      initializeDemoData()
      
      // Initialize demo notifications
      initializeDemoNotifications(user.id || user.email, "admin")
      
      // Get real counts
      const userCounts = getUserCounts()
      const classes = getAllClasses()
      
      setCounts({
        students: userCounts.students,
        teachers: userCounts.teachers,
        parents: userCounts.parents,
        classes: classes.length
      })
    } catch (error) {
      console.log("[v0] Error parsing user data:", error)
      localStorage.removeItem("user")
      window.location.href = "/auth/login"
    }
  }, [])

  // Show loading state while authenticating
  if (!isAuthenticated) {
    return <Loader size="lg" text="Loading Dashboard..." fullScreen />
  }

  const stats = [
    {
      label: "Total Students",
      value: "1,247",
      icon: Users,
      color: "bg-primary",
    },
    {
      label: "Total Teachers",
      value: "89",
      icon: BookOpen,
      color: "bg-secondary",
    },
    {
      label: "Active Classes",
      value: "32",
      icon: Calendar,
      color: "bg-accent",
    },
    {
      label: "Average Score",
      value: "82.5%",
      icon: TrendingUp,
      color: "bg-chart-1",
    },
  ]

  // Calculate percentages for visual indicators (assuming max capacity)
  const maxCapacity = {
    students: 100,
    teachers: 20,
    parents: 50,
    classes: 10
  }

  const statCards = [
    { 
      label: "TOTAL STUDENTS", 
      value: counts.students.toString(), 
      icon: "👨‍🎓", 
      bgColor: "bg-blue-500",
      progressColor: "bg-blue-500",
      percentage: Math.min((counts.students / maxCapacity.students) * 100, 100),
      trend: "+12%",
      trendUp: true,
      href: "/dashboard/admin/students" 
    },
    { 
      label: "TOTAL TEACHERS", 
      value: counts.teachers.toString(), 
      icon: "👨‍🏫", 
      bgColor: "bg-green-500",
      progressColor: "bg-green-500",
      percentage: Math.min((counts.teachers / maxCapacity.teachers) * 100, 100),
      trend: "+5%",
      trendUp: true,
      href: "/dashboard/admin/teachers" 
    },
    { 
      label: "TOTAL PARENTS", 
      value: counts.parents.toString(), 
      icon: "👨‍👩‍👧", 
      bgColor: "bg-purple-500",
      progressColor: "bg-purple-500",
      percentage: Math.min((counts.parents / maxCapacity.parents) * 100, 100),
      trend: "+8%",
      trendUp: true
    },
    { 
      label: "TOTAL CLASSES", 
      value: counts.classes.toString(), 
      icon: "🏫", 
      bgColor: "bg-yellow-500",
      progressColor: "bg-yellow-500",
      percentage: Math.min((counts.classes / maxCapacity.classes) * 100, 100),
      trend: "0%",
      trendUp: false,
      href: "/dashboard/admin/classes" 
    },
  ]

  const quickActions = [
    { label: "Add Student", icon: "➕👨‍🎓", href: "/dashboard/admin/students" },
    { label: "Add Teacher", icon: "➕👨‍🏫", href: "/dashboard/admin/teachers" },
    { label: "Manage Classes", icon: "🏫", href: "/dashboard/admin/classes" },
    { label: "View Reports", icon: "📊", href: "/dashboard/admin/reports" },
  ]

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-400 rounded-3xl p-8 mb-8 shadow-xl relative">
              <div className="absolute top-6 right-6">
                <NotificationBell userId={userId} userRole="admin" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, <span className="text-yellow-200">Administrator</span>
              </h1>
              <p className="text-white/90 text-lg">Here's what's happening in your school today ✨</p>
            </div>

            {/* Stats Grid with Visual Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => {
                const CardContent = (
                  <div
                    className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover-lift border border-gray-100 ${
                      stat.href ? "cursor-pointer" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-500 text-xs font-semibold tracking-wide">{stat.label}</p>
                      <span className={`text-xs font-bold flex items-center gap-1 ${stat.trendUp ? 'text-green-600' : 'text-gray-500'}`}>
                        {stat.trendUp ? '↗' : '→'} {stat.trend}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-5xl font-bold text-gray-800">
                        <AnimatedNumber value={parseInt(stat.value)} duration={1500} />
                      </h3>
                      <div className={`${stat.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                        {stat.icon}
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Capacity</span>
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
                )

                return stat.href ? (
                  <Link key={index} href={stat.href}>
                    {CardContent}
                  </Link>
                ) : (
                  <div key={index}>{CardContent}</div>
                )
              })}
            </div>

            {/* Overview Chart */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">School Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Distribution Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">User Distribution</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          Students
                        </span>
                        <span className="text-sm font-bold text-gray-800">{counts.students}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(counts.students / (counts.students + counts.teachers + counts.parents + 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          Teachers
                        </span>
                        <span className="text-sm font-bold text-gray-800">{counts.teachers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(counts.teachers / (counts.students + counts.teachers + counts.parents + 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                          Parents
                        </span>
                        <span className="text-sm font-bold text-gray-800">{counts.parents}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(counts.parents / (counts.students + counts.teachers + counts.parents + 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Student-Teacher Ratio</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {counts.teachers > 0 ? Math.round(counts.students / counts.teachers) : 0}:1
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1">Avg Class Size</p>
                      <p className="text-3xl font-bold text-green-700">
                        {counts.classes > 0 ? Math.round(counts.students / counts.classes) : 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <p className="text-xs text-purple-600 font-semibold mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-purple-700">
                        {counts.students + counts.teachers + counts.parents}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                      <p className="text-xs text-yellow-600 font-semibold mb-1">Active Classes</p>
                      <p className="text-3xl font-bold text-yellow-700">{counts.classes}</p>
                    </div>
                  </div>
                </div>
              </div>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics & Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/admin/financial-reports">
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover-lift border border-gray-100 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-green-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                        <span className="text-4xl">💰</span>
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        Financial
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Financial Reports</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Track income, expenses, and financial health
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-semibold">₵147,300 Net</span>
                      <span className="text-gray-500">This month</span>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/admin/performance-analysis">
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover-lift border border-gray-100 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                        <span className="text-4xl">📊</span>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Academic
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Performance Analysis</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Student rankings, grades, and trends
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 font-semibold">79.5% Average</span>
                      <span className="text-gray-500">School-wide</span>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/admin/reports">
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover-lift border border-gray-100 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-purple-100 p-4 rounded-xl group-hover:scale-110 transition-transform">
                        <span className="text-4xl">📄</span>
                      </div>
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                        Reports
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">All Reports</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Generate and download comprehensive reports
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-600 font-semibold">5 Recent</span>
                      <span className="text-gray-500">Available</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityFeed userRole="admin" maxItems={10} />
          </div>
        </main>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Calendar, BarChart3, Bell, Settings, LogOut, GraduationCap } from "lucide-react"

interface SidebarProps {
  userRole: "admin" | "teacher" | "parent" | "student"
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const getMenuItems = () => {
    const baseItems = [
      {
        label: "Dashboard",
        href: `/dashboard/${userRole}`,
        icon: LayoutDashboard,
      },
      {
        label: "Announcements",
        href: `/dashboard/${userRole}/announcements`,
        icon: Bell,
      },
    ]

    if (userRole === "admin") {
      return [
        ...baseItems,
        {
          label: "Students",
          href: `/dashboard/${userRole}/students`,
          icon: Users,
        },
        {
          label: "Teachers",
          href: `/dashboard/${userRole}/teachers`,
          icon: GraduationCap,
        },
        {
          label: "Classes",
          href: `/dashboard/${userRole}/classes`,
          icon: Calendar,
        },
        {
          label: "Academic Calendar",
          href: `/dashboard/${userRole}/academic-calendar`,
          icon: Calendar,
        },
        {
          label: "Attendance",
          href: `/dashboard/${userRole}/attendance-analytics`,
          icon: Calendar,
        },
        {
          label: "Financial Reports",
          href: `/dashboard/${userRole}/financial-reports`,
          icon: BarChart3,
        },
        {
          label: "Performance Analysis",
          href: `/dashboard/${userRole}/performance-analysis`,
          icon: BarChart3,
        },
        {
          label: "Reports",
          href: `/dashboard/${userRole}/reports`,
          icon: BarChart3,
        },
        {
          label: "Settings",
          href: `/dashboard/${userRole}/settings`,
          icon: Settings,
        },
      ]
    } else if (userRole === "teacher") {
      return [
        ...baseItems,
        {
          label: "Attendance",
          href: `/dashboard/${userRole}/attendance`,
          icon: Calendar,
        },
        {
          label: "Grades",
          href: `/dashboard/${userRole}/grades`,
          icon: BarChart3,
        },
        {
          label: "Performance Analysis",
          href: `/dashboard/${userRole}/performance-analysis`,
          icon: BarChart3,
        },
        {
          label: "Homework",
          href: `/dashboard/${userRole}/homework`,
          icon: Users,
        },
      ]
    } else if (userRole === "student") {
      return [
        ...baseItems,
        {
          label: "My Grades",
          href: `/dashboard/${userRole}/grades`,
          icon: BarChart3,
        },
        {
          label: "Attendance",
          href: `/dashboard/${userRole}/attendance`,
          icon: Calendar,
        },
        {
          label: "Homework",
          href: `/dashboard/${userRole}/homework`,
          icon: Users,
        },
        {
          label: "Timetable",
          href: `/dashboard/${userRole}/timetable`,
          icon: Calendar,
        },
      ]
    } else {
      // Parent
      return [
        ...baseItems,
        {
          label: "Performance",
          href: `/dashboard/${userRole}/performance`,
          icon: BarChart3,
        },
        {
          label: "Attendance",
          href: `/dashboard/${userRole}/attendance`,
          icon: Calendar,
        },
        {
          label: "Student Report",
          href: `/dashboard/${userRole}/student-report`,
          icon: BarChart3,
        },
        {
          label: "Homework",
          href: `/dashboard/${userRole}/homework`,
          icon: Users,
        },
      ]
    }
  }

  const menuItems = getMenuItems()

  const getRoleLabel = () => {
    switch (userRole) {
      case "admin": return "Admin Portal"
      case "teacher": return "Teacher Portal"
      case "parent": return "Parent Portal"
      case "student": return "Student Portal"
    }
  }

  return (
    <aside className="w-64 bg-primary min-h-screen flex flex-col shadow-xl">
      {/* Logo & Title */}
      <div className="p-6">
        <h1 className="font-bold text-white text-2xl mb-1">SAR School</h1>
        <p className="text-white/80 text-sm">{getRoleLabel()}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isOverview = index === 0
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive && isOverview
                  ? "bg-secondary text-foreground font-semibold shadow-lg"
                  : isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            localStorage.removeItem("user")
            window.location.href = "/"
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

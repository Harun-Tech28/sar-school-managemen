"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart3, FileText, Download } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  title: string
  type: string
  generatedDate: string
  generatedBy: string
  format: string
}

export default function ReportsPage() {
  const [userName, setUserName] = useState("")
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      title: "Student Performance Report - Term 2 2025",
      type: "Student Performance",
      generatedDate: "2025-01-20",
      generatedBy: "Admin",
      format: "PDF",
    },
    {
      id: "2",
      title: "Attendance Summary - January 2025",
      type: "Attendance",
      generatedDate: "2025-01-15",
      generatedBy: "Admin",
      format: "Excel",
    },
    {
      id: "3",
      title: "Exam Results Analysis - Mid-term 2025",
      type: "Exam Results",
      generatedDate: "2025-01-10",
      generatedBy: "Admin",
      format: "PDF",
    },
    {
      id: "4",
      title: "Teacher Performance Review - 2024",
      type: "Teacher Performance",
      generatedDate: "2025-01-05",
      generatedBy: "Admin",
      format: "Excel",
    },
    {
      id: "5",
      title: "Financial Summary - Q4 2024",
      type: "Financial",
      generatedDate: "2024-12-31",
      generatedBy: "Finance Officer",
      format: "Excel",
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

  const reportTypes = [
    { name: "Student Performance", icon: BarChart3, link: "/dashboard/admin/reports/student-performance" },
    { name: "Attendance Analysis", icon: FileText, link: "/dashboard/admin/reports/attendance" },
    { name: "Exam Results", icon: BarChart3, link: "/dashboard/admin/reports/exam-results" },
    { name: "Teacher Performance", icon: BarChart3, link: "/dashboard/admin/reports/teacher-performance" },
    { name: "Class Analysis", icon: FileText, link: "/dashboard/admin/reports/class-analysis" },
    { name: "Financial Reports", icon: BarChart3, link: "/dashboard/admin/financial-reports" },
  ]

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Reports</h1>
                <p className="text-muted-foreground mt-1">Generate and view comprehensive school reports</p>
              </div>
            </div>

            {/* Report Types */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Generate New Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Link key={type.name} href={type.link}>
                      <Card className="p-6 bg-card border-border hover:border-primary cursor-pointer transition-all hover:shadow-md">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <Icon size={24} className="text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{type.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Generate detailed report</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Recent Reports */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Recent Reports</h2>
              <div className="space-y-3">
                {reports.map((report) => (
                  <Card key={report.id} className="p-4 bg-card border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-muted p-3 rounded-lg mt-1">
                          <FileText size={20} className="text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{report.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {report.type} • {new Date(report.generatedDate).toLocaleDateString()} • {report.format}
                          </p>
                          <p className="text-xs text-muted-foreground">By {report.generatedBy}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                        <Download size={16} />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

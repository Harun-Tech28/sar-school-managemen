"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { AlertTriangle, TrendingDown, TrendingUp, Users, Calendar } from "lucide-react"

interface TruancyStudent {
  id: string
  name: string
  class: string
  absences: number
  lateCount: number
  attendanceRate: number
  trend: "improving" | "declining" | "stable"
}

export default function AttendanceAnalyticsPage() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  // Monthly attendance data
  const monthlyData = [
    { month: "Sep", rate: 94, students: 1247 },
    { month: "Oct", rate: 92, students: 1250 },
    { month: "Nov", rate: 95, students: 1255 },
    { month: "Dec", rate: 91, students: 1260 },
    { month: "Jan", rate: 96, students: 1265 },
    { month: "Feb", rate: 94, students: 1270 },
  ]

  // Class-wise attendance
  const classData = [
    { class: "Form 1A", present: 42, absent: 3, late: 2, rate: 89 },
    { class: "Form 1B", present: 45, absent: 1, late: 1, rate: 96 },
    { class: "Form 2A", present: 38, absent: 5, late: 3, rate: 83 },
    { class: "Form 2B", present: 44, absent: 2, late: 1, rate: 94 },
    { class: "Form 3A", present: 40, absent: 4, late: 2, rate: 87 },
    { class: "Form 3B", present: 43, absent: 2, late: 2, rate: 91 },
  ]

  // Students at risk (truancy detection)
  const atRiskStudents: TruancyStudent[] = [
    { id: "1", name: "Kwame Asante", class: "Form 2A", absences: 12, lateCount: 8, attendanceRate: 72, trend: "declining" },
    { id: "2", name: "Ama Mensah", class: "Form 1A", absences: 10, lateCount: 5, attendanceRate: 78, trend: "stable" },
    { id: "3", name: "Kofi Boateng", class: "Form 3A", absences: 9, lateCount: 6, attendanceRate: 80, trend: "improving" },
    { id: "4", name: "Abena Osei", class: "Form 2B", absences: 11, lateCount: 7, attendanceRate: 75, trend: "declining" },
    { id: "5", name: "Yaw Addo", class: "Form 1B", absences: 8, lateCount: 4, attendanceRate: 82, trend: "stable" },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp size={16} className="text-accent" />
      case "declining":
        return <TrendingDown size={16} className="text-destructive" />
      default:
        return <span className="text-muted-foreground">—</span>
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-accent"
      case "declining":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Attendance Analytics</h1>
              <p className="text-muted-foreground mt-1">Advanced attendance analytics and truancy detection</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Overall Rate</p>
                    <p className="text-3xl font-bold text-accent">94%</p>
                  </div>
                  <Users className="text-accent" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Present Today</p>
                    <p className="text-3xl font-bold text-foreground">1,189</p>
                  </div>
                  <Calendar className="text-primary" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Absent Today</p>
                    <p className="text-3xl font-bold text-destructive">76</p>
                  </div>
                  <AlertTriangle className="text-destructive" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">At Risk</p>
                    <p className="text-3xl font-bold text-chart-3">5</p>
                  </div>
                  <TrendingDown className="text-chart-3" size={32} />
                </div>
              </Card>
            </div>

            {/* Monthly Attendance Trend */}
            <Card className="p-6 bg-card border-border mb-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Monthly Attendance Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[85, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rate" stroke="#EF3B39" name="Attendance Rate %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Class-wise Attendance */}
            <Card className="p-6 bg-card border-border mb-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Class-wise Attendance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10B981" name="Present" />
                  <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                  <Bar dataKey="late" fill="#FFD700" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Truancy Detection - At Risk Students */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-destructive" size={24} />
                <h2 className="text-xl font-semibold text-foreground">Truancy Detection - Students at Risk</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Students with attendance rate below 85% or more than 8 absences
              </p>

              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-center">Absences</TableHead>
                      <TableHead className="text-center">Late Count</TableHead>
                      <TableHead className="text-center">Attendance Rate</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atRiskStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell className="text-center">
                          <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                            {student.absences}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="px-2 py-1 rounded-full bg-chart-3/10 text-chart-3 text-xs font-semibold">
                            {student.lateCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-semibold ${
                              student.attendanceRate < 75
                                ? "text-destructive"
                                : student.attendanceRate < 85
                                  ? "text-chart-3"
                                  : "text-accent"
                            }`}
                          >
                            {student.attendanceRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`flex items-center justify-center gap-1 ${getTrendColor(student.trend)}`}>
                            {getTrendIcon(student.trend)}
                            <span className="text-xs font-medium capitalize">{student.trend}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

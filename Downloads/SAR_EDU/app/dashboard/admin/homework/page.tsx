"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { FileText, Users, TrendingUp, CheckCircle } from "lucide-react"

interface ClassStats {
  class: string
  totalAssignments: number
  avgCompletion: number
  avgGrade: number
}

interface TeacherStats {
  teacher: string
  subject: string
  assignments: number
  avgCompletion: number
}

export default function AdminHomeworkPage() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  const classStats: ClassStats[] = [
    { class: "Form 1A", totalAssignments: 24, avgCompletion: 89, avgGrade: 78 },
    { class: "Form 1B", totalAssignments: 22, avgCompletion: 92, avgGrade: 82 },
    { class: "Form 2A", totalAssignments: 26, avgCompletion: 85, avgGrade: 75 },
    { class: "Form 2B", totalAssignments: 25, avgCompletion: 88, avgGrade: 80 },
    { class: "Form 3A", totalAssignments: 28, avgCompletion: 91, avgGrade: 84 },
    { class: "Form 3B", totalAssignments: 27, avgCompletion: 87, avgGrade: 79 },
  ]

  const teacherStats: TeacherStats[] = [
    { teacher: "Mr. Mensah", subject: "Mathematics", assignments: 18, avgCompletion: 90 },
    { teacher: "Mrs. Asante", subject: "English", assignments: 16, avgCompletion: 88 },
    { teacher: "Dr. Boateng", subject: "Science", assignments: 20, avgCompletion: 92 },
    { teacher: "Ms. Osei", subject: "History", assignments: 14, avgCompletion: 85 },
    { teacher: "Mr. Addo", subject: "Geography", assignments: 12, avgCompletion: 87 },
  ]

  const monthlyData = [
    { month: "Sep", assignments: 45, completion: 88 },
    { month: "Oct", assignments: 52, completion: 90 },
    { month: "Nov", assignments: 48, completion: 87 },
    { month: "Dec", assignments: 38, completion: 85 },
    { month: "Jan", assignments: 55, completion: 91 },
  ]

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Homework Management System</h1>
              <p className="text-muted-foreground mt-1">Monitor homework assignments and completion across all classes</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Assignments</p>
                    <p className="text-3xl font-bold text-foreground">152</p>
                  </div>
                  <FileText className="text-primary" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Avg Completion</p>
                    <p className="text-3xl font-bold text-accent">89%</p>
                  </div>
                  <CheckCircle className="text-accent" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Teachers</p>
                    <p className="text-3xl font-bold text-foreground">24</p>
                  </div>
                  <Users className="text-chart-2" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Avg Grade</p>
                    <p className="text-3xl font-bold text-chart-3">80%</p>
                  </div>
                  <TrendingUp className="text-chart-3" size={32} />
                </div>
              </Card>
            </div>

            {/* Monthly Trend Chart */}
            <Card className="p-6 bg-card border-border mb-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Monthly Assignment Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="assignments" fill="#EF3B39" name="Assignments Created" />
                  <Bar yAxisId="right" dataKey="completion" fill="#10B981" name="Avg Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Performance */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Class Performance</h2>
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-center">Assignments</TableHead>
                        <TableHead className="text-center">Completion</TableHead>
                        <TableHead className="text-center">Avg Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classStats.map((stat) => (
                        <TableRow key={stat.class}>
                          <TableCell className="font-medium">{stat.class}</TableCell>
                          <TableCell className="text-center">{stat.totalAssignments}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-semibold ${
                              stat.avgCompletion >= 90 ? "text-accent" : 
                              stat.avgCompletion >= 80 ? "text-chart-3" : 
                              "text-destructive"
                            }`}>
                              {stat.avgCompletion}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">{stat.avgGrade}%</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Teacher Statistics */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Teacher Statistics</h2>
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">Assignments</TableHead>
                        <TableHead className="text-center">Completion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherStats.map((stat, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{stat.teacher}</TableCell>
                          <TableCell>{stat.subject}</TableCell>
                          <TableCell className="text-center">{stat.assignments}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-semibold ${
                              stat.avgCompletion >= 90 ? "text-accent" : 
                              stat.avgCompletion >= 85 ? "text-chart-3" : 
                              "text-destructive"
                            }`}>
                              {stat.avgCompletion}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, TrendingUp, Award, Users, BarChart3 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface StudentPerf {
  id: string
  name: string
  averageScore: number
  gradeCount: { A: number; B: number; C: number; D: number; F: number }
  trend: "up" | "down" | "stable"
}

export default function TeacherPerformanceAnalysisPage() {
  const [userName, setUserName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [students] = useState<StudentPerf[]>([
    {
      id: "1",
      name: "Ama Boateng",
      averageScore: 88,
      gradeCount: { A: 5, B: 3, C: 1, D: 0, F: 0 },
      trend: "up",
    },
    {
      id: "2",
      name: "Kwesi Mensah",
      averageScore: 76,
      gradeCount: { A: 2, B: 4, C: 2, D: 1, F: 0 },
      trend: "stable",
    },
    {
      id: "3",
      name: "Abena Asante",
      averageScore: 92,
      gradeCount: { A: 8, B: 2, C: 0, D: 0, F: 0 },
      trend: "up",
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

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const averageScore = (students.reduce((sum, s) => sum + s.averageScore, 0) / students.length).toFixed(2)
  const topPerformer = students.reduce((top, s) => (s.averageScore > top.averageScore ? s : top), students[0])

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="teacher" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Teacher" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Class Performance Analysis</h1>
                <p className="text-muted-foreground mt-1">Your students' academic performance</p>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download size={18} />
                Export Report
              </Button>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Class Average</p>
                    <p className="text-3xl font-bold text-primary mt-2">{averageScore}%</p>
                  </div>
                  <BarChart3 size={24} className="text-primary opacity-50" />
                </div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Top Student</p>
                    <p className="text-lg font-bold text-foreground mt-2">{topPerformer.name}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">{topPerformer.averageScore}%</p>
                  </div>
                  <Award size={24} className="text-yellow-500 opacity-50" />
                </div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Students</p>
                    <p className="text-3xl font-bold text-secondary mt-2">{students.length}</p>
                  </div>
                  <Users size={24} className="text-secondary opacity-50" />
                </div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Improvement Rate</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">42%</p>
                  </div>
                  <TrendingUp size={24} className="text-green-600 dark:text-green-400 opacity-50" />
                </div>
              </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Performance Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Grade A Count</TableHead>
                    <TableHead>Grade B Count</TableHead>
                    <TableHead>Performance Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600 dark:text-green-400">{student.averageScore}%</span>
                      </TableCell>
                      <TableCell>{student.gradeCount.A}</TableCell>
                      <TableCell>{student.gradeCount.B}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${student.trend === "up" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : student.trend === "down" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"}`}
                        >
                          {student.trend === "up" ? "Improving" : student.trend === "down" ? "Declining" : "Stable"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

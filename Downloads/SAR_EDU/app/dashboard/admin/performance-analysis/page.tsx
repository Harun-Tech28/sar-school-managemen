"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { BarChart3, TrendingUp, Award, Users, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudentPerformance {
  id: string
  name: string
  form: string
  averageScore: number
  totalSubjects: number
  gradeDistribution: {
    A: number
    B: number
    C: number
    D: number
    F: number
  }
  attendance: number
  trend: "up" | "down" | "stable"
  ranking: number
}

export default function PerformanceAnalysisPage() {
  const [userName, setUserName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterForm, setFilterForm] = useState("all")

  const [students, setStudents] = useState<StudentPerformance[]>([
    {
      id: "1",
      name: "Ama Boateng",
      form: "Form 2A",
      averageScore: 88,
      totalSubjects: 9,
      gradeDistribution: { A: 5, B: 3, C: 1, D: 0, F: 0 },
      attendance: 95,
      trend: "up",
      ranking: 1,
    },
    {
      id: "2",
      name: "Kwesi Mensah",
      form: "Form 1B",
      averageScore: 76,
      totalSubjects: 9,
      gradeDistribution: { A: 2, B: 4, C: 2, D: 1, F: 0 },
      attendance: 88,
      trend: "stable",
      ranking: 15,
    },
    {
      id: "3",
      name: "Abena Asante",
      form: "Form 3C",
      averageScore: 92,
      totalSubjects: 10,
      gradeDistribution: { A: 8, B: 2, C: 0, D: 0, F: 0 },
      attendance: 98,
      trend: "up",
      ranking: 2,
    },
    {
      id: "4",
      name: "Kofi Osei",
      form: "Form 2A",
      averageScore: 65,
      totalSubjects: 9,
      gradeDistribution: { A: 0, B: 2, C: 4, D: 2, F: 1 },
      attendance: 72,
      trend: "down",
      ranking: 128,
    },
    {
      id: "5",
      name: "Efua Mensah",
      form: "Form 1B",
      averageScore: 81,
      totalSubjects: 9,
      gradeDistribution: { A: 3, B: 5, C: 1, D: 0, F: 0 },
      attendance: 92,
      trend: "up",
      ranking: 8,
    },
    {
      id: "6",
      name: "Yaw Agyeman",
      form: "Form 3C",
      averageScore: 77,
      totalSubjects: 10,
      gradeDistribution: { A: 2, B: 5, C: 2, D: 1, F: 0 },
      attendance: 85,
      trend: "stable",
      ranking: 35,
    },
    {
      id: "7",
      name: "Akosua Owusu",
      form: "Form 2A",
      averageScore: 84,
      totalSubjects: 9,
      gradeDistribution: { A: 4, B: 4, C: 1, D: 0, F: 0 },
      attendance: 93,
      trend: "up",
      ranking: 5,
    },
    {
      id: "8",
      name: "Benjamin Arko",
      form: "Form 1B",
      averageScore: 71,
      totalSubjects: 9,
      gradeDistribution: { A: 1, B: 3, C: 3, D: 2, F: 0 },
      attendance: 80,
      trend: "down",
      ranking: 65,
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

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.form.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesForm = filterForm === "all" || student.form === filterForm

    return matchesSearch && matchesForm
  })

  const topPerformers = students
    .slice()
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5)
  const averageSchoolScore = (students.reduce((sum, s) => sum + s.averageScore, 0) / students.length).toFixed(2)
  const studentsAboveAverage = students.filter(
    (s) => s.averageScore > Number.parseFloat(averageSchoolScore as string),
  ).length

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400"
    if (score >= 70) return "text-blue-600 dark:text-blue-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return "🔼 Up"
    if (trend === "down") return "🔽 Down"
    return "➡️ Stable"
  }

  const getFormOptions = Array.from(new Set(students.map((s) => s.form)))

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
                <h1 className="text-3xl font-bold text-foreground">Student Performance Analysis</h1>
                <p className="text-muted-foreground mt-1">Comprehensive academic performance insights and trends</p>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download size={18} />
                Export Analytics
              </Button>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* School Average */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">School Average</p>
                    <p className="text-3xl font-bold text-primary mt-2">{averageSchoolScore}%</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <BarChart3 size={24} className="text-primary" />
                  </div>
                </div>
              </Card>

              {/* Top Performer */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Top Performer</p>
                    <p className="text-lg font-bold text-foreground mt-2">{topPerformers[0]?.name}</p>
                    <p className={`text-xl font-bold mt-1 ${getScoreColor(topPerformers[0]?.averageScore)}`}>
                      {topPerformers[0]?.averageScore}%
                    </p>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                    <Award size={24} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </Card>

              {/* Above Average */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Above Average</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{studentsAboveAverage}</p>
                    <p className="text-xs text-muted-foreground mt-1">of {students.length} students</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>

              {/* Total Students */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Students</p>
                    <p className="text-3xl font-bold text-secondary mt-2">{students.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Analyzed this term</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Users size={24} className="text-secondary" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Top Performers Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-3">
                <h2 className="text-xl font-bold text-foreground mb-4">Top 5 Performers</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {topPerformers.map((student, index) => (
                    <Card key={student.id} className="p-4 bg-card border-border text-center">
                      <div className="text-3xl font-bold text-primary mb-2">#{index + 1}</div>
                      <p className="font-semibold text-foreground text-sm mb-1">{student.name}</p>
                      <p className="text-xs text-muted-foreground mb-3">{student.form}</p>
                      <p className={`text-2xl font-bold ${getScoreColor(student.averageScore)}`}>
                        {student.averageScore}%
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6 flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
                <Input
                  placeholder="Search by student name or form..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Filter by Form</label>
                <select
                  value={filterForm}
                  onChange={(e) => setFilterForm(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="all">All Forms</option>
                  {getFormOptions.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Performance Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Grade Distribution</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents
                    .slice()
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-bold text-primary">#{index + 1}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.form}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${getScoreColor(student.averageScore)}`}>
                            {student.averageScore}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 text-xs">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                              A:{student.gradeDistribution.A}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              B:{student.gradeDistribution.B}
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                              C:{student.gradeDistribution.C}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2"
                                style={{ width: `${student.attendance}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">{student.attendance}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${student.trend === "up" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : student.trend === "down" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"}`}
                          >
                            {getTrendIcon(student.trend)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No performance data found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

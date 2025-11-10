"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Award, TrendingUp, BarChart3 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SubjectPerformance {
  subject: string
  score: number
  grade: string
  trend: string
}

export default function ParentStudentReportPage() {
  const [userName, setUserName] = useState("")
  const [studentData] = useState({
    name: "John Mensah",
    form: "Form 2B",
    term: "Term 2, 2024",
    overallAverage: 82,
    attendance: 92,
    rank: "5th",
    totalStudents: 45,
    subjects: [
      { subject: "Mathematics", score: 85, grade: "A", trend: "up" },
      { subject: "English", score: 78, grade: "B", trend: "up" },
      { subject: "Science", score: 88, grade: "A", trend: "stable" },
      { subject: "History", score: 72, grade: "B", trend: "down" },
      { subject: "Geography", score: 81, grade: "B", trend: "up" },
      { subject: "Computer Science", score: 90, grade: "A", trend: "up" },
      { subject: "Physical Education", score: 95, grade: "A", trend: "stable" },
      { subject: "Art & Design", score: 75, grade: "B", trend: "down" },
    ] as SubjectPerformance[],
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  const strengthAreas = studentData.subjects
    .filter((s) => s.score >= 85)
    .map((s) => s.subject)
    .join(", ")
  const improvementAreas = studentData.subjects
    .filter((s) => s.score < 75)
    .map((s) => s.subject)
    .join(", ")

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="parent" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Parent" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Student Report Card</h1>
                <p className="text-muted-foreground mt-1">{studentData.term}</p>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download size={18} />
                Download Report
              </Button>
            </div>

            {/* Student Info */}
            <Card className="p-6 bg-card border-border mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Student Name</p>
                  <p className="text-lg font-bold text-foreground mt-1">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Form/Class</p>
                  <p className="text-lg font-bold text-foreground mt-1">{studentData.form}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Class Rank</p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {studentData.rank} / {studentData.totalStudents}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">Attendance</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{studentData.attendance}%</p>
                </div>
              </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Overall Average</p>
                    <p className="text-3xl font-bold text-primary mt-2">{studentData.overallAverage}%</p>
                  </div>
                  <BarChart3 size={24} className="text-primary opacity-50" />
                </div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Strength Areas</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-2">{strengthAreas}</p>
                  </div>
                  <Award size={24} className="text-yellow-500 opacity-50" />
                </div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Improvement Needed</p>
                    <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                      {improvementAreas || "None"}
                    </p>
                  </div>
                  <TrendingUp size={24} className="text-blue-500 opacity-50" />
                </div>
              </Card>
            </div>

            {/* Subject Performance Table */}
            <Card className="bg-card border-border mb-8">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Subject Performance</h2>
              </div>
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentData.subjects.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{subject.subject}</TableCell>
                        <TableCell>
                          <span className="font-bold">{subject.score}%</span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${subject.grade === "A" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : subject.grade === "B" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`}
                          >
                            {subject.grade}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${subject.trend === "up" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : subject.trend === "down" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"}`}
                          >
                            {subject.trend === "up" ? "Improving" : subject.trend === "down" ? "Declining" : "Stable"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Teacher Comments */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">Teacher's Comments</h2>
              <p className="text-foreground leading-relaxed">
                John has shown consistent effort and engagement in class this term. His mathematical skills have
                improved significantly, and he demonstrates excellent performance in practical subjects. We encourage
                him to focus more on historical analysis and critical thinking in humanities. Overall, John is a
                responsible and well-behaved student who interacts well with peers.
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

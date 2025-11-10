"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Award, AlertCircle } from "lucide-react"

interface SubjectGrade {
  subject: string
  score: number
  grade: string
  remarks: string
}

interface PerformanceTrend {
  term: string
  score: number
}

export default function PerformancePage() {
  const [userName, setUserName] = useState("")
  const [subjects] = useState<SubjectGrade[]>([
    {
      subject: "Mathematics",
      score: 85,
      grade: "A",
      remarks: "Excellent performance",
    },
    {
      subject: "English",
      score: 78,
      grade: "B",
      remarks: "Good, needs improvement in writing",
    },
    {
      subject: "Science",
      score: 92,
      grade: "A+",
      remarks: "Outstanding work",
    },
    {
      subject: "History",
      score: 80,
      grade: "B+",
      remarks: "Very good understanding",
    },
    {
      subject: "PE",
      score: 88,
      grade: "A",
      remarks: "Excellent participation",
    },
  ])

  const [performanceTrend] = useState<PerformanceTrend[]>([
    { term: "Term 1", score: 79 },
    { term: "Term 2", score: 82 },
    { term: "Term 3", score: 85 },
  ])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  const averageScore = subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length
  const highestScore = Math.max(...subjects.map((s) => s.score))
  const lowestScore = Math.min(...subjects.map((s) => s.score))

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-accent"
    if (score >= 75) return "text-chart-2"
    if (score >= 65) return "text-chart-3"
    return "text-destructive"
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="parent" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Parent" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Performance Analytics</h1>
              <p className="text-muted-foreground mt-1">Track your child's academic performance</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Average Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>{averageScore.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-primary rounded-lg">
                    <Award size={24} className="text-primary-foreground" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Highest Score</p>
                    <p className="text-3xl font-bold text-accent">{highestScore}%</p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg">
                    <TrendingUp size={24} className="text-accent-foreground" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Lowest Score</p>
                    <p className="text-3xl font-bold text-chart-3">{lowestScore}%</p>
                  </div>
                  <div className="p-3 bg-chart-3 rounded-lg">
                    <AlertCircle size={24} className="text-accent-foreground" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Subjects</p>
                    <p className="text-3xl font-bold text-secondary">{subjects.length}</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <Award size={24} className="text-secondary-foreground" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Performance Trend */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Performance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-primary)", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Subject Scores */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Scores by Subject</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjects}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="subject"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      stroke="var(--color-muted-foreground)"
                    />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="score" fill="var(--color-secondary)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Results</h3>
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <div key={subject.subject} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{subject.subject}</p>
                      <p className="text-sm text-muted-foreground">{subject.remarks}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(subject.score)}`}>{subject.score}%</p>
                      <p className="text-sm text-muted-foreground">{subject.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

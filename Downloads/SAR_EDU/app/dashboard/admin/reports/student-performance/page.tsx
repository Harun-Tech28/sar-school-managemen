"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function StudentPerformanceReportPage() {
  const [userName, setUserName] = useState("")
  const [selectedClass, setSelectedClass] = useState("Form 2A")

  const reportData = [
    { form: "Form 1A", average: 75, passed: 38, failed: 2 },
    { form: "Form 1B", average: 73, passed: 35, failed: 3 },
    { form: "Form 2A", average: 82, passed: 36, failed: 1 },
    { form: "Form 3C", average: 88, passed: 32, failed: 0 },
  ]

  const studentData = [
    { name: "Ama Boateng", average: 88, grade: "A", rank: 1 },
    { name: "Kwesi Mensah", average: 76, grade: "B", rank: 5 },
    { name: "Abena Asante", average: 92, grade: "A", rank: 1 },
    { name: "Kofi Amoah", average: 72, grade: "B", rank: 10 },
    { name: "Yaa Owusu", average: 84, grade: "A", rank: 3 },
  ]

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  const handleGenerateReport = () => {
    alert("Report generated successfully! Ready to download.")
  }

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
                <h1 className="text-3xl font-bold text-foreground">Student Performance Report</h1>
                <p className="text-muted-foreground mt-1">Analyze academic performance by class</p>
              </div>
              <Button className="gap-2">
                <Download size={18} />
                Export Report
              </Button>
            </div>

            {/* Class Selection */}
            <Card className="p-6 bg-card border-border mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="Form 1A">Form 1A</option>
                    <option value="Form 1B">Form 1B</option>
                    <option value="Form 2A">Form 2A</option>
                    <option value="Form 3C">Form 3C</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleGenerateReport} className="w-full">
                    Generate Report
                  </Button>
                </div>
              </div>
            </Card>

            {/* Performance Chart */}
            <Card className="p-6 bg-card border-border mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Class Performance Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="form" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="var(--color-primary)" name="Average Score" />
                  <Bar dataKey="passed" fill="var(--color-accent)" name="Students Passed" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Performance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-4 bg-card border-border">
                <p className="text-muted-foreground text-xs font-medium">Class Average</p>
                <p className="text-2xl font-bold text-primary mt-2">82%</p>
              </Card>
              <Card className="p-4 bg-card border-border">
                <p className="text-muted-foreground text-xs font-medium">Students Passed</p>
                <p className="text-2xl font-bold text-accent mt-2">36/37</p>
              </Card>
              <Card className="p-4 bg-card border-border">
                <p className="text-muted-foreground text-xs font-medium">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">97.3%</p>
              </Card>
              <Card className="p-4 bg-card border-border">
                <p className="text-muted-foreground text-xs font-medium">Top Score</p>
                <p className="text-2xl font-bold text-yellow-500 mt-2">92%</p>
              </Card>
            </div>

            {/* Detailed Performance Table */}
            <Card className="bg-card border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Top Performers</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.map((student) => (
                    <TableRow key={student.name}>
                      <TableCell className="font-bold text-primary">{student.rank}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <span className="font-bold">{student.average}%</span>
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                          {student.grade}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

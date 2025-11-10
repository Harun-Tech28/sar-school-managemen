"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save } from "lucide-react"

interface StudentGrade {
  id: string
  name: string
  rollNumber: string
  subject: string
  score: number
  grade: string
  remarks: string
}

export default function GradesPage() {
  const [userName, setUserName] = useState("")
  const [selectedClass, setSelectedClass] = useState("Form 1A")
  const [selectedSubject, setSelectedSubject] = useState("Mathematics")
  const [isLoading, setIsLoading] = useState(false)
  const [grades, setGrades] = useState<StudentGrade[]>([
    {
      id: "1",
      name: "Ama Boateng",
      rollNumber: "001",
      subject: "Mathematics",
      score: 85,
      grade: "A",
      remarks: "Excellent performance",
    },
    {
      id: "2",
      name: "Kwesi Mensah",
      rollNumber: "002",
      subject: "Mathematics",
      score: 78,
      grade: "B",
      remarks: "Good work, needs improvement in algebra",
    },
    {
      id: "3",
      name: "Abena Asante",
      rollNumber: "003",
      subject: "Mathematics",
      score: 92,
      grade: "A+",
      remarks: "Outstanding performance",
    },
    {
      id: "4",
      name: "Kofi Addo",
      rollNumber: "004",
      subject: "Mathematics",
      score: 65,
      grade: "C",
      remarks: "Needs more effort and focus",
    },
    {
      id: "5",
      name: "Nana Osei",
      rollNumber: "005",
      subject: "Mathematics",
      score: 88,
      grade: "A",
      remarks: "Very good performance",
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

  const handleUpdateGrade = (id: string, field: string, value: string | number) => {
    setGrades(
      grades.map((g) =>
        g.id === id
          ? {
              ...g,
              [field]: value,
              grade: field === "score" ? getGradeFromScore(Number(value)) : g.grade,
            }
          : g,
      ),
    )
  }

  const getGradeFromScore = (score: number): string => {
    if (score >= 90) return "A+"
    if (score >= 85) return "A"
    if (score >= 80) return "B+"
    if (score >= 75) return "B"
    if (score >= 70) return "C+"
    if (score >= 65) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  const handleSaveGrades = async () => {
    setIsLoading(true)

    setTimeout(() => {
      console.log("Grades saved:", grades)
      setIsLoading(false)
      alert("Grades saved successfully!")
    }, 500)
  }

  const averageScore = (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)

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
                <h1 className="text-3xl font-bold text-foreground">Grade Management</h1>
                <p className="text-muted-foreground mt-1">Enter and manage student grades</p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                >
                  <option value="Form 1A">Form 1A</option>
                  <option value="Form 2B">Form 2B</option>
                  <option value="Form 3C">Form 3C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="PE">PE</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="w-full p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">{averageScore}</p>
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSaveGrades} disabled={isLoading} className="w-full gap-2">
                  <Save size={18} />
                  {isLoading ? "Saving..." : "Save Grades"}
                </Button>
              </div>
            </div>

            {/* Grades Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Score (100)</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((gradeRecord) => (
                    <TableRow key={gradeRecord.id}>
                      <TableCell className="font-medium">{gradeRecord.rollNumber}</TableCell>
                      <TableCell>{gradeRecord.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeRecord.score}
                          onChange={(e) => handleUpdateGrade(gradeRecord.id, "score", e.target.value)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell className="font-semibold">{gradeRecord.grade}</TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={gradeRecord.remarks}
                          onChange={(e) => handleUpdateGrade(gradeRecord.id, "remarks", e.target.value)}
                          placeholder="Add remarks"
                          className="w-40"
                        />
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

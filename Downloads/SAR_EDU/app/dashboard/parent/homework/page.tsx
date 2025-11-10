"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Clock, XCircle, FileText, Calendar } from "lucide-react"

interface Homework {
  id: string
  subject: string
  title: string
  description: string
  dueDate: string
  status: "submitted" | "pending" | "overdue"
  grade?: number
  submittedDate?: string
}

export default function ParentHomeworkPage() {
  const [userName, setUserName] = useState("")
  const [homeworkList] = useState<Homework[]>([
    {
      id: "1",
      subject: "Mathematics",
      title: "Algebra Practice Problems",
      description: "Complete exercises 1-20 from Chapter 5",
      dueDate: "2025-01-20",
      status: "submitted",
      grade: 85,
      submittedDate: "2025-01-18"
    },
    {
      id: "2",
      subject: "English",
      title: "Essay on Climate Change",
      description: "Write a 500-word essay on climate change impacts",
      dueDate: "2025-01-22",
      status: "pending",
    },
    {
      id: "3",
      subject: "Science",
      title: "Lab Report - Photosynthesis",
      description: "Complete lab report based on class experiment",
      dueDate: "2025-01-19",
      status: "overdue",
    },
    {
      id: "4",
      subject: "History",
      title: "Ghana Independence Research",
      description: "Research and present key events of Ghana's independence",
      dueDate: "2025-01-25",
      status: "pending",
    },
    {
      id: "5",
      subject: "Mathematics",
      title: "Geometry Worksheet",
      description: "Complete geometry problems on triangles",
      dueDate: "2025-01-15",
      status: "submitted",
      grade: 92,
      submittedDate: "2025-01-14"
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

  const submittedCount = homeworkList.filter((h) => h.status === "submitted").length
  const pendingCount = homeworkList.filter((h) => h.status === "pending").length
  const overdueCount = homeworkList.filter((h) => h.status === "overdue").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
            <CheckCircle size={14} />
            Submitted
          </span>
        )
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-chart-3 text-accent-foreground">
            <Clock size={14} />
            Pending
          </span>
        )
      case "overdue":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-destructive text-destructive-foreground">
            <XCircle size={14} />
            Overdue
          </span>
        )
    }
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="parent" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Parent" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Child's Homework</h1>
              <p className="text-muted-foreground mt-1">View your child's homework assignments and submissions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Submitted</p>
                    <p className="text-3xl font-bold text-accent">{submittedCount}</p>
                  </div>
                  <CheckCircle className="text-accent" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Pending</p>
                    <p className="text-3xl font-bold text-chart-3">{pendingCount}</p>
                  </div>
                  <Clock className="text-chart-3" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Overdue</p>
                    <p className="text-3xl font-bold text-destructive">{overdueCount}</p>
                  </div>
                  <XCircle className="text-destructive" size={32} />
                </div>
              </Card>
            </div>

            {/* Homework List */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <FileText size={24} />
                All Assignments
              </h2>

              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {homeworkList.map((homework) => (
                      <TableRow key={homework.id}>
                        <TableCell className="font-medium">{homework.subject}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{homework.title}</p>
                            <p className="text-xs text-muted-foreground">{homework.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar size={14} className="text-muted-foreground" />
                            {new Date(homework.dueDate).toLocaleDateString()}
                          </div>
                          {homework.submittedDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted: {new Date(homework.submittedDate).toLocaleDateString()}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(homework.status)}</TableCell>
                        <TableCell className="text-center">
                          {homework.grade ? (
                            <span className={`font-bold text-lg ${
                              homework.grade >= 80 ? "text-accent" : 
                              homework.grade >= 60 ? "text-chart-3" : 
                              "text-destructive"
                            }`}>
                              {homework.grade}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not graded</span>
                          )}
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

"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, FileText, Users, CheckCircle, Clock } from "lucide-react"

interface Assignment {
  id: string
  title: string
  class: string
  subject: string
  dueDate: string
  totalStudents: number
  submitted: number
  pending: number
}

export default function TeacherHomeworkPage() {
  const [userName, setUserName] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [assignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "Algebra Practice Problems",
      class: "Form 1A",
      subject: "Mathematics",
      dueDate: "2025-01-20",
      totalStudents: 45,
      submitted: 38,
      pending: 7
    },
    {
      id: "2",
      title: "Essay on Climate Change",
      class: "Form 2B",
      subject: "English",
      dueDate: "2025-01-22",
      totalStudents: 42,
      submitted: 25,
      pending: 17
    },
    {
      id: "3",
      title: "Lab Report - Photosynthesis",
      class: "Form 1A",
      subject: "Science",
      dueDate: "2025-01-19",
      totalStudents: 45,
      submitted: 45,
      pending: 0
    },
    {
      id: "4",
      title: "Geometry Worksheet",
      class: "Form 3C",
      subject: "Mathematics",
      dueDate: "2025-01-25",
      totalStudents: 40,
      submitted: 12,
      pending: 28
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

  const totalAssignments = assignments.length
  const totalSubmissions = assignments.reduce((sum, a) => sum + a.submitted, 0)
  const totalPending = assignments.reduce((sum, a) => sum + a.pending, 0)

  const getCompletionRate = (submitted: number, total: number) => {
    return Math.round((submitted / total) * 100)
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="teacher" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Teacher" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Homework Management</h1>
                <p className="text-muted-foreground mt-1">Create homework assignments and track student submissions</p>
              </div>
              <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
                <Plus size={18} />
                Create Assignment
              </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <Card className="p-6 bg-card border-border mb-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Create New Assignment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Assignment Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Chapter 5 Exercises"
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                    <select className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Mathematics</option>
                      <option>English</option>
                      <option>Science</option>
                      <option>History</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Class</label>
                    <select className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Form 1A</option>
                      <option>Form 2B</option>
                      <option>Form 3C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Assignment instructions..."
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button>Create Assignment</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                </div>
              </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Assignments</p>
                    <p className="text-3xl font-bold text-foreground">{totalAssignments}</p>
                  </div>
                  <FileText className="text-primary" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Submissions</p>
                    <p className="text-3xl font-bold text-accent">{totalSubmissions}</p>
                  </div>
                  <CheckCircle className="text-accent" size={32} />
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Pending</p>
                    <p className="text-3xl font-bold text-chart-3">{totalPending}</p>
                  </div>
                  <Clock className="text-chart-3" size={32} />
                </div>
              </Card>
            </div>

            {/* Assignments List */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Active Assignments</h2>

              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-center">Submissions</TableHead>
                      <TableHead className="text-center">Completion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.class}</TableCell>
                        <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users size={14} className="text-muted-foreground" />
                            <span className="font-medium">{assignment.submitted}/{assignment.totalStudents}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-muted rounded-full h-2 mb-1">
                              <div
                                className="bg-accent rounded-full h-2"
                                style={{ width: `${getCompletionRate(assignment.submitted, assignment.totalStudents)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold">
                              {getCompletionRate(assignment.submitted, assignment.totalStudents)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">View Details</Button>
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

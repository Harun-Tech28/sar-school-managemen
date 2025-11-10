"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit2, Plus, Search } from "lucide-react"
import Link from "next/link"

interface Student {
  id: string
  name: string
  email: string
  form: string
  rollNumber: string
  admissionDate: string
  status: "active" | "inactive"
}

export default function StudentsPage() {
  const [userName, setUserName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      name: "Ama Boateng",
      email: "ama.boateng@school.com",
      form: "Form 2A",
      rollNumber: "001",
      admissionDate: "2023-09-15",
      status: "active",
    },
    {
      id: "2",
      name: "Kwesi Mensah",
      email: "kwesi.mensah@school.com",
      form: "Form 1B",
      rollNumber: "002",
      admissionDate: "2024-09-10",
      status: "active",
    },
    {
      id: "3",
      name: "Abena Asante",
      email: "abena.asante@school.com",
      form: "Form 3C",
      rollNumber: "003",
      admissionDate: "2022-09-12",
      status: "active",
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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.form.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((s) => s.id !== id))
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
                <p className="text-muted-foreground mt-1">Manage all students in the school</p>
              </div>
              <Link href="/dashboard/admin/students/add">
                <Button className="gap-2">
                  <Plus size={18} />
                  Add Student
                </Button>
              </Link>
            </div>

            {/* Search and Filter */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6">
              <div className="flex items-center gap-2">
                <Search size={20} className="text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or form..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.form}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{new Date(student.admissionDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/dashboard/admin/students/${student.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Edit2 size={16} />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No students found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

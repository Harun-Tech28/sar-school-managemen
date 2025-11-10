"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit2, Plus, Search } from "lucide-react"
import Link from "next/link"

interface Teacher {
  id: string
  name: string
  email: string
  qualification: string
  department: string
  phone: string
  dateOfHire: string
  subjects: string[]
  status: "active" | "inactive"
}

export default function TeachersPage() {
  const [userName, setUserName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: "1",
      name: "Mr. Agyeman",
      email: "agyeman@school.com",
      qualification: "BSc Mathematics, MSc Education",
      department: "Mathematics",
      phone: "+233 24 123 4567",
      dateOfHire: "2018-09-01",
      subjects: ["Mathematics", "Further Mathematics"],
      status: "active",
    },
    {
      id: "2",
      name: "Miss Akosua",
      email: "akosua@school.com",
      qualification: "BA English Literature",
      department: "Languages",
      phone: "+233 24 234 5678",
      dateOfHire: "2020-09-15",
      subjects: ["English Language", "Literature in English"],
      status: "active",
    },
    {
      id: "3",
      name: "Mr. Boateng",
      email: "boateng@school.com",
      qualification: "BSc Physics, PGDE",
      department: "Science",
      phone: "+233 24 345 6789",
      dateOfHire: "2019-01-10",
      subjects: ["Physics", "Integrated Science"],
      status: "active",
    },
    {
      id: "4",
      name: "Mrs. Mensah",
      email: "mensah@school.com",
      qualification: "BA History, MA International Relations",
      department: "Social Studies",
      phone: "+233 24 456 7890",
      dateOfHire: "2017-08-20",
      subjects: ["History", "Geography"],
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

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      setTeachers(teachers.filter((t) => t.id !== id))
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
                <h1 className="text-3xl font-bold text-foreground">Teacher Management</h1>
                <p className="text-muted-foreground mt-1">Manage all teachers and their assignments</p>
              </div>
              <Link href="/dashboard/admin/teachers/add">
                <Button className="gap-2">
                  <Plus size={18} />
                  Add Teacher
                </Button>
              </Link>
            </div>

            {/* Search and Filter */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6">
              <div className="flex items-center gap-2">
                <Search size={20} className="text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Teachers Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date of Hire</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.department}</TableCell>
                      <TableCell>{teacher.subjects.join(", ")}</TableCell>
                      <TableCell>{teacher.phone}</TableCell>
                      <TableCell>{new Date(teacher.dateOfHire).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                          {teacher.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/dashboard/admin/teachers/${teacher.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Edit2 size={16} />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(teacher.id)}
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

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No teachers found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

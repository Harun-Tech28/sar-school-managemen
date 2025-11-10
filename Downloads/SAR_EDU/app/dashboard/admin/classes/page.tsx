"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"

interface Class {
  id: string
  name: string
  form: string
  teacher: string
  studentCount: number
  room: string
  capacity: number
}

export default function ClassesPage() {
  const [userName, setUserName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [classes, setClasses] = useState<Class[]>([
    {
      id: "1",
      name: "Form 1A",
      form: "Form 1",
      teacher: "Mr. Agyeman",
      studentCount: 38,
      room: "101",
      capacity: 40,
    },
    {
      id: "2",
      name: "Form 1B",
      form: "Form 1",
      teacher: "Miss Akosua",
      studentCount: 35,
      room: "102",
      capacity: 40,
    },
    {
      id: "3",
      name: "Form 2A",
      form: "Form 2",
      teacher: "Mr. Boateng",
      studentCount: 36,
      room: "201",
      capacity: 40,
    },
    {
      id: "4",
      name: "Form 3C",
      form: "Form 3",
      teacher: "Mrs. Mensah",
      studentCount: 32,
      room: "301",
      capacity: 40,
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

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacher.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      setClasses(classes.filter((c) => c.id !== id))
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
                <h1 className="text-3xl font-bold text-foreground">Class Management</h1>
                <p className="text-muted-foreground mt-1">Manage all classes and their timetables</p>
              </div>
              <Link href="/dashboard/admin/classes/add">
                <Button className="gap-2">
                  <Plus size={18} />
                  Add Class
                </Button>
              </Link>
            </div>

            {/* Search */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6">
              <Input
                placeholder="Search by class name or teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>

            {/* Classes Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.form}</TableCell>
                      <TableCell>{cls.teacher}</TableCell>
                      <TableCell>{cls.studentCount}</TableCell>
                      <TableCell>{cls.room}</TableCell>
                      <TableCell>{cls.capacity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/dashboard/admin/classes/${cls.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Edit2 size={16} />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cls.id)}
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

            {filteredClasses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No classes found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

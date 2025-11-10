"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, Calendar } from "lucide-react"

interface Student {
  id: string
  name: string
  rollNumber: string
  present: boolean
}

export default function AttendancePage() {
  const [userName, setUserName] = useState("")
  const [selectedClass, setSelectedClass] = useState("Form 1A")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Ama Boateng", rollNumber: "001", present: true },
    { id: "2", name: "Kwesi Mensah", rollNumber: "002", present: true },
    { id: "3", name: "Abena Asante", rollNumber: "003", present: false },
    { id: "4", name: "Kofi Addo", rollNumber: "004", present: true },
    { id: "5", name: "Nana Osei", rollNumber: "005", present: true },
  ])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  const handleToggleAttendance = (studentId: string) => {
    setStudents(
      students.map((student) => (student.id === studentId ? { ...student, present: !student.present } : student)),
    )
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    setTimeout(() => {
      const attendanceData = {
        class: selectedClass,
        date: selectedDate,
        students: students,
      }
      console.log("Attendance submitted:", attendanceData)
      setIsLoading(false)
      alert("Attendance marked successfully!")
    }, 500)
  }

  const presentCount = students.filter((s) => s.present).length

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="teacher" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Teacher" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1>
              <p className="text-muted-foreground mt-1">Record student attendance for your classes</p>
            </div>

            {/* Controls */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Calendar className="inline-block mr-2" size={16} />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full gap-2">
                  <Save size={18} />
                  {isLoading ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="grid grid-cols-2 mb-6 gap-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-muted-foreground text-sm">Present</p>
                <p className="text-3xl font-bold text-accent">{presentCount}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-muted-foreground text-sm">Absent</p>
                <p className="text-3xl font-bold text-destructive">{students.length - presentCount}</p>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-right">Present</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-right">
                        <Checkbox
                          checked={student.present}
                          onCheckedChange={() => handleToggleAttendance(student.id)}
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

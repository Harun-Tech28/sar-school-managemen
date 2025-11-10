"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Calendar } from "lucide-react"

interface AttendanceRecord {
  date: string
  subject: string
  status: "present" | "absent" | "late"
}

export default function ParentAttendancePage() {
  const [userName, setUserName] = useState("")
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    { date: "2024-12-01", subject: "Mathematics", status: "present" },
    { date: "2024-12-01", subject: "English", status: "present" },
    { date: "2024-11-30", subject: "Science", status: "late" },
    { date: "2024-11-30", subject: "History", status: "present" },
    { date: "2024-11-29", subject: "Mathematics", status: "present" },
    { date: "2024-11-29", subject: "PE", status: "absent" },
  ])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  const presentCount = attendanceRecords.filter((r) => r.status === "present").length
  const absentCount = attendanceRecords.filter((r) => r.status === "absent").length
  const lateCount = attendanceRecords.filter((r) => r.status === "late").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
            <CheckCircle size={14} />
            Present
          </span>
        )
      case "absent":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-destructive text-destructive-foreground">
            <XCircle size={14} />
            Absent
          </span>
        )
      case "late":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-chart-3 text-accent-foreground">
            <Calendar size={14} />
            Late
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
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Attendance Records</h1>
              <p className="text-muted-foreground mt-1">View your child's attendance history</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-muted-foreground text-sm">Present</p>
                <p className="text-3xl font-bold text-accent">{presentCount}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-muted-foreground text-sm">Absent</p>
                <p className="text-3xl font-bold text-destructive">{absentCount}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-muted-foreground text-sm">Late</p>
                <p className="text-3xl font-bold text-chart-3">{lateCount}</p>
              </div>
            </div>

            {/* Attendance Records Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell className="text-right">{getStatusBadge(record.status)}</TableCell>
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

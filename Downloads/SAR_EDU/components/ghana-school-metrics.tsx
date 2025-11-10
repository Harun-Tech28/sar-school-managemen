"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const metricsData = [
  { month: "Jan", enrollment: 1150, attendance: 92, performance: 78 },
  { month: "Feb", enrollment: 1180, attendance: 94, performance: 80 },
  { month: "Mar", enrollment: 1200, attendance: 91, performance: 79 },
  { month: "Apr", enrollment: 1220, attendance: 95, performance: 82 },
  { month: "May", enrollment: 1247, attendance: 94, performance: 82.5 },
]

export function GhanaSchoolMetrics() {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">School Performance Metrics (Ghana Standards)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={metricsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="enrollment" fill="#EF3B39" name="Enrollment" />
          <Bar dataKey="attendance" fill="#FFD700" name="Attendance %" />
          <Bar dataKey="performance" fill="#10B981" name="Avg Score %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

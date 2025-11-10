"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, TrendingUp } from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const monthlyData = [
  { month: "Jan", income: 145000, expense: 96000 },
  { month: "Feb", income: 158000, expense: 105000 },
  { month: "Mar", income: 162000, expense: 102000 },
  { month: "Apr", income: 155000, expense: 98000 },
  { month: "May", income: 175000, expense: 115000 },
  { month: "Jun", income: 182000, expense: 120000 },
]

const categoryData = [
  { name: "School Fees", value: 45, color: "#3b82f6" },
  { name: "Exam Fees", value: 25, color: "#10b981" },
  { name: "Sports", value: 15, color: "#f59e0b" },
  { name: "Other", value: 15, color: "#8b5cf6" },
]

const expenseCategoryData = [
  { name: "Salaries", value: 60, color: "#ef4444" },
  { name: "Utilities", value: 15, color: "#f97316" },
  { name: "Maintenance", value: 15, color: "#eab308" },
  { name: "Supplies", value: 10, color: "#06b6d4" },
]

export default function FinancialAnalyticsPage() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Link href="/dashboard/admin/financial-reports">
                  <Button variant="ghost" className="gap-2 mb-4">
                    <ArrowLeft size={18} />
                    Back
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Financial Analytics</h1>
                <p className="text-muted-foreground mt-1">Income and expense trends analysis</p>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download size={18} />
                Export Charts
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-card border-border">
                <p className="text-muted-foreground text-sm font-medium mb-2">Total 6-Month Income</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">₵977,000</p>
                <p className="text-xs text-muted-foreground mt-2">Average: ₵162,833/month</p>
              </Card>
              <Card className="p-6 bg-card border-border">
                <p className="text-muted-foreground text-sm font-medium mb-2">Total 6-Month Expense</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">₵636,000</p>
                <p className="text-xs text-muted-foreground mt-2">Average: ₵106,000/month</p>
              </Card>
              <Card className="p-6 bg-card border-border">
                <p className="text-muted-foreground text-sm font-medium mb-2">Net Surplus</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₵341,000</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <TrendingUp size={14} /> 35% growth
                </p>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Trend */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-lg font-bold text-foreground mb-4">Monthly Income vs Expense</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "#f3f4f6" }}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" />
                    <Bar dataKey="expense" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Income Trend */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-lg font-bold text-foreground mb-4">Income Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "#f3f4f6" }}
                    />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income Distribution */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-lg font-bold text-foreground mb-4">Income Sources Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Expense Distribution */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-lg font-bold text-foreground mb-4">Expense Categories Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Download, Plus } from "lucide-react"
import Link from "next/link"

interface FinancialRecord {
  id: string
  type: "income" | "expense"
  category: string
  description: string
  amount: number
  date: string
  paymentMethod: string
  status: "completed" | "pending" | "rejected"
}

export default function FinancialReportsPage() {
  const [userName, setUserName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")

  const [records, setRecords] = useState<FinancialRecord[]>([
    {
      id: "1",
      type: "income",
      category: "School Fees",
      description: "January 2025 Tuition - Form 1A",
      amount: 45000,
      date: "2025-01-10",
      paymentMethod: "Bank Transfer",
      status: "completed",
    },
    {
      id: "2",
      type: "income",
      category: "Examination Fees",
      description: "Mid-term Exam Fees - 150 Students",
      amount: 75000,
      date: "2025-01-08",
      paymentMethod: "Mobile Money",
      status: "completed",
    },
    {
      id: "3",
      type: "expense",
      category: "Utilities",
      description: "Electricity Bill - January",
      amount: 8500,
      date: "2025-01-15",
      paymentMethod: "Bank Transfer",
      status: "completed",
    },
    {
      id: "4",
      type: "expense",
      category: "Staff Salaries",
      description: "January 2025 Salaries - 45 Staff",
      amount: 125000,
      date: "2025-01-01",
      paymentMethod: "Bank Transfer",
      status: "completed",
    },
    {
      id: "5",
      type: "income",
      category: "Sports Activities",
      description: "Sports Day Registration - 500 participants",
      amount: 25000,
      date: "2025-01-12",
      paymentMethod: "Cash",
      status: "completed",
    },
    {
      id: "6",
      type: "expense",
      category: "Maintenance",
      description: "Building Repairs - Block C",
      amount: 18000,
      date: "2025-01-14",
      paymentMethod: "Bank Transfer",
      status: "pending",
    },
    {
      id: "7",
      type: "expense",
      category: "Supplies",
      description: "Stationery and Learning Materials",
      amount: 12500,
      date: "2025-01-16",
      paymentMethod: "Bank Transfer",
      status: "completed",
    },
    {
      id: "8",
      type: "income",
      category: "Library Fines",
      description: "Late return charges collected",
      amount: 2300,
      date: "2025-01-17",
      paymentMethod: "Cash",
      status: "completed",
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

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || record.type === filterType

    return matchesSearch && matchesType
  })

  const totalIncome = records
    .filter((r) => r.type === "income" && r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0)
  const totalExpense = records
    .filter((r) => r.type === "expense" && r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0)
  const netBalance = totalIncome - totalExpense

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
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
                <h1 className="text-3xl font-bold text-foreground">Financial Reports</h1>
                <p className="text-muted-foreground mt-1">Income, expenditure, and financial analysis</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download size={18} />
                  Export Report
                </Button>
                <Link href="/dashboard/admin/financial-reports/add">
                  <Button className="gap-2">
                    <Plus size={18} />
                    Add Record
                  </Button>
                </Link>
                <Link href="/dashboard/admin/financial-reports/analytics">
                  <Button className="gap-2">Analytics</Button>
                </Link>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Income */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Income</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                      ₵{totalIncome.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">From all sources this month</p>
              </Card>

              {/* Total Expense */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Expense</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                      ₵{totalExpense.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                    <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">All operational costs</p>
              </Card>

              {/* Net Balance */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Net Balance</p>
                    <p
                      className={`text-3xl font-bold mt-2 ${netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      ₵{netBalance.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`${netBalance >= 0 ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"} p-3 rounded-lg`}
                  >
                    <BarChart3
                      size={24}
                      className={
                        netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">This month's surplus/deficit</p>
              </Card>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6 flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
                <Input
                  placeholder="Search by category, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "all" | "income" | "expense")}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="all">All Records</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expense Only</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Month</label>
                <select className="px-4 py-2 rounded-lg border border-border bg-background text-foreground">
                  <option value="january">January</option>
                  <option value="february">February</option>
                  {/* Add more months as needed */}
                </select>
              </div>
            </div>

            {/* Financial Records Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${record.type === "income" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                        >
                          {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{record.category}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell
                        className={`font-bold ${record.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {record.type === "income" ? "+" : "-"}₵{record.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.paymentMethod}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(record.status)}`}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <DollarSign size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No financial records found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

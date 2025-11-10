"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function SettingsPage() {
  const [userName, setUserName] = useState("")
  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: "Sepe Sote Secondary School",
    location: "Box 130, Kumasi, Sepe Sote, Hospital Junction",
    email: "info@ssss.edu.gh",
    phone: "+233 32 123 4567",
    registrationNumber: "GES/2018/0245",
    academicYear: "2024/2025",
    currentTerm: "Term 2",
  })

  const [gradeScale, setGradeScale] = useState({
    A: "80-100",
    B: "70-79",
    C: "60-69",
    D: "50-59",
    F: "0-49",
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])
  }, [])

  const handleSchoolSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSchoolSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveSettings = () => {
    alert("Settings saved successfully!")
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage school configuration and preferences</p>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="grades">Grade Scale</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <Card className="p-6 bg-card border-border mt-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">School Information</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">School Name</label>
                      <Input
                        name="schoolName"
                        value={schoolSettings.schoolName}
                        onChange={handleSchoolSettingChange}
                        placeholder="School name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                      <Input
                        name="location"
                        value={schoolSettings.location}
                        onChange={handleSchoolSettingChange}
                        placeholder="School location"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                        <Input
                          name="email"
                          type="email"
                          value={schoolSettings.email}
                          onChange={handleSchoolSettingChange}
                          placeholder="School email"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Phone</label>
                        <Input
                          name="phone"
                          value={schoolSettings.phone}
                          onChange={handleSchoolSettingChange}
                          placeholder="School phone"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Registration Number</label>
                      <Input
                        name="registrationNumber"
                        value={schoolSettings.registrationNumber}
                        onChange={handleSchoolSettingChange}
                        placeholder="GES registration number"
                      />
                    </div>

                    <Button onClick={handleSaveSettings} className="w-full">
                      Save General Settings
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Academic Settings */}
              <TabsContent value="academic">
                <Card className="p-6 bg-card border-border mt-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Academic Configuration</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Academic Year</label>
                      <Input
                        name="academicYear"
                        value={schoolSettings.academicYear}
                        onChange={handleSchoolSettingChange}
                        placeholder="e.g., 2024/2025"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Current Term</label>
                      <select
                        name="currentTerm"
                        value={schoolSettings.currentTerm}
                        onChange={(e) =>
                          setSchoolSettings((prev) => ({
                            ...prev,
                            currentTerm: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      >
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                      </select>
                    </div>

                    <Button onClick={handleSaveSettings} className="w-full">
                      Save Academic Settings
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Grade Scale Settings */}
              <TabsContent value="grades">
                <Card className="p-6 bg-card border-border mt-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Grade Scale Configuration</h2>
                  <div className="space-y-4">
                    {Object.entries(gradeScale).map(([grade, range]) => (
                      <div key={grade}>
                        <label className="text-sm font-medium text-foreground mb-2 block">Grade {grade}</label>
                        <Input value={range} placeholder="e.g., 80-100" disabled className="bg-muted" />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-4">Grade scales are fixed for consistency</p>
                  </div>
                </Card>
              </TabsContent>

              {/* Other Settings */}
              <TabsContent value="other">
                <Card className="p-6 bg-card border-border mt-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Other Settings</h2>
                  <div className="space-y-4">
                    <Link href="/dashboard/settings/offline">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        Offline Mode & Data Sync
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Backup & Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      System Logs
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Notification Preferences
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

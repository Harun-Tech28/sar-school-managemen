"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Users, BookOpen, Phone, Map } from "lucide-react"

export default function GhanaFeatures() {
  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        <Header userName="Administrator" userRole="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Ghana-Specific Features</h1>
              <p className="text-muted-foreground">Features tailored for Ghana basic schools and Kumasi location</p>
            </div>

            {/* Location Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    School Location
                  </CardTitle>
                  <CardDescription>Your Kumasi School Information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">School Name</label>
                    <p className="text-muted-foreground mt-1">Kumasi Basic School</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <p className="text-muted-foreground mt-1">Sepe Sote, Hospital Junction</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Box Address</label>
                    <p className="text-muted-foreground mt-1">Box 130, Kumasi</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">City/Region</label>
                    <p className="text-muted-foreground mt-1">Kumasi, Ashanti Region</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" />
                    Quick Stats
                  </CardTitle>
                  <CardDescription>School Overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Students</span>
                    <span className="font-bold text-foreground">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Teachers</span>
                    <span className="font-bold text-foreground">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Classes</span>
                    <span className="font-bold text-foreground">32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff Members</span>
                    <span className="font-bold text-foreground">15</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Education System */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Ghana Curriculum
                  </CardTitle>
                  <CardDescription>NaCCA Standards Implemented</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Class Structure</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Primary: Classes 1-6</p>
                      <p>• Junior High: Forms 1-3</p>
                      <p>• Core Subjects: Maths, English, Science, Social Studies</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Grading Scale</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• A: 80-100% • B: 70-79%</p>
                      <p>• C: 60-69% • D: 50-59%</p>
                      <p>• E/F: Below 50%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Financial Management
                  </CardTitle>
                  <CardDescription>Ghana Cedi (GHS) Support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Fee Structures</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Tuition Fees (GHS)</p>
                      <p>• Activity Fees (GHS)</p>
                      <p>• Exam Fees (GHS)</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Reports in GHS</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Monthly Reports</p>
                      <p>• Annual Summaries</p>
                      <p>• Student Balance Tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Communication */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Local Communication
                  </CardTitle>
                  <CardDescription>Ghana Phone Format Support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Phone Format</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Ghana: +233 XXX XXX XXX</p>
                      <p>• Support for all major networks</p>
                      <p>• SMS notifications integrated</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-primary hover:bg-primary/90">Configure Communication</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Community Integration
                  </CardTitle>
                  <CardDescription>Ghana Local Support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Support Services</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Local Kumasi support team</p>
                      <p>• Ghana time zone support</p>
                      <p>• Community resources</p>
                      <p>• Best practices from other schools</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

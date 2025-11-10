"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react"

export default function ProfessionalModules() {
  const modules = [
    {
      title: "Curriculum Management",
      description: "Ghana NaCCA curriculum standards, subject mapping, and learning outcomes tracking",
      icon: BookOpen,
      features: ["Subject standards", "Learning outcomes", "Content mapping", "Assessment alignment"],
      status: "Active",
    },
    {
      title: "Homework & Assignments",
      description: "Set, track, and manage student assignments with deadline monitoring and submission tracking",
      icon: Briefcase,
      features: ["Create assignments", "Track submissions", "Grade management", "Student feedback"],
      status: "Active",
    },
    {
      title: "Exam Management",
      description: "Plan, schedule, and manage exams with automated result analysis and reporting",
      icon: GraduationCap,
      features: ["Exam scheduling", "Question banks", "Result analysis", "Grade reports"],
      status: "Active",
    },
    {
      title: "Student Progression",
      description: "Automated class promotion, retention analysis, and student advancement planning",
      icon: TrendingUp,
      features: ["Promotion rules", "Retention analysis", "Grade comparison", "Historical tracking"],
      status: "Active",
    },
    {
      title: "Professional Development",
      description: "Teacher training tracking, professional development hours, and performance metrics",
      icon: Clock,
      features: ["Training records", "Certification tracking", "Hours logging", "Performance review"],
      status: "Coming Soon",
    },
    {
      title: "Advanced Analytics",
      description: "Predictive analytics, student performance trends, and data-driven insights",
      icon: BarChart3,
      features: ["Trend analysis", "Predictive modeling", "Risk identification", "Custom reports"],
      status: "Coming Soon",
    },
  ]

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole="admin" />
      <div className="flex-1 flex flex-col">
        <Header userName="Administrator" userRole="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Professional Modules</h1>
              <p className="text-muted-foreground">
                Advanced features for Ghana basic schools management and academic excellence
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {modules.map((module) => {
                const Icon = module.icon
                const isActive = module.status === "Active"

                return (
                  <Card key={module.title} className="relative overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Key Features:</h4>
                        <ul className="grid grid-cols-2 gap-2">
                          {module.features.map((feature) => (
                            <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {module.status}
                        </span>
                        {isActive && (
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            Access Module
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* System Features Overview */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Security & Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Role-based access control</li>
                    <li>✓ Data encryption</li>
                    <li>✓ Audit logging</li>
                    <li>✓ Multi-user support</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Performance & Reliability</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Offline functionality</li>
                    <li>✓ Automatic syncing</li>
                    <li>✓ Real-time updates</li>
                    <li>✓ 99.9% uptime</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ghana-Specific</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ NaCCA curriculum</li>
                    <li>✓ Ghana Cedi support</li>
                    <li>✓ Local phone format</li>
                    <li>✓ Kumasi location data</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

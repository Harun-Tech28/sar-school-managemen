import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { TeacherList } from '@/components/admin/TeacherList'
import { StudentList } from '@/components/admin/StudentList'
import { ParentList } from '@/components/admin/ParentList'
import { ClassList } from '@/components/admin/ClassList'
import { PaymentForm } from '@/components/admin/PaymentForm'
import { PaymentHistory } from '@/components/admin/PaymentHistory'
import { AcademicYearList } from '@/components/admin/AcademicYearList'
import { SubjectList } from '@/components/admin/SubjectList'
import { ClassSubjectAssignment } from '@/components/admin/ClassSubjectAssignment'
import { ReportCardGenerator } from '@/components/admin/ReportCardGenerator'

export const AdminDashboard = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [studentsRes, teachersRes, parentsRes, classesRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('parents').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
      ])

      return {
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalParents: parentsRes.count || 0,
        totalClasses: classesRes.count || 0,
      }
    },
  })

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Students', icon: '👨‍🎓' },
    { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
    { id: 'parents', label: 'Parents', icon: '👨‍👩‍👧' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'calendar', label: 'Academic Calendar', icon: '📅' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'fees', label: 'Fees', icon: '💰' },
    { id: 'reports', label: 'Reports', icon: '📄' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">SAR School</h1>
          <p className="text-sm text-gray-600 mt-1">Admin Portal</p>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeTab === item.id
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, Administrator
            </h2>
            <p className="text-gray-600 mt-1">
              Here's what's happening in your school today
            </p>
          </div>

          {/* Statistics Cards */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Students"
                  value={stats?.totalStudents || 0}
                  icon="👨‍🎓"
                  color="blue"
                  isLoading={isLoading}
                />
                <StatCard
                  title="Total Teachers"
                  value={stats?.totalTeachers || 0}
                  icon="👨‍🏫"
                  color="green"
                  isLoading={isLoading}
                />
                <StatCard
                  title="Total Parents"
                  value={stats?.totalParents || 0}
                  icon="👨‍👩‍👧"
                  color="purple"
                  isLoading={isLoading}
                />
                <StatCard
                  title="Total Classes"
                  value={stats?.totalClasses || 0}
                  icon="🏫"
                  color="orange"
                  isLoading={isLoading}
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickActionButton
                    label="Add Student"
                    icon="➕👨‍🎓"
                    onClick={() => setActiveTab('students')}
                  />
                  <QuickActionButton
                    label="Add Teacher"
                    icon="➕👨‍🏫"
                    onClick={() => setActiveTab('teachers')}
                  />
                  <QuickActionButton
                    label="Manage Classes"
                    icon="🏫"
                    onClick={() => setActiveTab('classes')}
                  />
                  <QuickActionButton
                    label="View Reports"
                    icon="📈"
                    onClick={() => setActiveTab('reports')}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <p className="text-gray-600 text-sm">
                  Activity tracking will be implemented in upcoming tasks
                </p>
              </div>
            </>
          )}

          {/* Teachers Tab */}
          {activeTab === 'teachers' && <TeacherList />}

          {/* Students Tab */}
          {activeTab === 'students' && <StudentList />}

          {/* Parents Tab */}
          {activeTab === 'parents' && <ParentList />}

          {/* Classes Tab */}
          {activeTab === 'classes' && <ClassList />}

          {/* Academic Calendar Tab */}
          {activeTab === 'calendar' && <AcademicYearList />}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="space-y-8">
              <SubjectList />
              <ClassSubjectAssignment />
            </div>
          )}

          {/* Fees/Payments Tab */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Payment Management</h3>
                <button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showPaymentForm ? 'View Payment History' : 'Record New Payment'}
                </button>
              </div>
              
              {showPaymentForm ? (
                <PaymentForm 
                  onSuccess={() => {
                    setShowPaymentForm(false);
                  }}
                  onCancel={() => setShowPaymentForm(false)}
                />
              ) : (
                <PaymentHistory />
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && <ReportCardGenerator />}

          {/* Other Tabs */}
          {activeTab !== 'overview' && 
           activeTab !== 'teachers' && 
           activeTab !== 'students' && 
           activeTab !== 'parents' && 
           activeTab !== 'classes' && 
           activeTab !== 'calendar' &&
           activeTab !== 'subjects' &&
           activeTab !== 'fees' &&
           activeTab !== 'reports' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {menuItems.find((item) => item.id === activeTab)?.label}
              </h3>
              <p className="text-gray-600">
                {menuItems.find((item) => item.id === activeTab)?.label} management will be implemented in upcoming tasks.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange'
  isLoading: boolean
}

const StatCard = ({ title, value, icon, color, isLoading }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}

// Quick Action Button Component
interface QuickActionButtonProps {
  label: string
  icon: string
  onClick: () => void
}

const QuickActionButton = ({ label, icon, onClick }: QuickActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  )
}

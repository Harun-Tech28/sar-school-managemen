import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { PerformanceView } from '@/components/parent/PerformanceView'
import { AttendanceMonitor } from '@/components/parent/AttendanceMonitor'
import { FeeStatus } from '@/components/parent/FeeStatus'

interface Child {
  id: string
  student_id: string
  profile: {
    first_name: string
    last_name: string
  }
  class: {
    class_name: string
    grade_level: number
  }
}

type TabType = 'overview' | 'performance' | 'attendance' | 'fees'

export const ParentDashboard = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    averageGrade: 0,
    feeBalance: 0,
    recentGrades: [] as any[],
  })
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])

  useEffect(() => {
    fetchChildren()
    fetchAnnouncements()
  }, [user])

  useEffect(() => {
    if (selectedChild) {
      fetchChildStats()
    }
  }, [selectedChild])

  const fetchChildren = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get parent record
      const { data: parent } = await supabase
        .from('parents')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!parent) return

      // Get all children
      const { data } = await supabase
        .from('student_parents')
        .select(`
          student:students(
            id,
            student_id,
            profile:profiles(first_name, last_name),
            class:classes(class_name, grade_level)
          )
        `)
        .eq('parent_id', parent.id)

      const childrenList: Child[] = (data?.map((sp: any) => sp.student).filter(Boolean) || []) as Child[]
      setChildren(childrenList)

      // Select first child by default
      if (childrenList.length > 0) {
        setSelectedChild(childrenList[0])
      }
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChildStats = async () => {
    if (!selectedChild) return

    try {
      // Get attendance
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', selectedChild.id)

      const totalRecords = attendanceRecords?.length || 0
      const presentRecords = attendanceRecords?.filter(a => a.status === 'present').length || 0
      const attendancePercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0

      // Get recent grades
      const { data: grades } = await supabase
        .from('assessment_scores')
        .select(`
          *,
          assessment:assessments(
            title,
            max_score,
            assessment_type,
            subject_assignment:subject_assignments(
              subject:subjects(subject_name)
            )
          )
        `)
        .eq('student_id', selectedChild.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Calculate average grade
      const totalScore = grades?.reduce((sum, g) => {
        const percentage = (g.score / g.assessment.max_score) * 100
        return sum + percentage
      }, 0) || 0
      const averageGrade = grades && grades.length > 0 ? Math.round(totalScore / grades.length) : 0

      setStats({
        attendancePercentage,
        averageGrade,
        feeBalance: 0, // Placeholder
        recentGrades: grades || [],
      })
    } catch (error) {
      console.error('Error fetching child stats:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .or('target_audience.eq.all,target_audience.eq.parent')
        .gte('expiry_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    if (percentage >= 40) return 'E'
    return 'F'
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Parent Portal</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No children linked</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please contact the school administrator to link your children to your account.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Parent Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'performance'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'attendance'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'fees'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fees & Payments
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Child
            </label>
            <select
              value={selectedChild?.id || ''}
              onChange={(e) => {
                const child = children.find(c => c.id === e.target.value)
                setSelectedChild(child || null)
              }}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.profile.first_name} {child.profile.last_name} - {child.class.class_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Render content based on active tab */}
        {activeTab === 'performance' && selectedChild && (
          <PerformanceView studentId={selectedChild.id} />
        )}
        {activeTab === 'attendance' && selectedChild && (
          <AttendanceMonitor studentId={selectedChild.id} />
        )}
        {activeTab === 'fees' && selectedChild && (
          <FeeStatus studentId={selectedChild.id} />
        )}
        
        {/* Overview Tab */}
        {activeTab === 'overview' && selectedChild && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedChild.profile.first_name} {selectedChild.profile.last_name}
              </h2>
              <p className="text-gray-600 mt-2">
                {selectedChild.class.class_name} • Grade {selectedChild.class.grade_level} • ID: {selectedChild.student_id}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Attendance</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.attendancePercentage}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Average Grade</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.averageGrade}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Fee Balance</p>
                    <p className="text-2xl font-semibold text-gray-900">GH₵ {stats.feeBalance}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Grades */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Grades</h3>
                </div>
                <div className="p-6">
                  {stats.recentGrades.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentGrades.map((grade) => {
                        const percentage = (grade.score / grade.assessment.max_score) * 100
                        const letter = getGradeLetter(percentage)
                        return (
                          <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {grade.assessment.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {grade.assessment.subject_assignment?.subject?.subject_name}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className={`text-lg font-bold ${getGradeColor(percentage)}`}>
                                {letter}
                              </div>
                              <div className="text-xs text-gray-500">
                                {grade.score}/{grade.assessment.max_score}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No grades available yet</p>
                  )}
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">School Announcements</h3>
                </div>
                <div className="p-6">
                  {announcements.length > 0 ? (
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="border-l-4 border-primary-500 pl-4 py-2">
                          <h4 className="text-sm font-semibold text-gray-900">{announcement.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No announcements</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab('performance')}
                    className="flex flex-col items-center justify-center p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
                  >
                    <svg className="h-8 w-8 text-primary-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Performance</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
                  >
                    <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Attendance</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Fees</span>
                  </button>

                  <button className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                    <svg className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Messages</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

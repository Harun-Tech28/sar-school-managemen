import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { AttendanceMarker } from '@/components/teacher/AttendanceMarker'
import { GradeBook } from '@/components/teacher/GradeBook'
import { MaterialManager } from '@/components/teacher/MaterialManager'
import { MessagingInterface } from '@/components/teacher/MessagingInterface'

type TabType = 'overview' | 'attendance' | 'grades' | 'materials' | 'messages'

export const TeacherDashboard = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [assignedClasses, setAssignedClasses] = useState<any[]>([])
  const [todaySchedule, setTodaySchedule] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingGrades: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeacherData()
  }, [user])

  const fetchTeacherData = async () => {
    if (!user) return

    try {
      // Get teacher record
      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (!teacher) return

      // Get assigned classes
      const { data: assignments } = await supabase
        .from('subject_assignments')
        .select(`
          *,
          class:classes(id, class_name, grade_level),
          subject:subjects(subject_name),
          academic_year:academic_years(year_name, is_current)
        `)
        .eq('teacher_id', teacher.id)

      setAssignedClasses(assignments || [])

      // Get today's schedule
      const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
      const { data: schedule } = await supabase
        .from('timetable_slots')
        .select(`
          *,
          class:classes(class_name),
          subject:subjects(subject_name)
        `)
        .eq('teacher_id', teacher.id)
        .eq('day_of_week', today === 0 ? 7 : today)
        .order('start_time')

      setTodaySchedule(schedule || [])

      // Calculate stats
      const uniqueClasses = new Set(assignments?.map(a => a.class_id))
      setStats({
        totalClasses: uniqueClasses.size,
        totalStudents: 0,
        pendingGrades: 0,
      })
    } catch (error) {
      console.error('Error fetching teacher data:', error)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Teacher Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
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
                onClick={() => setActiveTab('grades')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'grades'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Grade Book
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'materials'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Messages
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Render content based on active tab */}
        {activeTab === 'attendance' && <AttendanceMarker />}
        {activeTab === 'grades' && <GradeBook />}
        {activeTab === 'materials' && <MaterialManager />}
        {activeTab === 'messages' && <MessagingInterface />}
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Dashboard
              </h2>
              <p className="text-gray-600 mt-2">Welcome back!</p>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">My Classes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Pending Grades</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingGrades}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            </div>
            <div className="p-6">
              {todaySchedule.length > 0 ? (
                <div className="space-y-4">
                  {todaySchedule.map((slot) => (
                    <div key={slot.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="text-sm font-medium text-gray-900">{slot.start_time}</div>
                        <div className="text-xs text-gray-500">{slot.end_time}</div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">{slot.subject?.subject_name}</div>
                        <div className="text-sm text-gray-500">{slot.class?.class_name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No classes scheduled for today</p>
              )}
            </div>
          </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center justify-center p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
                  >
                    <svg className="h-8 w-8 text-primary-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Mark Attendance</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('grades')}
                    className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
                  >
                    <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Enter Grades</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('materials')}
                    className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Upload Materials</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('messages')}
                    className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                  >
                    <svg className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Messages</span>
                  </button>
                </div>
              </div>
            </div>
        </div>

            {/* Assigned Classes */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Classes</h3>
              </div>
              <div className="p-6">
                {assignedClasses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedClasses.map((assignment) => (
                      <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition">
                        <h4 className="font-semibold text-gray-900">{assignment.class?.class_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{assignment.subject?.subject_name}</p>
                        <p className="text-xs text-gray-500 mt-2">Grade {assignment.class?.grade_level}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No classes assigned yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

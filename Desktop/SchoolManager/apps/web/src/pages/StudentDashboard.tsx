import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { TimetableView } from '@/components/student/TimetableView'
import { ResultsView } from '@/components/student/ResultsView'
import { AttendanceHistory } from '@/components/student/AttendanceHistory'
import { MaterialsLibrary } from '@/components/student/MaterialsLibrary'
import { StreakTracker } from '@/components/StreakTracker'
import { AchievementGrid } from '@/components/AchievementBadge'
import { ProgressRing, MultiProgressRing } from '@/components/ProgressRing'
import { QRAttendanceScanner } from '@/components/QRAttendance'

type TabType = 'overview' | 'timetable' | 'results' | 'attendance' | 'materials' | 'achievements' | 'qr-scan'

export const StudentDashboard = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [studentData, setStudentData] = useState<any>(null)
  const [todaySchedule, setTodaySchedule] = useState<any[]>([])
  const [recentGrades, setRecentGrades] = useState<any[]>([])
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    averageGrade: 0,
    feeBalance: 0,
    upcomingAssignments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentData()
  }, [user])

  const fetchStudentData = async () => {
    if (!user) return

    try {
      // Get student record
      const { data: student } = await supabase
        .from('students')
        .select(`
          *,
          profile:profiles(first_name, last_name),
          class:classes(id, class_name, grade_level)
        `)
        .eq('profile_id', user.id)
        .single()

      if (!student) return

      setStudentData(student)

      // Get today's schedule
      const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
      const { data: schedule } = await supabase
        .from('timetable_slots')
        .select(`
          *,
          subject:subjects(subject_name),
          teacher:teachers(profile:profiles(first_name, last_name))
        `)
        .eq('class_id', student.class_id)
        .eq('day_of_week', today === 0 ? 7 : today)
        .order('start_time')

      setTodaySchedule(schedule || [])

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
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentGrades(grades || [])

      // Calculate attendance percentage
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', student.id)

      const totalRecords = attendanceRecords?.length || 0
      const presentRecords = attendanceRecords?.filter(a => a.status === 'present').length || 0
      const attendancePercentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

      // Calculate average grade
      const totalScore = grades?.reduce((sum, g) => {
        const percentage = (g.score / g.assessment.max_score) * 100
        return sum + percentage
      }, 0) || 0
      const averageGrade = grades && grades.length > 0 ? totalScore / grades.length : 0

      // Get fee balance (placeholder - will be implemented in payment section)
      const feeBalance = 0

      setStats({
        attendancePercentage: Math.round(attendancePercentage),
        averageGrade: Math.round(averageGrade),
        feeBalance,
        upcomingAssignments: 0, // Placeholder
      })
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    if (percentage >= 40) return 'E'
    return 'F'
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
                Student Portal
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
                onClick={() => setActiveTab('timetable')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'timetable'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Timetable
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Results
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
                onClick={() => setActiveTab('achievements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'achievements'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏆 Achievements
              </button>
              <button
                onClick={() => setActiveTab('qr-scan')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'qr-scan'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📱 QR Scan
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Render content based on active tab */}
        {activeTab === 'timetable' && <TimetableView />}
        {activeTab === 'results' && <ResultsView />}
        {activeTab === 'attendance' && <AttendanceHistory />}
        {activeTab === 'materials' && <MaterialsLibrary />}
        {activeTab === 'achievements' && studentData && (
          <div className="space-y-8">
            <StreakTracker studentId={studentData.id} />
            <AchievementGrid achievements={[
              {
                id: '1',
                title: 'Perfect Attendance',
                description: 'No absences for a full term',
                icon: '🎯',
                color: 'gold',
                earned: stats.attendancePercentage >= 95,
                progress: stats.attendancePercentage
              },
              {
                id: '2',
                title: 'Top Performer',
                description: 'Average grade above 80%',
                icon: '⭐',
                color: 'ghana',
                earned: stats.averageGrade >= 80,
                progress: stats.averageGrade
              },
              {
                id: '3',
                title: 'Early Bird',
                description: 'Never late for 30 days',
                icon: '🌅',
                color: 'kente',
                earned: false,
                progress: 60
              },
              {
                id: '4',
                title: 'Bookworm',
                description: 'Read 10 materials',
                icon: '📚',
                color: 'bronze',
                earned: false,
                progress: 40
              },
              {
                id: '5',
                title: 'Class Leader',
                description: 'Top 3 in class',
                icon: '👑',
                color: 'gold',
                earned: false,
                progress: 75
              },
              {
                id: '6',
                title: 'Consistent',
                description: '10-day streak',
                icon: '🔥',
                color: 'ghana',
                earned: true,
                progress: 100
              }
            ]} />
          </div>
        )}
        {activeTab === 'qr-scan' && studentData && (
          <QRAttendanceScanner studentId={studentData.id} />
        )}
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {studentData?.profile?.first_name}!
          </h2>
          <p className="text-gray-600 mt-2">
            {studentData?.class?.class_name} • Grade {studentData?.class?.grade_level}
          </p>
        </div>

        {/* Progress Rings - NEW! */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Your Performance</h3>
          <MultiProgressRing data={[
            {
              label: 'Attendance',
              progress: stats.attendancePercentage,
              color: '#10B981',
              icon: '📚'
            },
            {
              label: 'Average Grade',
              progress: stats.averageGrade,
              color: '#3B82F6',
              icon: '⭐'
            },
            {
              label: 'Assignments',
              progress: 75,
              color: '#F59E0B',
              icon: '📝'
            },
            {
              label: 'Participation',
              progress: 85,
              color: '#8B5CF6',
              icon: '🎯'
            }
          ]} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-modern">
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

          <div className="card-modern">
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

          <div className="card-modern">
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

          <div className="card-modern">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Today's Classes</h3>
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
                        <div className="text-sm text-gray-500">
                          {slot.teacher?.profile?.first_name} {slot.teacher?.profile?.last_name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No classes scheduled for today</p>
              )}
            </div>
          </div>

          {/* Recent Grades */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Grades</h3>
            </div>
            <div className="p-6">
              {recentGrades.length > 0 ? (
                <div className="space-y-4">
                  {recentGrades.map((grade) => {
                    const percentage = (grade.score / grade.assessment.max_score) * 100
                    const letter = getGradeLetter(percentage)
                    return (
                      <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {grade.assessment.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {grade.assessment.subject_assignment?.subject?.subject_name} • {grade.assessment.assessment_type}
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
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveTab('timetable')}
                className="flex flex-col items-center justify-center p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
              >
                <svg className="h-8 w-8 text-primary-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Timetable</span>
              </button>

              <button 
                onClick={() => setActiveTab('results')}
                className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Results</span>
              </button>

              <button 
                onClick={() => setActiveTab('materials')}
                className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Materials</span>
              </button>

              <button 
                onClick={() => setActiveTab('attendance')}
                className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
              >
                <svg className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Attendance</span>
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

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface AttendanceRecord {
  id: string
  date: string
  status: 'present' | 'absent' | 'late'
  remarks?: string
}

export const AttendanceHistory = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'term' | 'all'>('month')
  const [stats, setStats] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  })

  useEffect(() => {
    fetchAttendance()
  }, [user, dateRange])

  const fetchAttendance = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get student record
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!student) return

      // Calculate date filter
      const now = new Date()
      let startDate: Date | null = null

      switch (dateRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'term':
          // Get current term start date
          const { data: currentTerm } = await supabase
            .from('terms')
            .select('start_date')
            .eq('is_current', true)
            .single()
          if (currentTerm) {
            startDate = new Date(currentTerm.start_date)
          }
          break
        case 'all':
          startDate = null
          break
      }

      // Build query
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .order('date', { ascending: false })

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0])
      }

      const { data } = await query

      setAttendance(data || [])

      // Calculate statistics
      const total = data?.length || 0
      const present = data?.filter(a => a.status === 'present').length || 0
      const absent = data?.filter(a => a.status === 'absent').length || 0
      const late = data?.filter(a => a.status === 'late').length || 0
      const percentage = total > 0 ? (present / total) * 100 : 0

      setStats({
        totalDays: total,
        present,
        absent,
        late,
        percentage: Math.round(percentage),
      })
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'absent':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'late':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getCalendarData = () => {
    const calendar: Record<string, AttendanceRecord> = {}
    attendance.forEach(record => {
      calendar[record.date] = record
    })
    return calendar
  }

  const renderCalendar = () => {
    const calendarData = getCalendarData()
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>)
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateStr = date.toISOString().split('T')[0]
      const record = calendarData[dateStr]
      const isToday = day === now.getDate()

      days.push(
        <div
          key={day}
          className={`h-16 border border-gray-200 p-2 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${record ? getStatusColor(record.status) : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>{day}</span>
            {record && (
              <div className="flex items-center">
                {getStatusIcon(record.status)}
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading attendance history...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Attendance History</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="term">Current Term</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Days</p>
              <p className="text-xl font-semibold text-gray-900">{stats.totalDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Present</p>
              <p className="text-xl font-semibold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-2">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Absent</p>
              <p className="text-xl font-semibold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Late</p>
              <p className="text-xl font-semibold text-gray-900">{stats.late}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Percentage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Rate</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  stats.percentage >= 90 ? 'bg-green-600' :
                  stats.percentage >= 75 ? 'bg-blue-600' :
                  stats.percentage >= 60 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.percentage}%
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {stats.percentage >= 90 ? 'Excellent attendance!' :
           stats.percentage >= 75 ? 'Good attendance' :
           stats.percentage >= 60 ? 'Fair attendance' :
           'Attendance needs improvement'}
        </p>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded mr-2"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded mr-2"></div>
            <span>Absent</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-200 rounded mr-2"></div>
            <span>Late</span>
          </div>
        </div>
      </div>

      {/* Detailed Records */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          {attendance.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Day
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map(record => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-2 ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1 capitalize">{record.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No attendance records found for the selected period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

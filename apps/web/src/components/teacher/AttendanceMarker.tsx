import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Student {
  id: string
  profile: {
    first_name: string
    last_name: string
  }
  student_id: string
}

interface AttendanceRecord {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'excused'
  remarks?: string
}

export const AttendanceMarker = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [existingAttendance, setExistingAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTeacherClasses()
  }, [user])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
      fetchExistingAttendance()
    }
  }, [selectedClass, selectedDate])

  const fetchTeacherClasses = async () => {
    if (!user) return

    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!teacher) return

      const { data: assignments } = await supabase
        .from('subject_assignments')
        .select(`
          class:classes(id, class_name, grade_level)
        `)
        .eq('teacher_id', teacher.id)

      const uniqueClasses = Array.from(
        new Map(assignments?.map(a => [a.class.id, a.class])).values()
      )
      
      setClasses(uniqueClasses)
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('class_enrollments')
        .select(`
          student:students(
            id,
            student_id,
            profile:profiles(first_name, last_name)
          )
        `)
        .eq('class_id', selectedClass)
        .eq('status', 'active')

      if (error) throw error

      const studentList = data?.map(d => d.student).filter(Boolean) || []
      setStudents(studentList)

      // Initialize attendance state
      const initialAttendance: Record<string, AttendanceRecord> = {}
      studentList.forEach(student => {
        initialAttendance[student.id] = {
          student_id: student.id,
          status: 'present',
        }
      })
      setAttendance(initialAttendance)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingAttendance = async () => {
    try {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', selectedDate)

      setExistingAttendance(data || [])

      // Update attendance state with existing records
      if (data && data.length > 0) {
        const existingMap: Record<string, AttendanceRecord> = {}
        data.forEach(record => {
          existingMap[record.student_id] = {
            student_id: record.student_id,
            status: record.status,
            remarks: record.remarks,
          }
        })
        setAttendance(prev => ({ ...prev, ...existingMap }))
      }
    } catch (error) {
      console.error('Error fetching existing attendance:', error)
    }
  }

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }))
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }))
  }

  const handleSaveAttendance = async () => {
    if (!selectedClass || !user) return

    setSaving(true)
    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!teacher) throw new Error('Teacher not found')

      // Delete existing attendance for this date
      await supabase
        .from('attendance')
        .delete()
        .eq('class_id', selectedClass)
        .eq('date', selectedDate)

      // Insert new attendance records
      const records = Object.values(attendance).map(record => ({
        student_id: record.student_id,
        class_id: selectedClass,
        date: selectedDate,
        status: record.status,
        remarks: record.remarks || null,
        recorded_by: user.id,
      }))

      const { error } = await supabase
        .from('attendance')
        .insert(records)

      if (error) throw error

      alert('Attendance saved successfully!')
      fetchExistingAttendance()
    } catch (error: any) {
      console.error('Error saving attendance:', error)
      alert(error.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const calculateStats = () => {
    const total = students.length
    const present = Object.values(attendance).filter(a => a.status === 'present').length
    const absent = Object.values(attendance).filter(a => a.status === 'absent').length
    const late = Object.values(attendance).filter(a => a.status === 'late').length
    const excused = Object.values(attendance).filter(a => a.status === 'excused').length

    return { total, present, absent, late, excused }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} (Grade {cls.grade_level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {existingAttendance.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ Attendance already recorded for this date. You can update it below.
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      {selectedClass && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <div className="text-sm text-green-700">Present</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-red-700">Absent</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <div className="text-sm text-yellow-700">Late</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
            <div className="text-sm text-blue-700">Excused</div>
          </div>
        </div>
      )}

      {/* Student List */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : students.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
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
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.student_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.profile.first_name} {student.profile.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center space-x-2">
                            {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(student.id, status)}
                                className={`px-3 py-1 text-xs font-medium rounded-full border-2 transition ${
                                  attendance[student.id]?.status === status
                                    ? getStatusColor(status)
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={attendance[student.id]?.remarks || ''}
                            onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                            placeholder="Optional remarks"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No students enrolled in this class
            </div>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="text-center py-12 text-gray-500">
          Please select a class to mark attendance
        </div>
      )}
    </div>
  )
}

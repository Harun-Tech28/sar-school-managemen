import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface TimetableSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  subject: {
    subject_name: string
    subject_code?: string
  }
  teacher: {
    profile: {
      first_name: string
      last_name: string
    }
  }
  room_number?: string
}

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
]

const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-red-100 text-red-800 border-red-200',
  'bg-orange-100 text-orange-800 border-orange-200',
]

export const TimetableView = () => {
  const { user } = useAuth()
  const [timetable, setTimetable] = useState<Record<number, TimetableSlot[]>>({})
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [subjectColorMap, setSubjectColorMap] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchTimetable()
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [user])

  const fetchTimetable = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get student's class
      const { data: student } = await supabase
        .from('students')
        .select('class_id')
        .eq('profile_id', user.id)
        .single()

      if (!student) return

      // Get timetable for the class
      const { data: slots } = await supabase
        .from('timetable_slots')
        .select(`
          *,
          subject:subjects(subject_name, subject_code),
          teacher:teachers(profile:profiles(first_name, last_name))
        `)
        .eq('class_id', student.class_id)
        .order('start_time')

      // Group by day
      const grouped: Record<number, TimetableSlot[]> = {}
      const subjects = new Set<string>()

      slots?.forEach(slot => {
        if (!grouped[slot.day_of_week]) {
          grouped[slot.day_of_week] = []
        }
        grouped[slot.day_of_week].push(slot)
        subjects.add(slot.subject.subject_name)
      })

      // Assign colors to subjects
      const colorMap: Record<string, string> = {}
      Array.from(subjects).forEach((subject, index) => {
        colorMap[subject] = SUBJECT_COLORS[index % SUBJECT_COLORS.length]
      })

      setTimetable(grouped)
      setSubjectColorMap(colorMap)
    } catch (error) {
      console.error('Error fetching timetable:', error)
    } finally {
      setLoading(false)
    }
  }

  const isCurrentClass = (dayOfWeek: number, startTime: string, endTime: string) => {
    const now = currentTime
    const currentDay = now.getDay() === 0 ? 7 : now.getDay() // Convert Sunday from 0 to 7
    
    if (currentDay !== dayOfWeek) return false

    const currentTimeStr = now.toTimeString().slice(0, 5) // HH:MM format
    return currentTimeStr >= startTime && currentTimeStr <= endTime
  }

  const getAllTimeSlots = () => {
    const times = new Set<string>()
    Object.values(timetable).forEach(slots => {
      slots.forEach(slot => {
        times.add(slot.start_time)
      })
    })
    return Array.from(times).sort()
  }

  const getSlotForDayAndTime = (day: number, time: string) => {
    return timetable[day]?.find(slot => slot.start_time === time)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading timetable...</p>
      </div>
    )
  }

  const timeSlots = getAllTimeSlots()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Timetable</h2>
        <div className="text-sm text-gray-600">
          Current time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Desktop View - Grid */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Time
                </th>
                {DAYS.map(day => (
                  <th key={day.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {time}
                  </td>
                  {DAYS.map(day => {
                    const slot = getSlotForDayAndTime(day.id, time)
                    const isCurrent = slot && isCurrentClass(day.id, slot.start_time, slot.end_time)
                    
                    return (
                      <td key={day.id} className="px-3 py-2">
                        {slot ? (
                          <div className={`p-3 rounded-lg border-2 ${
                            isCurrent 
                              ? 'ring-2 ring-primary-500 ring-offset-2' 
                              : ''
                          } ${subjectColorMap[slot.subject.subject_name]}`}>
                            <div className="font-semibold text-sm">
                              {slot.subject.subject_name}
                            </div>
                            <div className="text-xs mt-1">
                              {slot.teacher.profile.first_name} {slot.teacher.profile.last_name}
                            </div>
                            <div className="text-xs mt-1">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            {slot.room_number && (
                              <div className="text-xs mt-1">
                                Room: {slot.room_number}
                              </div>
                            )}
                            {isCurrent && (
                              <div className="text-xs font-bold mt-1 text-primary-700">
                                • NOW
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full min-h-[80px]"></div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View - Day by Day */}
      <div className="lg:hidden space-y-4">
        {DAYS.map(day => {
          const daySlots = timetable[day.id] || []
          
          return (
            <div key={day.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{day.name}</h3>
              </div>
              <div className="p-4">
                {daySlots.length > 0 ? (
                  <div className="space-y-3">
                    {daySlots.map(slot => {
                      const isCurrent = isCurrentClass(day.id, slot.start_time, slot.end_time)
                      
                      return (
                        <div
                          key={slot.id}
                          className={`p-4 rounded-lg border-2 ${
                            isCurrent 
                              ? 'ring-2 ring-primary-500 ring-offset-2' 
                              : ''
                          } ${subjectColorMap[slot.subject.subject_name]}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-semibold text-base">
                                {slot.subject.subject_name}
                              </div>
                              <div className="text-sm mt-1">
                                {slot.teacher.profile.first_name} {slot.teacher.profile.last_name}
                              </div>
                              {slot.room_number && (
                                <div className="text-sm mt-1">
                                  Room: {slot.room_number}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium">
                                {slot.start_time}
                              </div>
                              <div className="text-sm">
                                {slot.end_time}
                              </div>
                              {isCurrent && (
                                <div className="text-xs font-bold mt-1 text-primary-700">
                                  NOW
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No classes scheduled</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(subjectColorMap).map(([subject, color]) => (
            <div key={subject} className={`px-3 py-2 rounded-lg border-2 ${color}`}>
              <span className="text-sm font-medium">{subject}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

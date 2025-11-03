import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface TimetableSlot {
  id?: string
  class_id: string
  subject_id: string
  teacher_id: string
  term_id: string
  day_of_week: number
  start_time: string
  end_time: string
  subject?: {
    subject_name?: string
  }
  teacher?: {
    profile?: {
      first_name?: string
      last_name?: string
    }
  }
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
]

export const TimetableBuilder = () => {
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [terms, setTerms] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [timetable, setTimetable] = useState<TimetableSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      fetchTimetable()
    }
  }, [selectedClass, selectedTerm])

  const fetchData = async () => {
    const [classesRes, subjectsRes, teachersRes, termsRes] = await Promise.all([
      supabase.from('classes').select('*').order('class_name'),
      supabase.from('subjects').select('*').order('subject_name'),
      supabase.from('teachers').select('*, profile:profiles(first_name, last_name)'),
      supabase.from('terms').select('*').order('start_date', { ascending: false })
    ])

    setClasses(classesRes.data || [])
    setSubjects(subjectsRes.data || [])
    setTeachers(teachersRes.data || [])
    setTerms(termsRes.data || [])
  }

  const fetchTimetable = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('timetable_slots')
        .select(`
          *,
          subject:subjects(subject_name),
          teacher:teachers(profile:profiles(first_name, last_name))
        `)
        .eq('class_id', selectedClass)
        .eq('term_id', selectedTerm)

      if (error) throw error
      setTimetable(data || [])
    } catch (error) {
      console.error('Error fetching timetable:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSlotForDayAndTime = (day: number, time: string) => {
    return timetable.find(
      slot => slot.day_of_week === day && slot.start_time === time
    )
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Delete this time slot?')) return

    try {
      const { error } = await supabase
        .from('timetable_slots')
        .delete()
        .eq('id', slotId)

      if (error) throw error
      fetchTimetable()
    } catch (error) {
      console.error('Error deleting slot:', error)
      alert('Failed to delete slot')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Timetable Builder</h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Class *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Term *
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Choose a term</option>
              {terms.map(term => (
                <option key={term.id} value={term.id}>{term.term_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setEditingSlot(null)
                setShowSlotForm(true)
              }}
              disabled={!selectedClass || !selectedTerm}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Add Time Slot
            </button>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      {selectedClass && selectedTerm && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">Loading timetable...</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {TIME_SLOTS.map(time => (
                  <tr key={time}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {time}
                    </td>
                    {DAYS.map((_, dayIndex) => {
                      const slot = getSlotForDayAndTime(dayIndex + 1, time)
                      return (
                        <td key={dayIndex} className="px-2 py-2">
                          {slot ? (
                            <div className="bg-primary-50 border border-primary-200 rounded p-2 text-xs">
                              <div className="font-semibold text-primary-900">
                                {slot.subject?.subject_name}
                              </div>
                              <div className="text-primary-700">
                                {slot.teacher?.profile?.first_name} {slot.teacher?.profile?.last_name}
                              </div>
                              <div className="text-primary-600 text-xs">
                                {slot.start_time} - {slot.end_time}
                              </div>
                              <div className="mt-1 space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingSlot(slot)
                                    setShowSlotForm(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id!)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-20 border border-dashed border-gray-300 rounded"></div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!selectedClass || !selectedTerm && (
        <div className="text-center py-12 text-gray-500">
          Please select a class and term to view/edit the timetable
        </div>
      )}

      {showSlotForm && (
        <TimetableSlotForm
          slot={editingSlot}
          classId={selectedClass}
          termId={selectedTerm}
          subjects={subjects}
          teachers={teachers}
          onClose={() => {
            setShowSlotForm(false)
            setEditingSlot(null)
          }}
          onSuccess={() => {
            setShowSlotForm(false)
            setEditingSlot(null)
            fetchTimetable()
          }}
        />
      )}
    </div>
  )
}

interface SlotFormProps {
  slot: TimetableSlot | null
  classId: string
  termId: string
  subjects: any[]
  teachers: any[]
  onClose: () => void
  onSuccess: () => void
}

const TimetableSlotForm = ({ slot, classId, termId, subjects, teachers, onClose, onSuccess }: SlotFormProps) => {
  const [formData, setFormData] = useState({
    subject_id: slot?.subject_id || '',
    teacher_id: slot?.teacher_id || '',
    day_of_week: slot?.day_of_week || 1,
    start_time: slot?.start_time || '08:00',
    end_time: slot?.end_time || '09:00',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const slotData = {
        ...formData,
        class_id: classId,
        term_id: termId,
      }

      if (slot) {
        const { error } = await supabase
          .from('timetable_slots')
          .update(slotData)
          .eq('id', slot.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('timetable_slots')
          .insert([slotData])

        if (error) throw error
      }

      alert(`Time slot ${slot ? 'updated' : 'created'} successfully`)
      onSuccess()
    } catch (error: any) {
      console.error('Error saving slot:', error)
      alert(error.message || 'Failed to save time slot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">
          {slot ? 'Edit Time Slot' : 'Add Time Slot'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher *
            </label>
            <select
              value={formData.teacher_id}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.profile?.first_name} {teacher.profile?.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week *
            </label>
            <select
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              {DAYS.map((day, index) => (
                <option key={day} value={index + 1}>{day}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : slot ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

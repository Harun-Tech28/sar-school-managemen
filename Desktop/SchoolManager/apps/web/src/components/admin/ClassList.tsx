import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface Class {
  id: string
  class_name: string
  grade_level: number
  academic_year_id: string
  class_teacher_id: string | null
  academic_years: {
    year_name: string
  }
  teachers?: {
    teacher_id: string
    profiles: {
      first_name: string
      last_name: string
    }
  }
}

export const ClassList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const queryClient = useQueryClient()

  // Fetch classes
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          academic_years (year_name),
          teachers (
            teacher_id,
            profiles (first_name, last_name)
          )
        `)
        .order('grade_level')

      if (error) throw error
      return data as Class[]
    },
  })

  // Delete class mutation
  const deleteMutation = useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const filteredClasses = classes?.filter((cls) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      cls.class_name.toLowerCase().includes(searchLower) ||
      cls.grade_level.toString().includes(searchLower)
    )
  })

  const handleEdit = (cls: Class) => {
    setEditingClass(cls)
    setShowForm(true)
  }

  const handleDelete = async (classId: string, className: string) => {
    if (confirm(`Are you sure you want to delete ${className}?`)) {
      deleteMutation.mutate(classId)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingClass(null)
  }

  if (showForm) {
    return (
      <ClassForm
        classData={editingClass}
        onClose={handleCloseForm}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
          <p className="text-gray-600 mt-1">Manage class records</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Add Class
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search classes by name or grade level..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading classes...</p>
          </div>
        ) : filteredClasses && filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cls.class_name}</h3>
                  <p className="text-sm text-gray-600">Grade {cls.grade_level}</p>
                </div>
                <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                  {cls.academic_years.year_name}
                </span>
              </div>

              {cls.teachers && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Class Teacher:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {cls.teachers.profiles.first_name} {cls.teachers.profiles.last_name}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(cls)}
                  className="flex-1 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cls.id, cls.class_name)}
                  className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center">
            <p className="text-gray-600">
              {searchTerm ? 'No classes found matching your search.' : 'No classes yet. Add your first class!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Class Form Component
interface ClassFormProps {
  classData: Class | null
  onClose: () => void
}

const ClassForm = ({ classData, onClose }: ClassFormProps) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    className: classData?.class_name || '',
    gradeLevel: classData?.grade_level || 1,
    academicYearId: classData?.academic_year_id || '',
    classTeacherId: classData?.class_teacher_id || '',
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch academic years
  const { data: academicYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('year_name', { ascending: false })

      if (error) throw error
      return data
    },
  })

  // Fetch teachers
  const { data: teachers } = useQuery({
    queryKey: ['teachers-for-class'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          teacher_id,
          profiles!inner (first_name, last_name)
        `)
        .eq('status', 'active')
        .order('teacher_id')

      if (error) throw error
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const classPayload = {
        class_name: formData.className,
        grade_level: formData.gradeLevel,
        academic_year_id: formData.academicYearId,
        class_teacher_id: formData.classTeacherId || null,
      }

      if (classData) {
        const { error } = await supabase
          .from('classes')
          .update(classPayload)
          .eq('id', classData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('classes')
          .insert(classPayload)

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to save class')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.className || !formData.academicYearId) {
      setError('Please fill in all required fields')
      return
    }

    saveMutation.mutate()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {classData ? 'Edit Class' : 'Add New Class'}
          </h2>
          <p className="text-gray-600 mt-1">
            {classData ? 'Update class information' : 'Create a new class'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Name *
            </label>
            <input
              type="text"
              required
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Class 1A, Primary 3B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade Level *
            </label>
            <select
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={1}>Creche</option>
              <option value={2}>Nursery 1</option>
              <option value={3}>Nursery 2</option>
              <option value={4}>KG 1</option>
              <option value={5}>KG 2</option>
              <option value={6}>Primary 1</option>
              <option value={7}>Primary 2</option>
              <option value={8}>Primary 3</option>
              <option value={9}>Primary 4</option>
              <option value={10}>Primary 5</option>
              <option value={11}>Primary 6</option>
              <option value={12}>JHS 1</option>
              <option value={13}>JHS 2</option>
              <option value={14}>JHS 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year *
            </label>
            <select
              value={formData.academicYearId}
              onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select academic year...</option>
              {academicYears?.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year_name}
                </option>
              ))}
            </select>
            {!academicYears || academicYears.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No academic years found. Please create one first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Teacher (Optional)
            </label>
            <select
              value={formData.classTeacherId}
              onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">No class teacher assigned</option>
              {teachers?.map((teacher: any) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.teacher_id} - {teacher.profiles.first_name} {teacher.profiles.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : classData ? 'Update Class' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

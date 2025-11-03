import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface Teacher {
  id: string
  teacher_id: string
  hire_date: string
  status: string
  profile_id: string
  profiles: {
    first_name: string
    last_name: string
    email: string
    phone: string | null
  }
}

export const TeacherList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const queryClient = useQueryClient()

  // Fetch teachers
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Teacher[]
    },
  })

  // Delete teacher mutation
  const deleteMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const filteredTeachers = teachers?.filter((teacher) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      teacher.profiles.first_name.toLowerCase().includes(searchLower) ||
      teacher.profiles.last_name.toLowerCase().includes(searchLower) ||
      teacher.profiles.email.toLowerCase().includes(searchLower) ||
      teacher.teacher_id.toLowerCase().includes(searchLower)
    )
  })

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setShowForm(true)
  }

  const handleDelete = async (teacherId: string, teacherName: string) => {
    if (confirm(`Are you sure you want to delete ${teacherName}?`)) {
      deleteMutation.mutate(teacherId)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTeacher(null)
  }

  if (showForm) {
    return (
      <TeacherForm
        teacher={editingTeacher}
        onClose={handleCloseForm}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teachers</h2>
          <p className="text-gray-600 mt-1">Manage teacher records</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search teachers by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading teachers...</p>
          </div>
        ) : filteredTeachers && filteredTeachers.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hire Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {teacher.teacher_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.profiles.first_name} {teacher.profiles.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {teacher.profiles.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {teacher.profiles.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(teacher.hire_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        teacher.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : teacher.status === 'on_leave'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(
                          teacher.id,
                          `${teacher.profiles.first_name} ${teacher.profiles.last_name}`
                        )
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600">
              {searchTerm ? 'No teachers found matching your search.' : 'No teachers yet. Add your first teacher!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Teacher Form Component
interface TeacherFormProps {
  teacher: Teacher | null
  onClose: () => void
}

const TeacherForm = ({ teacher, onClose }: TeacherFormProps) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    firstName: teacher?.profiles.first_name || '',
    lastName: teacher?.profiles.last_name || '',
    email: teacher?.profiles.email || '',
    phone: teacher?.profiles.phone || '',
    teacherId: teacher?.teacher_id || '',
    hireDate: teacher?.hire_date || new Date().toISOString().split('T')[0],
    status: teacher?.status || 'active',
  })
  const [error, setError] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (teacher) {
        // Update existing teacher
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
          })
          .eq('id', teacher.profile_id)

        if (profileError) throw profileError

        const { error: teacherError } = await supabase
          .from('teachers')
          .update({
            teacher_id: formData.teacherId,
            hire_date: formData.hireDate,
            status: formData.status,
          })
          .eq('id', teacher.id)

        if (teacherError) throw teacherError
      } else {
        // Create new teacher
        // First create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: 'Teacher@123', // Default password
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('Failed to create user')

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            role: 'teacher',
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
          })

        if (profileError) throw profileError

        // Create teacher record
        const { error: teacherError } = await supabase
          .from('teachers')
          .insert({
            profile_id: authData.user.id,
            teacher_id: formData.teacherId,
            hire_date: formData.hireDate,
            status: formData.status,
          })

        if (teacherError) throw teacherError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to save teacher')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.teacherId) {
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
            {teacher ? 'Edit Teacher' : 'Add New Teacher'}
          </h2>
          <p className="text-gray-600 mt-1">
            {teacher ? 'Update teacher information' : 'Create a new teacher account'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              disabled={!!teacher}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
            />
            {teacher && (
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher ID *
              </label>
              <input
                type="text"
                required
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="T001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hire Date *
              </label>
              <input
                type="date"
                required
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {!teacher && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A default password "Teacher@123" will be set. The teacher should change it after first login.
              </p>
            </div>
          )}

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
              {saveMutation.isPending ? 'Saving...' : teacher ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

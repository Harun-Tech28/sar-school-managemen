import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface Parent {
  id: string
  profile_id: string
  profiles: {
    first_name: string
    last_name: string
    email: string
    phone: string | null
  }
}

interface Student {
  id: string
  student_id: string
  profiles: {
    first_name: string
    last_name: string
  }
}

interface StudentParent {
  id: string
  student_id: string
  parent_id: string
  relationship: string
  is_primary: boolean
  students: {
    student_id: string
    profiles: {
      first_name: string
      last_name: string
    }
  }
}

export const ParentList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [linkingParent, setLinkingParent] = useState<Parent | null>(null)
  const queryClient = useQueryClient()

  // Fetch parents
  const { data: parents, isLoading } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parents')
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
      return data as Parent[]
    },
  })

  // Delete parent mutation
  const deleteMutation = useMutation({
    mutationFn: async (parentId: string) => {
      const { error} = await supabase
        .from('parents')
        .delete()
        .eq('id', parentId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const filteredParents = parents?.filter((parent) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      parent.profiles.first_name.toLowerCase().includes(searchLower) ||
      parent.profiles.last_name.toLowerCase().includes(searchLower) ||
      parent.profiles.email.toLowerCase().includes(searchLower)
    )
  })

  const handleEdit = (parent: Parent) => {
    setEditingParent(parent)
    setShowForm(true)
  }

  const handleDelete = async (parentId: string, parentName: string) => {
    if (confirm(`Are you sure you want to delete ${parentName}?`)) {
      deleteMutation.mutate(parentId)
    }
  }

  const handleLinkStudent = (parent: Parent) => {
    setLinkingParent(parent)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingParent(null)
  }

  const handleCloseLinking = () => {
    setLinkingParent(null)
  }

  if (showForm) {
    return (
      <ParentForm
        parent={editingParent}
        onClose={handleCloseForm}
      />
    )
  }

  if (linkingParent) {
    return (
      <StudentParentLink
        parent={linkingParent}
        onClose={handleCloseLinking}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parents</h2>
          <p className="text-gray-600 mt-1">Manage parent records and link to students</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Add Parent
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search parents by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Parents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading parents...</p>
          </div>
        ) : filteredParents && filteredParents.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParents.map((parent) => (
                <tr key={parent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parent.profiles.first_name} {parent.profiles.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {parent.profiles.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {parent.profiles.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleLinkStudent(parent)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Link Student
                    </button>
                    <button
                      onClick={() => handleEdit(parent)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(
                          parent.id,
                          `${parent.profiles.first_name} ${parent.profiles.last_name}`
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
              {searchTerm ? 'No parents found matching your search.' : 'No parents yet. Add your first parent!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Parent Form Component
interface ParentFormProps {
  parent: Parent | null
  onClose: () => void
}

const ParentForm = ({ parent, onClose }: ParentFormProps) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    firstName: parent?.profiles.first_name || '',
    lastName: parent?.profiles.last_name || '',
    email: parent?.profiles.email || '',
    phone: parent?.profiles.phone || '',
  })
  const [error, setError] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (parent) {
        // Update existing parent
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
          })
          .eq('id', parent.profile_id)

        if (profileError) throw profileError
      } else {
        // Create new parent
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: 'Parent@123',
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('Failed to create user')

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            role: 'parent',
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
          })

        if (profileError) throw profileError

        const { error: parentError } = await supabase
          .from('parents')
          .insert({
            profile_id: authData.user.id,
          })

        if (parentError) throw parentError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to save parent')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.firstName || !formData.lastName || !formData.email) {
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
            {parent ? 'Edit Parent' : 'Add New Parent'}
          </h2>
          <p className="text-gray-600 mt-1">
            {parent ? 'Update parent information' : 'Create a new parent account'}
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
              disabled={!!parent}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
            />
            {parent && (
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

          {!parent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A default password "Parent@123" will be set. The parent should change it after first login.
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
              {saveMutation.isPending ? 'Saving...' : parent ? 'Update Parent' : 'Add Parent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Student-Parent Link Component
interface StudentParentLinkProps {
  parent: Parent
  onClose: () => void
}

const StudentParentLink = ({ parent, onClose }: StudentParentLinkProps) => {
  const queryClient = useQueryClient()
  const [selectedStudent, setSelectedStudent] = useState('')
  const [relationship, setRelationship] = useState('Father')
  const [isPrimary, setIsPrimary] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch students
  const { data: students } = useQuery({
    queryKey: ['students-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          profiles!inner (
            first_name,
            last_name
          )
        `)
        .order('student_id')

      if (error) throw error
      return data as unknown as Student[]
    },
  })

  // Fetch existing links
  const { data: existingLinks } = useQuery({
    queryKey: ['student-parent-links', parent.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_parents')
        .select(`
          *,
          students (
            student_id,
            profiles (
              first_name,
              last_name
            )
          )
        `)
        .eq('parent_id', parent.id)

      if (error) throw error
      return data as StudentParent[]
    },
  })

  const linkMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('student_parents')
        .insert({
          student_id: selectedStudent,
          parent_id: parent.id,
          relationship,
          is_primary: isPrimary,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-parent-links', parent.id] })
      setSelectedStudent('')
      setRelationship('Father')
      setIsPrimary(false)
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to link student')
    },
  })

  const unlinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('student_parents')
        .delete()
        .eq('id', linkId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-parent-links', parent.id] })
    },
  })

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedStudent) {
      setError('Please select a student')
      return
    }

    linkMutation.mutate()
  }

  const handleUnlink = (linkId: string, studentName: string) => {
    if (confirm(`Remove link to ${studentName}?`)) {
      unlinkMutation.mutate(linkId)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Link Students to {parent.profiles.first_name} {parent.profiles.last_name}
          </h2>
          <p className="text-gray-600 mt-1">
            Associate students with this parent account
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Back to Parents
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Link New Student Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Link New Student
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Student *
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Choose a student...</option>
                {students?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.student_id} - {student.profiles.first_name} {student.profiles.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship *
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
                Primary Contact
              </label>
            </div>

            <button
              type="submit"
              disabled={linkMutation.isPending}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {linkMutation.isPending ? 'Linking...' : 'Link Student'}
            </button>
          </form>
        </div>

        {/* Existing Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Linked Students
          </h3>

          {existingLinks && existingLinks.length > 0 ? (
            <div className="space-y-3">
              {existingLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {link.students.student_id} - {link.students.profiles.first_name}{' '}
                      {link.students.profiles.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {link.relationship}
                      {link.is_primary && (
                        <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded-full">
                          Primary
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleUnlink(
                        link.id,
                        `${link.students.profiles.first_name} ${link.students.profiles.last_name}`
                      )
                    }
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              No students linked yet. Use the form to link students.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

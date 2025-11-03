import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface AcademicYear {
  id: string
  year_name: string
  start_date: string
  end_date: string
  is_current: boolean
}

interface Term {
  id: string
  academic_year_id: string
  term_name: string
  start_date: string
  end_date: string
  is_current: boolean
}

export const AcademicYearList = () => {
  const [showYearForm, setShowYearForm] = useState(false)
  const [showTermForm, setShowTermForm] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [selectedYearForTerm, setSelectedYearForTerm] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch academic years
  const { data: years, isLoading } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error
      return data as AcademicYear[]
    },
  })

  // Fetch terms
  const { data: terms } = useQuery({
    queryKey: ['terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('start_date')

      if (error) throw error
      return data as Term[]
    },
  })

  // Delete year mutation
  const deleteYearMutation = useMutation({
    mutationFn: async (yearId: string) => {
      const { error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', yearId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] })
    },
  })

  // Set current year mutation
  const setCurrentYearMutation = useMutation({
    mutationFn: async (yearId: string) => {
      // First, unset all current years
      await supabase
        .from('academic_years')
        .update({ is_current: false })
        .neq('id', '00000000-0000-0000-0000-000000000000')

      // Then set the selected year as current
      const { error } = await supabase
        .from('academic_years')
        .update({ is_current: true })
        .eq('id', yearId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] })
    },
  })

  const handleAddTerm = (yearId: string) => {
    setSelectedYearForTerm(yearId)
    setShowTermForm(true)
  }

  const handleEditYear = (year: AcademicYear) => {
    setEditingYear(year)
    setShowYearForm(true)
  }

  const handleDeleteYear = (yearId: string, yearName: string) => {
    if (confirm(`Delete ${yearName}? This will also delete all associated terms and classes.`)) {
      deleteYearMutation.mutate(yearId)
    }
  }

  const handleSetCurrent = (yearId: string) => {
    setCurrentYearMutation.mutate(yearId)
  }

  if (showYearForm) {
    return (
      <AcademicYearForm
        year={editingYear}
        onClose={() => {
          setShowYearForm(false)
          setEditingYear(null)
        }}
      />
    )
  }

  if (showTermForm && selectedYearForTerm) {
    return (
      <TermForm
        academicYearId={selectedYearForTerm}
        onClose={() => {
          setShowTermForm(false)
          setSelectedYearForTerm(null)
        }}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Academic Years & Terms</h2>
          <p className="text-gray-600 mt-1">Manage academic calendar</p>
        </div>
        <button
          onClick={() => setShowYearForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Add Academic Year
        </button>
      </div>

      {/* Academic Years */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading academic years...</p>
          </div>
        ) : years && years.length > 0 ? (
          years.map((year) => {
            const yearTerms = terms?.filter((t) => t.academic_year_id === year.id) || []
            
            return (
              <div key={year.id} className="bg-white rounded-lg shadow">
                {/* Year Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold text-gray-900">{year.year_name}</h3>
                        {year.is_current && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Current Year
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(year.start_date).toLocaleDateString()} - {new Date(year.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!year.is_current && (
                        <button
                          onClick={() => handleSetCurrent(year.id)}
                          className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          Set as Current
                        </button>
                      )}
                      <button
                        onClick={() => handleAddTerm(year.id)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        + Add Term
                      </button>
                      <button
                        onClick={() => handleEditYear(year)}
                        className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteYear(year.id, year.year_name)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Terms</h4>
                  {yearTerms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {yearTerms.map((term) => (
                        <div key={term.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{term.term_name}</h5>
                            {term.is_current && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No terms yet. Add a term to get started.</p>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No academic years yet. Create your first academic year!</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Academic Year Form
interface AcademicYearFormProps {
  year: AcademicYear | null
  onClose: () => void
}

const AcademicYearForm = ({ year, onClose }: AcademicYearFormProps) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    yearName: year?.year_name || '',
    startDate: year?.start_date || '',
    endDate: year?.end_date || '',
    isCurrent: year?.is_current || false,
  })
  const [error, setError] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Validate dates
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('End date must be after start date')
      }

      if (year) {
        const { error } = await supabase
          .from('academic_years')
          .update({
            year_name: formData.yearName,
            start_date: formData.startDate,
            end_date: formData.endDate,
            is_current: formData.isCurrent,
          })
          .eq('id', year.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('academic_years')
          .insert({
            year_name: formData.yearName,
            start_date: formData.startDate,
            end_date: formData.endDate,
            is_current: formData.isCurrent,
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to save academic year')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.yearName || !formData.startDate || !formData.endDate) {
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
            {year ? 'Edit Academic Year' : 'Add New Academic Year'}
          </h2>
        </div>
        <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
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
              Year Name *
            </label>
            <input
              type="text"
              required
              value={formData.yearName}
              onChange={(e) => setFormData({ ...formData, yearName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., 2024/2025"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCurrent"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-700">
              Set as current academic year
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : year ? 'Update Year' : 'Add Year'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Term Form Component
interface TermFormProps {
  academicYearId: string
  onClose: () => void
}

const TermForm = ({ academicYearId, onClose }: TermFormProps) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    termName: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  })
  const [error, setError] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('End date must be after start date')
      }

      const { error } = await supabase
        .from('terms')
        .insert({
          academic_year_id: academicYearId,
          term_name: formData.termName,
          start_date: formData.startDate,
          end_date: formData.endDate,
          is_current: formData.isCurrent,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to save term')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.termName || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields')
      return
    }

    saveMutation.mutate()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Term</h2>
        </div>
        <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
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
              Term Name *
            </label>
            <select
              value={formData.termName}
              onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select term...</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCurrentTerm"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isCurrentTerm" className="ml-2 block text-sm text-gray-700">
              Set as current term
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : 'Add Term'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

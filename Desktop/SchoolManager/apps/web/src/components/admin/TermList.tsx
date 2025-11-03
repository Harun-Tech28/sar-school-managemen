import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Term {
  id: string
  academic_year_id: string
  term_name: string
  start_date: string
  end_date: string
  is_current: boolean
  academic_year?: {
    year_name: string
  }
}

export const TermList = () => {
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('terms')
        .select(`
          *,
          academic_year:academic_years(year_name)
        `)
        .order('start_date', { ascending: false })

      if (error) throw error
      setTerms(data || [])
    } catch (error) {
      console.error('Error fetching terms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetCurrent = async (termId: string) => {
    try {
      // First, unset all current terms
      await supabase
        .from('terms')
        .update({ is_current: false })
        .neq('id', '00000000-0000-0000-0000-000000000000')

      // Then set the selected term as current
      const { error } = await supabase
        .from('terms')
        .update({ is_current: true })
        .eq('id', termId)

      if (error) throw error
      
      fetchTerms()
      alert('Current term updated successfully')
    } catch (error) {
      console.error('Error setting current term:', error)
      alert('Failed to set current term')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return

    try {
      const { error } = await supabase
        .from('terms')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      fetchTerms()
      alert('Term deleted successfully')
    } catch (error) {
      console.error('Error deleting term:', error)
      alert('Failed to delete term')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading terms...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Terms</h2>
        <button
          onClick={() => {
            setEditingTerm(null)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Add Term
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Academic Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Term Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {terms.map((term) => (
              <tr key={term.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {term.academic_year?.year_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {term.term_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(term.start_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(term.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {term.is_current ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Current
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {!term.is_current && (
                    <button
                      onClick={() => handleSetCurrent(term.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Set Current
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingTerm(term)
                      setShowForm(true)
                    }}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(term.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {terms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No terms found. Add your first term to get started.
          </div>
        )}
      </div>

      {showForm && (
        <TermForm
          term={editingTerm}
          onClose={() => {
            setShowForm(false)
            setEditingTerm(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingTerm(null)
            fetchTerms()
          }}
        />
      )}
    </div>
  )
}

interface TermFormProps {
  term: Term | null
  onClose: () => void
  onSuccess: () => void
}

const TermForm = ({ term, onClose, onSuccess }: TermFormProps) => {
  const [academicYears, setAcademicYears] = useState<any[]>([])
  const [formData, setFormData] = useState({
    academic_year_id: term?.academic_year_id || '',
    term_name: term?.term_name || '',
    start_date: term?.start_date || '',
    end_date: term?.end_date || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAcademicYears()
  }, [])

  const fetchAcademicYears = async () => {
    const { data } = await supabase
      .from('academic_years')
      .select('*')
      .order('start_date', { ascending: false })
    
    setAcademicYears(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (term) {
        const { error } = await supabase
          .from('terms')
          .update(formData)
          .eq('id', term.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('terms')
          .insert([formData])

        if (error) throw error
      }

      alert(`Term ${term ? 'updated' : 'created'} successfully`)
      onSuccess()
    } catch (error) {
      console.error('Error saving term:', error)
      alert('Failed to save term')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">
          {term ? 'Edit Term' : 'Add New Term'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year *
            </label>
            <select
              value={formData.academic_year_id}
              onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term Name *
            </label>
            <input
              type="text"
              value={formData.term_name}
              onChange={(e) => setFormData({ ...formData, term_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Term 1, First Term"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
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
              {loading ? 'Saving...' : term ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Assessment {
  id: string
  title: string
  assessment_type: string
  max_score: number
  weight: number
  due_date: string
}

interface Student {
  id: string
  student_id: string
  profile: {
    first_name: string
    last_name: string
  }
}

interface Score {
  student_id: string
  score: number
  remarks?: string
}

export const GradeBook = () => {
  const { user } = useAuth()
  const [subjectAssignments, setSubjectAssignments] = useState<any[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [scores, setScores] = useState<Record<string, Score>>({})
  const [existingScores, setExistingScores] = useState<any[]>([])
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSubjectAssignments()
  }, [user])

  useEffect(() => {
    if (selectedAssignment) {
      fetchAssessments()
      fetchStudents()
    }
  }, [selectedAssignment])

  useEffect(() => {
    if (selectedAssessment) {
      fetchExistingScores()
    }
  }, [selectedAssessment])

  const fetchSubjectAssignments = async () => {
    if (!user) return

    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!teacher) return

      const { data } = await supabase
        .from('subject_assignments')
        .select(`
          *,
          class:classes(class_name, grade_level),
          subject:subjects(subject_name)
        `)
        .eq('teacher_id', teacher.id)

      setSubjectAssignments(data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    }
  }

  const fetchAssessments = async () => {
    try {
      const { data } = await supabase
        .from('assessments')
        .select('*')
        .eq('subject_assignment_id', selectedAssignment)
        .order('due_date', { ascending: false })

      setAssessments(data || [])
    } catch (error) {
      console.error('Error fetching assessments:', error)
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const assignment = subjectAssignments.find(a => a.id === selectedAssignment)
      if (!assignment) return

      const { data } = await supabase
        .from('class_enrollments')
        .select(`
          student:students(
            id,
            student_id,
            profile:profiles(first_name, last_name)
          )
        `)
        .eq('class_id', assignment.class_id)
        .eq('status', 'active')

      const studentList = data?.map(d => d.student).filter(Boolean) || []
      setStudents(studentList)

      // Initialize scores
      const initialScores: Record<string, Score> = {}
      studentList.forEach(student => {
        initialScores[student.id] = {
          student_id: student.id,
          score: 0,
        }
      })
      setScores(initialScores)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingScores = async () => {
    try {
      const { data } = await supabase
        .from('assessment_scores')
        .select('*')
        .eq('assessment_id', selectedAssessment)

      setExistingScores(data || [])

      if (data && data.length > 0) {
        const existingMap: Record<string, Score> = {}
        data.forEach(record => {
          existingMap[record.student_id] = {
            student_id: record.student_id,
            score: record.score,
            remarks: record.remarks,
          }
        })
        setScores(prev => ({ ...prev, ...existingMap }))
      }
    } catch (error) {
      console.error('Error fetching scores:', error)
    }
  }

  const handleScoreChange = (studentId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score,
      },
    }))
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }))
  }

  const handleSaveScores = async () => {
    if (!selectedAssessment || !user) return

    setSaving(true)
    try {
      // Delete existing scores
      await supabase
        .from('assessment_scores')
        .delete()
        .eq('assessment_id', selectedAssessment)

      // Insert new scores
      const records = Object.values(scores).map(score => ({
        assessment_id: selectedAssessment,
        student_id: score.student_id,
        score: score.score,
        remarks: score.remarks || null,
        graded_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('assessment_scores')
        .insert(records)

      if (error) throw error

      alert('Grades saved successfully!')
      fetchExistingScores()
    } catch (error: any) {
      console.error('Error saving scores:', error)
      alert(error.message || 'Failed to save grades')
    } finally {
      setSaving(false)
    }
  }

  const calculateStats = () => {
    const assessment = assessments.find(a => a.id === selectedAssessment)
    if (!assessment) return { average: 0, highest: 0, lowest: 0, percentage: 0 }

    const scoreValues = Object.values(scores).map(s => s.score).filter(s => s > 0)
    if (scoreValues.length === 0) return { average: 0, highest: 0, lowest: 0, percentage: 0 }

    const sum = scoreValues.reduce((a, b) => a + b, 0)
    const average = sum / scoreValues.length
    const highest = Math.max(...scoreValues)
    const lowest = Math.min(...scoreValues)
    const percentage = (average / assessment.max_score) * 100

    return {
      average,
      highest,
      lowest,
      percentage,
    }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Grade Book</h2>
        <button
          onClick={() => setShowAssessmentForm(true)}
          disabled={!selectedAssignment}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          Create Assessment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class & Subject *
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose class and subject</option>
              {subjectAssignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.class?.class_name} - {assignment.subject?.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Assessment *
            </label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              disabled={!selectedAssignment}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="">Choose assessment</option>
              {assessments.map(assessment => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title} ({assessment.assessment_type}) - Max: {assessment.max_score}
                </option>
              ))}
            </select>
          </div>
        </div>

        {existingScores.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ Grades already recorded for this assessment. You can update them below.
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      {selectedAssessment && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.average.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Class Average</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">{stats.highest}</div>
            <div className="text-sm text-gray-600">Highest Score</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-red-600">{stats.lowest}</div>
            <div className="text-sm text-gray-600">Lowest Score</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.percentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Average %</div>
          </div>
        </div>
      )}

      {/* Grade Entry Table */}
      {selectedAssessment && (
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
                        Score (Max: {assessments.find(a => a.id === selectedAssessment)?.max_score})
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
                          <input
                            type="number"
                            min="0"
                            max={assessments.find(a => a.id === selectedAssessment)?.max_score}
                            step="0.5"
                            value={scores[student.id]?.score || 0}
                            onChange={(e) => handleScoreChange(student.id, parseFloat(e.target.value) || 0)}
                            className="w-24 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={scores[student.id]?.remarks || ''}
                            onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                            placeholder="Optional remarks"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSaveScores}
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Grades'}
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

      {!selectedAssignment && (
        <div className="text-center py-12 text-gray-500">
          Please select a class and subject
        </div>
      )}

      {selectedAssignment && !selectedAssessment && assessments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No assessments created yet. Click "Create Assessment" to add one.
        </div>
      )}

      {showAssessmentForm && (
        <AssessmentForm
          subjectAssignmentId={selectedAssignment}
          onClose={() => setShowAssessmentForm(false)}
          onSuccess={() => {
            setShowAssessmentForm(false)
            fetchAssessments()
          }}
        />
      )}
    </div>
  )
}

interface AssessmentFormProps {
  subjectAssignmentId: string
  onClose: () => void
  onSuccess: () => void
}

const AssessmentForm = ({ subjectAssignmentId, onClose, onSuccess }: AssessmentFormProps) => {
  const [terms, setTerms] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    assessment_type: 'test',
    max_score: 100,
    weight: 1,
    due_date: new Date().toISOString().split('T')[0],
    term_id: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    const { data } = await supabase
      .from('terms')
      .select('*')
      .order('start_date', { ascending: false })
    
    setTerms(data || [])
    if (data && data.length > 0) {
      const currentTerm = data.find(t => t.is_current)
      if (currentTerm) {
        setFormData(prev => ({ ...prev, term_id: currentTerm.id }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('assessments')
        .insert([{
          ...formData,
          subject_assignment_id: subjectAssignmentId,
        }])

      if (error) throw error

      alert('Assessment created successfully!')
      onSuccess()
    } catch (error: any) {
      console.error('Error creating assessment:', error)
      alert(error.message || 'Failed to create assessment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Create New Assessment</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Mid-Term Test, Quiz 1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Type *
              </label>
              <select
                value={formData.assessment_type}
                onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="quiz">Quiz</option>
                <option value="test">Test</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term *
              </label>
              <select
                value={formData.term_id}
                onChange={(e) => setFormData({ ...formData, term_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term.id} value={term.id}>
                    {term.term_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Score *
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Optional description"
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
              {loading ? 'Creating...' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

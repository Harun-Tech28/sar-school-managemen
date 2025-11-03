import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface AssessmentScore {
  id: string
  score: number
  remarks?: string
  assessment: {
    title: string
    max_score: number
    assessment_type: string
    due_date: string
    subject_assignment: {
      subject: {
        subject_name: string
      }
    }
    term: {
      term_name: string
    }
  }
}

interface SubjectPerformance {
  subject: string
  scores: number[]
  average: number
  grade: string
  assessmentCount: number
}

export const ResultsView = () => {
  const { user } = useAuth()
  const [scores, setScores] = useState<AssessmentScore[]>([])
  const [terms, setTerms] = useState<any[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [loading, setLoading] = useState(true)
  const [classRank, setClassRank] = useState<number | null>(null)
  const [totalStudents, setTotalStudents] = useState<number>(0)

  useEffect(() => {
    fetchTerms()
  }, [])

  useEffect(() => {
    if (selectedTerm) {
      fetchScores()
    }
  }, [selectedTerm, user])

  const fetchTerms = async () => {
    try {
      const { data } = await supabase
        .from('terms')
        .select('*')
        .order('start_date', { ascending: false })

      setTerms(data || [])
      if (data && data.length > 0) {
        // Set current term or most recent
        const currentTerm = data.find(t => t.is_current) || data[0]
        setSelectedTerm(currentTerm.id)
      }
    } catch (error) {
      console.error('Error fetching terms:', error)
    }
  }

  const fetchScores = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get student record
      const { data: student } = await supabase
        .from('students')
        .select('id, class_id')
        .eq('profile_id', user.id)
        .single()

      if (!student) return

      // Get all scores for the term
      const { data: scoresData } = await supabase
        .from('assessment_scores')
        .select(`
          *,
          assessment:assessments(
            title,
            max_score,
            assessment_type,
            due_date,
            subject_assignment:subject_assignments(
              subject:subjects(subject_name)
            ),
            term:terms(term_name)
          )
        `)
        .eq('student_id', student.id)
        .eq('assessment.term_id', selectedTerm)
        .order('assessment.due_date', { ascending: false })

      const filteredScores = scoresData?.filter(s => s.assessment?.term?.term_name) || []
      setScores(filteredScores)

      // Extract unique subjects
      const uniqueSubjects = Array.from(
        new Set(filteredScores.map(s => s.assessment.subject_assignment.subject.subject_name))
      )
      setSubjects(uniqueSubjects)

      // Calculate class rank
      await calculateClassRank(student.id, student.class_id)
    } catch (error) {
      console.error('Error fetching scores:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateClassRank = async (studentId: string, classId: string) => {
    try {
      // Get all students in the class
      const { data: classStudents } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)

      if (!classStudents) return

      setTotalStudents(classStudents.length)

      // Get all scores for all students in the term
      const { data: allScores } = await supabase
        .from('assessment_scores')
        .select(`
          student_id,
          score,
          assessment:assessments(max_score, term_id)
        `)
        .in('student_id', classStudents.map(s => s.id))
        .eq('assessment.term_id', selectedTerm)

      // Calculate average for each student
      const studentAverages: Record<string, { total: number; count: number }> = {}
      
      allScores?.forEach((score: any) => {
        if (!studentAverages[score.student_id]) {
          studentAverages[score.student_id] = { total: 0, count: 0 }
        }
        const percentage = (score.score / score.assessment.max_score) * 100
        studentAverages[score.student_id].total += percentage
        studentAverages[score.student_id].count += 1
      })

      // Calculate final averages
      const averages = Object.entries(studentAverages).map(([id, data]) => ({
        studentId: id,
        average: data.count > 0 ? data.total / data.count : 0
      }))

      // Sort by average descending
      averages.sort((a, b) => b.average - a.average)

      // Find rank
      const rank = averages.findIndex(a => a.studentId === studentId) + 1
      setClassRank(rank > 0 ? rank : null)
    } catch (error) {
      console.error('Error calculating rank:', error)
    }
  }

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    if (percentage >= 40) return 'E'
    return 'F'
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getSubjectPerformance = (): SubjectPerformance[] => {
    const subjectMap: Record<string, number[]> = {}

    scores.forEach(score => {
      const subject = score.assessment.subject_assignment.subject.subject_name
      const percentage = (score.score / score.assessment.max_score) * 100
      
      if (!subjectMap[subject]) {
        subjectMap[subject] = []
      }
      subjectMap[subject].push(percentage)
    })

    return Object.entries(subjectMap).map(([subject, percentages]) => {
      const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
      return {
        subject,
        scores: percentages,
        average,
        grade: getGradeLetter(average),
        assessmentCount: percentages.length
      }
    }).sort((a, b) => b.average - a.average)
  }

  const getOverallAverage = () => {
    if (scores.length === 0) return 0
    const total = scores.reduce((sum, score) => {
      return sum + (score.score / score.assessment.max_score) * 100
    }, 0)
    return total / scores.length
  }

  const filteredScores = selectedSubject === 'all' 
    ? scores 
    : scores.filter(s => s.assessment.subject_assignment.subject.subject_name === selectedSubject)

  const subjectPerformance = getSubjectPerformance()
  const overallAverage = getOverallAverage()

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading results...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Results</h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {terms.map(term => (
                <option key={term.id} value={term.id}>
                  {term.term_name} {term.is_current && '(Current)'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Overall Average</p>
              <p className={`text-2xl font-semibold ${getGradeColor(overallAverage)}`}>
                {overallAverage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Grade: {getGradeLetter(overallAverage)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Class Rank</p>
              <p className="text-2xl font-semibold text-gray-900">
                {classRank ? `${classRank}/${totalStudents}` : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Position</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Assessments</p>
              <p className="text-2xl font-semibold text-gray-900">{scores.length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance by Subject</h3>
        </div>
        <div className="p-6">
          {subjectPerformance.length > 0 ? (
            <div className="space-y-4">
              {subjectPerformance.map(perf => (
                <div key={perf.subject} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{perf.subject}</h4>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${getGradeColor(perf.average)}`}>
                        {perf.grade}
                      </span>
                      <p className="text-sm text-gray-500">{perf.average.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        perf.average >= 80 ? 'bg-green-600' :
                        perf.average >= 70 ? 'bg-blue-600' :
                        perf.average >= 60 ? 'bg-yellow-600' :
                        perf.average >= 50 ? 'bg-orange-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(perf.average, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {perf.assessmentCount} assessment{perf.assessmentCount !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No subject performance data available</p>
          )}
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Assessment Details</h3>
        </div>
        <div className="overflow-x-auto">
          {filteredScores.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredScores.map(score => {
                  const percentage = (score.score / score.assessment.max_score) * 100
                  const grade = getGradeLetter(percentage)
                  
                  return (
                    <tr key={score.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {score.assessment.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(score.assessment.due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {score.assessment.subject_assignment.subject.subject_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.assessment.assessment_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {score.score}/{score.assessment.max_score}
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          grade === 'A' ? 'bg-green-100 text-green-800' :
                          grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          grade === 'E' ? 'bg-red-100 text-red-800' :
                          'bg-red-200 text-red-900'
                        }`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {score.remarks || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No assessment scores available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Material {
  id: string
  title: string
  description: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  uploaded_at: string
  subject: {
    subject_name: string
  }
  teacher: {
    profile: {
      first_name: string
      last_name: string
    }
  }
}

export const MaterialsLibrary = () => {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMaterials()
  }, [user])

  const fetchMaterials = async () => {
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

      // Get all materials for the student's class
      const { data } = await supabase
        .from('materials')
        .select(`
          *,
          subject:subjects(subject_name),
          teacher:teachers(profile:profiles(first_name, last_name))
        `)
        .eq('class_id', student.class_id)
        .order('uploaded_at', { ascending: false })

      setMaterials(data || [])

      // Extract unique subjects
      const uniqueSubjects = Array.from(
        new Set(data?.map(m => m.subject.subject_name) || [])
      )
      setSubjects(uniqueSubjects)
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('video')) return '🎥'
    return '📎'
  }

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF'
    if (fileType.includes('word') || fileType.includes('document')) return 'Document'
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'Spreadsheet'
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'Presentation'
    if (fileType.includes('image')) return 'Image'
    if (fileType.includes('video')) return 'Video'
    return 'File'
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSubject = selectedSubject === 'all' || material.subject.subject_name === selectedSubject
    const matchesSearch = searchTerm === '' || 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSubject && matchesSearch
  })

  const groupedMaterials = filteredMaterials.reduce((acc, material) => {
    const subject = material.subject.subject_name
    if (!acc[subject]) {
      acc[subject] = []
    }
    acc[subject].push(material)
    return acc
  }, {} as Record<string, Material[]>)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading materials...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Learning Materials</h2>
        <div className="text-sm text-gray-600">
          {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description, or subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Subject
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

      {/* Materials by Subject */}
      {Object.keys(groupedMaterials).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedMaterials).map(([subject, subjectMaterials]) => (
            <div key={subject} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {subject} ({subjectMaterials.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {subjectMaterials.map(material => (
                  <div key={material.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-4xl flex-shrink-0">{getFileIcon(material.file_type)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {material.title}
                          </h4>
                          {material.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {material.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {material.teacher.profile.first_name} {material.teacher.profile.last_name}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              {getFileTypeLabel(material.file_type)}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                              </svg>
                              {formatFileSize(material.file_size)}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(material.uploaded_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500 font-mono break-all">
                              {material.file_name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4 flex-shrink-0">
                        <a
                          href={material.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                        >
                          View
                        </a>
                        <a
                          href={material.file_url}
                          download={material.file_name}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedSubject !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Your teachers haven\'t uploaded any materials yet.'}
          </p>
        </div>
      )}

      {/* Quick Stats */}
      {materials.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Library Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{materials.length}</div>
              <div className="text-sm text-gray-500">Total Materials</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{subjects.length}</div>
              <div className="text-sm text-gray-500">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {materials.filter(m => m.file_type.includes('pdf')).length}
              </div>
              <div className="text-sm text-gray-500">PDFs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {materials.filter(m => m.file_type.includes('video')).length}
              </div>
              <div className="text-sm text-gray-500">Videos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

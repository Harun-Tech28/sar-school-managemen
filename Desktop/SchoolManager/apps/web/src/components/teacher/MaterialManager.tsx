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
  class: {
    class_name: string
    grade_level: number
  }
  subject: {
    subject_name: string
  }
}

export const MaterialManager = () => {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [filterClass, setFilterClass] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  useEffect(() => {
    fetchTeacherData()
  }, [user])

  useEffect(() => {
    fetchMaterials()
  }, [filterClass, filterSubject])

  const fetchTeacherData = async () => {
    if (!user) return

    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!teacher) return

      // Get teacher's assignments
      const { data: assignments } = await supabase
        .from('subject_assignments')
        .select(`
          class:classes(id, class_name, grade_level),
          subject:subjects(id, subject_name)
        `)
        .eq('teacher_id', teacher.id)

      if (assignments) {
        const classMap = new Map()
        const subjectMap = new Map()
        
        assignments.forEach((a: any) => {
          if (a.class) classMap.set(a.class.id, a.class)
          if (a.subject) subjectMap.set(a.subject.id, a.subject)
        })
        
        setClasses(Array.from(classMap.values()))
        setSubjects(Array.from(subjectMap.values()))
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error)
    }
  }

  const fetchMaterials = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!teacher) return

      let query = supabase
        .from('materials')
        .select(`
          *,
          class:classes(class_name, grade_level),
          subject:subjects(subject_name)
        `)
        .eq('uploaded_by', teacher.id)
        .order('uploaded_at', { ascending: false })

      if (filterClass) {
        query = query.eq('class_id', filterClass)
      }

      if (filterSubject) {
        query = query.eq('subject_id', filterSubject)
      }

      const { data, error } = await query

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (materialId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/materials/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('materials')
          .remove([filePath])

        if (storageError) {
          console.error('Error deleting file from storage:', storageError)
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)

      if (error) throw error

      alert('Material deleted successfully!')
      fetchMaterials()
    } catch (error: any) {
      console.error('Error deleting material:', error)
      alert(error.message || 'Failed to delete material')
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Learning Materials</h2>
        <button
          onClick={() => setShowUploadForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Upload Material
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Class
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} (Grade {cls.grade_level})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Subject
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading materials...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No materials uploaded yet.</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Upload First Material
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {materials.map(material => (
              <div key={material.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-4xl">{getFileIcon(material.file_type)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {material.title}
                      </h3>
                      {material.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {material.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="font-medium">Class:</span>
                          <span className="ml-1">
                            {material.class.class_name} (Grade {material.class.grade_level})
                          </span>
                        </span>
                        <span className="flex items-center">
                          <span className="font-medium">Subject:</span>
                          <span className="ml-1">{material.subject.subject_name}</span>
                        </span>
                        <span className="flex items-center">
                          <span className="font-medium">Size:</span>
                          <span className="ml-1">{formatFileSize(material.file_size)}</span>
                        </span>
                        <span className="flex items-center">
                          <span className="font-medium">Uploaded:</span>
                          <span className="ml-1">
                            {new Date(material.uploaded_at).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 font-mono">
                          {material.file_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      View
                    </a>
                    <a
                      href={material.file_url}
                      download={material.file_name}
                      className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(material.id, material.file_url)}
                      className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadForm && (
        <MaterialUploadForm
          classes={classes}
          subjects={subjects}
          onClose={() => setShowUploadForm(false)}
          onSuccess={() => {
            setShowUploadForm(false)
            fetchMaterials()
          }}
        />
      )}
    </div>
  )
}

interface MaterialUploadFormProps {
  classes: any[]
  subjects: any[]
  onClose: () => void
  onSuccess: () => void
}

const MaterialUploadForm = ({ classes, subjects, onClose, onSuccess }: MaterialUploadFormProps) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  if (!user) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (selectedFile.size > maxSize) {
      alert('File size must be less than 10MB')
      e.target.value = ''
      return
    }

    setFile(selectedFile)
    
    // Auto-fill title if empty
    if (!formData.title) {
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '')
      setFormData(prev => ({ ...prev, title: fileName }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      alert('Please select a file to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!teacher) throw new Error('Teacher not found')

      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${teacher.id}/${fileName}`

      // Upload file to storage
      setUploadProgress(30)
      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      setUploadProgress(60)
      const { data: urlData } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath)

      // Save material metadata to database
      setUploadProgress(80)
      const { error: dbError } = await supabase
        .from('materials')
        .insert([{
          title: formData.title,
          description: formData.description || null,
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: teacher.id,
        }])

      if (dbError) throw dbError

      setUploadProgress(100)
      alert('Material uploaded successfully!')
      onSuccess()
    } catch (error: any) {
      console.error('Error uploading material:', error)
      alert(error.message || 'Failed to upload material')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Upload Learning Material</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mp3"
              required
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Max file size: 10MB. Supported formats: PDF, Word, PowerPoint, Excel, Images, Videos
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Chapter 5 Notes"
              required
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Optional description of the material"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class *
            </label>
            <select
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
              disabled={uploading}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} (Grade {cls.grade_level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
              disabled={uploading}
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-600">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

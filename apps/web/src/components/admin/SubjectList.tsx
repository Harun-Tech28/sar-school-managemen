import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Subject {
  id: string;
  subject_name: string;
  subject_code: string;
  description: string | null;
  created_at: string;
}

export const SubjectList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const queryClient = useQueryClient();

  // Fetch subjects
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('subject_name');

      if (error) throw error;
      return data as Subject[];
    },
  });

  // Delete subject mutation
  const deleteMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', subjectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const filteredSubjects = subjects?.filter((subject) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      subject.subject_name.toLowerCase().includes(searchLower) ||
      subject.subject_code.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleDelete = async (subjectId: string, subjectName: string) => {
    if (confirm(`Are you sure you want to delete ${subjectName}?`)) {
      deleteMutation.mutate(subjectId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubject(null);
  };

  if (showForm) {
    return <SubjectForm subject={editingSubject} onClose={handleCloseForm} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subjects</h2>
          <p className="text-gray-600 mt-1">Manage school subjects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Add Subject
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading subjects...</p>
          </div>
        ) : filteredSubjects && filteredSubjects.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subject.subject_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{subject.subject_code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{subject.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id, subject.subject_name)}
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
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No subjects found matching your search.' : 'No subjects yet. Add your first subject!'}
          </div>
        )}
      </div>
    </div>
  );
};

// Subject Form Component
interface SubjectFormProps {
  subject: Subject | null;
  onClose: () => void;
}

const SubjectForm = ({ subject, onClose }: SubjectFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    subjectName: subject?.subject_name || '',
    subjectCode: subject?.subject_code || '',
    description: subject?.description || '',
  });
  const [error, setError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (subject) {
        const { error } = await supabase
          .from('subjects')
          .update({
            subject_name: formData.subjectName,
            subject_code: formData.subjectCode,
            description: formData.description || null,
          })
          .eq('id', subject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('subjects').insert({
          subject_name: formData.subjectName,
          subject_code: formData.subjectCode,
          description: formData.description || null,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to save subject');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.subjectName || !formData.subjectCode) {
      setError('Please fill in all required fields');
      return;
    }

    saveMutation.mutate();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {subject ? 'Edit Subject' : 'Add New Subject'}
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
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.subjectName}
              onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Mathematics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., MATH101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Optional description..."
            />
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
              {saveMutation.isPending ? 'Saving...' : subject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

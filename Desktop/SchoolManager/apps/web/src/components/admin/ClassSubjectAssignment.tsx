import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const ClassSubjectAssignment = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('current');
  const queryClient = useQueryClient();

  // Fetch academic years
  const { data: academicYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch class-subject assignments
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['class-subjects', selectedYear],
    queryFn: async () => {
      let query = supabase
        .from('class_subjects')
        .select(`
          id,
          class:classes(id, class_name, grade_level),
          subject:subjects(id, subject_name, subject_code),
          teacher:teachers(
            id,
            teacher_id,
            profile:profiles(first_name, last_name)
          ),
          academic_year:academic_years(id, year_name, is_current)
        `)
        .order('created_at', { ascending: false });

      if (selectedYear === 'current') {
        // Get current academic year
        const { data: currentYear } = await supabase
          .from('academic_years')
          .select('id')
          .eq('is_current', true)
          .single();

        if (currentYear) {
          query = query.eq('academic_year_id', currentYear.id);
        }
      } else if (selectedYear !== 'all') {
        query = query.eq('academic_year_id', selectedYear);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as any[];
    },
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase.from('class_subjects').delete().eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
    },
  });

  const handleDelete = async (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      deleteMutation.mutate(assignmentId);
    }
  };

  // Group assignments by class
  const groupedAssignments = assignments?.reduce((acc, assignment: any) => {
    const className = assignment.class.class_name;
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(assignment);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class-Subject Assignments</h2>
          <p className="text-gray-600 mt-1">Assign teachers to class-subject combinations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + New Assignment
        </button>
      </div>

      {/* Year Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="current">Current Year</option>
          <option value="all">All Years</option>
          {academicYears?.map((year) => (
            <option key={year.id} value={year.id}>
              {year.year_name}
            </option>
          ))}
        </select>
      </div>

      {/* Assignments */}
      {showForm ? (
        <AssignmentForm onClose={() => setShowForm(false)} />
      ) : isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading assignments...</p>
        </div>
      ) : groupedAssignments && Object.keys(groupedAssignments).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedAssignments).map(([className, classAssignments]) => (
            <div key={className} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">{className}</h3>
              </div>
              <div className="p-6">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Subject</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Teacher</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Academic Year</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(classAssignments as any[]).map((assignment: any) => (
                      <tr key={assignment.id} className="border-b last:border-b-0">
                        <td className="py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.subject.subject_name}
                          </div>
                          <div className="text-xs text-gray-500">{assignment.subject.subject_code}</div>
                        </td>
                        <td className="py-3">
                          {assignment.teacher ? (
                            <div>
                              <div className="text-sm text-gray-900">
                                {assignment.teacher.profile.first_name} {assignment.teacher.profile.last_name}
                              </div>
                              <div className="text-xs text-gray-500">{assignment.teacher.teacher_id}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not assigned</span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="text-sm text-gray-900">{assignment.academic_year.year_name}</div>
                          {assignment.academic_year.is_current && (
                            <span className="text-xs text-green-600">Current</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="text-sm text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No assignments found. Create your first assignment!
        </div>
      )}
    </div>
  );
};

// Assignment Form Component
interface AssignmentFormProps {
  onClose: () => void;
}

const AssignmentForm = ({ onClose }: AssignmentFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    academicYearId: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('classes').select('*').order('class_name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subjects').select('*').order('subject_name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch teachers
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, teacher_id, profile:profiles(first_name, last_name)')
        .order('teacher_id');

      if (error) throw error;
      return data;
    },
  });

  // Fetch academic years
  const { data: academicYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('class_subjects').insert({
        class_id: formData.classId,
        subject_id: formData.subjectId,
        teacher_id: formData.teacherId || null,
        academic_year_id: formData.academicYearId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create assignment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.classId || !formData.subjectId || !formData.academicYearId) {
      setError('Please fill in all required fields');
      return;
    }

    saveMutation.mutate();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">New Assignment</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a class</option>
            {classes?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a subject</option>
            {subjects?.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name} ({subject.subject_code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teacher (Optional)</label>
          <select
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">No teacher assigned</option>
            {teachers?.map((teacher: any) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.profile.first_name} {teacher.profile.last_name} ({teacher.teacher_id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.academicYearId}
            onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select academic year</option>
            {academicYears?.map((year) => (
              <option key={year.id} value={year.id}>
                {year.year_name} {year.is_current && '(Current)'}
              </option>
            ))}
          </select>
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
            {saveMutation.isPending ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

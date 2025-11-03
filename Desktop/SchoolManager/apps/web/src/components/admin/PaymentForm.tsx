import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  id: string;
  student_id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
  class: {
    class_name: string;
  };
  class_enrollments?: Array<{
    class: {
      class_name: string;
    };
  }>;
}

interface Term {
  id: string;
  term_name: string;
  academic_year: {
    year_name: string;
  };
}

interface PaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    payment_reference: '',
    term_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchTerms();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            s.student_id.toLowerCase().includes(query) ||
            s.profile.first_name.toLowerCase().includes(query) ||
            s.profile.last_name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          profile:profiles(first_name, last_name),
          class_enrollments!inner(
            class:classes(class_name)
          )
        `)
        .eq('status', 'active')
        .eq('class_enrollments.status', 'active')
        .order('student_id');

      if (error) throw error;
      
      // Transform the data to flatten the class information
      const transformedData = data?.map(student => ({
        ...student,
        class: student.class_enrollments?.[0]?.class || { class_name: 'No Class' }
      })) || [];
      
      setStudents(transformedData as any);
      setFilteredStudents(transformedData as any);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('terms')
        .select(`
          id,
          term_name,
          academic_year:academic_years(year_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTerms(data as any || []);
    } catch (err) {
      console.error('Error fetching terms:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.student_id) {
        throw new Error('Please select a student');
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (!formData.payment_date) {
        throw new Error('Please select a payment date');
      }

      // Generate payment reference if not provided
      const reference = formData.payment_reference || 
        `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Insert payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          student_id: formData.student_id,
          amount: parseFloat(formData.amount),
          payment_date: formData.payment_date,
          payment_method: formData.payment_method,
          payment_reference: reference,
          payment_gateway: 'manual',
          status: 'completed',
          term_id: formData.term_id || null,
          recorded_by: user?.id
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // TODO: Generate receipt (will be implemented in Task 10.5)
      console.log('Payment recorded successfully:', payment);

      // Reset form
      setFormData({
        student_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        payment_reference: '',
        term_id: '',
        notes: ''
      });
      setSearchQuery('');

      if (onSuccess) {
        onSuccess();
      }

      alert('Payment recorded successfully!');
    } catch (err: any) {
      console.error('Error recording payment:', err);
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedStudent = students.find(s => s.id === formData.student_id);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Search by student ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
          />
          <select
            name="student_id"
            value={formData.student_id}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a student</option>
            {filteredStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.student_id} - {student.profile.first_name} {student.profile.last_name} ({student.class.class_name})
              </option>
            ))}
          </select>
          {selectedStudent && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Selected:</span> {selectedStudent.profile.first_name} {selectedStudent.profile.last_name}
              </p>
              <p className="text-sm text-gray-600">
                ID: {selectedStudent.student_id} | Class: {selectedStudent.class.class_name}
              </p>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (GH₵) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleInputChange}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card Payment</option>
          </select>
        </div>

        {/* Payment Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Reference (Optional)
          </label>
          <input
            type="text"
            name="payment_reference"
            value={formData.payment_reference}
            onChange={handleInputChange}
            placeholder="Auto-generated if left empty"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to auto-generate a reference number
          </p>
        </div>

        {/* Term */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Term (Optional)
          </label>
          <select
            name="term_id"
            value={formData.term_id}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a term</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.term_name} - {term.academic_year.year_name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            placeholder="Add any additional notes about this payment..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

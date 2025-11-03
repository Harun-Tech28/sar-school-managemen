import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_reference: string;
  payment_gateway: string;
  status: string;
  receipt_url: string | null;
  student: {
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
  };
  term: {
    term_name: string;
    academic_year: {
      year_name: string;
    };
  } | null;
  recorded_by_profile: {
    first_name: string;
    last_name: string;
  } | null;
}

export const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    paymentMethod: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_date,
          payment_method,
          payment_reference,
          payment_gateway,
          status,
          receipt_url,
          student:students(
            student_id,
            profile:profiles(first_name, last_name),
            class_enrollments!inner(
              class:classes(class_name)
            )
          ),
          term:terms(
            term_name,
            academic_year:academic_years(year_name)
          ),
          recorded_by_profile:profiles!payments_recorded_by_fkey(
            first_name,
            last_name
          )
        `)
        .order('payment_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Transform the data to flatten the class information
      const transformedData = data?.map((payment: any) => ({
        ...payment,
        student: {
          ...payment.student,
          class: payment.student?.class_enrollments?.[0]?.class || { class_name: 'No Class' }
        }
      })) || [];
      
      setPayments(transformedData as any);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        payment.student.student_id.toLowerCase().includes(query) ||
        payment.student.profile.first_name.toLowerCase().includes(query) ||
        payment.student.profile.last_name.toLowerCase().includes(query) ||
        payment.payment_reference.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Payment method filter
    if (filters.paymentMethod && payment.payment_method !== filters.paymentMethod) {
      return false;
    }

    // Status filter
    if (filters.status && payment.status !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom && payment.payment_date < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && payment.payment_date > filters.dateTo) {
      return false;
    }

    return true;
  });

  const totalAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      mobile_money: 'Mobile Money',
      card: 'Card Payment'
    };
    return labels[method] || method;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return `GH₵ ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleExport = () => {
    // Convert to CSV
    const headers = ['Date', 'Student ID', 'Student Name', 'Class', 'Amount', 'Method', 'Reference', 'Status', 'Term'];
    const rows = filteredPayments.map(p => [
      p.payment_date,
      p.student.student_id,
      `${p.student.profile.first_name} ${p.student.profile.last_name}`,
      p.student.class.class_name,
      p.amount,
      p.payment_method,
      p.payment_reference,
      p.status,
      p.term ? `${p.term.term_name} - ${p.term.academic_year.year_name}` : 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{filteredPayments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {filteredPayments.filter(p => p.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search student or reference..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Methods</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setFilters({ searchQuery: '', paymentMethod: '', status: '', dateFrom: '', dateTo: '' })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Term
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No payment records found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.student.profile.first_name} {payment.student.profile.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{payment.student.student_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.student.class.class_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(payment.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.payment_reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.term ? payment.term.term_name : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

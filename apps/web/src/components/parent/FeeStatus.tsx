import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PaymentModal } from './PaymentModal';

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_reference: string;
  payment_gateway: string;
  status: string;
  receipt_url: string | null;
  term: {
    term_name: string;
    academic_year: {
      year_name: string;
    };
  } | null;
}

interface FeeStructure {
  id: string;
  fee_type: string;
  amount: number;
  description: string | null;
  term: {
    term_name: string;
    academic_year: {
      year_name: string;
    };
  } | null;
}

interface FeeStatusProps {
  studentId: string;
}

export const FeeStatus: React.FC<FeeStatusProps> = ({ studentId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [terms, setTerms] = useState<any[]>([]);

  useEffect(() => {
    fetchFeeData();
    fetchTerms();
  }, [studentId]);

  const fetchTerms = async () => {
    try {
      const { data: termsData, error: termsError } = await supabase
        .from('terms')
        .select(`
          id,
          term_name,
          academic_year:academic_years(year_name)
        `)
        .order('created_at', { ascending: false });

      if (termsError) throw termsError;
      setTerms(termsData || []);
      
      // Set the most recent term as default
      if (termsData && termsData.length > 0) {
        setSelectedTerm(termsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching terms:', err);
      setError('Failed to load terms');
    }
  };

  

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student's class to get fee structures
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('class_id')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Fetch payment history
      let query = supabase
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
          term:terms(
            term_name,
            academic_year:academic_years(year_name)
          )
        `)
        .eq('student_id', studentId);
      
      if (selectedTerm) {
        query = query.eq('term_id', selectedTerm);
      }

      const { data: paymentsData, error: paymentsError } = await query
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch fee structures for the student's class
      const { data: feesData, error: feesError } = await supabase
        .from('fee_structures')
        .select(`
          id,
          fee_type,
          amount,
          description,
          term:terms(
            term_name,
            academic_year:academic_years(year_name)
          )
        `)
        .eq('class_id', studentData.class_id)
        .order('created_at', { ascending: false });

      if (feesError) throw feesError;

      setPayments(paymentsData as any || []);
      setFeeStructures(feesData as any || []);
    } catch (err) {
      console.error('Error fetching fee data:', err);
      setError('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const calculateOutstandingBalance = () => {
    const totalFees = feeStructures.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    return totalFees - totalPaid;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      mobile_money: 'Mobile Money',
      card: 'Card Payment'
    };
    return labels[method] || method;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      failed: 'text-red-600 bg-red-100',
      refunded: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
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

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleQuickPay = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchFeeData(); // Refresh the fee data
  };

  const handleDownloadReceipt = (receiptUrl: string) => {
    window.open(receiptUrl, '_blank');
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

  const outstandingBalance = calculateOutstandingBalance();
  const isOverdue = outstandingBalance > 0;

  return (
    <div className="space-y-6">
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          amount={outstandingBalance}
          studentId={studentId}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Term Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Term
        </label>
        <select
          value={selectedTerm}
          onChange={(e) => {
            setSelectedTerm(e.target.value);
            fetchFeeData();
          }}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Terms</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.term_name} - {term.academic_year.year_name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Outstanding Balance Card */}
      <div className={`rounded-lg p-6 ${isOverdue ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Outstanding Balance</h3>
            <p className={`text-3xl font-bold mt-2 ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(outstandingBalance)}
            </p>
            {isOverdue && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Payment overdue. Please settle your balance.
              </p>
            )}
          </div>
          {isOverdue && (
            <button
              onClick={handleQuickPay}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Pay Now
            </button>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Fees</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {formatCurrency(feeStructures.reduce((sum, fee) => sum + Number(fee.amount), 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Paid</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {formatCurrency(payments
              .filter(p => p.status === 'completed')
              .reduce((sum, p) => sum + Number(p.amount), 0)
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Payment Progress</h3>
          <div className="mt-2">
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{
                    width: `${Math.min(
                      (payments
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + Number(p.amount), 0) /
                        feeStructures.reduce((sum, fee) => sum + Number(fee.amount), 0)) * 100,
                      100
                    )}%`
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                ></div>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-600">
              {Math.round(
                (payments
                  .filter(p => p.status === 'completed')
                  .reduce((sum, p) => sum + Number(p.amount), 0) /
                  feeStructures.reduce((sum, fee) => sum + Number(fee.amount), 0)) * 100
              )}% Paid
            </p>
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Structure</h3>
        {feeStructures.length === 0 ? (
          <p className="text-gray-500">No fee structure defined for this class.</p>
        ) : (
          <div className="space-y-3">
            {feeStructures.map((fee) => (
              <div key={fee.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{fee.fee_type}</p>
                  {fee.description && (
                    <p className="text-sm text-gray-500">{fee.description}</p>
                  )}
                  {fee.term && (
                    <p className="text-xs text-gray-400 mt-1">
                      {fee.term.term_name} - {fee.term.academic_year.year_name}
                    </p>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(Number(fee.amount))}</p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
              <p className="font-bold text-gray-900">Total Fees</p>
              <p className="font-bold text-gray-900">
                {formatCurrency(feeStructures.reduce((sum, fee) => sum + Number(fee.amount), 0))}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        {payments.length === 0 ? (
          <p className="text-gray-500">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Term
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.payment_reference || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.term ? `${payment.term.term_name}` : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(payment.amount))}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {payment.receipt_url ? (
                        <button
                          onClick={() => handleDownloadReceipt(payment.receipt_url!)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Download
                        </button>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Paid</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatCurrency(
                payments
                  .filter(p => p.status === 'completed')
                  .reduce((sum, p) => sum + Number(p.amount), 0)
              )}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Fees</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(feeStructures.reduce((sum, fee) => sum + Number(fee.amount), 0))}
            </p>
          </div>
          <div className={`rounded-lg p-4 ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-600">Balance</p>
            <p className={`text-2xl font-bold mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              {formatCurrency(outstandingBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

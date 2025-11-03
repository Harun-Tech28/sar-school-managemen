import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateAndStoreReceipt } from '@/utils/receiptGenerator';
import { Payment } from '@/types';

interface PaymentModalProps {
  amount: number;
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  amount,
  studentId,
  onClose,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'bank_transfer'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate a unique payment reference
      const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Determine payment gateway and get payment URL
      let paymentUrl: string;
      let paymentGateway: string;
      
      switch (paymentMethod) {
        case 'card': {
          paymentGateway = 'paystack';
          // Call Paystack serverless function
          const { data: paystackData, error: paystackError } = await supabase.functions.invoke('paystack-payment', {
            body: { amount, studentId, reference: paymentReference }
          });
          if (paystackError) throw paystackError;
          paymentUrl = paystackData.authorization_url;
          break;
        }

        case 'mobile_money': {
          paymentGateway = 'mtn_momo';
          // Call MTN MoMo serverless function
          const { data: momoData, error: momoError } = await supabase.functions.invoke('mtn-momo-payment', {
            body: { amount, studentId, reference: paymentReference }
          });
          if (momoError) throw momoError;
          paymentUrl = momoData.payment_url;
          break;
        }

        case 'bank_transfer': {
          paymentGateway = 'hubtel';
          // Call Hubtel serverless function
          const { data: hubtelData, error: hubtelError } = await supabase.functions.invoke('hubtel-payment', {
            body: { amount, studentId, reference: paymentReference }
          });
          if (hubtelError) throw hubtelError;
          paymentUrl = hubtelData.checkout_url;
          break;
        }

        default:
          throw new Error('Invalid payment method');
      }

      // Create pending payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          student_id: studentId,
          amount,
          payment_date: new Date().toISOString(),
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_gateway: paymentGateway,
          status: 'pending'
        })
        .select();

      if (paymentError) throw paymentError;

      // Generate receipt for completed payments
      // Generate receipt for the payment
      const payment = paymentData?.[0] as Payment;
      if (payment) {
        try {
          await generateAndStoreReceipt(payment, studentId);
        } catch (err) {
          console.error('Error generating receipt:', err);
          // Continue even if receipt generation fails
        }
      }

      // Open payment URL in new window
      window.open(paymentUrl, '_blank');
      onSuccess();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Make Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Amount to pay:</p>
            <p className="text-2xl font-bold text-gray-900">GH₵ {amount.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border rounded-lg text-center ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Card Payment
              </button>
              <button
                onClick={() => setPaymentMethod('mobile_money')}
                className={`p-3 border rounded-lg text-center ${
                  paymentMethod === 'mobile_money'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Mobile Money
              </button>
              <button
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3 border rounded-lg text-center ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Bank Transfer
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {loading ? (
              <>
                <span className="opacity-0">Proceed to Payment</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </div>
              </>
            ) : (
              'Proceed to Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
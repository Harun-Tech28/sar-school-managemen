import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';

interface QuickStatsWidgetProps {
  userRole: string;
}

export const QuickStatsWidget = ({ userRole }: QuickStatsWidgetProps) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'attendance' | 'performance' | 'payments'>('attendance');

  useEffect(() => {
    fetchStats();
  }, [userRole]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      if (userRole === 'admin') {
        // Fetch admin stats
        const [attendanceRes, , paymentsRes] = await Promise.all([
          supabase.from('attendance').select('status, date').gte('date', getLastWeekDate()),
          supabase.from('grades').select('score, created_at').gte('created_at', getLastMonthDate()),
          supabase.from('payments').select('amount, payment_date, status').gte('payment_date', getLastMonthDate()),
        ]);

        // Process attendance data
        const attendanceByDay = processAttendanceData(attendanceRes.data || []);
        
        // Process payment data
        const paymentsByWeek = processPaymentData(paymentsRes.data || []);

        setStats({
          attendance: attendanceByDay,
          payments: paymentsByWeek,
          totalStudents: 0,
          totalRevenue: paymentsRes.data?.reduce((sum, p) => sum + (p.status === 'completed' ? Number(p.amount) : 0), 0) || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLastWeekDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  };

  const getLastMonthDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  };

  const processAttendanceData = (data: any[]) => {
    const dayMap: Record<string, { present: number; absent: number; late: number }> = {};
    
    data.forEach((record) => {
      const day = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (!dayMap[day]) {
        dayMap[day] = { present: 0, absent: 0, late: 0 };
      }
      if (record.status === 'present') dayMap[day].present++;
      else if (record.status === 'absent') dayMap[day].absent++;
      else if (record.status === 'late') dayMap[day].late++;
    });

    return Object.entries(dayMap).map(([day, counts]) => ({
      day,
      ...counts,
    }));
  };

  const processPaymentData = (data: any[]) => {
    const weekMap: Record<string, number> = {};
    
    data.forEach((payment) => {
      if (payment.status === 'completed') {
        const week = `Week ${Math.ceil(new Date(payment.payment_date).getDate() / 7)}`;
        weekMap[week] = (weekMap[week] || 0) + Number(payment.amount);
      }
    });

    return Object.entries(weekMap).map(([week, amount]) => ({
      week,
      amount,
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">📊 Quick Analytics</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveChart('attendance')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeChart === 'attendance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveChart('payments')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeChart === 'payments'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Payments
            </button>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {activeChart === 'attendance' && stats?.attendance && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Weekly Attendance Trends</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.attendance}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="late" fill="#f59e0b" name="Late" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'payments' && stats?.payments && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Monthly Payment Collection</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.payments}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => `GH₵ ${value}`} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} name="Amount (GH₵)" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Total Revenue:</span> GH₵ {stats.totalRevenue?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

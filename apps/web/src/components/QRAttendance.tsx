import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface QRAttendanceProps {
  classId: string;
  date?: string;
}

export const QRAttendanceGenerator: React.FC<QRAttendanceProps> = ({ 
  classId, 
  date = new Date().toISOString().split('T')[0] 
}) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        if (expiresAt && new Date() > expiresAt) {
          setIsActive(false);
          setQrCode('');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive, expiresAt]);

  const generateQRSession = async () => {
    try {
      // Generate unique session ID
      const newSessionId = `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Set expiration (5 minutes from now)
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 5);

      // Create QR data
      const qrData = {
        sessionId: newSessionId,
        classId,
        date,
        expiresAt: expires.toISOString()
      };

      // Generate QR code URL (using a QR code API)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`;

      setSessionId(newSessionId);
      setQrCode(qrCodeUrl);
      setExpiresAt(expires);
      setIsActive(true);
      setScannedCount(0);

      // Store session in database
      await supabase.from('attendance_sessions').insert({
        session_id: newSessionId,
        class_id: classId,
        date,
        expires_at: expires.toISOString(),
        status: 'active'
      });

      // Start listening for scans
      listenForScans(newSessionId);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const listenForScans = (sessionId: string) => {
    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`attendance-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'attendance',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setScannedCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const stopSession = async () => {
    try {
      if (sessionId) {
        await supabase
          .from('attendance_sessions')
          .update({ status: 'closed' })
          .eq('session_id', sessionId);
      }
      setIsActive(false);
      setQrCode('');
      setSessionId('');
    } catch (err) {
      console.error('Error stopping session:', err);
    }
  };

  const getTimeRemaining = () => {
    if (!expiresAt) return '0:00';
    const diff = expiresAt.getTime() - new Date().getTime();
    if (diff <= 0) return '0:00';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <span className="text-3xl mr-2">📱</span>
          QR Code Attendance
        </h2>
        <p className="text-gray-600 mb-6">
          Students scan this code to mark attendance
        </p>

        {!isActive ? (
          <button
            onClick={generateQRSession}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            🎯 Generate QR Code
          </button>
        ) : (
          <div className="space-y-6">
            {/* QR Code Display */}
            <div className="relative inline-block">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border-4 border-blue-200">
                <img
                  src={qrCode}
                  alt="Attendance QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl border-4 border-blue-500 animate-pulse"></div>
            </div>

            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                <div className="text-3xl font-bold text-green-600">
                  {scannedCount}
                </div>
                <div className="text-sm text-gray-600">Students Scanned</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                <div className="text-3xl font-bold text-orange-600">
                  {getTimeRemaining()}
                </div>
                <div className="text-sm text-gray-600">Time Remaining</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-gray-900 mb-2">📋 Instructions:</h4>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Students open the mobile app</li>
                <li>Tap "Scan Attendance"</li>
                <li>Point camera at this QR code</li>
                <li>Attendance is marked automatically</li>
              </ol>
            </div>

            {/* Stop Button */}
            <button
              onClick={stopSession}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              ⏹️ Stop Session
            </button>

            {/* Session ID */}
            <div className="text-xs text-gray-500">
              Session ID: {sessionId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// QR Scanner Component (for students)
export const QRAttendanceScanner: React.FC<{ studentId: string }> = ({ studentId }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const handleScan = async (qrData: string) => {
    try {
      const data = JSON.parse(qrData);
      
      // Verify session is still valid
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('session_id', data.sessionId)
        .eq('status', 'active')
        .single();

      if (sessionError || !session) {
        throw new Error('Invalid or expired QR code');
      }

      // Check if already scanned
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', data.date)
        .eq('session_id', data.sessionId)
        .single();

      if (existing) {
        throw new Error('You have already marked attendance');
      }

      // Mark attendance
      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert({
          student_id: studentId,
          class_id: data.classId,
          date: data.date,
          status: 'present',
          session_id: data.sessionId,
          marked_at: new Date().toISOString()
        });

      if (attendanceError) throw attendanceError;

      setResult('success');
      setMessage('✅ Attendance marked successfully!');
      
      // Show confetti or celebration
      setTimeout(() => {
        setResult(null);
        setScanning(false);
      }, 3000);
    } catch (err: any) {
      setResult('error');
      setMessage(err.message || 'Failed to mark attendance');
      setTimeout(() => {
        setResult(null);
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          📸 Scan Attendance
        </h2>

        {!scanning && !result && (
          <button
            onClick={() => setScanning(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            📱 Open Scanner
          </button>
        )}

        {scanning && !result && (
          <div className="space-y-4">
            <div className="w-64 h-64 mx-auto bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-white">Camera View</p>
              {/* Integrate actual camera/QR scanner library here */}
            </div>
            <button
              onClick={() => setScanning(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

        {result && (
          <div className={`
            p-6 rounded-xl text-white text-lg font-semibold
            ${result === 'success' ? 'bg-green-500' : 'bg-red-500'}
          `}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

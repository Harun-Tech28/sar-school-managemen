import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Streak {
  type: 'attendance' | 'assignment' | 'performance';
  current: number;
  longest: number;
  lastUpdated: string;
  icon: string;
  color: string;
}

interface StreakTrackerProps {
  studentId: string;
  compact?: boolean;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ 
  studentId, 
  compact = false 
}) => {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchStreaks();
  }, [studentId]);

  const fetchStreaks = async () => {
    try {
      setLoading(true);

      // Fetch attendance streak
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(100);

      const attendanceStreak = calculateAttendanceStreak(attendanceData || []);

      // Fetch assignment streak (placeholder - implement when assignments table exists)
      const assignmentStreak = {
        type: 'assignment' as const,
        current: 0,
        longest: 0,
        lastUpdated: new Date().toISOString(),
        icon: '📝',
        color: 'blue'
      };

      // Fetch performance streak (placeholder)
      const performanceStreak = {
        type: 'performance' as const,
        current: 0,
        longest: 0,
        lastUpdated: new Date().toISOString(),
        icon: '⭐',
        color: 'purple'
      };

      setStreaks([attendanceStreak, assignmentStreak, performanceStreak]);

      // Show celebration if any streak is milestone
      if (attendanceStreak.current % 10 === 0 && attendanceStreak.current > 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch (err) {
      console.error('Error fetching streaks:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceStreak = (attendanceData: any[]): Streak => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort by date descending
    const sorted = [...attendanceData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate current streak
    for (const record of sorted) {
      if (record.status === 'present') {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (const record of attendanceData) {
      if (record.status === 'present') {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      type: 'attendance',
      current: currentStreak,
      longest: longestStreak,
      lastUpdated: sorted[0]?.date || new Date().toISOString(),
      icon: '🔥',
      color: 'orange'
    };
  };

  const getStreakMessage = (streak: Streak) => {
    if (streak.current === 0) return 'Start your streak today!';
    if (streak.current < 5) return 'Keep it up!';
    if (streak.current < 10) return 'You\'re on fire!';
    if (streak.current < 20) return 'Amazing streak!';
    return 'Legendary streak!';
  };

  const getStreakColor = (type: string) => {
    const colors = {
      attendance: 'from-orange-400 to-red-500',
      assignment: 'from-blue-400 to-indigo-500',
      performance: 'from-purple-400 to-pink-500'
    };
    return colors[type as keyof typeof colors] || 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {streaks.map((streak) => (
          <div
            key={streak.type}
            className={`
              relative bg-gradient-to-br ${getStreakColor(streak.type)}
              rounded-lg p-4 text-white shadow-lg
              transform transition-all duration-300 hover:scale-105
            `}
          >
            <div className="text-3xl mb-2">{streak.icon}</div>
            <div className="text-2xl font-bold">{streak.current}</div>
            <div className="text-xs opacity-90 capitalize">{streak.type}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-8xl animate-bounce">
            🎉
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold flex items-center">
          🔥 Your Streaks
        </h2>
        <p className="text-white/80 mt-1">Keep the momentum going!</p>
      </div>

      {/* Streak Cards */}
      {streaks.map((streak) => (
        <div
          key={streak.type}
          className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          <div className={`h-2 bg-gradient-to-r ${getStreakColor(streak.type)}`}></div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{streak.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 capitalize">
                    {streak.type} Streak
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getStreakMessage(streak)}
                  </p>
                </div>
              </div>
            </div>

            {/* Streak Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className={`text-4xl font-bold bg-gradient-to-r ${getStreakColor(streak.type)} bg-clip-text text-transparent`}>
                  {streak.current}
                </div>
                <div className="text-sm text-gray-600 mt-1">Current Streak</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-4xl font-bold text-gray-700">
                  {streak.longest}
                </div>
                <div className="text-sm text-gray-600 mt-1">Longest Streak</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Next Milestone</span>
                <span>{Math.ceil(streak.current / 10) * 10} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${getStreakColor(streak.type)} transition-all duration-500`}
                  style={{ width: `${(streak.current % 10) * 10}%` }}
                ></div>
              </div>
            </div>

            {/* Milestones */}
            {streak.current >= 10 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {[10, 20, 30, 50, 100].map((milestone) => (
                  <div
                    key={milestone}
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${streak.longest >= milestone 
                        ? `bg-gradient-to-r ${getStreakColor(streak.type)} text-white` 
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {milestone} days {streak.longest >= milestone && '✓'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">💪</div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Keep Going!</h4>
            <p className="text-sm text-gray-700">
              Consistency is key to success. Every day counts towards building great habits!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Streak Widget for Dashboard
export const StreakWidget: React.FC<{ studentId: string }> = ({ studentId }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        🔥 Streaks
      </h3>
      <StreakTracker studentId={studentId} compact={true} />
    </div>
  );
};

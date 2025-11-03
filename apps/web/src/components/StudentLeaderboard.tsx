import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  student_id: string;
  student_name: string;
  class_name: string;
  average_score: number;
  rank: number;
  total_assessments: number;
  attendance_rate: number;
  profile_image?: string;
  trend: 'up' | 'down' | 'same';
}

interface StudentLeaderboardProps {
  classId?: string;
  subjectId?: string;
  termId?: string;
  view?: 'weekly' | 'monthly' | 'termly';
  limit?: number;
  showPrivacy?: boolean;
}

export const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({
  classId,
  subjectId,
  termId,
  view = 'termly',
  limit = 10,
  showPrivacy = true
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(showPrivacy);

  useEffect(() => {
    fetchLeaderboard();
  }, [classId, subjectId, termId, view]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Build query based on filters
      let query = supabase
        .from('grades')
        .select(`
          student:students(
            id,
            student_id,
            profile:profiles(first_name, last_name)
          ),
          score,
          assessment:assessments(
            class_id,
            subject_id,
            term_id
          )
        `);

      if (classId) query = query.eq('assessment.class_id', classId);
      if (subjectId) query = query.eq('assessment.subject_id', subjectId);
      if (termId) query = query.eq('assessment.term_id', termId);

      const { data: gradesData, error } = await query;

      if (error) throw error;

      // Calculate averages and rankings
      const studentScores: Record<string, {
        total: number;
        count: number;
        student: any;
      }> = {};

      gradesData?.forEach((grade: any) => {
        const studentId = grade.student.id;
        if (!studentScores[studentId]) {
          studentScores[studentId] = {
            total: 0,
            count: 0,
            student: grade.student
          };
        }
        studentScores[studentId].total += grade.score;
        studentScores[studentId].count += 1;
      });

      // Convert to leaderboard entries
      const entries: LeaderboardEntry[] = Object.entries(studentScores)
        .map(([studentId, data]) => ({
          student_id: data.student.student_id,
          student_name: `${data.student.profile.first_name} ${data.student.profile.last_name}`,
          class_name: 'Class Name', // TODO: Get from class data
          average_score: data.total / data.count,
          rank: 0,
          total_assessments: data.count,
          attendance_rate: 95, // TODO: Calculate from attendance data
          trend: 'same' as const
        }))
        .sort((a, b) => b.average_score - a.average_score)
        .slice(0, limit);

      // Assign ranks
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboard(entries);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const maskName = (name: string) => {
    if (!privacyMode) return name;
    const parts = name.split(' ');
    return parts.map(part => part[0] + '*'.repeat(part.length - 1)).join(' ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              🏆 Top Performers
            </h2>
            <p className="text-purple-100 mt-1">
              {view === 'weekly' && 'This Week'}
              {view === 'monthly' && 'This Month'}
              {view === 'termly' && 'This Term'}
            </p>
          </div>
          {showPrivacy && (
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
            >
              {privacyMode ? '🔒 Private' : '👁️ Public'}
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-6 space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">📊</p>
            <p>No data available yet</p>
            <p className="text-sm mt-2">Grades will appear here once assessments are recorded</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.student_id}
              className={`
                relative flex items-center p-4 rounded-xl transition-all duration-300
                ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300' : 'bg-white border border-gray-200'}
                hover:shadow-lg hover:scale-[1.02]
              `}
            >
              {/* Rank Badge */}
              <div className={`
                flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' : ''}
                ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg' : ''}
                ${index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg' : ''}
                ${index > 2 ? 'bg-gray-100 text-gray-700' : ''}
              `}>
                {getMedalEmoji(entry.rank)}
              </div>

              {/* Student Info */}
              <div className="flex-1 ml-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">
                    {maskName(entry.student_name)}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {getTrendIcon(entry.trend)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>{entry.class_name}</span>
                  <span>•</span>
                  <span>{entry.total_assessments} assessments</span>
                  <span>•</span>
                  <span>{entry.attendance_rate}% attendance</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(entry.average_score)}`}>
                  {entry.average_score.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Average</div>
              </div>

              {/* Sparkle Effect for Top 3 */}
              {index < 3 && (
                <div className="absolute top-2 right-2 text-2xl animate-pulse">
                  ✨
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{leaderboard.length}</div>
            <div className="text-xs text-gray-600">Students</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-600">
              {leaderboard[0]?.average_score.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-gray-600">Top Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {(leaderboard.reduce((sum, e) => sum + e.average_score, 0) / leaderboard.length || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Class Average</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact Leaderboard Widget for Dashboard
export const LeaderboardWidget: React.FC<{ classId?: string; limit?: number }> = ({ 
  classId, 
  limit = 5 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        🏆 Top 5 Students
      </h3>
      <StudentLeaderboard 
        classId={classId} 
        limit={limit} 
        showPrivacy={false}
      />
    </div>
  );
};

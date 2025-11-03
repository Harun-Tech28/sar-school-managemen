import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Activity {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  } | null;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Subscribe to new activities
    const subscription = supabase
      .channel('audit_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          table_name,
          created_at,
          user:profiles!audit_logs_user_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data as any || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('INSERT') || action.includes('create')) return '➕';
    if (action.includes('UPDATE') || action.includes('edit')) return '✏️';
    if (action.includes('DELETE') || action.includes('remove')) return '🗑️';
    return '📝';
  };

  const getActivityColor = (action: string) => {
    if (action.includes('INSERT') || action.includes('create')) return 'text-green-600';
    if (action.includes('UPDATE') || action.includes('edit')) return 'text-blue-600';
    if (action.includes('DELETE') || action.includes('remove')) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatAction = (action: string, tableName: string) => {
    const actionType = action.split('_')[0].toLowerCase();
    const formattedTable = tableName.replace(/_/g, ' ');
    
    switch (actionType) {
      case 'insert':
        return `Created new ${formattedTable}`;
      case 'update':
        return `Updated ${formattedTable}`;
      case 'delete':
        return `Deleted ${formattedTable}`;
      default:
        return `${action} on ${formattedTable}`;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">🕐 Recent Activity</h3>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {getActivityIcon(activity.action)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getActivityColor(activity.action)}`}>
                    {formatAction(activity.action, activity.table_name)}
                  </p>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    {activity.user && (
                      <>
                        <span>
                          {activity.user.first_name} {activity.user.last_name}
                        </span>
                        <span className="mx-2">•</span>
                      </>
                    )}
                    <span>{formatTime(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

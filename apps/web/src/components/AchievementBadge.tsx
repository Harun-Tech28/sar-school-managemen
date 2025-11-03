import { useState } from 'react';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  color: 'gold' | 'silver' | 'bronze' | 'ghana' | 'kente';
  earned: boolean;
  progress?: number;
  onClick?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  color,
  earned,
  progress = 0,
  onClick
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const colorClasses = {
    gold: 'from-yellow-400 to-yellow-600',
    silver: 'from-gray-300 to-gray-500',
    bronze: 'from-orange-400 to-orange-600',
    ghana: 'from-red-600 via-yellow-500 to-green-600',
    kente: 'from-purple-500 via-blue-500 to-green-500'
  };

  const glowClasses = {
    gold: 'shadow-yellow-500/50',
    silver: 'shadow-gray-500/50',
    bronze: 'shadow-orange-500/50',
    ghana: 'shadow-red-500/50',
    kente: 'shadow-purple-500/50'
  };

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 ${
        earned ? 'scale-100' : 'scale-95 opacity-60 grayscale'
      }`}
      onClick={() => {
        setShowDetails(!showDetails);
        onClick?.();
      }}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Badge Container */}
      <div className={`
        relative w-24 h-24 rounded-full
        bg-gradient-to-br ${colorClasses[color]}
        ${earned ? `shadow-2xl ${glowClasses[color]}` : 'shadow-md'}
        transform transition-all duration-300
        ${earned ? 'group-hover:scale-110 group-hover:rotate-6' : ''}
        flex items-center justify-center
      `}>
        {/* Icon */}
        <span className="text-4xl filter drop-shadow-lg">
          {icon}
        </span>

        {/* Progress Ring (if not earned) */}
        {!earned && progress > 0 && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 45 * progress / 100} ${2 * Math.PI * 45}`}
              className="transition-all duration-500"
            />
          </svg>
        )}

        {/* Earned Checkmark */}
        {earned && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Badge Name */}
      <p className="text-center mt-2 text-xs font-semibold text-gray-700 truncate px-1">
        {title}
      </p>

      {/* Progress Percentage */}
      {!earned && progress > 0 && (
        <p className="text-center text-xs text-gray-500">
          {progress}%
        </p>
      )}

      {/* Details Tooltip */}
      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-50 animate-fadeIn">
          <div className="bg-gray-900 text-white rounded-lg p-4 shadow-2xl">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">{icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{title}</h4>
                <p className="text-xs text-gray-300 mb-2">{description}</p>
                {!earned && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {earned && (
                  <div className="flex items-center text-xs text-green-400 mt-2">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Earned!
                  </div>
                )}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-3 h-3 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Achievement Grid Component
interface AchievementGridProps {
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    color: 'gold' | 'silver' | 'bronze' | 'ghana' | 'kente';
    earned: boolean;
    progress?: number;
  }>;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({ achievements }) => {
  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((earnedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Achievements</h3>
            <p className="text-white/80">
              {earnedCount} of {totalCount} earned
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{completionPercentage}%</div>
            <p className="text-sm text-white/80">Complete</p>
          </div>
        </div>
        <div className="mt-4 w-full bg-white/20 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-white transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} {...achievement} />
        ))}
      </div>
    </div>
  );
};

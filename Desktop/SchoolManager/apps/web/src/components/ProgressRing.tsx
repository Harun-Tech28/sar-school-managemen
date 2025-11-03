import { useEffect, useState } from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  icon?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#DC2626',
  backgroundColor = '#E5E7EB',
  label,
  showPercentage = true,
  animated = true,
  icon
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;

  const getColorByProgress = (prog: number) => {
    if (prog >= 80) return '#10B981'; // Green
    if (prog >= 60) return '#3B82F6'; // Blue
    if (prog >= 40) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const displayColor = color === 'auto' ? getColorByProgress(progress) : color;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={displayColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${displayColor}40)`
          }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon && (
          <span className="text-3xl mb-1">{icon}</span>
        )}
        {showPercentage && (
          <span className="text-2xl font-bold" style={{ color: displayColor }}>
            {Math.round(animatedProgress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-600 mt-1 text-center px-2">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

// Multiple Progress Rings Component
interface MultiProgressRingProps {
  data: Array<{
    label: string;
    progress: number;
    color?: string;
    icon?: string;
  }>;
}

export const MultiProgressRing: React.FC<MultiProgressRingProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <ProgressRing
            progress={item.progress}
            color={item.color || 'auto'}
            label={item.label}
            icon={item.icon}
          />
        </div>
      ))}
    </div>
  );
};

// Animated Counter Component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(progress * value);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="font-bold">
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

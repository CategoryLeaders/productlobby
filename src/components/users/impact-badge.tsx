interface ImpactBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function ImpactBadge({ score, size = 'md' }: ImpactBadgeProps) {
  // Ensure score is between 0-100
  const normalizedScore = Math.max(0, Math.min(100, score))

  // Determine tier and colors based on score
  interface TierConfig {
    name: string
    color: string
    bgColor: string
  }

  const getTierConfig = (score: number): TierConfig => {
    if (score >= 80) {
      return {
        name: 'Diamond',
        color: '#60A5FA',
        bgColor: '#F0F9FF',
      }
    }
    if (score >= 60) {
      return {
        name: 'Platinum',
        color: '#A78BFA',
        bgColor: '#F5F3FF',
      }
    }
    if (score >= 40) {
      return {
        name: 'Gold',
        color: '#FBBF24',
        bgColor: '#FFFBEB',
      }
    }
    if (score >= 20) {
      return {
        name: 'Silver',
        color: '#D1D5DB',
        bgColor: '#F9FAFB',
      }
    }
    return {
      name: 'Bronze',
      color: '#EA8357',
      bgColor: '#FFF5F1',
    }
  }

  const tier = getTierConfig(normalizedScore)

  // Size configurations
  const sizeConfigs = {
    sm: {
      container: 'w-24 h-24',
      score: 'text-xl',
      label: 'text-xs',
      padding: 'p-3',
    },
    md: {
      container: 'w-32 h-32',
      score: 'text-3xl',
      label: 'text-sm',
      padding: 'p-4',
    },
    lg: {
      container: 'w-40 h-40',
      score: 'text-5xl',
      label: 'text-base',
      padding: 'p-6',
    },
  }

  const config = sizeConfigs[size]

  // Calculate circle circumference and offset for progress circle
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (normalizedScore / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${config.container} relative flex items-center justify-center rounded-full`}
        style={{ backgroundColor: tier.bgColor }}
      >
        {/* Background circle */}
        <svg className="absolute w-full h-full" viewBox="0 0 120 120">
          {/* Outer background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={tier.color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '60px 60px',
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>

        {/* Content */}
        <div className={`${config.padding} text-center relative z-10 flex flex-col items-center`}>
          <p className={`${config.score} font-bold text-gray-900`}>
            {normalizedScore}
          </p>
          <p className="text-xs text-gray-600 mt-1">out of 100</p>
        </div>
      </div>

      {/* Tier label */}
      <div className="text-center">
        <p className="font-semibold text-gray-900" style={{ color: tier.color }}>
          {tier.name}
        </p>
      </div>
    </div>
  )
}

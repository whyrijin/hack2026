import React from 'react'

interface BrandLogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showBadge?: boolean
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const isDark = variant === 'dark'

  const sizeConfig = {
    sm: {
      box: 'w-7 h-7',
      text: 'text-xl',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      box: 'w-9 h-9',
      text: 'text-2xl',
      badge: 'text-xs px-2 py-0.5',
    },
    lg: {
      box: 'w-11 h-11',
      text: 'text-3xl',
      badge: 'text-xs px-2.5 py-1',
    },
  }

  const currentSize = sizeConfig[size]

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Distinctive loop-inspired visual element */}
      <div className={`relative flex items-center justify-center shrink-0 ${currentSize.box}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:rotate-6"
          aria-hidden="true"
        >
          <defs>
            {/* Primary electric-blue to cyan gradient */}
            <linearGradient id="blLoopGradientA" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#4965F5" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>

            {/* Accent overlay gradient */}
            <linearGradient id="blLoopGradientB" x1="42" y1="12" x2="6" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#4965F5" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="blGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4965F5" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background circular pad */}
          <circle
            cx="24"
            cy="24"
            r="22"
            className={isDark ? 'fill-[#131D31]/80 stroke-[#1E2D4A]' : 'fill-blue-50/70 stroke-blue-100/60'}
            strokeWidth="1.5"
          />

          {/* Infinity loop / Recurring subscription ribbon */}
          <g filter="url(#blGlowFilter)">
            <path
              d="M16 17 C11 17, 8 20.5, 8 24 C8 27.5, 11 31, 16 31 C22 31, 26 17, 32 17 C37 17, 40 20.5, 40 24 C40 27.5, 37 31, 32 31 C26 31, 22 17, 16 17 Z"
              stroke="url(#blLoopGradientA)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Continuous cycle ribbon highlight */}
            <path
              d="M32 31 C37 31, 40 27.5, 40 24 C40 20.5, 37 17, 32 17 C26.5 17, 22.5 28.5, 17 31"
              stroke="url(#blLoopGradientB)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glowing nodes representing recurring payment checkpoints */}
            <circle cx="16" cy="31" r="2.5" fill="#4965F5" />
            <circle cx="32" cy="17" r="2.5" fill="#38BDF8" />
          </g>
        </svg>
      </div>

      {/* Clean Wordmark: BrightLoop */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center leading-none">
          <span
            className={`font-bold tracking-tight ${currentSize.text} ${
              isDark ? 'text-white' : 'text-[#101828]'
            }`}
          >
            Bright
          </span>
          <span
            className={`font-bold tracking-tight ${currentSize.text} ${
              isDark ? 'text-[#38BDF8]' : 'text-[#4965F5]'
            }`}
          >
            Loop
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] ml-0.5 inline-block self-end mb-1" />
          
          {showBadge && (
            <span
              className={`ml-2 font-medium rounded-full ${currentSize.badge} ${
                isDark
                  ? 'bg-blue-500/10 text-cyan-400 border border-blue-500/20'
                  : 'bg-blue-50 text-[#4965F5] border border-blue-100'
              }`}
            >
              SaaS
            </span>
          )}
        </div>
      </div>
    </div>
  )
}


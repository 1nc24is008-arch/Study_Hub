import React, { useMemo } from 'react';

export interface ParallaxStarsProps {
  children?: React.ReactNode;
  className?: string;
  speed?: number;
}

const generateBoxShadows = (n: number) => {
  let value = `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
  for (let i = 2; i <= n; i++) {
    value += `, ${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
  }
  return value;
};

export function ParallaxStars({
  children,
  className = "",
  speed = 1
}: ParallaxStarsProps) {
  const shadowsSmall = useMemo(() => generateBoxShadows(700), []);
  const shadowsMedium = useMemo(() => generateBoxShadows(200), []);
  const shadowsBig = useMemo(() => generateBoxShadows(100), []);

  return (
    <div className={`relative w-full overflow-hidden bg-transparent ${className}`}>
      <style>{`
        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
        .stars-container {
          mask-image: radial-gradient(ellipse at center, black 0%, transparent 80%);
        }
      `}</style>

      {/* Stars layers - only visible in dark mode or with low opacity in light mode */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-100 transition-opacity duration-1000">
        {/* Layer 1 */}
        <div 
          className="absolute left-0 top-0 w-[1px] h-[1px] bg-transparent animate-[animStar_50s_linear_infinite]"
          style={{ 
            boxShadow: shadowsSmall,
            animationDuration: `${50 / speed}s`,
            color: 'var(--text-main)'
          }}
        >
          <div className="absolute top-[2000px] w-[1px] h-[1px] bg-transparent" style={{ boxShadow: shadowsSmall }} />
        </div>

        {/* Layer 2 */}
        <div 
          className="absolute left-0 top-0 w-[2px] h-[2px] bg-transparent animate-[animStar_100s_linear_infinite]"
          style={{ 
            boxShadow: shadowsMedium,
            animationDuration: `${100 / speed}s`,
            color: 'var(--text-main)'
          }}
        >
          <div className="absolute top-[2000px] w-[2px] h-[2px] bg-transparent" style={{ boxShadow: shadowsMedium }} />
        </div>

        {/* Layer 3 */}
        <div 
          className="absolute left-0 top-0 w-[3px] h-[3px] bg-transparent animate-[animStar_150s_linear_infinite]"
          style={{ 
            boxShadow: shadowsBig,
            animationDuration: `${150 / speed}s`,
            color: 'var(--text-main)'
          }}
        >
          <div className="absolute top-[2000px] w-[3px] h-[3px] bg-transparent" style={{ boxShadow: shadowsBig }} />
        </div>
      </div>

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

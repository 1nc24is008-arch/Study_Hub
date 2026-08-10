import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface LightBeamButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  gradientColors?: [string, string, string];
}

/**
 * LightBeamButton
 * 
 * A high-performance button with a rotating light beam border effect.
 * Adapted for the Digital Hub design system.
 */
export function LightBeamButton({ 
  children, 
  className = "", 
  onClick,
  gradientColors = ["#2563eb", "#06b6d4", "#2563eb"], // brand-primary -> cyan -> brand-primary
  ...props 
}: LightBeamButtonProps) {
  const gradientString = `conic-gradient(from var(--gradient-angle), transparent 0%, ${gradientColors[0]} 40%, ${gradientColors[1]} 50%, transparent 60%, transparent 100%)`;

  return (
    <>
      <style>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-spin {
          from { --gradient-angle: 0deg; }
          to { --gradient-angle: 360deg; }
        }
        .animate-border-spin {
          animation: border-spin 3s linear infinite;
        }
      `}</style>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`group relative isolate overflow-hidden rounded-xl bg-panel px-8 py-3 text-sm font-black text-main transition-all hover:bg-soft-bg shadow-[0_0_20px_-5px_var(--color-brand-primary)] hover:shadow-[0_0_25px_-5px_var(--color-brand-primary)] border border-transparent ${className}`}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">{children}</span>
        
        {/* Gradient Border Simulation */}
        <div 
          className="absolute inset-0 -z-10 rounded-xl p-[1px] animate-border-spin" 
          style={{ 
            '--gradient-angle': '0deg',
            background: gradientString
          } as React.CSSProperties} 
        />
        
        {/* Inner Background (keeps text readable) */}
        <div className="absolute inset-[1.5px] -z-10 rounded-xl bg-panel group-hover:bg-soft-bg transition-colors" />
        
        {/* Shine Effect Overlay */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,var(--color-brand-primary)_0%,transparent_60%)] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      </motion.button>
    </>
  );
}

export default LightBeamButton;

import React, { type ReactNode } from "react";

export interface FeatureCardProps {
  icon?: ReactNode;
  title?: string;
  paragraph?: string;
  className?: string;
  children?: ReactNode;
  glowColors?: string;
  isDark?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  paragraph,
  className = "",
  children,
  glowColors = "from-indigo-500/70 via-blue-600/60 via-purple-500/60 to-cyan-400/70",
  isDark = true,
}) => {
  return (
    <div className={`relative p-[1px] rounded-2xl overflow-hidden group transition-all duration-300 ${className}`}>
      {/* Outer Subtle Binaural Glow Ambient Aura */}
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r ${glowColors} bg-[length:300%_300%] animate-binaural-flow blur-sm ${
          isDark ? 'opacity-20 group-hover:opacity-60' : 'opacity-35 group-hover:opacity-80'
        } transition-opacity duration-700 rounded-2xl pointer-events-none`} 
      />

      {/* Animated Razor-Thin Binaural Border Gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${glowColors} bg-[length:300%_300%] animate-binaural-flow rounded-2xl ${
          isDark ? 'opacity-70 group-hover:opacity-100' : 'opacity-85 group-hover:opacity-100'
        } transition-opacity duration-500`} 
      />

      {/* Inner Mask Container (Supports Beautiful Light Mode & Untouched Dark Mode) */}
      <div className={`relative z-10 w-full h-full rounded-[15px] backdrop-blur-xl p-6 flex flex-col justify-between space-y-4 transition-colors duration-300 ${
        isDark
          ? 'bg-[#071022]/95 dark:bg-[#050c1b]/98 text-white'
          : 'bg-gradient-to-br from-white via-amber-50/20 to-white text-slate-900 shadow-md border border-amber-200/60'
      }`}>
        {children ? (
          children
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400">
                {icon || (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                )}
              </div>
              {title && (
                <h3 className={`font-headline font-black text-lg uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {title}
                </h3>
              )}
            </div>
            {paragraph && (
              <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {paragraph}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeatureCard;

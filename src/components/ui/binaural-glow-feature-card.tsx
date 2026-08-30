import React, { type ReactNode } from "react";

export interface FeatureCardProps {
  icon?: ReactNode;
  title?: string;
  paragraph?: string;
  className?: string;
  children?: ReactNode;
  glowColors?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  paragraph,
  className = "",
  children,
  glowColors = "from-indigo-500/70 via-blue-600/60 via-purple-500/60 to-cyan-400/70"
}) => {
  return (
    <div className={`relative p-[1px] rounded-2xl overflow-hidden group transition-all duration-300 ${className}`}>
      {/* Outer Subtle Binaural Glow Ambient Aura */}
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r ${glowColors} bg-[length:300%_300%] animate-binaural-flow blur-sm opacity-20 group-hover:opacity-60 transition-opacity duration-700 rounded-2xl pointer-events-none`} 
      />

      {/* Animated Razor-Thin Binaural Border Gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${glowColors} bg-[length:300%_300%] animate-binaural-flow rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500`} 
      />

      {/* Inner Elegant Dark Mask Container */}
      <div className="relative z-10 w-full h-full rounded-[15px] bg-[#071022]/95 dark:bg-[#050c1b]/98 backdrop-blur-xl p-6 text-white flex flex-col justify-between space-y-4">
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
                <h3 className="font-headline font-black text-lg uppercase tracking-wider text-white">
                  {title}
                </h3>
              )}
            </div>
            {paragraph && (
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
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

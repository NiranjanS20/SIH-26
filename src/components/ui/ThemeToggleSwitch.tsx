import React from 'react';

interface ThemeToggleSwitchProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({
  isDark,
  onToggle,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center w-[72px] h-[36px] rounded-full p-1 bg-[#0a1222] border border-white/15 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_2px_10px_rgba(0,0,0,0.3)] cursor-pointer select-none transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${className}`}
    >
      {/* Background Icons Layer */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none text-amber-300/60">
        {/* Sun Icon on Left */}
        <span className={`material-symbols-outlined text-base transition-opacity duration-300 ${!isDark ? 'opacity-20' : 'opacity-80 text-amber-300'}`}>
          light_mode
        </span>
        {/* Moon Icon on Right */}
        <span className={`material-symbols-outlined text-base transition-opacity duration-300 ${isDark ? 'opacity-20' : 'opacity-80 text-amber-300'}`}>
          dark_mode
        </span>
      </div>

      {/* Sliding 3D Metallic Knob */}
      <div
        className={`relative z-10 w-[28px] h-[28px] rounded-full bg-gradient-to-b from-[#475569] via-[#334155] to-[#1e293b] dark:from-[#3a475a] dark:via-[#222e40] dark:to-[#121b28] border border-slate-400/40 shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-105 ${
          isDark ? 'translate-x-[36px]' : 'translate-x-0'
        }`}
      >
        <span className="material-symbols-outlined text-sm text-[#FBBF24] drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </div>
    </button>
  );
};

export default ThemeToggleSwitch;

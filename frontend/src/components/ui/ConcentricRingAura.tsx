import React from 'react';

export type AuraColor = 'red' | 'amber' | 'teal' | 'indigo' | 'blue';

interface ConcentricRingAuraProps {
  color?: AuraColor;
  className?: string;
}

const COLOR_MAP: Record<AuraColor, { ring: string; core: string }> = {
  red: {
    ring: 'border-[#B03A2E]/40',
    core: 'bg-[#B03A2E]/30',
  },
  amber: {
    ring: 'border-[#D97706]/40',
    core: 'bg-[#D97706]/30',
  },
  teal: {
    ring: 'border-[#0E7C7B]/40',
    core: 'bg-[#0E7C7B]/30',
  },
  indigo: {
    ring: 'border-indigo-400/40',
    core: 'bg-indigo-500/30',
  },
  blue: {
    ring: 'border-blue-400/40',
    core: 'bg-blue-500/30',
  },
};

export const ConcentricRingAura: React.FC<ConcentricRingAuraProps> = ({
  color = 'amber',
  className = '',
}) => {
  const styles = COLOR_MAP[color] || COLOR_MAP.amber;

  return (
    <div className={`absolute top-0 right-0 w-44 h-44 pointer-events-none overflow-hidden rounded-tr-xl z-0 ${className}`}>
      {/* Outer concentric ring 4 */}
      <div className={`absolute -top-14 -right-14 w-52 h-52 rounded-full border ${styles.ring} opacity-25 group-hover:scale-110 transition-transform duration-700 ease-out`} />
      {/* Concentric ring 3 */}
      <div className={`absolute -top-8 -right-8 w-40 h-40 rounded-full border ${styles.ring} opacity-40 group-hover:scale-110 transition-transform duration-500 ease-out`} />
      {/* Concentric ring 2 */}
      <div className={`absolute -top-2 -right-2 w-28 h-28 rounded-full border ${styles.ring} opacity-60 group-hover:scale-105 transition-transform duration-300 ease-out`} />
      {/* Concentric ring 1 */}
      <div className={`absolute top-3 right-3 w-16 h-16 rounded-full border ${styles.ring} opacity-80`} />
      {/* Core radial glow */}
      <div className={`absolute -top-4 -right-4 w-28 h-28 rounded-full ${styles.core} blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
};

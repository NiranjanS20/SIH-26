import React, { useRef, useState, useCallback, type ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
  style?: React.CSSProperties;
}

const glowColorMap = {
  blue: { base: 220, accent: '#3b82f6', glowRgba: 'rgba(59, 130, 246, 0.25)' },
  purple: { base: 280, accent: '#a855f7', glowRgba: 'rgba(168, 85, 247, 0.25)' },
  green: { base: 120, accent: '#10b981', glowRgba: 'rgba(16, 185, 129, 0.25)' },
  red: { base: 0, accent: '#ef4444', glowRgba: 'rgba(239, 68, 68, 0.25)' },
  orange: { base: 30, accent: '#f59e0b', glowRgba: 'rgba(245, 158, 11, 0.25)' }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
  style = {}
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; opacity: number }>({ x: 0, y: 0, opacity: 0 });
  const rafRef = useRef<number | null>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setCoords({ x, y, opacity: 1 });
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setCoords(prev => ({ ...prev, opacity: 0 }));
  }, []);

  const { accent, glowRgba } = glowColorMap[glowColor];

  const getSizeClasses = () => {
    if (customSize) return '';
    return sizeMap[size];
  };

  const inlineStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={inlineStyles}
      className={`
        ${getSizeClasses()}
        ${!customSize ? 'aspect-[3/4]' : ''}
        rounded-2xl 
        relative 
        overflow-hidden
        p-5 
        transition-shadow duration-300
        ${className}
      `}
    >
      {/* Hardware-accelerated local spotlight glow that follows pointer inside card */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 z-0"
        style={{
          opacity: coords.opacity,
          background: `radial-gradient(220px circle at ${coords.x}px ${coords.y}px, ${glowRgba} 0%, transparent 80%)`,
        }}
      />
      {/* Subtle border highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-0"
        style={{
          opacity: coords.opacity * 0.6,
          border: `1px solid ${accent}`,
        }}
      />
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

export { GlowCard };

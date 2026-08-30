import React, { useState } from 'react';
import { Warp } from '@paper-design/shaders-react';

export type ShaderVariant = 'teal' | 'indigo' | 'amber' | 'red' | 'dark';

interface ShaderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ShaderVariant;
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

const SHADER_COLOR_PRESETS: Record<ShaderVariant, string[]> = {
  teal: ['hsl(178, 80%, 15%)', 'hsl(178, 80%, 25%)', 'hsl(185, 90%, 20%)', 'hsl(175, 75%, 30%)'],
  indigo: ['hsl(220, 70%, 15%)', 'hsl(225, 75%, 28%)', 'hsl(230, 80%, 22%)', 'hsl(215, 70%, 32%)'],
  amber: ['hsl(38, 80%, 15%)', 'hsl(38, 85%, 28%)', 'hsl(32, 90%, 22%)', 'hsl(42, 80%, 30%)'],
  red: ['hsl(355, 70%, 15%)', 'hsl(355, 75%, 26%)', 'hsl(350, 80%, 20%)', 'hsl(360, 70%, 30%)'],
  dark: ['hsl(220, 20%, 10%)', 'hsl(220, 25%, 15%)', 'hsl(220, 18%, 12%)', 'hsl(220, 22%, 18%)'],
};

export const ShaderCard: React.FC<ShaderCardProps> = ({
  variant = 'teal',
  children,
  className = '',
  speed = 0.5,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = SHADER_COLOR_PRESETS[variant] || SHADER_COLOR_PRESETS.teal;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-xl overflow-hidden border border-white/15 transition-all duration-300 ${
        isHovered ? 'shadow-lg shadow-black/40 scale-[1.015]' : ''
      } ${className}`}
      {...props}
    >
      {/* Background WebGL Shader Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 transition-opacity duration-500">
        <Warp
          style={{ height: '100%', width: '100%' }}
          proportion={0.35}
          softness={1.0}
          distortion={0.15}
          swirl={0.6}
          swirlIterations={8}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={isHovered ? speed * 1.5 : speed}
          colors={colors}
        />
      </div>

      {/* Dark tint overlay for crystal-clear readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-5 pointer-events-none" />

      {/* Card Content Container */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

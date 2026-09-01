import React, { useState } from 'react';
import { Warp } from '@paper-design/shaders-react';

export type ShaderVariant = 'teal' | 'indigo' | 'amber' | 'red' | 'dark';

interface ShaderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ShaderVariant;
  children: React.ReactNode;
  className?: string;
  speed?: number;
  isDark?: boolean;
}

const SHADER_COLOR_PRESETS: Record<ShaderVariant, string[]> = {
  teal: ['hsl(178, 80%, 15%)', 'hsl(178, 80%, 25%)', 'hsl(185, 90%, 20%)', 'hsl(175, 75%, 30%)'],
  indigo: ['hsl(220, 70%, 15%)', 'hsl(225, 75%, 28%)', 'hsl(230, 80%, 22%)', 'hsl(215, 70%, 32%)'],
  amber: ['hsl(38, 80%, 15%)', 'hsl(38, 85%, 28%)', 'hsl(32, 90%, 22%)', 'hsl(42, 80%, 30%)'],
  red: ['hsl(355, 70%, 15%)', 'hsl(355, 75%, 26%)', 'hsl(350, 80%, 20%)', 'hsl(360, 70%, 30%)'],
  dark: ['hsl(220, 20%, 10%)', 'hsl(220, 25%, 15%)', 'hsl(220, 18%, 12%)', 'hsl(220, 22%, 18%)'],
};

const SHADER_LIGHT_PRESETS: Record<ShaderVariant, string[]> = {
  teal: ['hsl(178, 65%, 82%)', 'hsl(178, 75%, 88%)', 'hsl(185, 60%, 92%)', 'hsl(175, 55%, 85%)'],
  indigo: ['hsl(220, 65%, 85%)', 'hsl(225, 70%, 90%)', 'hsl(230, 60%, 94%)', 'hsl(215, 65%, 88%)'],
  amber: ['hsl(38, 75%, 85%)', 'hsl(38, 80%, 90%)', 'hsl(32, 70%, 94%)', 'hsl(42, 75%, 88%)'],
  red: ['hsl(355, 65%, 88%)', 'hsl(355, 70%, 92%)', 'hsl(350, 60%, 95%)', 'hsl(360, 65%, 90%)'],
  dark: ['hsl(220, 20%, 90%)', 'hsl(220, 25%, 94%)', 'hsl(220, 18%, 92%)', 'hsl(220, 22%, 88%)'],
};

export const ShaderCard: React.FC<ShaderCardProps> = ({
  variant = 'teal',
  children,
  className = '',
  speed = 0.5,
  isDark = true,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorPresetMap = isDark ? SHADER_COLOR_PRESETS : SHADER_LIGHT_PRESETS;
  const colors = colorPresetMap[variant] || colorPresetMap.teal;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        isDark
          ? 'border border-white/15 ' + (isHovered ? 'shadow-lg shadow-black/40 scale-[1.015]' : '')
          : 'border border-slate-200/90 bg-white shadow-md ' + (isHovered ? 'shadow-lg scale-[1.015] border-slate-300' : '')
      } ${className}`}
      {...props}
    >
      {/* Background WebGL Shader Canvas */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${
        isDark ? 'opacity-40' : 'opacity-55'
      }`}>
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

      {/* Tint overlay for crystal-clear readability in both Dark & Light modes */}
      <div className={`absolute inset-0 z-5 pointer-events-none ${
        isDark
          ? 'bg-black/60 backdrop-blur-[2px]'
          : 'bg-white/85 backdrop-blur-[1px]'
      }`} />

      {/* Card Content Container */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

export default ShaderCard;

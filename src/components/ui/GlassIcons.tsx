import React from 'react';

export interface GlassIconsItem {
  icon: React.ReactElement;
  color: string;
  label: string;
  customClass?: string;
}

export interface GlassIconsProps {
  items: GlassIconsItem[];
  className?: string;
}

const gradientMapping: Record<string, string> = {
  blue: 'linear-gradient(hsl(215, 90%, 35%), hsl(208, 90%, 45%))',
  purple: 'linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))',
  red: 'linear-gradient(hsl(3, 90%, 50%), hsl(348, 90%, 50%))',
  indigo: 'linear-gradient(hsl(253, 90%, 50%), hsl(238, 90%, 50%))',
  orange: 'linear-gradient(hsl(38, 95%, 50%), hsl(25, 95%, 50%))',
  green: 'linear-gradient(hsl(145, 80%, 40%), hsl(130, 80%, 40%))'
};

export const getGlassBackgroundStyle = (color: string): React.CSSProperties => {
  if (gradientMapping[color]) {
    return { background: gradientMapping[color] };
  }
  return { background: color };
};

export const GlassIcon: React.FC<{ item: GlassIconsItem; size?: string }> = ({ item, size = 'w-[3.2em] h-[3.2em]' }) => {
  return (
    <div
      aria-label={item.label}
      className={`relative bg-transparent outline-none border-none shrink-0 cursor-pointer ${size} [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group/icon ${
        item.customClass || ''
      }`}
    >
      <span
        className="absolute top-0 left-0 w-full h-full rounded-[1em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] [will-change:transform] group-hover/icon:[transform:rotate(25deg)_translate3d(-0.3em,-0.3em,0.3em)] group-hover:[transform:rotate(25deg)_translate3d(-0.3em,-0.3em,0.3em)]"
        style={{
          ...getGlassBackgroundStyle(item.color),
          boxShadow: '0.4em -0.4em 0.6em hsla(223, 10%, 10%, 0.15)'
        }}
      ></span>

      <span
        className="absolute top-0 left-0 w-full h-full rounded-[1em] bg-[hsla(0,0%,100%,0.2)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.75em] [-webkit-backdrop-filter:blur(0.75em)] [-moz-backdrop-filter:blur(0.75em)] [will-change:transform] transform group-hover/icon:[transform:translate3d(0,0,1.5em)] group-hover:[transform:translate3d(0,0,1.5em)]"
        style={{
          boxShadow: '0 0 0 0.1em hsla(0, 0%, 100%, 0.4) inset'
        }}
      >
        <span className="m-auto w-[1.5em] h-[1.5em] flex items-center justify-center text-white" aria-hidden="true">
          {item.icon}
        </span>
      </span>
    </div>
  );
};

const GlassIcons: React.FC<GlassIconsProps> = ({ items, className }) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-8 md:gap-12 mx-auto py-6 overflow-visible ${className || ''}`}>
      {items.map((item, index) => (
        <GlassIcon key={index} item={item} size="w-[4.2em] h-[4.2em]" />
      ))}
    </div>
  );
};

export default GlassIcons;

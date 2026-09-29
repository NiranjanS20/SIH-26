import React from 'react';

interface SatyamevaJayateLogoProps {
  className?: string;
  variant?: 'dark' | 'white' | 'auto';
  alt?: string;
  title?: string;
}

export const SatyamevaJayateLogo: React.FC<SatyamevaJayateLogoProps> = ({
  className = 'h-10 w-auto',
  variant = 'auto',
  alt = 'Satyameva Jayate - State Emblem of India',
  title = 'Satyameva Jayate',
}) => {
  const src =
    variant === 'white'
      ? '/assets/satyameva_jayate_white.png'
      : variant === 'dark'
      ? '/assets/satyameva_jayate.png'
      : '/assets/satyameva_jayate.png';

  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={`object-contain select-none shrink-0 ${
        variant === 'auto' ? 'dark:brightness-0 dark:invert' : ''
      } ${className}`}
      loading="eager"
    />
  );
};

export default SatyamevaJayateLogo;

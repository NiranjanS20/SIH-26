import React from 'react';
import FooterSection5 from './ui/footer-section-5';

interface FooterProps {
  themeMode?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ themeMode = 'dark' }) => {
  return <FooterSection5 themeMode={themeMode} />;
};

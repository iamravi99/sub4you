import React from 'react';

interface CoinIconProps {
  className?: string;
  size?: number;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ className = 'w-5 h-5', size }) => {
  return (
    <svg
      className={`inline-block shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="url(#coinGradPrimary)" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7.5" stroke="#FDE68A" strokeWidth="1" strokeDasharray="1 1.5" opacity="0.8" />
      <path
        d="M12 7.5V16.5M9.5 9.5H13.5C14.3284 9.5 15 10.1716 15 11C15 11.8284 14.3284 12.5 13.5 12.5H10.5C9.67157 12.5 9 13.1716 9 14C9 14.8284 9.67157 15.5 10.5 15.5H14.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="coinGradPrimary" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="0.5" stopColor="#D97706" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
      </defs>
    </svg>
  );
};


import React from 'react';

export const BryteLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Abstract 'b' shape with geometric lines */}
      <path 
        d="M30 20 V80 H60 L75 65 L60 50 H30" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="square" 
        strokeLinejoin="miter" 
      />
      <path 
        d="M60 50 L75 35" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="square"
      />
      <path 
        d="M45 50 V65 H60" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="square"
      />
    </svg>
  );
};

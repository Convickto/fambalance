import React from 'react';

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  // Allows passing any SVG props like className, width, height
}

const LogoIcon: React.FC<LogoIconProps> = (props) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Logotipo FamBalance"
    {...props}
  >
    <defs>
      <linearGradient id="scaleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F9A8D4" /> {/* Pink 300 */}
        <stop offset="100%" stopColor="#FBBF24" /> {/* Amber 400 */}
      </linearGradient>
      <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F472B6" /> {/* Pink 400 */}
        <stop offset="100%" stopColor="#FB923C" /> {/* Orange 400 */}
      </linearGradient>
      <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6EE7B7" /> {/* Emerald 300 */}
        <stop offset="100%" stopColor="#3B82F6" /> {/* Blue 500 */}
      </linearGradient>
    </defs>

    {/* Background Circle */}
    <circle cx="50" cy="50" r="50" fill="#0d244f"/>

    {/* Scale */}
    <g fill="url(#scaleGradient)">
      {/* Base */}
      <path d="M42 78 H 58 L 62 82 H 38 Z" />
      {/* Vertical beam */}
      <rect x="48" y="32" width="4" height="46" rx="2"/>
      {/* Horizontal beam */}
      <rect x="20" y="30" width="60" height="4" rx="2"/>
    </g>

    {/* Left side */}
    <g>
      <path d="M30 34 V 44" stroke="url(#scaleGradient)" strokeWidth="2" />
      <path d="M18 45 H 42" stroke="url(#scaleGradient)" strokeWidth="2" strokeLinecap="round"/>
      {/* Heart */}
      <path
        d="M30 60 C 15 50, 15 35, 30 45 C 45 35, 45 50, 30 60 Z"
        fill="url(#heartGradient)"
        transform="translate(0, -2)"
      />
    </g>
    
    {/* Right side */}
    <g>
      <path d="M70 34 V 44" stroke="url(#scaleGradient)" strokeWidth="2" />
      <path d="M58 45 H 82" stroke="url(#scaleGradient)" strokeWidth="2" strokeLinecap="round"/>
      {/* House */}
      <g fill="url(#houseGradient)" transform="translate(0, -2)">
        <path d="M62 50 L 78 50 V 60 H 62 Z" />
        <path d="M60 51 L 80 51 L 70 43 Z" />
        <rect x="67" y="53" width="6" height="7" fill="#0d244f" opacity="0.5" rx="1"/>
      </g>
    </g>
  </svg>
);

export default LogoIcon;

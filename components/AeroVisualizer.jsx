'use client';

import { useMemo } from 'react';

export default function AeroVisualizer({
  frontAero = 100,
  rearAero = 100
}) {
  // Normalize aero values for visual representation (arrow size)
  // Assume a typical range is 50kg to 400kg
  const getArrowSize = (value) => {
    return Math.max(10, Math.min(60, (value / 400) * 60 + 10));
  };

  const frontArrowSize = getArrowSize(frontAero);
  const rearArrowSize = getArrowSize(rearAero);

  // Arrow color based on intensity
  const getArrowColor = (value) => {
    if (value > 250) return '#f97316'; // Red/Pink (High)
    if (value > 120) return '#f97316'; // Yellow (Medium)
    return '#00ffaa'; // Green (Low)
  };

  const frontColor = getArrowColor(frontAero);
  const rearColor = getArrowColor(rearAero);

  // Helper to draw a downward arrow
  const renderArrow = (x, yBase, size, color) => {
    // Arrow pointing down to yBase
    // Tail starts at yBase - size - 20
    const tailY = yBase - size - 20;
    const headY = yBase;
    
    return (
      <g className="aero-arrow" style={{ transformOrigin: `${x}px ${yBase}px` }}>
        <line x1={x} y1={tailY} x2={x} y2={headY - 5} stroke={color} strokeWidth={size / 4} strokeLinecap="round" />
        <polygon 
          points={`${x},${headY} ${x - (size/3)},${headY - (size/3)} ${x + (size/3)},${headY - (size/3)}`} 
          fill={color} 
        />
      </g>
    );
  };

  return (
    <div className="aero-visualizer">
      <svg viewBox="0 0 300 150" width="100%" height="100%" className="aero-svg">
        <defs>
          <linearGradient id="aeroCarBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#333" />
            <stop offset="100%" stopColor="#111" />
          </linearGradient>
          <filter id="aeroGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ground Line */}
        <line x1="10" y1="130" x2="290" y2="130" stroke="#222" strokeWidth="2" strokeLinecap="round" />
        
        {/* Wheels */}
        <circle cx="70" cy="115" r="15" fill="#111" stroke="#444" strokeWidth="3" />
        <circle cx="230" cy="115" r="15" fill="#111" stroke="#444" strokeWidth="3" />
        
        {/* Airflow Lines (Background) */}
        <path d="M 10 80 Q 80 50 150 50 T 290 80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />
        <path d="M 10 100 Q 80 70 150 70 T 290 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />

        {/* Car Body (Side Profile) */}
        <path 
          d="M 30 110 L 40 80 L 100 50 L 180 50 L 250 75 L 270 110 Z"
          fill="url(#aeroCarBody)"
          stroke="#555"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Front Splitter / Wing Indicator */}
        <path d="M 25 110 L 40 110" stroke="#00ffaa" strokeWidth="3" strokeLinecap="round" />
        
        {/* Rear Wing Indicator */}
        <path d="M 250 70 L 275 60 L 275 55 L 250 65 Z" fill="#f97316" />
        <line x1="260" y1="65" x2="260" y2="85" stroke="#555" strokeWidth="2" />

        {/* Downforce Arrows */}
        <g filter="url(#aeroGlow)">
          {/* Front Downforce */}
          {renderArrow(70, 70, frontArrowSize, frontColor)}
          {/* Rear Downforce */}
          {renderArrow(260, 45, rearArrowSize, rearColor)}
        </g>

        {/* Labels */}
        <text x="70" y="145" fill="#888" fontSize="10" textAnchor="middle" fontFamily="Orbitron">FRONT AERO</text>
        <text x="260" y="145" fill="#888" fontSize="10" textAnchor="middle" fontFamily="Orbitron">REAR AERO</text>
      </svg>
      
      {/* Add a simple CSS animation for the arrows floating down */}
      <style>{`
        .aero-arrow {
          animation: pressDown 2s infinite alternate ease-in-out;
        }
        @keyframes pressDown {
          0% { transform: translateY(-5px); }
          100% { transform: translateY(5px); }
        }
      `}</style>
    </div>
  );
}

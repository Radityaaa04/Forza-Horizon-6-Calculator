'use client';

import { useMemo } from 'react';

export default function SpringsVisualizer({
  frontSpring = 100,
  rearSpring = 100,
  rideHeightFront = 50,
  rideHeightRear = 50
}) {
  // We'll draw a simple car side profile with front and rear springs.
  // The ride height determines the Y position of the car body relative to the wheels/ground.
  // The spring rate determines the thickness/color intensity of the spring coils.

  const renderSpring = (rate, x, y, height) => {
    // Determine spring thickness based on rate (clamped between 2 and 8)
    const thickness = Math.max(2, Math.min(8, rate / 30));
    const coilCount = 5;
    const coilSpacing = height / coilCount;
    
    let path = `M ${x - 10} ${y} `;
    for (let i = 1; i <= coilCount; i++) {
      const isRight = i % 2 === 0;
      const xOffset = isRight ? 10 : -10;
      path += `L ${x + xOffset} ${y + (i * coilSpacing) - (coilSpacing/2)} `;
      path += `L ${x - xOffset} ${y + (i * coilSpacing)} `;
    }

    // Color based on stiffness: soft = green, medium = yellow, stiff = red
    let color = '#00ffaa'; // Soft
    if (rate > 150) color = '#f97316'; // Stiff
    else if (rate > 80) color = '#f97316'; // Medium

    return (
      <path 
        d={path} 
        fill="none" 
        stroke={color} 
        strokeWidth={thickness} 
        strokeLinejoin="round"
        strokeLinecap="round"
        className="spring-coil"
      />
    );
  };

  // Convert ride height (cm) to actual visual offset.
  // Visual body Y base is 70.
  // E.g., 35cm offroad height -> Y = 35 (high in the air)
  // E.g., 9cm race height -> Y = 61 (low to the ground)
  const visualBodyYFront = 70 - rideHeightFront;
  const visualBodyYRear = 70 - rideHeightRear;

  return (
    <div className="springs-visualizer">
      <svg viewBox="0 0 300 150" width="100%" height="100%" className="springs-svg">
        <defs>
          <linearGradient id="carBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#222" />
            <stop offset="100%" stopColor="#111" />
          </linearGradient>
          <filter id="springGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ground Line */}
        <line x1="10" y1="130" x2="290" y2="130" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        
        {/* Wheels */}
        <circle cx="60" cy="115" r="15" fill="#111" stroke="#444" strokeWidth="3" />
        <circle cx="240" cy="115" r="15" fill="#111" stroke="#444" strokeWidth="3" />
        
        {/* Springs */}
        <g filter="url(#springGlow)">
          {renderSpring(frontSpring, 60, visualBodyYFront, 115 - visualBodyYFront)}
          {renderSpring(rearSpring, 240, visualBodyYRear, 115 - visualBodyYRear)}
        </g>

        {/* Car Body */}
        {/* Draw a polygon for the car body that tilts based on front vs rear ride height */}
        <path 
          d={`M 20 ${visualBodyYFront} 
              L 40 ${visualBodyYFront - 20} 
              L 120 ${visualBodyYFront - 30} 
              L 180 ${visualBodyYRear - 30} 
              L 260 ${visualBodyYRear - 15} 
              L 280 ${visualBodyYRear} 
              L 280 ${visualBodyYRear + 10}
              L 20 ${visualBodyYFront + 10} Z`}
          fill="url(#carBodyGrad)"
          stroke="#444"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: 'all 0.5s ease-out' }}
        />

        {/* Indicators */}
        <text x="60" y="145" fill="#888" fontSize="10" textAnchor="middle" fontFamily="Orbitron">DEPAN</text>
        <text x="240" y="145" fill="#888" fontSize="10" textAnchor="middle" fontFamily="Orbitron">BELAKANG</text>
      </svg>
    </div>
  );
}

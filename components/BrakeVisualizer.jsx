'use client';

import { useMemo } from 'react';

export default function BrakeVisualizer({
  balance = 50,
  pressure = 100
}) {
  // Visualizer: Overhead view of car chassis with 4 wheels.
  // The brake discs (circles inside wheels) will glow red based on balance and pressure.
  // balance > 50 means Front bias.
  // Max pressure = 200.

  const getHeatColor = (intensity) => {
    // Intensity from 0 to 1
    // Cold: #333
    // Warm: #ff6600
    // Hot: #ff2d78
    if (intensity < 0.2) return '#555';
    if (intensity < 0.5) return '#ffaa00';
    if (intensity < 0.8) return '#ff6600';
    return '#ff2d78';
  };

  // Calculate work done by front vs rear
  // If balance = 50, they do equal work.
  // If balance = 100, front does 100%, rear 0%.
  const frontWork = balance / 100;
  const rearWork = 1 - frontWork;

  // Multiply by pressure (normalized 0-2) to get intensity
  const pressureFactor = pressure / 200; // max 1.0

  // The base intensity is adjusted so even at 100% pressure 50% balance, it glows a bit
  const frontIntensity = Math.min(1.0, frontWork * pressureFactor * 2);
  const rearIntensity = Math.min(1.0, rearWork * pressureFactor * 2);

  const frontColor = getHeatColor(frontIntensity);
  const rearColor = getHeatColor(rearIntensity);

  // Size of the brake glow
  const frontGlow = 10 + (frontIntensity * 15);
  const rearGlow = 10 + (rearIntensity * 15);

  return (
    <div className="brake-visualizer">
      <svg viewBox="0 0 300 200" width="100%" height="100%" className="brake-svg">
        <defs>
          <filter id="brakeHeatGlowFront" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={frontIntensity * 5 + 1} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="brakeHeatGlowRear" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={rearIntensity * 5 + 1} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Car Chassis (Overhead) */}
        <rect x="100" y="20" width="100" height="160" rx="20" fill="#111" stroke="#333" strokeWidth="2" />
        <text x="150" y="105" fill="#333" fontSize="16" textAnchor="middle" fontFamily="Orbitron" fontWeight="bold">CHASSIS</text>
        <polygon points="150,30 140,50 160,50" fill="#333" /> {/* Forward Arrow */}

        {/* FRONT WHEELS */}
        <g className="front-wheels">
          {/* Front Left */}
          <rect x="70" y="40" width="20" height="40" rx="4" fill="#000" stroke="#444" strokeWidth="2" />
          {/* Brake Disc FL */}
          <circle cx="80" cy="60" r={frontGlow / 2} fill={frontColor} filter="url(#brakeHeatGlowFront)" />
          
          {/* Front Right */}
          <rect x="210" y="40" width="20" height="40" rx="4" fill="#000" stroke="#444" strokeWidth="2" />
          {/* Brake Disc FR */}
          <circle cx="220" cy="60" r={frontGlow / 2} fill={frontColor} filter="url(#brakeHeatGlowFront)" />
        </g>

        {/* REAR WHEELS */}
        <g className="rear-wheels">
          {/* Rear Left */}
          <rect x="70" y="120" width="20" height="40" rx="4" fill="#000" stroke="#444" strokeWidth="2" />
          {/* Brake Disc RL */}
          <circle cx="80" cy="140" r={rearGlow / 2} fill={rearColor} filter="url(#brakeHeatGlowRear)" />
          
          {/* Rear Right */}
          <rect x="210" y="120" width="20" height="40" rx="4" fill="#000" stroke="#444" strokeWidth="2" />
          {/* Brake Disc RR */}
          <circle cx="220" cy="140" r={rearGlow / 2} fill={rearColor} filter="url(#brakeHeatGlowRear)" />
        </g>

        {/* Axles connecting wheels */}
        <line x1="90" y1="60" x2="100" y2="60" stroke="#444" strokeWidth="4" />
        <line x1="200" y1="60" x2="210" y2="60" stroke="#444" strokeWidth="4" />
        <line x1="90" y1="140" x2="100" y2="140" stroke="#444" strokeWidth="4" />
        <line x1="200" y1="140" x2="210" y2="140" stroke="#444" strokeWidth="4" />

      </svg>
    </div>
  );
}

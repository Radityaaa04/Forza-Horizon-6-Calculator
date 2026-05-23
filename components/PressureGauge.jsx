'use client';
import { useMemo } from 'react';

export default function PressureGauge({
  value = 30,
  minValue = 15,
  maxValue = 55,
  label = 'Depan',
  unit = 'PSI',
  accentColor = '#f97316',
}) {
  const gaugeData = useMemo(() => {
    const radius = 80;
    const cx = 100;
    const cy = 100;
    const startAngle = 135;
    const endAngle = 405;
    const totalSweep = endAngle - startAngle; // 270 degrees

    // Calculate percentage
    const clampedValue = Math.max(minValue, Math.min(maxValue, value));
    const percentage = (clampedValue - minValue) / (maxValue - minValue);

    // Arc calculations
    const circumference = 2 * Math.PI * radius;
    const arcLength = (totalSweep / 360) * circumference;
    const dashOffset = arcLength * (1 - percentage);

    // Determine color based on value (in PSI equivalent)
    let color = accentColor;
    const psiValue = unit === 'BAR' ? value * 14.5038 : value;
    if (psiValue < 18 || psiValue > 48) {
      color = '#ef4444';
    } else if (psiValue < 22 || psiValue > 42) {
      color = '#f97316';
    }

    // Start position for the arc (135 degrees = bottom-left)
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    return {
      radius,
      cx,
      cy,
      arcLength,
      dashOffset,
      color,
      startAngle: startRad,
      endAngle: endRad,
      percentage,
    };
  }, [value, minValue, maxValue, unit, accentColor]);

  // Create arc path using SVG arc command
  const createArcPath = (cx, cy, radius, startAngle, endAngle) => {
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const bgPath = createArcPath(
    gaugeData.cx,
    gaugeData.cy,
    gaugeData.radius,
    gaugeData.startAngle,
    gaugeData.endAngle
  );

  return (
    <div className="gauge-container">
      <svg viewBox="0 0 200 200" className="gauge-svg">
        <defs>
          <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={bgPath}
          className="gauge-bg"
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Foreground arc */}
        <path
          d={bgPath}
          fill="none"
          stroke={gaugeData.color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={gaugeData.arcLength}
          strokeDashoffset={gaugeData.dashOffset}
          filter={`url(#glow-${label})`}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.5s ease',
          }}
        />

        {/* Value text */}
        <text x="100" y="95" className="gauge-value">
          {value}
        </text>

        {/* Unit text */}
        <text x="100" y="118" className="gauge-unit">
          {unit}
        </text>
      </svg>

      <div className="result-label" style={{ textAlign: 'center', marginTop: '-8px' }}>
        {label}
      </div>
    </div>
  );
}

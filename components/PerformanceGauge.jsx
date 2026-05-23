'use client';

import { useMemo } from 'react';

// Single ring gauge component
function RingGauge({ value, maxValue, label, unit, color, size = 100 }) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="ring-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: `drop-shadow(0 0 6px ${color})`
          }}
        />
      </svg>
      <div className="ring-gauge-content">
        <span className="ring-gauge-value" style={{ color }}>{value.toFixed(1)}</span>
        <span className="ring-gauge-unit">{unit}</span>
      </div>
      <span className="ring-gauge-label">{label}</span>
    </div>
  );
}

// Linear bar gauge component
function BarGauge({ value, maxValue, label, color, showValue = true }) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="bar-gauge">
      <div className="bar-gauge-header">
        <span className="bar-gauge-label">{label}</span>
        {showValue && <span className="bar-gauge-value" style={{ color }}>{percentage.toFixed(0)}%</span>}
      </div>
      <div className="bar-gauge-track">
        <div
          className="bar-gauge-fill"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 12px ${color}66`
          }}
        />
      </div>
    </div>
  );
}

// Main performance gauge component
export default function PerformanceGauge({
  horsepower = 400,
  weight = 1200,
  topSpeed = 250,
  weightBias = 50,
  drivetrain = 'RWD',
  tireCompound = 'sport',
  className = ''
}) {
  // Calculate performance metrics
  const metrics = useMemo(() => {
    // Power-to-weight ratio (HP per ton)
    const powerToWeight = (horsepower / weight) * 1000;
    
    // Estimated acceleration score (0-100)
    const accelScore = Math.min(100, (powerToWeight / 5) * 10);
    
    // Handling score based on weight distribution and drivetrain
    const biasDeviation = Math.abs(50 - weightBias);
    let handlingBase = 100 - biasDeviation * 1.5;
    if (drivetrain === 'AWD') handlingBase += 10;
    if (drivetrain === 'FWD') handlingBase -= 5;
    const handlingScore = Math.min(100, Math.max(0, handlingBase));
    
    // Braking score based on weight
    const brakingScore = Math.min(100, Math.max(0, 100 - (weight - 1000) / 20));
    
    // Grip score based on tire compound
    const gripMap = {
      slick: 100, race: 95, sport: 80, street: 65, rally: 70, offroad: 60, snow: 55
    };
    const gripScore = gripMap[tireCompound] || 75;
    
    // Overall performance score
    const overallScore = (accelScore * 0.3 + handlingScore * 0.25 + brakingScore * 0.2 + gripScore * 0.25);

    return {
      powerToWeight: powerToWeight.toFixed(1),
      accelScore,
      handlingScore,
      brakingScore,
      gripScore,
      overallScore
    };
  }, [horsepower, weight, weightBias, drivetrain, tireCompound]);

  return (
    <div className={`performance-gauge-container ${className}`}>
      {/* Main overall gauge */}
      <div className="performance-main-gauge">
        <div className="performance-overall-ring">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Background arc */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="12"
              strokeDasharray="330 110"
              transform="rotate(135 80 80)"
            />
            {/* Progress arc */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(metrics.overallScore / 100) * 330} 440`}
              transform="rotate(135 80 80)"
              style={{
                transition: 'stroke-dasharray 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))'
              }}
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <div className="performance-overall-content">
            <span className="performance-overall-value">{metrics.overallScore.toFixed(0)}</span>
            <span className="performance-overall-label">Performance</span>
          </div>
        </div>
        
        {/* Power to weight display */}
        <div className="performance-ptw">
          <span className="performance-ptw-value">{metrics.powerToWeight}</span>
          <span className="performance-ptw-label">HP/Ton</span>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="performance-metrics-grid">
        <BarGauge
          value={metrics.accelScore}
          maxValue={100}
          label="Acceleration"
          color="#f97316"
        />
        <BarGauge
          value={metrics.handlingScore}
          maxValue={100}
          label="Handling"
          color="#22d3ee"
        />
        <BarGauge
          value={metrics.brakingScore}
          maxValue={100}
          label="Braking"
          color="#ef4444"
        />
        <BarGauge
          value={metrics.gripScore}
          maxValue={100}
          label="Grip"
          color="#22c55e"
        />
      </div>

      {/* Quick stats row */}
      <div className="performance-stats-row">
        <div className="performance-stat">
          <span className="performance-stat-value">{horsepower}</span>
          <span className="performance-stat-label">HP</span>
        </div>
        <div className="performance-stat-divider" />
        <div className="performance-stat">
          <span className="performance-stat-value">{weight}</span>
          <span className="performance-stat-label">KG</span>
        </div>
        <div className="performance-stat-divider" />
        <div className="performance-stat">
          <span className="performance-stat-value">{topSpeed}</span>
          <span className="performance-stat-label">KM/H</span>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useMemo } from 'react';

export default function AlignmentVisualizer({ 
  frontCamber = -1.5, 
  rearCamber = -1.0, 
  frontToe = 0.0, 
  rearToe = 0.0,
  caster = 5.0
}) {
  
  // Amplify values purely for visual exaggeration so changes are obvious
  // Forza slider limits: Camber -5 to 5. Toe -5 to 5.
  const visualCamberFront = frontCamber * 4; 
  const visualCamberRear = rearCamber * 4;
  const visualToeFront = frontToe * 15; 
  const visualToeRear = rearToe * 15;

  return (
    <div className="alignment-visualizer" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* FRONT VIEW (CAMBER) */}
      <div className="visualizer-card" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-primary)' }}>Muka Depan (Camber)</h4>
        <svg viewBox="0 0 400 120" style={{ width: '100%', height: 'auto', dropShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
          {/* Ground */}
          <line x1="20" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          
          {/* Chassis Line */}
          <rect x="120" y="40" width="160" height="40" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <text x="200" y="65" fill="rgba(255,255,255,0.3)" fontSize="12" textAnchor="middle" fontFamily="Orbitron">CHASSIS</text>
          
          {/* Left Front Wheel (Positive rotation = leans left. We want negative camber = top leans right (inwards) -> positive rotate) */}
          <g style={{ transform: `translate(80px, 60px) rotate(${visualCamberFront}deg)`, transformOrigin: 'center bottom', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <rect x="-15" y="-40" width="30" height="80" rx="4" fill="#333" stroke="var(--color-primary)" strokeWidth="2" />
            {/* Rim */}
            <rect x="-5" y="-25" width="10" height="50" fill="#555" />
          </g>
          
          {/* Right Front Wheel (Negative camber = top leans left (inwards) -> negative rotate) */}
          <g style={{ transform: `translate(320px, 60px) rotate(${-visualCamberFront}deg)`, transformOrigin: 'center bottom', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <rect x="-15" y="-40" width="30" height="80" rx="4" fill="#333" stroke="var(--color-primary)" strokeWidth="2" />
            <rect x="-5" y="-25" width="10" height="50" fill="#555" />
          </g>

          <text x="80" y="20" fill="white" fontSize="12" textAnchor="middle">{frontCamber}°</text>
          <text x="320" y="20" fill="white" fontSize="12" textAnchor="middle">{frontCamber}°</text>
        </svg>
      </div>

      {/* TOP VIEW (TOE) */}
      <div className="visualizer-card" style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-accent)' }}>Tampak Atas (Toe)</h4>
        <svg viewBox="0 0 400 240" style={{ width: '100%', height: 'auto' }}>
          {/* Chassis outline */}
          <rect x="150" y="20" width="100" height="200" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
          <text x="200" y="125" fill="rgba(255,255,255,0.2)" fontSize="16" textAnchor="middle" fontFamily="Orbitron">DEPAN ⬆</text>

          {/* FRONT WHEELS (Y = 50) */}
          {/* Left Front (Toe OUT (Positive) = points left -> negative rotate) */}
          <g style={{ transform: `translate(120px, 50px) rotate(${-visualToeFront}deg)`, transformOrigin: 'center center', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <rect x="-10" y="-30" width="20" height="60" rx="3" fill="#222" stroke="var(--color-accent)" strokeWidth="2" />
          </g>
          {/* Right Front (Toe OUT (Positive) = points right -> positive rotate) */}
          <g style={{ transform: `translate(280px, 50px) rotate(${visualToeFront}deg)`, transformOrigin: 'center center', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <rect x="-10" y="-30" width="20" height="60" rx="3" fill="#222" stroke="var(--color-accent)" strokeWidth="2" />
          </g>

          {/* REAR WHEELS (Y = 190) */}
          {/* Left Rear */}
          <g style={{ transform: `translate(120px, 190px) rotate(${-visualToeRear}deg)`, transformOrigin: 'center center', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <rect x="-10" y="-30" width="20" height="60" rx="3" fill="#222" stroke="var(--color-text-secondary)" strokeWidth="2" />
          </g>
          {/* Right Rear */}
          <g style={{ transform: `translate(280px, 190px) rotate(${visualToeRear}deg)`, transformOrigin: 'center center', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <rect x="-10" y="-30" width="20" height="60" rx="3" fill="#222" stroke="var(--color-text-secondary)" strokeWidth="2" />
          </g>

          <text x="70" y="55" fill="white" fontSize="12" textAnchor="middle">{frontToe}°</text>
          <text x="330" y="55" fill="white" fontSize="12" textAnchor="middle">{frontToe}°</text>
          
          <text x="70" y="195" fill="rgba(255,255,255,0.7)" fontSize="12" textAnchor="middle">{rearToe}°</text>
          <text x="330" y="195" fill="rgba(255,255,255,0.7)" fontSize="12" textAnchor="middle">{rearToe}°</text>
        </svg>
      </div>

    </div>
  );
}

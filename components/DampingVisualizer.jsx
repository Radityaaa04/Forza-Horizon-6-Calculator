'use client';

import { useMemo } from 'react';

export default function DampingVisualizer({
  frontRebound = 10,
  rearRebound = 10,
  frontBump = 6,
  rearBump = 6
}) {
  // We will animate two "wheels" attached to shock absorbers.
  // Animation duration is mapped to the stiffness values.
  // Lower stiffness = faster animation (less resistance).
  // High stiffness = slower animation (more resistance).

  // Base speeds in seconds:
  // Rebound (extension): range 1.0 (fast) to 20.0 (slow) -> mapped to 0.2s to 1.5s
  // Bump (compression): range 1.0 (fast) to 20.0 (slow) -> mapped to 0.1s to 1.0s

  const getReboundSpeed = (val) => (val / 20) * 1.3 + 0.2; // 0.2s to 1.5s
  const getBumpSpeed = (val) => (val / 20) * 0.9 + 0.1; // 0.1s to 1.0s

  const fRebSec = getReboundSpeed(frontRebound);
  const fBumpSec = getBumpSpeed(frontBump);
  
  const rRebSec = getReboundSpeed(rearRebound);
  const rBumpSec = getBumpSpeed(rearBump);

  // We use CSS Custom Properties (variables) so the keyframes can use them
  const frontStyle = {
    '--reb-time': `${fRebSec}s`,
    '--bump-time': `${fBumpSec}s`,
  };

  const rearStyle = {
    '--reb-time': `${rRebSec}s`,
    '--bump-time': `${rBumpSec}s`,
  };

  return (
    <div className="damping-visualizer">
      <div className="suspension-container">
        
        {/* FRONT SUSPENSION */}
        <div className="suspension-unit" style={frontStyle}>
          <div className="chassis-mount">DEPAN</div>
          <div className="shock-body">
            <div className="shock-shaft anim-shock-front"></div>
          </div>
          <div className="wheel anim-wheel-front">
            <div className="wheel-center"></div>
          </div>
          <div className="stats-overlay">
            <span>Reb: {frontRebound.toFixed(1)}</span>
            <span>Bmp: {frontBump.toFixed(1)}</span>
          </div>
        </div>

        {/* REAR SUSPENSION */}
        <div className="suspension-unit" style={rearStyle}>
          <div className="chassis-mount">BELAKANG</div>
          <div className="shock-body">
            <div className="shock-shaft anim-shock-rear"></div>
          </div>
          <div className="wheel anim-wheel-rear">
            <div className="wheel-center"></div>
          </div>
          <div className="stats-overlay">
            <span>Reb: {rearRebound.toFixed(1)}</span>
            <span>Bmp: {rearBump.toFixed(1)}</span>
          </div>
        </div>

      </div>

      <style>{`
        .damping-visualizer {
          width: 100%;
          height: 200px;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .suspension-container {
          display: flex;
          width: 80%;
          justify-content: space-around;
        }

        .suspension-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .chassis-mount {
          background: #333;
          padding: 4px 12px;
          border-radius: 4px;
          font-family: Orbitron;
          font-size: 12px;
          color: #aaa;
          z-index: 2;
          border-bottom: 2px solid #555;
        }

        .shock-body {
          width: 20px;
          height: 60px;
          background: #f97316;
          border-radius: 4px;
          position: relative;
          z-index: 1;
          margin-top: -2px;
          display: flex;
          justify-content: center;
          overflow: hidden;
        }

        .shock-shaft {
          width: 6px;
          height: 100%;
          background: #ddd;
          transform-origin: top;
        }

        .wheel {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #111;
          border: 6px solid #444;
          margin-top: -10px;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wheel-center {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #666;
        }

        .stats-overlay {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 11px;
          color: #888;
          font-family: monospace;
        }

        /* Front Animations */
        .anim-wheel-front {
          animation: bounceFront calc(var(--bump-time) + var(--reb-time)) infinite;
        }
        .anim-shock-front {
          animation: shockFront calc(var(--bump-time) + var(--reb-time)) infinite;
        }

        @keyframes bounceFront {
          0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); } /* Start Compress */
          30% { transform: translateY(-30px); animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1); } /* Max Compress */
          100% { transform: translateY(0); } /* Extended */
        }

        @keyframes shockFront {
          0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
          30% { transform: translateY(-30px); animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1); }
          100% { transform: translateY(0); }
        }

        /* Rear Animations */
        .anim-wheel-rear {
          animation: bounceRear calc(var(--bump-time) + var(--reb-time)) infinite;
          animation-delay: 0.2s; /* Slight offset for realism */
        }
        .anim-shock-rear {
          animation: shockRear calc(var(--bump-time) + var(--reb-time)) infinite;
          animation-delay: 0.2s;
        }

        @keyframes bounceRear {
          0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
          30% { transform: translateY(-30px); animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1); }
          100% { transform: translateY(0); }
        }

        @keyframes shockRear {
          0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
          30% { transform: translateY(-30px); animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

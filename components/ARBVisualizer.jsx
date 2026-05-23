'use client';

/**
 * ARBVisualizer - Shows a front-view car silhouette with body roll animation
 * The car tilts based on how soft/stiff the ARB is relative to weight
 */
export default function ARBVisualizer({ frontARB, rearARB, weight = 1250 }) {
  // Simulate how much the car WOULD roll given these ARB values
  // Higher ARB relative to weight = less roll
  // This is purely visual — amplified for clarity
  const rollStiffness = (frontARB + rearARB) / 2;
  const expectedRoll = Math.max(0, 15 - (rollStiffness / weight) * 280);
  // expectedRoll: 0 = almost no roll (drag setup), ~12 = lots of roll (rally soft)

  const frontBias = Math.round((frontARB / (frontARB + rearARB)) * 100);
  const rearBias = 100 - frontBias;

  // Body tilt angle (visual only, amplified)
  const tiltDeg = Math.min(12, expectedRoll);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* FRONT VIEW: Car body rolling */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
          BODY ROLL SIMULATOR
        </h4>
        <svg viewBox="0 0 320 160" style={{ width: '100%', height: 'auto' }}>
          {/* Road */}
          <rect x="0" y="130" width="320" height="30" fill="rgba(255,255,255,0.04)" />
          <line x1="0" y1="130" x2="320" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

          {/* Shadow under car (more shadow = more roll) */}
          <ellipse cx="160" cy="132" rx={70 + tiltDeg * 1.5} ry="6" fill="rgba(0,0,0,0.5)" />

          {/* Car body group — tilts on roll */}
          <g style={{
            transform: `rotate(${tiltDeg}deg)`,
            transformOrigin: '160px 130px',
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Car body */}
            <rect x="80" y="75" width="160" height="55" rx="8"
              fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            {/* Cabin */}
            <rect x="100" y="52" width="120" height="35" rx="6"
              fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            {/* Windows */}
            <rect x="108" y="56" width="46" height="24" rx="4" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.3)" strokeWidth="1" />
            <rect x="162" y="56" width="46" height="24" rx="4" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.3)" strokeWidth="1" />

            {/* Left wheel (outside in right corner) */}
            <ellipse cx="108" cy="132" rx="22" ry="10" fill="#1a1a1a" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <ellipse cx="108" cy="132" rx="13" ry="6" fill="#333" />

            {/* Right wheel */}
            <ellipse cx="212" cy="132" rx="22" ry="10" fill="#1a1a1a" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <ellipse cx="212" cy="132" rx="13" ry="6" fill="#333" />

            {/* ARB bar (front) */}
            <line x1="86" y1="120" x2="234" y2="120"
              stroke="var(--color-primary)" strokeWidth="3"
              strokeLinecap="round"
              opacity={Math.min(1, frontARB / 65 + 0.2)}
            />
          </g>

          {/* Roll angle label */}
          <text x="160" y="20" fill="white" fontSize="11" textAnchor="middle" fontFamily="Orbitron">
            Estimasi Body Roll: ~{tiltDeg.toFixed(1)}°
          </text>
          <text x="160" y="35" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">
            {tiltDeg < 2 ? 'Sangat Kaku — Hampir Tidak Ada Roll' : tiltDeg < 5 ? 'Normal — Roll Terkontrol' : tiltDeg < 9 ? 'Lunak — Roll Cukup Besar' : 'Sangat Lunak — Banyak Roll'}
          </text>
        </svg>
      </div>

      {/* FRONT / REAR BALANCE BAR */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--color-accent)', letterSpacing: '0.05em' }}>
          FRONT / REAR BALANCE
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 700, minWidth: '28px', textAlign: 'right' }}>{frontBias}%</span>
          <div style={{ flex: 1, height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${frontBias}%`,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
              borderRadius: '6px',
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
            {/* Center marker */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.4)' }} />
          </div>
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700, minWidth: '28px' }}>{rearBias}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
          <span>Depan (F)</span>
          <span>Belakang (R)</span>
        </div>

        {/* Handling tendency label */}
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.8rem' }}>
          {frontBias > 55 && <span style={{ color: '#fb923c', fontWeight: 600 }}>⚡ Oversteer Bias — Ekor lebih mudah bergeser</span>}
          {rearBias > 55 && <span style={{ color: '#4fc3f7', fontWeight: 600 }}>🛡️ Understeer Bias — Lebih aman, kurang responsif</span>}
          {frontBias >= 45 && frontBias <= 55 && <span style={{ color: '#a8ff78', fontWeight: 600 }}>⚖️ Neutral — Handling seimbang</span>}
        </div>
      </div>
    </div>
  );
}

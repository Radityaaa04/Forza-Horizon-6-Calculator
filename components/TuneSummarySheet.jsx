'use client';

import React, { useState } from 'react';

/**
 * Renders a full tuning setup sheet with CORRECT field mappings from each math module.
 *
 * Actual return values per module:
 * - calculator.js:       { front, rear, unit }
 * - gearingMath.js:      { gears[], finalDrive, chartData, profileDescription, physicsWarnings, tractionIndex }
 * - alignmentMath.js:    { frontCamber, rearCamber, frontToe, rearToe, caster, warnings[] }
 * - arbMath.js:          { frontARB, rearARB, frontBias, rearBias, balanceLabel, warnings[] }
 * - springsMath.js:      { frontSpring, rearSpring, rideHeightFront, rideHeightRear, warnings[] }
 * - dampingMath.js:      { frontRebound, rearRebound, frontBump, rearBump, warnings[] }
 * - aeroMath.js:         { frontAero, rearAero, totalDownforce, dragPenaltyKmh, warnings[] }
 * - brakeMath.js:        { balance, pressure, warnings[] }
 * - differentialMath.js:  { frontAccel, frontDecel, rearAccel, rearDecel, centerBalance, warnings[] }
 */
export default function TuneSummarySheet({ 
  tires, gearing, alignment, arb, springs, damping, aero, brakes, differential, drivetrain 
}) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [copied, setCopied] = useState(false);

  // ── Copy All Results to Clipboard ──
  const copyAll = () => {
    const f = (val, d = 1) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(d) : '-';
    const lines = [
      '═══ FORZA TUNE SHEET ═══',
      '',
      '── TIRES ──',
      `  Front: ${f(tires?.front)} ${tires?.unit?.toUpperCase() || 'PSI'}`,
      `  Rear:  ${f(tires?.rear)} ${tires?.unit?.toUpperCase() || 'PSI'}`,
      '',
      '── GEARING ──',
      `  Final Drive: ${f(gearing?.finalDrive, 2)}`,
      ...(gearing?.gears?.map((g, i) => `  Gear ${i+1}: ${f(g, 2)}`) || []),
      '',
      '── ALIGNMENT ──',
      `  Camber F: ${f(alignment?.frontCamber)}°  R: ${f(alignment?.rearCamber)}°`,
      `  Toe    F: ${f(alignment?.frontToe)}°  R: ${f(alignment?.rearToe)}°`,
      `  Caster:   ${f(alignment?.caster)}°`,
      '',
      '── ANTI-ROLL BARS ──',
      `  Front: ${f(arb?.frontARB)}  Rear: ${f(arb?.rearARB)}`,
      '',
      '── SPRINGS ──',
      `  Front: ${f(springs?.frontSpring)} N/mm  Rear: ${f(springs?.rearSpring)} N/mm`,
      `  Ride Height F: ${f(springs?.rideHeightFront)} cm  R: ${f(springs?.rideHeightRear)} cm`,
      '',
      '── DAMPING ──',
      `  Rebound F: ${f(damping?.frontRebound)}  R: ${f(damping?.rearRebound)}`,
      `  Bump    F: ${f(damping?.frontBump)}  R: ${f(damping?.rearBump)}`,
      '',
      '── AERO ──',
      `  Front: ${f(aero?.frontAero, 0)} kgf  Rear: ${f(aero?.rearAero, 0)} kgf`,
      '',
      '── BRAKE ──',
      `  Balance: ${f(brakes?.balance, 0)}%  Pressure: ${f(brakes?.pressure, 0)}%`,
      '',
      '── DIFFERENTIAL ──',
    ];

    if (drivetrain === 'AWD' || drivetrain === 'FWD') {
      lines.push(`  Front Accel: ${f(differential?.frontAccel, 0)}%  Decel: ${f(differential?.frontDecel, 0)}%`);
    }
    if (drivetrain === 'AWD' || drivetrain === 'RWD') {
      lines.push(`  Rear  Accel: ${f(differential?.rearAccel, 0)}%  Decel: ${f(differential?.rearDecel, 0)}%`);
    }
    if (drivetrain === 'AWD') {
      lines.push(`  Center Balance: ${f(differential?.centerBalance, 0)}%`);
    }

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const tabs = [
    { id: 'ALL', label: 'ALL' },
    { id: 'TIRES', label: 'TIRES' },
    { id: 'GEARING', label: 'GEARING' },
    { id: 'ALIGNMENT', label: 'ALIGNMENT' },
    { id: 'ANTI-ROLL', label: 'ANTI-ROLL' },
    { id: 'SPRINGS', label: 'SPRINGS' },
    { id: 'DAMPING', label: 'DAMPING' },
    { id: 'AERO', label: 'AERO' },
    { id: 'BRAKE', label: 'BRAKE' },
    { id: 'DIFF', label: 'DIFF' }
  ];

  const fmt = (val, decimals = 1) => (typeof val === 'number' && !isNaN(val)) ? val.toFixed(decimals) : '-';

  // Aggregate all warnings from all modules (handling both arrays and single strings)
  const allWarnings = [
    ...(tires?.warnings || []),
    ...(gearing?.physicsWarnings ? [gearing.physicsWarnings] : []),
    ...(alignment?.warnings || []),
    ...(arb?.warnings || []),
    ...(springs?.warnings || []),
    ...(damping?.warnings || []),
    ...(aero?.warnings || []),
    ...(brakes?.warnings || []),
    ...(differential?.warnings || []),
  ].filter(Boolean);

  return (
    <div className="tune-sheet">
      {/* TABS HEADER */}
      <div className="tune-tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tune-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* COPY BUTTON */}
      <div style={{ 
        padding: '0.5rem 1rem', 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={copyAll}
          style={{
            background: copied ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${copied ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '6px',
            color: copied ? '#22c55e' : '#aaa',
            padding: '0.4rem 1rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '0.05em'
          }}
        >
          {copied ? '✓ COPIED!' : '📋 COPY ALL'}
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tune-content">
        
        {/* 1. TIRES — calculator.js returns { front, rear, unit } */}
        {(activeTab === 'ALL' || activeTab === 'TIRES') && (
          <div className="tune-grid">
            <h3 className="tune-section-title">TIRE PRESSURE</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(tires?.front)} <small>{tires?.unit?.toUpperCase() || 'PSI'}</small></span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(tires?.rear)} <small>{tires?.unit?.toUpperCase() || 'PSI'}</small></span>
            </div>
          </div>
        )}

        {/* 2. GEARING — gearingMath.js returns { gears[], finalDrive, ... } */}
        {(activeTab === 'ALL' || activeTab === 'GEARING') && (
          <div className="tune-grid">
            <h3 className="tune-section-title">GEARING</h3>
            <div className="tune-row highlight">
              <span className="tune-label">FINAL DRIVE</span>
              <span className="tune-value">{fmt(gearing?.finalDrive, 2)}</span>
            </div>
            {gearing?.gears?.map((g, i) => (
              <div className="tune-row" key={i}>
                <span className="tune-label">{i === 0 ? '1ST' : i === 1 ? '2ND' : i === 2 ? '3RD' : `${i+1}TH`} GEAR</span>
                <span className="tune-value">{fmt(g, 2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* 3. ALIGNMENT — alignmentMath.js returns { frontCamber, rearCamber, frontToe, rearToe, caster } */}
        {(activeTab === 'ALL' || activeTab === 'ALIGNMENT') && (
          <div className="tune-grid">
            <h3 className="tune-section-title">CAMBER</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(alignment?.frontCamber)}°</span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(alignment?.rearCamber)}°</span>
            </div>

            <h3 className="tune-section-title" style={{ marginTop: '1.5rem' }}>TOE</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(alignment?.frontToe)}°</span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(alignment?.rearToe)}°</span>
            </div>

            <h3 className="tune-section-title" style={{ marginTop: '1.5rem' }}>FRONT CASTER</h3>
            <div className="tune-row">
              <span className="tune-label">ANGLE</span>
              <span className="tune-value">{fmt(alignment?.caster)}°</span>
            </div>
          </div>
        )}

        {/* 4. ANTI-ROLL BARS — arbMath.js returns { frontARB, rearARB, balanceLabel } */}
        {(activeTab === 'ALL' || activeTab === 'ANTI-ROLL') && (
          <div className="tune-grid">
            <h3 className="tune-section-title">ANTI-ROLL BARS</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(arb?.frontARB)}</span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(arb?.rearARB)}</span>
            </div>
            {arb?.balanceLabel && (
              <div className="tune-row" style={{ marginTop: '0.5rem' }}>
                <span className="tune-label">BALANCE</span>
                <span className="tune-value" style={{ fontSize: '0.9rem' }}>{arb.balanceLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* 5. SPRINGS — springsMath.js returns { frontSpring, rearSpring, frontSpringKgf, rearSpringKgf, rideHeightFront, rideHeightRear } */}
        {(activeTab === 'ALL' || activeTab === 'SPRINGS') && (
          <div className="tune-grid">
            <h3 className="tune-section-title">SPRINGS (N/mm)</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(springs?.frontSpring)} <small>N/mm</small></span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(springs?.rearSpring)} <small>N/mm</small></span>
            </div>

            <h3 className="tune-section-title" style={{ marginTop: '1rem' }}>SPRINGS (kgf/mm)</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(springs?.frontSpringKgf)} <small>kgf/mm</small></span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(springs?.rearSpringKgf)} <small>kgf/mm</small></span>
            </div>

            <h3 className="tune-section-title" style={{ marginTop: '1rem' }}>RIDE HEIGHT</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(springs?.rideHeightFront)} <small>cm</small></span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(springs?.rideHeightRear)} <small>cm</small></span>
            </div>
          </div>
        )}

        {/* 6. DAMPING — dampingMath.js returns { frontRebound, rearRebound, frontBump, rearBump } */}
        {(activeTab === 'ALL' || activeTab === 'DAMPING') && (
          <div className="tune-grid">
            <h3 className="tune-section-title">REBOUND STIFFNESS</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(damping?.frontRebound)}</span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(damping?.rearRebound)}</span>
            </div>

            <h3 className="tune-section-title" style={{ marginTop: '1.5rem' }}>BUMP STIFFNESS</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(damping?.frontBump)}</span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(damping?.rearBump)}</span>
            </div>
          </div>
        )}

        {/* 7. AERO — aeroMath.js returns { frontAero, rearAero, totalDownforce, frontSliderPct, rearSliderPct, dragPenaltyKmh } */}
        {(activeTab === 'ALL' || activeTab === 'AERO') && (
          <div className="tune-grid">
            <h3 className="tune-section-title">DOWNFORCE TARGET</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value">{fmt(aero?.frontAero, 0)} <small>kgf</small></span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value">{fmt(aero?.rearAero, 0)} <small>kgf</small></span>
            </div>
            <div className="tune-row" style={{ marginTop: '0.5rem' }}>
              <span className="tune-label">TOTAL</span>
              <span className="tune-value">{fmt(aero?.totalDownforce, 0)} <small>kgf</small></span>
            </div>

            <h3 className="tune-section-title" style={{ marginTop: '1rem' }}>SLIDER POSITION (est.)</h3>
            <div className="tune-row">
              <span className="tune-label">FRONT</span>
              <span className="tune-value" style={{ color: '#22d3ee' }}>~{aero?.frontSliderPct ?? '-'}%</span>
            </div>
            <div className="tune-row">
              <span className="tune-label">REAR</span>
              <span className="tune-value" style={{ color: '#22d3ee' }}>~{aero?.rearSliderPct ?? '-'}%</span>
            </div>

            {aero?.dragPenaltyKmh > 0 && (
              <div className="tune-row" style={{ marginTop: '0.5rem' }}>
                <span className="tune-label">DRAG PENALTY</span>
                <span className="tune-value" style={{ color: '#f97316' }}>-{aero.dragPenaltyKmh} <small>km/h</small></span>
              </div>
            )}
          </div>
        )}

        {/* 8. BRAKE — brakeMath.js returns { balance, pressure } */}
        {(activeTab === 'ALL' || activeTab === 'BRAKE') && (
          <div className="tune-grid">
            <h3 className="tune-section-title">BRAKING FORCE</h3>
            <div className="tune-row">
              <span className="tune-label">BALANCE</span>
              <span className="tune-value">{fmt(brakes?.balance, 0)}%</span>
            </div>
            <div className="tune-row">
              <span className="tune-label">PRESSURE</span>
              <span className="tune-value">{fmt(brakes?.pressure, 0)}%</span>
            </div>
          </div>
        )}

        {/* 9. DIFFERENTIAL — differentialMath.js returns { frontAccel, frontDecel, rearAccel, rearDecel, centerBalance } */}
        {(activeTab === 'ALL' || activeTab === 'DIFF') && (
          <div className="tune-grid">
            {(drivetrain === 'AWD' || drivetrain === 'FWD') && (
              <>
                <h3 className="tune-section-title">FRONT DIFFERENTIAL</h3>
                <div className="tune-row">
                  <span className="tune-label">ACCELERATION</span>
                  <span className="tune-value">{fmt(differential?.frontAccel, 0)}%</span>
                </div>
                <div className="tune-row">
                  <span className="tune-label">DECELERATION</span>
                  <span className="tune-value">{fmt(differential?.frontDecel, 0)}%</span>
                </div>
              </>
            )}

            {(drivetrain === 'AWD' || drivetrain === 'RWD') && (
              <>
                <h3 className="tune-section-title" style={{ marginTop: drivetrain === 'AWD' ? '1.5rem' : '0' }}>REAR DIFFERENTIAL</h3>
                <div className="tune-row">
                  <span className="tune-label">ACCELERATION</span>
                  <span className="tune-value">{fmt(differential?.rearAccel, 0)}%</span>
                </div>
                <div className="tune-row">
                  <span className="tune-label">DECELERATION</span>
                  <span className="tune-value">{fmt(differential?.rearDecel, 0)}%</span>
                </div>
              </>
            )}

            {drivetrain === 'AWD' && (
              <>
                <h3 className="tune-section-title" style={{ marginTop: '1.5rem' }}>CENTER BALANCE</h3>
                <div className="tune-row">
                  <span className="tune-label">TORQUE SPLIT</span>
                  <span className="tune-value">{fmt(differential?.centerBalance, 0)}%</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* NOTES PANEL */}
      {allWarnings.length > 0 && (
        <div className="tune-notes">
          <h4 style={{ color: '#f97316', marginBottom: '0.8rem', fontFamily: 'Orbitron', fontSize: '0.9rem' }}>
            ENGINEER&apos;S NOTES
          </h4>
          <ul style={{ color: '#ccc', paddingLeft: '1.2rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
            {allWarnings.map((warn, i) => <li key={i} style={{ marginBottom: '6px' }}>{warn}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

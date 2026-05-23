'use client';

export default function DifferentialVisualizer({
  drivetrain   = 'RWD',
  frontAccel   = 50,
  frontDecel   = 25,
  rearAccel    = 50,
  rearDecel    = 25,
  centerBalance = 50,
}) {
  const isAWD = drivetrain === 'AWD';
  const isFWD = drivetrain === 'FWD';
  const isRWD = drivetrain === 'RWD';

  // Color helpers
  const lockColor = (val) => {
    if (val >= 75) return '#ff2d78';
    if (val >= 45) return '#ffcc00';
    return '#00ffaa';
  };

  // Draw a diff gauge — small arc meter
  const DiffGauge = ({ label, value, x, y }) => {
    const r = 22;
    const sweep = 220; // degrees of arc
    const startAngle = -110;
    const endAngle   = startAngle + (sweep * value / 100);
    const toRad      = (d) => (d * Math.PI) / 180;
    const bgEnd      = startAngle + sweep;

    const arcPath = (cx, cy, radius, start, end) => {
      const s = { x: cx + radius * Math.cos(toRad(start)), y: cy + radius * Math.sin(toRad(start)) };
      const e = { x: cx + radius * Math.cos(toRad(end)),   y: cy + radius * Math.sin(toRad(end)) };
      const large = (end - start) > 180 ? 1 : 0;
      return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
    };

    const color = lockColor(value);

    return (
      <g>
        {/* Background arc */}
        <path d={arcPath(x, y, r, startAngle, bgEnd)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" />
        {/* Value arc */}
        {value > 0 && (
          <path d={arcPath(x, y, r, startAngle, endAngle)} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        )}
        {/* Center value */}
        <text x={x} y={y + 5} textAnchor="middle" fill={color} fontSize="11" fontFamily="Orbitron" fontWeight="bold">{value}</text>
        {/* Label */}
        <text x={x} y={y + 40} textAnchor="middle" fill="#888" fontSize="8" fontFamily="Orbitron">{label}</text>
      </g>
    );
  };

  return (
    <div className="diff-visualizer">
      <svg viewBox="0 0 320 200" width="100%" height="100%">

        {/* ── Car outline (overhead) ───────────────────────── */}
        <rect x="120" y="40" width="80" height="130" rx="18" fill="#0d0d1a" stroke="#2a2a3a" strokeWidth="2" />
        {/* Front arrow */}
        <polygon points="160,46 153,60 167,60" fill="#2a2a3a" />

        {/* ── FRONT AXLE ────────────────────────────────────── */}
        {/* Left front wheel */}
        <rect x="78"  y="48" width="14" height="34" rx="4" fill="#0a0a14" stroke="#333" strokeWidth="2" />
        {/* Right front wheel */}
        <rect x="228" y="48" width="14" height="34" rx="4" fill="#0a0a14" stroke="#333" strokeWidth="2" />
        {/* Front axle line */}
        <line x1="92" y1="65" x2="120" y2="65" stroke="#333" strokeWidth="3" />
        <line x1="200" y1="65" x2="228" y2="65" stroke="#333" strokeWidth="3" />
        {/* Front diff box */}
        <rect x="130" y="55" width="40" height="20" rx="6" fill={isFWD || isAWD ? '#1a1a2e' : '#0d0d14'} stroke={isFWD || isAWD ? '#444' : '#1a1a1a'} strokeWidth="2" />
        <text x="150" y="69" textAnchor="middle" fill={isFWD || isAWD ? '#555' : '#222'} fontSize="7" fontFamily="Orbitron">FRONT</text>

        {/* ── REAR AXLE ─────────────────────────────────────── */}
        {/* Left rear wheel */}
        <rect x="78"  y="128" width="14" height="34" rx="4" fill="#0a0a14" stroke="#333" strokeWidth="2" />
        {/* Right rear wheel */}
        <rect x="228" y="128" width="14" height="34" rx="4" fill="#0a0a14" stroke="#333" strokeWidth="2" />
        {/* Rear axle line */}
        <line x1="92" y1="145" x2="120" y2="145" stroke="#333" strokeWidth="3" />
        <line x1="200" y1="145" x2="228" y2="145" stroke="#333" strokeWidth="3" />
        {/* Rear diff box */}
        <rect x="130" y="135" width="40" height="20" rx="6" fill={isRWD || isAWD ? '#1a1a2e' : '#0d0d14'} stroke={isRWD || isAWD ? '#444' : '#1a1a1a'} strokeWidth="2" />
        <text x="150" y="149" textAnchor="middle" fill={isRWD || isAWD ? '#555' : '#222'} fontSize="7" fontFamily="Orbitron">REAR</text>

        {/* ── CENTER DRIVESHAFT (AWD only) ───────────────────── */}
        {isAWD && (
          <>
            <line x1="150" y1="75" x2="150" y2="135" stroke="#333" strokeWidth="3" />
            <rect x="138" y="100" width="24" height="12" rx="4" fill="#1a1a2e" stroke="#444" strokeWidth="1.5" />
            <text x="150" y="109" textAnchor="middle" fill="#555" fontSize="6" fontFamily="Orbitron">CTR</text>
          </>
        )}

        {/* ── Diff Gauges ──────────────────────────────────── */}
        {/* Front section gauges */}
        {(isFWD || isAWD) && (
          <>
            <DiffGauge label="F.ACCEL" value={frontAccel} x={55}  y={65} />
            <DiffGauge label="F.DECEL" value={frontDecel} x={265} y={65} />
          </>
        )}

        {/* Rear section gauges */}
        {(isRWD || isAWD) && (
          <>
            <DiffGauge label="R.ACCEL" value={rearAccel} x={55}  y={145} />
            <DiffGauge label="R.DECEL" value={rearDecel} x={265} y={145} />
          </>
        )}

        {/* FWD only — show front gauges in rear row too (slightly shifted) */}
        {isFWD && (
          <>
            <DiffGauge label="F.ACCEL" value={frontAccel} x={55}  y={145} />
            <DiffGauge label="F.DECEL" value={frontDecel} x={265} y={145} />
          </>
        )}

        {/* AWD Center Balance gauge */}
        {isAWD && (
          <DiffGauge label="CENTER" value={centerBalance} x={150} y={106} />
        )}
      </svg>
    </div>
  );
}

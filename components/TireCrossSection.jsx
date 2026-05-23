'use client';

export default function TireCrossSection({ pressure = 30, maxPressure = 55, accentColor = '#ff2d78' }) {
  // Calculate tire deformation based on pressure
  const normalizedPressure = Math.max(0, Math.min(1, (pressure) / maxPressure));

  // Contact patch width: wider when low pressure, narrower when high
  const contactWidth = 80 - normalizedPressure * 50; // 80px at 0, 30px at max
  const contactX = 80 - contactWidth / 2;

  // Tire profile: flatter at low pressure, rounder at high
  const tireHeight = 30 + normalizedPressure * 15; // 30 at low, 45 at high
  const tireBulge = 20 + normalizedPressure * 15; // horizontal bulge

  // Determine contact patch label
  let contactLabel = 'Normal';
  let contactLabelColor = accentColor;
  if (normalizedPressure < 0.35) {
    contactLabel = 'Sangat Lebar';
    contactLabelColor = '#00ff88';
  } else if (normalizedPressure < 0.5) {
    contactLabel = 'Lebar';
    contactLabelColor = '#00d4ff';
  } else if (normalizedPressure > 0.8) {
    contactLabel = 'Sangat Sempit';
    contactLabelColor = '#ff3344';
  } else if (normalizedPressure > 0.65) {
    contactLabel = 'Sempit';
    contactLabelColor = '#ffaa00';
  }

  return (
    <div className="tire-section-container">
      <svg viewBox="0 0 160 110" className="tire-svg">
        {/* Road surface */}
        <line x1="10" y1="95" x2="150" y2="95" stroke="#333344" strokeWidth="2" strokeLinecap="round" />

        {/* Tire body - using quadratic bezier for smooth shape */}
        <path
          d={`
            M ${80 - tireBulge} 95
            Q ${80 - tireBulge - 5} ${95 - tireHeight * 0.5},
              ${80 - tireBulge * 0.6} ${95 - tireHeight}
            Q ${80} ${95 - tireHeight - 8},
              ${80 + tireBulge * 0.6} ${95 - tireHeight}
            Q ${80 + tireBulge + 5} ${95 - tireHeight * 0.5},
              ${80 + tireBulge} 95
            Z
          `}
          fill="#2a2a35"
          stroke="#444455"
          strokeWidth="1.5"
          style={{ transition: 'all 0.6s ease' }}
        />

        {/* Tire tread pattern */}
        <path
          d={`
            M ${80 - tireBulge + 4} 95
            Q ${80 - tireBulge - 1} ${95 - tireHeight * 0.5},
              ${80 - tireBulge * 0.6 + 4} ${95 - tireHeight + 3}
            Q ${80} ${95 - tireHeight - 4},
              ${80 + tireBulge * 0.6 - 4} ${95 - tireHeight + 3}
            Q ${80 + tireBulge + 1} ${95 - tireHeight * 0.5},
              ${80 + tireBulge - 4} 95
          `}
          fill="none"
          stroke="#3a3a48"
          strokeWidth="1"
          strokeDasharray="4 3"
          style={{ transition: 'all 0.6s ease' }}
        />

        {/* Rim */}
        <rect
          x="62"
          y={95 - tireHeight + 10}
          width="36"
          height={tireHeight - 15}
          rx="4"
          ry="4"
          fill="#555566"
          stroke="#777788"
          strokeWidth="1"
          style={{ transition: 'all 0.6s ease' }}
        />

        {/* Rim inner detail */}
        <circle
          cx="80"
          cy={95 - tireHeight / 2 + 2}
          r="8"
          fill="#444455"
          stroke="#666677"
          strokeWidth="1"
          style={{ transition: 'all 0.6s ease' }}
        />

        {/* Rim bolt pattern */}
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const centerY = 95 - tireHeight / 2 + 2;
          const boltX = 80 + 5 * Math.cos((angle * Math.PI) / 180);
          const boltY = centerY + 5 * Math.sin((angle * Math.PI) / 180);
          return (
            <circle
              key={i}
              cx={boltX}
              cy={boltY}
              r="1.2"
              fill="#888899"
              style={{ transition: 'all 0.6s ease' }}
            />
          );
        })}

        {/* Contact patch highlight */}
        <rect
          x={contactX}
          y="93"
          width={contactWidth}
          height="4"
          rx="2"
          ry="2"
          fill={accentColor}
          opacity="0.7"
          style={{ transition: 'all 0.6s ease' }}
        >
          <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Contact patch glow */}
        <rect
          x={contactX - 2}
          y="92"
          width={contactWidth + 4}
          height="6"
          rx="3"
          ry="3"
          fill={accentColor}
          opacity="0.15"
          style={{ transition: 'all 0.6s ease', filter: 'blur(3px)' }}
        />
      </svg>

      <div className="tire-contact-label" style={{ color: contactLabelColor }}>
        Area Kontak: <strong>{contactLabel}</strong>
      </div>
    </div>
  );
}

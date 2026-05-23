'use client';

export default function WheelIllustration() {
  return (
    <svg
      className="hero-wheel"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer tire */}
      <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="3" opacity="0.5" />
      <circle cx="200" cy="200" r="175" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />

      {/* Tread pattern */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 10 * Math.PI) / 180;
        const x1 = (200 + 178 * Math.cos(angle)).toFixed(2);
        const y1 = (200 + 178 * Math.sin(angle)).toFixed(2);
        const x2 = (200 + 190 * Math.cos(angle)).toFixed(2);
        const y2 = (200 + 190 * Math.sin(angle)).toFixed(2);
        return (
          <line
            key={`tread-${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.2"
          />
        );
      })}

      {/* Rim outer */}
      <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <circle cx="200" cy="200" r="125" stroke="currentColor" strokeWidth="1" opacity="0.2" />

      {/* Spokes (5-spoke design) */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = ((i * 72 - 90) * Math.PI) / 180;
        const angleNext = (((i * 72 + 36) - 90) * Math.PI) / 180;
        const innerR = 35;
        const outerR = 120;
        const x1 = (200 + innerR * Math.cos(angle - 0.15)).toFixed(2);
        const y1 = (200 + innerR * Math.sin(angle - 0.15)).toFixed(2);
        const x2 = (200 + outerR * Math.cos(angle - 0.08)).toFixed(2);
        const y2 = (200 + outerR * Math.sin(angle - 0.08)).toFixed(2);
        const x3 = (200 + outerR * Math.cos(angleNext + 0.08)).toFixed(2);
        const y3 = (200 + outerR * Math.sin(angleNext + 0.08)).toFixed(2);
        const x4 = (200 + innerR * Math.cos(angleNext + 0.15)).toFixed(2);
        const y4 = (200 + innerR * Math.sin(angleNext + 0.15)).toFixed(2);
        return (
          <path
            key={`spoke-${i}`}
            d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} Z`}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            opacity="0.25"
          />
        );
      })}

      {/* Hub */}
      <circle cx="200" cy="200" r="35" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <circle cx="200" cy="200" r="15" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />

      {/* Lug nuts */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = ((i * 72 - 90) * Math.PI) / 180;
        const x = (200 + 25 * Math.cos(angle)).toFixed(2);
        const y = (200 + 25 * Math.sin(angle)).toFixed(2);
        return (
          <circle
            key={`lug-${i}`}
            cx={x} cy={y} r="4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            opacity="0.3"
          />
        );
      })}

      {/* Center cap detail */}
      <circle cx="200" cy="200" r="8" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

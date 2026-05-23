'use client';

export default function UnitToggle({ unit, onToggle }) {
  const isPsi = unit === 'psi';

  return (
    <div className="unit-toggle">
      <span className={`unit-toggle-label ${isPsi ? 'unit-toggle-label--active' : ''}`}>
        PSI
      </span>
      <div
        className="unit-toggle-track"
        onClick={onToggle}
        role="switch"
        aria-checked={!isPsi}
        aria-label="Ganti satuan tekanan"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      >
        <div className={`unit-toggle-thumb ${!isPsi ? 'unit-toggle-thumb--bar' : ''}`} />
      </div>
      <span className={`unit-toggle-label ${!isPsi ? 'unit-toggle-label--active' : ''}`}>
        BAR
      </span>
    </div>
  );
}

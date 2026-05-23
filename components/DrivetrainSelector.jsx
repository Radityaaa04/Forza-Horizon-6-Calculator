'use client';

const DRIVETRAINS = [
  { id: 'RWD', label: 'RWD', desc: 'Penggerak Belakang' },
  { id: 'FWD', label: 'FWD', desc: 'Penggerak Depan' },
  { id: 'AWD', label: 'AWD', desc: 'Semua Roda' },
];

export default function DrivetrainSelector({ selected, onSelect, visible }) {
  return (
    <div className={`drivetrain-container ${visible ? 'drivetrain-container--visible' : ''}`}>
      <div className="section-title">🔧 Sistem Penggerak</div>
      <div className="drivetrain-grid">
        {DRIVETRAINS.map((dt) => (
          <button
            key={dt.id}
            type="button"
            className={`drivetrain-card ${selected === dt.id ? 'drivetrain-card--active' : ''}`}
            onClick={() => onSelect(dt.id)}
            aria-pressed={selected === dt.id}
            tabIndex={visible ? 0 : -1}
          >
            <div className="drivetrain-label">{dt.label}</div>
            <div className="drivetrain-desc">{dt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

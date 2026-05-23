'use client';

const WEIGHT_CLASSES = [
  { id: 'light', emoji: '🪶', label: 'Ringan', desc: '< 1.000 kg' },
  { id: 'normal', emoji: '🚗', label: 'Normal', desc: '1.000 - 1.500 kg' },
  { id: 'heavy', emoji: '🛻', label: 'Berat', desc: '> 1.500 kg' },
];

export default function WeightClassSelector({ selected, onSelect }) {
  return (
    <div className="weight-class-grid">
      {WEIGHT_CLASSES.map((wc) => (
        <button
          key={wc.id}
          type="button"
          className={`weight-class-card ${selected === wc.id ? 'weight-class-card--active' : ''}`}
          onClick={() => onSelect(wc.id)}
          aria-pressed={selected === wc.id}
        >
          <span className="weight-class-emoji">{wc.emoji}</span>
          <span className="weight-class-label">{wc.label}</span>
          <span className="weight-class-desc">{wc.desc}</span>
        </button>
      ))}
    </div>
  );
}

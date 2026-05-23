'use client';

export default function WeightSlider({ value, onChange }) {
  return (
    <div className="slider-container">
      <div className="slider-header">
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Distribusi Berat
        </span>
        <span className="slider-value">{value}% Depan</span>
      </div>
      <input
        type="range"
        min="40"
        max="60"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        aria-label="Distribusi berat depan"
      />
      <div className="slider-labels">
        <span>40% Depan</span>
        <span>Seimbang</span>
        <span>60% Depan</span>
      </div>
    </div>
  );
}

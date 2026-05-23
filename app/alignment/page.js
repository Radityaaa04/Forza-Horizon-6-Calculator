'use client';

import { useState, useMemo } from 'react';
import AlignmentVisualizer from '../../components/AlignmentVisualizer';
import { calculateAlignment } from '../../lib/alignmentMath';

const TRACK_TYPES = [
  { id: 'Road',          label: 'Road / Circuit', icon: '🏁' },
  { id: 'Street',        label: 'Street',          icon: '🏙️' },
  { id: 'Drift',         label: 'Drift',           icon: '💨' },
  { id: 'Drag',          label: 'Drag',            icon: '🚀' },
  { id: 'Dirt',          label: 'Rally / Dirt',    icon: '🪨' },
  { id: 'Cross-Country', label: 'Cross-Country',   icon: '🌍' },
];

const SUSPENSION_TYPES = [
  { id: 'Stock',  label: 'Stock',     desc: 'Bawaan pabrik, empuk', icon: '📦' },
  { id: 'Street', label: 'Street',    desc: 'Lebih rendah, sedikit kaku', icon: '🛣️' },
  { id: 'Race',   label: 'Race',      desc: 'Kaku, roll minimal',   icon: '🏆' },
  { id: 'Rally',  label: 'Rally',     desc: 'Tinggi, travel panjang', icon: '🪨' },
  { id: 'Drift',  label: 'Drift',     desc: 'Setup angle ekstrem',  icon: '💨' },
];

const DEFAULT_FORM = {
  weight: 1250,
  weightDistribution: 52,
  drivetrain: 'RWD',
  suspensionType: 'Race',
  trackType: 'Road',
  springStiffness: 'medium',
};

export default function AlignmentPage() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [results, setResults] = useState(null);
  const [calculated, setCalculated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: isNaN(Number(value)) ? value : (name === 'weight' || name === 'weightDistribution') ? Number(value) : value }));
  };

  const handleCalculate = () => {
    const res = calculateAlignment({
      weight: Number(formData.weight),
      weightDistribution: Number(formData.weightDistribution),
      drivetrain: formData.drivetrain,
      suspensionType: formData.suspensionType,
      trackType: formData.trackType,
      springStiffness: formData.springStiffness,
    });
    setResults(res);
    setCalculated(true);
  };

  // Live preview (runs on every change after first calculation)
  const livePreview = useMemo(() => {
    return calculateAlignment({
      weight: Number(formData.weight) || 1250,
      weightDistribution: Number(formData.weightDistribution) || 52,
      drivetrain: formData.drivetrain,
      suspensionType: formData.suspensionType,
      trackType: formData.trackType,
      springStiffness: formData.springStiffness,
    });
  }, [formData]);

  return (
    <>
      <main className="main-content">

        {/* HEADER */}
        <div className="page-header stagger-1" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="page-title" style={{ fontSize: '2.2rem' }}>🧭 Alignment Tuning</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', maxWidth: '600px', margin: '8px auto 0' }}>
            Hitung Camber, Toe, dan Caster yang pas berdasarkan fisika kendaraan Anda. Hasil langsung bisa dimasukkan ke dalam game.
          </p>
        </div>

        {/* TRACK TYPE SELECTOR */}
        <div className="glass-card stagger-1" style={{ marginBottom: '24px' }}>
          <div className="section-title">🏎️ Tipe Lintasan / Discipline</div>
          <div className="track-selector-grid">
            {TRACK_TYPES.map(t => (
              <button
                key={t.id}
                className={`track-btn ${formData.trackType === t.id ? 'active' : ''}`}
                onClick={() => setFormData(p => ({ ...p, trackType: t.id }))}
              >
                <span className="track-btn-icon">{t.icon}</span>
                <span className="track-btn-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="gearing-layout">
          {/* LEFT: INPUTS */}
          <div className="gearing-left">

            {/* SUSPENSION TYPE */}
            <div className="glass-card stagger-2" style={{ marginBottom: '20px' }}>
              <div className="section-title">🔩 Jenis Suspensi</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SUSPENSION_TYPES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFormData(p => ({ ...p, suspensionType: s.id }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: '10px', border: '1px solid',
                      borderColor: formData.suspensionType === s.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                      background: formData.suspensionType === s.id ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: formData.suspensionType === s.id ? 'var(--color-primary)' : 'white', fontSize: '0.95rem' }}>{s.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* VEHICLE PARAMETERS */}
            <div className="glass-card stagger-2">
              <div className="section-title">⚙️ Parameter Kendaraan</div>
              <div className="gearing-form">

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Berat Mobil (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="form-input" placeholder="e.g. 1250" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Drivetrain</label>
                    <select name="drivetrain" value={formData.drivetrain} onChange={handleChange} className="form-select">
                      <option value="AWD">AWD</option>
                      <option value="RWD">RWD</option>
                      <option value="FWD">FWD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kekakuan Spring (ARB/Per)</label>
                    <select name="springStiffness" value={formData.springStiffness} onChange={handleChange} className="form-select">
                      <option value="soft">Soft (Empuk)</option>
                      <option value="medium">Medium (Sedang)</option>
                      <option value="stiff">Stiff (Kaku)</option>
                    </select>
                  </div>
                </div>

                {/* WEIGHT DISTRIBUTION SLIDER */}
                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label className="form-label">
                    Distribusi Berat: <strong style={{ color: 'var(--color-primary)' }}>{formData.weightDistribution}% Depan</strong> / {100 - formData.weightDistribution}% Belakang
                  </label>
                  <input
                    type="range" name="weightDistribution"
                    min="30" max="70" value={formData.weightDistribution}
                    onChange={handleChange}
                    style={{ width: '100%', accentColor: 'var(--color-primary)', marginTop: '8px', height: '6px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    <span>30% (Rear Heavy)</span>
                    <span>50% (Balanced)</span>
                    <span>70% (Nose Heavy)</span>
                  </div>
                </div>

                <button
                  className="btn-calculate"
                  onClick={handleCalculate}
                  disabled={!formData.weight}
                  style={{ marginTop: '24px' }}
                >
                  🧭 Hitung Alignment Final Tune
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="gearing-right">
            <div className="glass-card glass-card--glow stagger-3" style={{ marginBottom: '20px' }}>
              <div className="section-title" style={{ justifyContent: 'center' }}>
                📊 Visualisasi Real-Time
              </div>
              <AlignmentVisualizer
                frontCamber={livePreview.frontCamber}
                rearCamber={livePreview.rearCamber}
                frontToe={livePreview.frontToe}
                rearToe={livePreview.rearToe}
                caster={livePreview.caster}
              />
            </div>

            <div className="glass-card glass-card--glow stagger-3">
              <div className="section-title" style={{ justifyContent: 'center' }}>
                🎯 Hasil Alignment
              </div>

              {!calculated && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Tekan tombol <strong>"Hitung Alignment"</strong> untuk mendapatkan angka final tune.
                </div>
              )}

              {results && (
                <>
                  {results.warnings.length > 0 && (
                    <div style={{ padding: '12px', background: 'rgba(255,170,0,0.1)', border: '1px solid var(--color-warning, #ffaa00)', borderRadius: '8px', color: '#ffaa00', fontSize: '0.8rem', marginBottom: '16px', lineHeight: '1.5' }}>
                      {results.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
                    </div>
                  )}

                  <table className="gear-ratio-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Nilai</th>
                        <th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span style={{ color: 'var(--color-primary)' }}>Front Camber</span></td>
                        <td><span className="gear-number">{results.frontCamber}°</span></td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Kemiringan roda depan</td>
                      </tr>
                      <tr>
                        <td><span style={{ color: 'var(--color-primary)' }}>Rear Camber</span></td>
                        <td><span className="gear-number">{results.rearCamber}°</span></td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Kemiringan roda belakang</td>
                      </tr>
                      <tr>
                        <td><span style={{ color: 'var(--color-accent)' }}>Front Toe</span></td>
                        <td><span className="gear-number">{results.frontToe}°</span></td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{results.frontToe > 0 ? 'Toe Out → Tajam' : results.frontToe < 0 ? 'Toe In → Stabil' : 'Neutral'}</td>
                      </tr>
                      <tr>
                        <td><span style={{ color: 'var(--color-accent)' }}>Rear Toe</span></td>
                        <td><span className="gear-number">{results.rearToe}°</span></td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{results.rearToe < 0 ? 'Toe In → Stabil belakang' : results.rearToe > 0 ? 'Toe Out → Oversteer' : 'Neutral'}</td>
                      </tr>
                      <tr className="final-drive-row">
                        <td>Front Caster</td>
                        <td>{results.caster}°</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Sudut kingpin</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="protip-box" style={{ marginTop: '16px', marginBottom: 0 }}>
                    💡 <strong>Cara Verifikasi:</strong> Buka Telemetry → Tab Tire. Saat menikung penuh, angka Camber di ban luar idealnya menunjukkan <strong>0.0° sampai -0.1°</strong>. Jika tidak, sesuaikan ±0.2° dari nilai di atas.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

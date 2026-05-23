'use client';

import { useState, useMemo } from 'react';
import ARBVisualizer from '../../components/ARBVisualizer';
import { calculateARB } from '../../lib/arbMath';

const TRACK_TYPES = [
  { id: 'Road',          label: 'Road / Circuit', icon: '🏁' },
  { id: 'Street',        label: 'Street',          icon: '🏙️' },
  { id: 'Drift',         label: 'Drift',           icon: '💨' },
  { id: 'Drag',          label: 'Drag',            icon: '🚀' },
  { id: 'Dirt',          label: 'Rally / Dirt',    icon: '🪨' },
  { id: 'Cross-Country', label: 'Cross-Country',   icon: '🌍' },
];

const HANDLING_BIAS = [
  { id: 'Understeer', label: 'Understeer', desc: 'Lebih aman, less rotation', icon: '🛡️' },
  { id: 'Neutral',    label: 'Neutral',    desc: 'Handling seimbang',          icon: '⚖️' },
  { id: 'Oversteer',  label: 'Oversteer',  desc: 'Lebih lincah, lebih liar',  icon: '⚡' },
];

const TIRE_COMPOUNDS = [
  'Stock', 'Street', 'Sport', 'Semi Slick', 'Slick', 'Drift', 'Drag', 'Snow', 'Rally', 'Off-Road'
];

const SUSPENSION_TYPES = ['Stock', 'Street', 'Race', 'Rally', 'Drift'];

const DEFAULT_FORM = {
  weight: 1250,
  weightDistribution: 52,
  drivetrain: 'RWD',
  suspensionType: 'Race',
  trackType: 'Road',
  tireCompound: 'Sport',
  handlingBias: 'Neutral',
};

export default function ARBPage() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [results, setResults] = useState(null);
  const [calculated, setCalculated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'weight' || name === 'weightDistribution') ? Number(value) : value,
    }));
  };

  const handleCalculate = () => {
    const res = calculateARB(formData);
    setResults(res);
    setCalculated(true);
  };

  // Live preview for visualizer
  const livePreview = useMemo(() => calculateARB({
    ...formData,
    weight: Number(formData.weight) || 1250,
    weightDistribution: Number(formData.weightDistribution) || 52,
  }), [formData]);

  return (
    <>
      <main className="main-content">

        {/* HEADER */}
        <div className="page-header stagger-1" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="page-title" style={{ fontSize: '2.2rem' }}>🔩 Anti-Roll Bars</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', maxWidth: '600px', margin: '8px auto 0' }}>
            Hitung kekakuan ARB depan dan belakang untuk mengontrol body roll dan karakter handling mobil Anda.
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

        {/* HANDLING BIAS */}
        <div className="glass-card stagger-1" style={{ marginBottom: '24px' }}>
          <div className="section-title">🎯 Karakter Handling</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {HANDLING_BIAS.map(b => (
              <button
                key={b.id}
                onClick={() => setFormData(p => ({ ...p, handlingBias: b.id }))}
                style={{
                  padding: '14px 12px', borderRadius: '12px', border: '1px solid',
                  borderColor: formData.handlingBias === b.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                  background: formData.handlingBias === b.id ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{b.icon}</div>
                <div style={{ fontWeight: 700, color: formData.handlingBias === b.id ? 'var(--color-primary)' : 'white', fontSize: '0.9rem' }}>{b.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{b.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="gearing-layout">
          {/* LEFT: INPUTS */}
          <div className="gearing-left">
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

                <div className="form-row" style={{ marginTop: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Jenis Suspensi</label>
                    <select name="suspensionType" value={formData.suspensionType} onChange={handleChange} className="form-select">
                      {SUSPENSION_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tire Compound</label>
                    <select name="tireCompound" value={formData.tireCompound} onChange={handleChange} className="form-select">
                      {TIRE_COMPOUNDS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  className="btn-calculate"
                  onClick={handleCalculate}
                  disabled={!formData.weight}
                  style={{ marginTop: '24px' }}
                >
                  🔩 Hitung Anti-Roll Bars
                </button>
              </div>
            </div>

            {/* QUICK REFERENCE */}
            <div className="protip-box stagger-3" style={{ marginTop: '16px' }}>
              💡 <strong>Panduan Cepat:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', lineHeight: '1.8', fontSize: '0.82rem' }}>
                <li><strong>ARB Depan lebih kaku</strong> → Oversteer, ekor lebih mudah keluar</li>
                <li><strong>ARB Belakang lebih kaku</strong> → Understeer, lebih stabil</li>
                <li><strong>Drag/Circuit</strong> → ARB kaku agar tidak goyang kanan-kiri</li>
                <li><strong>Rally/CC</strong> → ARB lunak agar ban bisa mengikuti kontur tanah</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="gearing-right">
            {/* LIVE VISUALIZER */}
            <div className="glass-card glass-card--glow stagger-3" style={{ marginBottom: '20px' }}>
              <div className="section-title" style={{ justifyContent: 'center' }}>📊 Simulasi Real-Time</div>
              <ARBVisualizer
                frontARB={livePreview.frontARB}
                rearARB={livePreview.rearARB}
                weight={Number(formData.weight) || 1250}
              />
            </div>

            {/* RESULTS TABLE */}
            <div className="glass-card glass-card--glow stagger-3">
              <div className="section-title" style={{ justifyContent: 'center' }}>🎯 Hasil Anti-Roll Bars</div>

              {!calculated && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Tekan <strong>"Hitung Anti-Roll Bars"</strong> untuk mendapatkan angka final tune.
                </div>
              )}

              {results && (
                <>
                  {results.warnings.length > 0 && (
                    <div style={{ padding: '12px', background: 'rgba(255,170,0,0.1)', border: '1px solid #ffaa00', borderRadius: '8px', color: '#ffaa00', fontSize: '0.8rem', marginBottom: '16px', lineHeight: '1.5' }}>
                      {results.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
                    </div>
                  )}

                  {/* MAIN ARB VALUES — Big display */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,45,120,0.1)', borderRadius: '12px', border: '1px solid rgba(255,45,120,0.3)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.1em' }}>FRONT ARB</div>
                      <div style={{ fontSize: '2.8rem', fontWeight: 900, fontFamily: 'Orbitron, monospace', color: 'var(--color-primary)', lineHeight: 1 }}>
                        {results.frontARB}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(0,212,255,0.1)', borderRadius: '12px', border: '1px solid rgba(0,212,255,0.3)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.1em' }}>REAR ARB</div>
                      <div style={{ fontSize: '2.8rem', fontWeight: 900, fontFamily: 'Orbitron, monospace', color: 'var(--color-accent)', lineHeight: 1 }}>
                        {results.rearARB}
                      </div>
                    </div>
                  </div>

                  {/* BALANCE INFO */}
                  <table className="gear-ratio-table">
                    <tbody>
                      <tr>
                        <td>Balance Depan</td>
                        <td><span className="gear-number">{results.frontBias}%</span></td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Front roll resistance</td>
                      </tr>
                      <tr>
                        <td>Balance Belakang</td>
                        <td><span className="gear-number">{results.rearBias}%</span></td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Rear roll resistance</td>
                      </tr>
                      <tr className="final-drive-row">
                        <td>Karakter</td>
                        <td colSpan="2">{results.balanceLabel}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="protip-box" style={{ marginTop: '16px', marginBottom: 0 }}>
                    💡 <strong>Verifikasi di Game:</strong> Coba masuk tikungan cepat sambil lihat Telemetry → Suspension Travel. Kedua ban (dalam & luar) idealnya masih punya travel tersisa. Jika ban dalam terangkat (0mm travel), ARB terlalu kaku → turunkan ±5.
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

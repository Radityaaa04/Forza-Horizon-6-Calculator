'use client';

import { useState, useMemo, useEffect } from 'react';
import DifferentialVisualizer from '../../components/DifferentialVisualizer';
import { calculateDifferential } from '../../lib/differentialMath';

const SLIDER_ROW = ({ label, value, accent = '#00ffaa' }) => (
  <div style={{ marginBottom: '1.2rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
      <span style={{ color: '#aaa', fontFamily: 'Orbitron', fontSize: '0.75rem' }}>{label}</span>
      <span style={{ color: accent, fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 'bold' }}>{value}%</span>
    </div>
    <div style={{ position: 'relative', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: `${value}%`,
        height: '100%',
        background: `linear-gradient(to right, ${accent}66, ${accent})`,
        borderRadius: '10px',
        transition: 'width 0.4s ease',
        boxShadow: `0 0 8px ${accent}88`,
      }} />
    </div>
  </div>
);

export default function DifferentialPage() {
  const [formData, setFormData] = useState({
    drivetrain: 'RWD',
    weightBias: '50',
    horsepower: '400',
    tireCompound: 'sport'
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const results = useMemo(() => calculateDifferential(formData), [formData]);

  if (!mounted) return null;

  const isAWD = formData.drivetrain === 'AWD';
  const isFWD = formData.drivetrain === 'FWD';
  const isRWD = formData.drivetrain === 'RWD';

  return (
    <main className="main-content">
      <div className="hero-content stagger-1" style={{ marginBottom: '2rem' }}>
        <h1 className="logo" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>DIFFERENTIAL CALC</h1>
        <p className="logo-tagline">Kalkulator Differential Accel & Decel untuk Forza Horizon.</p>
      </div>

      <div className="calculator-layout">

        {/* ── INPUT ─────────────────────────────────────── */}
        <div className="input-section stagger-2">
          <div className="glass-panel">
            <h2 className="panel-title">Parameter Kendaraan</h2>

            <div className="form-group">
              <label>Penggerak (Drivetrain)</label>
              <select name="drivetrain" value={formData.drivetrain} onChange={handleChange} className="glass-input">
                <option value="RWD">RWD (Rear-Wheel Drive)</option>
                <option value="AWD">AWD (All-Wheel Drive)</option>
                <option value="FWD">FWD (Front-Wheel Drive)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tipe Trek</label>
              <select name="trackType" value={formData.trackType} onChange={handleChange} className="glass-input">
                <option value="race">Race / Circuit</option>
                <option value="street">Street / Sprint</option>
                <option value="rally">Rally / Dirt</option>
                <option value="offroad">Cross Country / Offroad</option>
                <option value="drift">Drift Zone</option>
                <option value="drag">Drag Strip</option>
              </select>
            </div>

            <div className="form-group">
              <label>Horsepower (HP)</label>
              <input
                type="number"
                name="horsepower"
                value={formData.horsepower}
                onChange={handleChange}
                className="glass-input"
                min="100" max="2000"
              />
            </div>

            <div className="form-group">
              <label>Compound Ban</label>
              <select name="tireCompound" value={formData.tireCompound} onChange={handleChange} className="glass-input">
                <option value="slick">Slick</option>
                <option value="race">Race</option>
                <option value="sport">Sport</option>
                <option value="street">Street</option>
                <option value="rally">Rally</option>
                <option value="offroad">Offroad</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Distribusi Berat Depan (%)</label>
              <div className="range-container">
                <input
                  type="range"
                  name="weightBias"
                  value={formData.weightBias}
                  onChange={handleChange}
                  className="glass-range"
                  min="30" max="70" step="1"
                />
                <span className="range-value">{formData.weightBias}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── OUTPUT ────────────────────────────────────── */}
        <div className="output-section stagger-3">
          <div className="glass-panel result-panel">
            <h2 className="panel-title">Hasil Tuning Differential</h2>

            {results.error ? (
              <div style={{ color: '#ff2d78', padding: '1rem', background: 'rgba(255,45,120,0.1)', borderRadius: '8px' }}>
                {results.error}
              </div>
            ) : (
              <>
                <DifferentialVisualizer
                  drivetrain={results.drivetrain}
                  frontAccel={results.frontAccel}
                  frontDecel={results.frontDecel}
                  rearAccel={results.rearAccel}
                  rearDecel={results.rearDecel}
                  centerBalance={results.centerBalance}
                />

                <div style={{ marginTop: '1.5rem' }}>

                  {/* FRONT diff — shown for FWD and AWD */}
                  {(isFWD || isAWD) && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ color: '#00ffaa', fontFamily: 'Orbitron', fontSize: '0.8rem', marginBottom: '1rem', letterSpacing: '2px' }}>
                        ▸ FRONT DIFFERENTIAL
                      </h3>
                      <SLIDER_ROW label="Acceleration" value={results.frontAccel} accent="#00ffaa" />
                      <SLIDER_ROW label="Deceleration" value={results.frontDecel} accent="#00ccaa" />
                    </div>
                  )}

                  {/* REAR diff — shown for RWD and AWD */}
                  {(isRWD || isAWD) && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ color: '#ff2d78', fontFamily: 'Orbitron', fontSize: '0.8rem', marginBottom: '1rem', letterSpacing: '2px' }}>
                        ▸ REAR DIFFERENTIAL
                      </h3>
                      <SLIDER_ROW label="Acceleration" value={results.rearAccel}  accent="#ff2d78" />
                      <SLIDER_ROW label="Deceleration" value={results.rearDecel}  accent="#cc1155" />
                    </div>
                  )}

                  {/* CENTER diff — AWD only */}
                  {isAWD && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ color: '#ffcc00', fontFamily: 'Orbitron', fontSize: '0.8rem', marginBottom: '1rem', letterSpacing: '2px' }}>
                        ▸ CENTER DIFFERENTIAL
                      </h3>
                      {/* Center balance bar — 0 = full rear, 100 = full front */}
                      <div style={{ marginBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: '#888', fontFamily: 'Orbitron', fontSize: '0.7rem' }}>FULL REAR</span>
                          <span style={{ color: '#ffcc00', fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 'bold' }}>{results.centerBalance}%</span>
                          <span style={{ color: '#888', fontFamily: 'Orbitron', fontSize: '0.7rem' }}>FULL FRONT</span>
                        </div>
                        <div style={{ position: 'relative', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{
                            position: 'absolute', left: 0, top: 0,
                            width: `${results.centerBalance}%`,
                            height: '100%',
                            background: 'linear-gradient(to right, #ff2d78, #ffcc00)',
                            borderRadius: '10px',
                            transition: 'width 0.4s ease',
                          }} />
                          {/* 50% marker */}
                          <div style={{ position: 'absolute', left: '50%', top: 0, width: '2px', height: '100%', background: '#fff', opacity: 0.3, transform: 'translateX(-50%)' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {results.warnings?.length > 0 && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,204,0,0.1)', borderRadius: '8px', borderLeft: '4px solid #ffcc00' }}>
                    <h4 style={{ color: '#ffcc00', marginBottom: '0.5rem', fontFamily: 'Orbitron' }}>Catatan Tuning</h4>
                    <ul style={{ color: '#ccc', paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                      {results.warnings.map((w, i) => <li key={i} style={{ marginBottom: '4px' }}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

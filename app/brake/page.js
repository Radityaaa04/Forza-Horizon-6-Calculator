'use client';

import { useState, useMemo, useEffect } from 'react';
import BrakeVisualizer from '../../components/BrakeVisualizer';
import { calculateBrakes } from '../../lib/brakeMath';

export default function BrakePage() {
  const [formData, setFormData] = useState({
    weightBias: '50',
    weight: '1200',
    trackType: 'race',
    drivetrain: 'RWD',
    absEnabled: 'off',
    tireCompound: 'sport',
    topSpeed: '250'
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const results = useMemo(() => calculateBrakes(formData), [formData]);

  if (!mounted) return null;

  // Visual bar for balance (0–100%)
  const frontPercent = results.balance ?? 50;
  const rearPercent = 100 - frontPercent;

  // Visual bar for pressure (0–200%)
  const pressurePercent = ((results.pressure ?? 100) / 200) * 100;

  return (
    <main className="main-content">
      <div className="hero-content stagger-1" style={{ marginBottom: '2rem' }}>
        <h1 className="logo" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>BRAKE CALC</h1>
        <p className="logo-tagline">Kalkulator Brake Balance & Pressure untuk Forza Horizon.</p>
      </div>

      <div className="calculator-layout">
        {/* INPUT SECTION */}
        <div className="input-section stagger-2">
          <div className="glass-panel">
            <h2 className="panel-title">Parameter Kendaraan</h2>

            <div className="form-group">
              <label>Berat Total (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="glass-input"
                min="500" max="3000"
              />
            </div>

            <div className="form-group">
              <label>Target Top Speed (km/h)</label>
              <input
                type="number"
                name="topSpeed"
                value={formData.topSpeed}
                onChange={handleChange}
                className="glass-input"
                min="100" max="500"
              />
              <small style={{ color: '#888', display: 'block', marginTop: '4px' }}>Kecepatan tinggi butuh pressure lebih untuk menghentikan energi kinetik.</small>
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

            <div className="form-group">
              <label>Penggerak (Drivetrain)</label>
              <select name="drivetrain" value={formData.drivetrain} onChange={handleChange} className="glass-input">
                <option value="RWD">RWD</option>
                <option value="AWD">AWD</option>
                <option value="FWD">FWD</option>
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
              <label>ABS</label>
              <select name="absEnabled" value={formData.absEnabled} onChange={handleChange} className="glass-input">
                <option value="off">OFF (Tanpa ABS)</option>
                <option value="on">ON (Dengan ABS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* OUTPUT SECTION */}
        <div className="output-section stagger-3">
          <div className="glass-panel result-panel">
            <h2 className="panel-title">Hasil Tuning Rem</h2>

            {results.error ? (
              <div style={{ color: '#ff2d78', padding: '1rem', background: 'rgba(255,45,120,0.1)', borderRadius: '8px' }}>
                {results.error}
              </div>
            ) : (
              <>
                <BrakeVisualizer balance={results.balance} pressure={results.pressure} />

                {/* BRAKE BALANCE BAR */}
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#888', fontFamily: 'Orbitron', fontSize: '0.8rem' }}>BELAKANG</span>
                    <span style={{ color: '#fff', fontFamily: 'Orbitron', fontSize: '0.8rem' }}>BRAKE BALANCE</span>
                    <span style={{ color: '#888', fontFamily: 'Orbitron', fontSize: '0.8rem' }}>DEPAN</span>
                  </div>
                  <div style={{ position: 'relative', height: '28px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', overflow: 'hidden' }}>
                    {/* Front bar from right */}
                    <div style={{
                      position: 'absolute', right: 0, top: 0,
                      width: `${frontPercent}%`, height: '100%',
                      background: 'linear-gradient(to left, #ff2d78, rgba(255,45,120,0.4))',
                      borderRadius: '14px',
                      transition: 'width 0.5s ease'
                    }} />
                    {/* Rear bar from left */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0,
                      width: `${rearPercent}%`, height: '100%',
                      background: 'linear-gradient(to right, #00ffaa, rgba(0,255,170,0.4))',
                      borderRadius: '14px',
                      transition: 'width 0.5s ease'
                    }} />
                    {/* Center marker */}
                    <div style={{
                      position: 'absolute', left: '50%', top: 0,
                      width: '2px', height: '100%',
                      background: '#fff',
                      transform: 'translateX(-50%)',
                      opacity: 0.3
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ color: '#00ffaa', fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 'bold' }}>
                      {rearPercent.toFixed(1)}%
                    </span>
                    <span style={{ color: '#ff2d78', fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 'bold' }}>
                      {frontPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* BRAKE PRESSURE BAR */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#fff', fontFamily: 'Orbitron', fontSize: '0.8rem' }}>BRAKE PRESSURE</span>
                    <span style={{ color: '#ffcc00', fontFamily: 'Orbitron', fontSize: '1rem', fontWeight: 'bold' }}>
                      {results.pressure.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: '28px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0,
                      width: `${pressurePercent}%`, height: '100%',
                      background: 'linear-gradient(to right, #ffcc00, #ff6600)',
                      borderRadius: '14px',
                      transition: 'width 0.5s ease'
                    }} />
                    {/* 100% marker */}
                    <div style={{
                      position: 'absolute', left: '50%', top: 0,
                      width: '2px', height: '100%',
                      background: '#fff',
                      transform: 'translateX(-50%)',
                      opacity: 0.3
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>0%</span>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>100%</span>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>200%</span>
                  </div>
                </div>

                {results.warnings && results.warnings.length > 0 && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,204,0,0.1)', borderRadius: '8px', borderLeft: '4px solid #ffcc00' }}>
                    <h4 style={{ color: '#ffcc00', marginBottom: '0.5rem', fontFamily: 'Orbitron' }}>Catatan Tuning</h4>
                    <ul style={{ color: '#ccc', paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                      {results.warnings.map((warn, i) => <li key={i} style={{ marginBottom: '4px' }}>{warn}</li>)}
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

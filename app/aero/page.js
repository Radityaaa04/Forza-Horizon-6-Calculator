'use client';

import { useState, useMemo, useEffect } from 'react';
import AeroVisualizer from '../../components/AeroVisualizer';
import { calculateAero } from '../../lib/aeroMath';

export default function AeroPage() {
  const [formData, setFormData] = useState({
    weight: '1200',
    horsepower: '400',
    drivetrain: 'RWD',
    trackType: 'race',
    aeroFocus: 'balanced',
    targetTopSpeed: '250'
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const results = useMemo(() => calculateAero(formData), [formData]);

  if (!mounted) return null;

  return (
    <main className="main-content">
      <div className="hero-content stagger-1" style={{ marginBottom: '2rem' }}>
        <h1 className="logo" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>AERO CALC</h1>
        <p className="logo-tagline">Kalkulator Aerodynamic Downforce untuk Forza Horizon.</p>
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
              <label>Tenaga Mesin (HP)</label>
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
              <label>Target Top Speed (km/h)</label>
              <input 
                type="number" 
                name="targetTopSpeed" 
                value={formData.targetTopSpeed} 
                onChange={handleChange} 
                className="glass-input"
                min="100" max="500" step="5"
              />
              <small style={{ color: '#888', display: 'block', marginTop: '4px' }}>Kecepatan mempengaruhi downforce secara eksponensial (v²).</small>
            </div>

            <div className="form-group">
              <label>Fokus Aerodinamika</label>
              <select name="aeroFocus" value={formData.aeroFocus} onChange={handleChange} className="glass-input">
                <option value="speed">Top Speed (Downforce Rendah)</option>
                <option value="balanced">Balanced (Seimbang)</option>
                <option value="cornering">Cornering (Downforce Maksimum)</option>
              </select>
            </div>
          </div>
        </div>

        {/* OUTPUT SECTION */}
        <div className="output-section stagger-3">
          <div className="glass-panel result-panel">
            <h2 className="panel-title">Target Downforce (kgf)</h2>
            
            {results.error ? (
              <div className="error-message" style={{ color: '#ff2d78', padding: '1rem', background: 'rgba(255,45,120,0.1)', borderRadius: '8px' }}>
                {results.error}
              </div>
            ) : (
              <>
                <AeroVisualizer 
                  frontAero={results.frontAero}
                  rearAero={results.rearAero}
                />

                <div className="results-grid" style={{ marginTop: '2rem' }}>
                  <div className="result-card">
                    <span className="result-label">Aero Depan</span>
                    <span className="result-value" style={{ color: '#00ffaa' }}>
                      {results.frontAero} <span style={{ fontSize: '0.9rem', color: '#888' }}>kgf</span>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#7b61ff' }}>
                      Slider: ~{results.frontSliderPct}%
                    </span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Aero Belakang</span>
                    <span className="result-value" style={{ color: '#ff2d78' }}>
                      {results.rearAero} <span style={{ fontSize: '0.9rem', color: '#888' }}>kgf</span>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#7b61ff' }}>
                      Slider: ~{results.rearSliderPct}%
                    </span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Total Downforce</span>
                    <span className="result-value" style={{ color: '#00d4ff' }}>
                      {results.totalDownforce} <span style={{ fontSize: '0.9rem', color: '#888' }}>kgf</span>
                    </span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Est. Drag Penalty</span>
                    <span className="result-value" style={{ color: results.dragPenaltyLabel === 'Tinggi' ? '#ff2d78' : results.dragPenaltyLabel === 'Rendah' ? '#00ffaa' : '#ffcc00' }}>
                      -{results.dragPenaltyKmh} <span style={{ fontSize: '0.9rem', color: '#888' }}>km/h</span>
                    </span>
                  </div>
                </div>

                {/* Additional Stats */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                   <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#888' }}>Speed Factor (v²): </span>
                      <span style={{ color: '#00d4ff', fontFamily: 'Orbitron' }}>{results.speedFactor}x</span>
                   </div>
                   <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#888' }}>Drag Level: </span>
                      <span style={{ color: '#fff', fontFamily: 'Orbitron' }}>{results.dragPenaltyLabel}</span>
                   </div>
                </div>

                {results.warnings && results.warnings.length > 0 && (
                  <div className="warnings-container" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255, 204, 0, 0.1)', borderRadius: '8px', borderLeft: '4px solid #ffcc00' }}>
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

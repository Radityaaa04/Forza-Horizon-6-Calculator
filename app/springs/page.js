'use client';

import { useState, useMemo, useEffect } from 'react';
import SpringsVisualizer from '../../components/SpringsVisualizer';
import { calculateSprings, SUSPENSION_TYPES } from '../../lib/springsMath';

export default function SpringsPage() {
  const [formData, setFormData] = useState({
    weight: '1200',
    weightBias: '50',
    suspensionType: 'race',
    aeroDownforceFront: '0',
    aeroDownforceRear: '0'
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const results = useMemo(() => calculateSprings(formData), [formData]);

  if (!mounted) return null; // Avoid hydration mismatch on initial render

  return (
    <main className="main-content">
      <div className="hero-content stagger-1" style={{ marginBottom: '2rem' }}>
        <h1 className="logo" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>SPRINGS CALC</h1>
        <p className="logo-tagline">Kalkulator Kekakuan Pegas & Ride Height untuk Forza Horizon.</p>
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
              <label>Aero Downforce Depan (kgf)</label>
              <input 
                type="number" 
                name="aeroDownforceFront" 
                value={formData.aeroDownforceFront} 
                onChange={handleChange} 
                className="glass-input"
                min="0" max="1000"
              />
              <small style={{ color: '#888', display: 'block', marginTop: '4px' }}>Isi 0 jika tidak ada aero depan.</small>
            </div>

            <div className="form-group">
              <label>Aero Downforce Belakang (kgf)</label>
              <input 
                type="number" 
                name="aeroDownforceRear" 
                value={formData.aeroDownforceRear} 
                onChange={handleChange} 
                className="glass-input"
                min="0" max="1000"
              />
              <small style={{ color: '#888', display: 'block', marginTop: '4px' }}>Isi 0 jika tidak ada aero belakang.</small>
            </div>

            <div className="form-group">
              <label>Tipe Suspensi</label>
              <select 
                name="suspensionType" 
                value={formData.suspensionType} 
                onChange={handleChange} 
                className="glass-input"
              >
                {Object.entries(SUSPENSION_TYPES).map(([key, profile]) => (
                  <option key={key} value={key}>{profile.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* OUTPUT SECTION */}
        <div className="output-section stagger-3">
          <div className="glass-panel result-panel">
            <h2 className="panel-title">Hasil Tuning</h2>
            
            {results.error ? (
              <div className="error-message" style={{ color: '#ff2d78', padding: '1rem', background: 'rgba(255,45,120,0.1)', borderRadius: '8px' }}>
                {results.error}
              </div>
            ) : (
              <>
                <SpringsVisualizer 
                  frontSpring={results.frontSpring}
                  rearSpring={results.rearSpring}
                  rideHeightFront={results.rideHeightFront}
                  rideHeightRear={results.rideHeightRear}
                />

                <div className="results-grid" style={{ marginTop: '2rem' }}>
                  <div className="result-card">
                    <span className="result-label">Springs Depan</span>
                    <span className="result-value" style={{ color: '#00ffaa' }}>
                      {results.frontSpring.toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#888' }}>N/mm</span>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                      ({results.frontSpringKgf.toFixed(1)} kgf/mm)
                    </span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Springs Belakang</span>
                    <span className="result-value" style={{ color: '#ff2d78' }}>
                      {results.rearSpring.toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#888' }}>N/mm</span>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                      ({results.rearSpringKgf.toFixed(1)} kgf/mm)
                    </span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Ride Height Depan</span>
                    <span className="result-value">
                      {results.rideHeightFront.toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#888' }}>cm</span>
                    </span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Ride Height Belakang</span>
                    <span className="result-value">
                      {results.rideHeightRear.toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#888' }}>cm</span>
                    </span>
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

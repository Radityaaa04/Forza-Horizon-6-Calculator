'use client';

import { useState, useMemo, useEffect } from 'react';
import DampingVisualizer from '../../components/DampingVisualizer';
import { calculateDamping } from '../../lib/dampingMath';
import { SUSPENSION_TYPES } from '../../lib/springsMath';

export default function DampingPage() {
  const [formData, setFormData] = useState({
    weightBias: '50',
    suspensionType: 'race'
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const results = useMemo(() => calculateDamping(formData), [formData]);

  if (!mounted) return null;

  return (
    <main className="main-content">
      <div className="hero-content stagger-1" style={{ marginBottom: '2rem' }}>
        <h1 className="logo" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>DAMPING CALC</h1>
        <p className="logo-tagline">Kalkulator Rebound & Bump Stiffness untuk Forza Horizon.</p>
      </div>

      <div className="calculator-layout">
        {/* INPUT SECTION */}
        <div className="input-section stagger-2">
          <div className="glass-panel">
            <h2 className="panel-title">Parameter Kendaraan</h2>
            
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
            <h2 className="panel-title">Hasil Tuning Damping</h2>
            
            {results.error ? (
              <div className="error-message" style={{ color: '#ff2d78', padding: '1rem', background: 'rgba(255,45,120,0.1)', borderRadius: '8px' }}>
                {results.error}
              </div>
            ) : (
              <>
                <DampingVisualizer 
                  frontRebound={results.frontRebound}
                  rearRebound={results.rearRebound}
                  frontBump={results.frontBump}
                  rearBump={results.rearBump}
                />

                <div className="results-grid" style={{ marginTop: '2rem' }}>
                  <div className="result-card">
                    <span className="result-label">Rebound Depan</span>
                    <span className="result-value" style={{ color: '#00ffaa' }}>
                      {results.frontRebound.toFixed(1)}
                    </span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Rebound Belakang</span>
                    <span className="result-value" style={{ color: '#ff2d78' }}>
                      {results.rearRebound.toFixed(1)}
                    </span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Bump Depan</span>
                    <span className="result-value">
                      {results.frontBump.toFixed(1)}
                    </span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Bump Belakang</span>
                    <span className="result-value">
                      {results.rearBump.toFixed(1)}
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

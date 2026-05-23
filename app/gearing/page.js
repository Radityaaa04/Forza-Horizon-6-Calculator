'use client';

import { useState } from 'react';
import ScreenshotUploader from '@/components/ScreenshotUploader';
import GearingChart from '@/components/GearingChart';
import { calculateGears, TRACK_PROFILES } from '@/lib/gearingMath';

const TRACK_ICONS = {
  drag:         '🏁',
  road:         '🏎️',
  street:       '🌆',
  touge:        '⛰️',
  dirt:         '🪨',
  crosscountry: '🌲',
};

export default function GearingPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    peakTorqueRpm: '',
    peakPowerRpm: '',
    redlineRpm: '',
    numGears: '6',
    drivetrain: 'AWD',
    targetTopSpeed: '',
    trackType: 'road',
    weight: '',
    horsepower: '',
    tireCompound: 'Street'
  });
  const [results, setResults] = useState(null);

  const handleAnalyzed = (data) => {
    const merged = {
      ...formData,
      peakTorqueRpm: data.peakTorqueRpm || '',
      peakPowerRpm:  data.peakPowerRpm  || '',
      redlineRpm:    data.redlineRpm    || '',
      weight:        data.weight        || '',
      horsepower:    data.horsepower    || '',
      tireCompound:  data.tireCompound  || 'Street',
    };
    setFormData(merged);
    if (data.peakTorqueRpm && data.redlineRpm && formData.targetTopSpeed) {
      setTimeout(() => calculate(merged), 100);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTrackType = (type) => {
    setFormData(prev => ({ ...prev, trackType: type }));
    setResults(null);
  };

  const calculate = (dataToUse = formData) => {
    const res = calculateGears({
      peakTorqueRpm: dataToUse.peakTorqueRpm,
      redlineRpm:    dataToUse.redlineRpm,
      numGears:      dataToUse.numGears,
      drivetrain:    dataToUse.drivetrain,
      targetTopSpeed:dataToUse.targetTopSpeed,
      trackType:     dataToUse.trackType,
      weight:        dataToUse.weight,
      horsepower:    dataToUse.horsepower,
      tireCompound:  dataToUse.tireCompound,
    });
    setResults(res);
  };

  const activeProfile = TRACK_PROFILES[formData.trackType] || TRACK_PROFILES.road;

  return (
    <main className="gearing-page">
      <div className="hero-content stagger-1">
        <h1 className="logo" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>GEARING CALC</h1>
        <p className="logo-tagline">AI-Powered Transmission Tuning untuk Forza Horizon.</p>
      </div>

      <div className="track-type-selector stagger-2">
          {Object.entries(TRACK_PROFILES).map(([key, profile]) => (
            <button
              key={key}
              className={`track-type-btn ${formData.trackType === key ? 'track-type-btn--active' : ''}`}
              onClick={() => handleTrackType(key)}
            >
              <span className="track-icon">{TRACK_ICONS[key]}</span>
              <span className="track-label">{profile.label}</span>
            </button>
          ))}
        </div>

        {/* TRACK DESCRIPTION */}
        <div className="track-description stagger-2">
          <span className="track-desc-icon">{TRACK_ICONS[formData.trackType]}</span>
          <span>{activeProfile.description}</span>
        </div>

        <div className="gearing-grid">
          {/* LEFT: Inputs */}
          <div className="gearing-left">
            <ScreenshotUploader
              onAnalyzed={handleAnalyzed}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />

            <div className="glass-card stagger-2">
              <div className="section-title">⚙️ Parameter Mesin</div>
              <div className="gearing-form">

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Peak Torque RPM</label>
                    <input type="number" name="peakTorqueRpm" value={formData.peakTorqueRpm} onChange={handleChange} className="form-input" placeholder="e.g. 4500" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Peak Power RPM</label>
                    <input type="number" name="peakPowerRpm" value={formData.peakPowerRpm} onChange={handleChange} className="form-input" placeholder="e.g. 8500" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Redline RPM</label>
                    <input type="number" name="redlineRpm" value={formData.redlineRpm} onChange={handleChange} className="form-input" placeholder="e.g. 9000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jumlah Gigi</label>
                    <select name="numGears" value={formData.numGears} onChange={handleChange} className="form-select">
                      {[4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}-Speed</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Drivetrain</label>
                    <select name="drivetrain" value={formData.drivetrain} onChange={handleChange} className="form-select">
                      <option value="AWD">AWD — Traction++</option>
                      <option value="RWD">RWD — Standard</option>
                      <option value="FWD">FWD — Slip Prone</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Top Speed (km/h)</label>
                    <input type="number" name="targetTopSpeed" value={formData.targetTopSpeed} onChange={handleChange} className="form-input" placeholder="e.g. 235" />
                  </div>
                </div>

                {/* ADVANCED PHYSICS FIELDS */}
                <div className="section-title" style={{ marginTop: '24px' }}>🏎️ Fisika & Traksi (Advanced)</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Berat Mobil (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="form-input" placeholder="e.g. 1200" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Tenaga (HP)</label>
                    <input type="number" name="horsepower" value={formData.horsepower} onChange={handleChange} className="form-input" placeholder="e.g. 350" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipe Ban (Tire Compound)</label>
                    <select name="tireCompound" value={formData.tireCompound} onChange={handleChange} className="form-select">
                      <option value="Stock">Stock (Base Grip)</option>
                      <option value="Street">Street</option>
                      <option value="Sport">Sport</option>
                      <option value="Semi Slick">Semi Slick (Track Day)</option>
                      <option value="Slick">Slick (Race)</option>
                      <option value="Drift">Drift (Low Longitudinal Grip)</option>
                      <option value="Drag">Drag (Max Launch Grip)</option>
                      <option value="Snow">Snow</option>
                      <option value="Rally">Rally</option>
                      <option value="Off-Road">Off-Road</option>
                    </select>
                  </div>
                </div>

                <button
                  className="btn-calculate"
                  onClick={() => calculate()}
                  disabled={!formData.peakTorqueRpm || !formData.redlineRpm || !formData.targetTopSpeed}
                  style={{ marginTop: '24px' }}
                >
                  {TRACK_ICONS[formData.trackType]} Kalkulasi {activeProfile.label} Tune
                </button>
              </div>
            </div>

            <div className="protip-box stagger-3" style={{ marginTop: 0 }}>
              💡 <strong>Pro Tip:</strong> Jika ban terlalu spin saat start, turunkan angka rasio Gigi 1 di dalam game. Untuk trek Dirt/CC, biasanya juga perlu panjangkan Final Drive sedikit lagi.
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="gearing-right">
            <div className="glass-card glass-card--glow stagger-3" style={{ height: '100%' }}>
              <div className="section-title" style={{ justifyContent: 'center' }}>
                📊 {activeProfile.label} — Gearing Curve
              </div>

              <div className="gear-chart-wrapper">
                <GearingChart
                  chartData={results?.chartData}
                  peakTorqueRpm={formData.peakTorqueRpm}
                  peakPowerRpm={formData.peakPowerRpm}
                  redlineRpm={formData.redlineRpm}
                />
              </div>

              {results && (
                <>
                  {results.physicsWarnings && (
                    <div style={{ padding: '12px', background: 'rgba(255, 170, 0, 0.1)', border: '1px solid var(--color-warning)', borderRadius: '8px', color: 'var(--color-warning)', fontSize: '0.8rem', marginBottom: '16px', lineHeight: '1.4' }}>
                      {results.physicsWarnings}
                    </div>
                  )}
                  
                  <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Traction Index: <strong>{results.tractionIndex}</strong> <span style={{ opacity: 0.5 }}>(Higher = Better Launch Grip)</span>
                  </div>

                  <table className="gear-ratio-table">
                    <thead>
                      <tr>
                        <th>Gigi</th>
                        <th>Rasio — {activeProfile.label}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="final-drive-row">
                        <td>Final Drive</td>
                        <td>{results.finalDrive.toFixed(2)}</td>
                      </tr>
                      {results.gears.map((ratio, idx) => (
                        <tr key={idx}>
                          <td><span className="gear-number">{idx + 1}</span></td>
                          <td>{ratio.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
  );
}

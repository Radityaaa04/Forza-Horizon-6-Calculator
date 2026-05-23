'use client';

import { useState, useMemo, useEffect } from 'react';
import TuneSummarySheet from '../../components/TuneSummarySheet';
import TuneErrorBoundary from '../../components/TuneErrorBoundary';
import PerformanceGauge from '../../components/PerformanceGauge';

// CORRECT imports — verified file names and function names
import { calculatePressure } from '../../lib/calculator';
import { calculateGears } from '../../lib/gearingMath';
import { calculateAlignment } from '../../lib/alignmentMath';
import { calculateARB } from '../../lib/arbMath';
import { calculateSprings } from '../../lib/springsMath';
import { calculateAero } from '../../lib/aeroMath';
import { calculateDamping } from '../../lib/dampingMath';
import { calculateBrakes } from '../../lib/brakeMath';
import { calculateDifferential } from '../../lib/differentialMath';

export default function TunePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ── VEHICLE PRESETS ──
  const PRESETS = {
    custom: { label: '— Custom —' },
    gtr_r35: {
      label: 'Nissan GT-R R35',
      weight: '1740', weightBias: '54', horsepower: '565', topSpeed: '315',
      maxRpm: '7100', drivetrain: 'AWD', tireCompound: 'sport', suspensionType: 'race',
      trackType: 'race', aeroDownforceFront: '0', aeroDownforceRear: '0', gearCount: '6', absEnabled: 'off'
    },
    m3_e46: {
      label: 'BMW M3 E46',
      weight: '1570', weightBias: '51', horsepower: '343', topSpeed: '280',
      maxRpm: '8000', drivetrain: 'RWD', tireCompound: 'sport', suspensionType: 'race',
      trackType: 'race', aeroDownforceFront: '0', aeroDownforceRear: '0', gearCount: '6', absEnabled: 'off'
    },
    supra_mk5: {
      label: 'Toyota Supra GR (A90)',
      weight: '1495', weightBias: '52', horsepower: '382', topSpeed: '290',
      maxRpm: '7200', drivetrain: 'RWD', tireCompound: 'sport', suspensionType: 'race',
      trackType: 'race', aeroDownforceFront: '0', aeroDownforceRear: '0', gearCount: '8', absEnabled: 'off'
    },
    civic_fk8: {
      label: 'Honda Civic Type R (FK8)',
      weight: '1390', weightBias: '62', horsepower: '306', topSpeed: '272',
      maxRpm: '7000', drivetrain: 'FWD', tireCompound: 'sport', suspensionType: 'race',
      trackType: 'race', aeroDownforceFront: '0', aeroDownforceRear: '0', gearCount: '6', absEnabled: 'off'
    },
    evo_x: {
      label: 'Mitsubishi Lancer Evo X',
      weight: '1560', weightBias: '57', horsepower: '291', topSpeed: '260',
      maxRpm: '7600', drivetrain: 'AWD', tireCompound: 'sport', suspensionType: 'race',
      trackType: 'rally', aeroDownforceFront: '0', aeroDownforceRear: '0', gearCount: '5', absEnabled: 'off'
    },
    corvette_c8: {
      label: 'Chevrolet Corvette C8',
      weight: '1527', weightBias: '40', horsepower: '495', topSpeed: '312',
      maxRpm: '6500', drivetrain: 'RWD', tireCompound: 'race', suspensionType: 'race',
      trackType: 'race', aeroDownforceFront: '50', aeroDownforceRear: '80', gearCount: '8', absEnabled: 'off'
    },
    impreza_wrx: {
      label: 'Subaru Impreza WRX STI',
      weight: '1490', weightBias: '58', horsepower: '300', topSpeed: '255',
      maxRpm: '8000', drivetrain: 'AWD', tireCompound: 'rally', suspensionType: 'rally',
      trackType: 'rally', aeroDownforceFront: '0', aeroDownforceRear: '0', gearCount: '6', absEnabled: 'off'
    },
    mustang_gt: {
      label: 'Ford Mustang GT (S550)',
      weight: '1769', weightBias: '53', horsepower: '460', topSpeed: '270',
      maxRpm: '7500', drivetrain: 'RWD', tireCompound: 'sport', suspensionType: 'race',
      trackType: 'street', aeroDownforceFront: '0', aeroDownforceRear: '0', gearCount: '6', absEnabled: 'off'
    },
  };

  const [selectedPreset, setSelectedPreset] = useState('custom');

  // MASTER STATE — all vehicle parameters in one place
  const [formData, setFormData] = useState({
    // Basic Specs
    weight: '1200',
    weightBias: '50',
    horsepower: '400',
    topSpeed: '250',
    maxRpm: '8000',
    
    // Build Profile
    drivetrain: 'RWD',
    trackType: 'race',
    tireCompound: 'sport',
    
    // Wheels & Susp
    frontTireWidth: '245',
    rearTireWidth: '265',
    rimSize: '18',
    suspensionType: 'race',
    
    // Aero & Extras
    aeroDownforceFront: '0',
    aeroDownforceRear: '0',
    gearCount: '6',
    absEnabled: 'off',
    handlingBias: 'Neutral'
  });

  const handleChange = (e) => {
    setSelectedPreset('custom'); // Any manual change resets preset label
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyPreset = (key) => {
    setSelectedPreset(key);
    if (key === 'custom') return;
    const preset = PRESETS[key];
    if (!preset) return;
    const { label, ...values } = preset;
    setFormData(prev => ({ ...prev, ...values }));
  };

  // ────────────────────────────────────────────────
  // ADAPTER LAYER — maps formData to each module's exact parameter names
  // ────────────────────────────────────────────────
  const results = useMemo(() => {
    const w = parseFloat(formData.weight) || 1200;
    const bias = parseFloat(formData.weightBias) || 50;
    const hp = parseFloat(formData.horsepower) || 400;
    const ts = parseFloat(formData.topSpeed) || 250;

    // Map compound names for different modules
    const compoundMap = {
      'slick': 'race',  // calculator.js uses 'race' for slick
      'race': 'race',
      'sport': 'sport',
      'street': 'street',
      'rally': 'rally',
      'offroad': 'offroad',
      'snow': 'snow'
    };
    const tireCalcCompound = compoundMap[formData.tireCompound] || 'sport';
    
    // Weight class from weight
    let weightClass = 'normal';
    if (w > 1500) weightClass = 'heavy';
    else if (w < 900) weightClass = 'light';

    // Suspension type capitalized for alignment/ARB (they expect 'Race', 'Rally', etc)
    const suspCapMap = { 
      race: 'Race', sport: 'Street', street: 'Street', 
      rally: 'Rally', drift: 'Drift', drag: 'Race', offroad: 'Rally' 
    };
    const suspCap = suspCapMap[formData.suspensionType] || 'Race';

    // Track type mapping for ARB (expects 'Road', 'Drift', 'Drag', 'Dirt', 'Cross-Country')
    const arbTrackMap = {
      race: 'Road', street: 'Road', drift: 'Drift', 
      drag: 'Drag', rally: 'Dirt', offroad: 'Cross-Country'
    };

    // Tire compound mapping for ARB (expects capitalized names)
    const arbCompoundMap = {
      slick: 'Slick', race: 'Slick', sport: 'Sport',
      street: 'Street', rally: 'Rally', offroad: 'Off-Road', snow: 'Snow'
    };

    // Track type mapping for gearing
    const gearTrackMap = {
      race: 'road', street: 'road', drift: 'drift',
      drag: 'drag', rally: 'dirt', offroad: 'dirt'
    };

    // 1. TIRES — calculator.js: calculatePressure({ compound, drivetrain, weightDist, weight, horsepower, unit })
    const tires = calculatePressure({
      compound: tireCalcCompound,
      drivetrain: formData.drivetrain,
      weightDist: bias,
      weight: w,
      horsepower: hp,
      unit: 'psi'
    });

    // 2. SPRINGS — springsMath.js: calculateSprings({ weight, weightBias, aeroDownforceFront, aeroDownforceRear, suspensionType })
    const springs = calculateSprings({
      weight: w,
      weightBias: bias,
      aeroDownforceFront: parseFloat(formData.aeroDownforceFront) || 0,
      aeroDownforceRear: parseFloat(formData.aeroDownforceRear) || 0,
      suspensionType: formData.suspensionType
    });

    // 3. GEARING — gearingMath.js: calculateGears({ peakTorqueRpm, redlineRpm, numGears, drivetrain, targetTopSpeed, trackType, weight, horsepower, tireCompound })
    const maxRpm = parseFloat(formData.maxRpm) || 8000;
    const gearing = calculateGears({
      peakTorqueRpm: Math.round(maxRpm * 0.6), // estimate peak torque at 60% of redline
      redlineRpm: maxRpm,
      numGears: parseInt(formData.gearCount) || 6,
      drivetrain: formData.drivetrain,
      targetTopSpeed: ts,
      trackType: gearTrackMap[formData.trackType] || 'road',
      weight: w,
      horsepower: hp,
      tireCompound: arbCompoundMap[formData.tireCompound] || 'Sport'
    });

    // 4. ALIGNMENT — alignmentMath.js: calculateAlignment({ weight, weightDistribution, drivetrain, suspensionType, trackType, springStiffness })
    // springStiffness: 'soft', 'medium', 'stiff' — derive from spring rate
    let springStiffness = 'medium';
    if (springs.frontSpring > 120) springStiffness = 'stiff';
    else if (springs.frontSpring < 60) springStiffness = 'soft';

    const alignment = calculateAlignment({
      weight: w,
      weightDistribution: bias,
      drivetrain: formData.drivetrain,
      suspensionType: suspCap,
      trackType: formData.trackType,
      springStiffness
    });

    // 5. ARB — arbMath.js: calculateARB({ weight, weightDistribution, drivetrain, suspensionType, trackType, tireCompound, handlingBias })
    const arb = calculateARB({
      weight: w,
      weightDistribution: bias,
      drivetrain: formData.drivetrain,
      suspensionType: suspCap,
      trackType: arbTrackMap[formData.trackType] || 'Road',
      tireCompound: arbCompoundMap[formData.tireCompound] || 'Sport',
      handlingBias: formData.handlingBias
    });

    // 6. DAMPING — dampingMath.js: calculateDamping({ weightBias, suspensionType })
    const damping = calculateDamping({
      weightBias: bias,
      suspensionType: formData.suspensionType
    });

    // 7. AERO — aeroMath.js: calculateAero({ weight, horsepower, drivetrain, trackType, aeroFocus, targetTopSpeed })
    const aero = calculateAero({
      weight: w,
      horsepower: hp,
      drivetrain: formData.drivetrain,
      trackType: formData.trackType,
      aeroFocus: 'balanced',
      targetTopSpeed: ts
    });

    // 8. BRAKES — brakeMath.js: calculateBrakes({ weightBias, weight, trackType, drivetrain, absEnabled, tireCompound, topSpeed })
    const brakes = calculateBrakes({
      weightBias: bias,
      weight: w,
      trackType: formData.trackType,
      drivetrain: formData.drivetrain,
      absEnabled: formData.absEnabled,
      tireCompound: formData.tireCompound,
      topSpeed: ts
    });

    // 9. DIFFERENTIAL — differentialMath.js: calculateDifferential({ drivetrain, trackType, weightBias, horsepower, tireCompound })
    const differential = calculateDifferential({
      drivetrain: formData.drivetrain,
      trackType: formData.trackType,
      weightBias: String(bias),
      horsepower: hp,
      tireCompound: formData.tireCompound
    });

    return { tires, gearing, alignment, arb, springs, damping, aero, brakes, differential };
  }, [formData]);

  if (!mounted) return null;

  return (
    <TuneErrorBoundary>
    <main className="main-content" style={{ maxWidth: '1400px', display: 'block' }}>
      
      {/* Hero Section with Performance Gauge */}
      <section className="hero-3d-section">
        <div className="hero-3d-content">
          <div className="hero-3d-text stagger-1">
            <h1 className="logo" style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}>PRO TUNE</h1>
            <p className="logo-tagline" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', maxWidth: '480px' }}>
              Master Dashboard untuk tuning Forza Horizon. Semua 9 modul kalkulasi dalam satu layar dengan hasil real-time.
            </p>
            <div className="stats-row" style={{ marginTop: '1rem' }}>
              <div className="stat-item">
                <span className="stat-value">9</span>
                <span className="stat-label">Modul Tuning</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">8+</span>
                <span className="stat-label">Preset Mobil</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">100%</span>
                <span className="stat-label">Akurat</span>
              </div>
            </div>
          </div>
          <div className="hero-3d-wheel stagger-2">
            <PerformanceGauge
              horsepower={parseFloat(formData.horsepower) || 400}
              weight={parseFloat(formData.weight) || 1200}
              topSpeed={parseFloat(formData.topSpeed) || 250}
              weightBias={parseFloat(formData.weightBias) || 50}
              drivetrain={formData.drivetrain}
              tireCompound={formData.tireCompound}
            />
          </div>
        </div>
      </section>

      <div className="calculator-layout tune-layout" style={{ marginTop: '2rem' }}>
        
        {/* INPUT SECTION (LEFT) */}
        <div className="input-section stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* PANEL 0: Quick Preset */}
          <div className="glass-panel" style={{ borderColor: 'rgba(249, 115, 22, 0.2)', background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05), transparent)' }}>
            <h2 className="panel-title" style={{ color: '#f97316', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>&#9889;</span> Quick Preset
            </h2>
            <div className="form-group">
              <select 
                value={selectedPreset} 
                onChange={(e) => applyPreset(e.target.value)} 
                className="glass-input"
                style={{ fontSize: '0.95rem', padding: '0.7rem' }}
              >
                {Object.entries(PRESETS).map(([key, p]) => (
                  <option key={key} value={key}>{p.label}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: '6px', lineHeight: '1.4' }}>
                Pilih mobil untuk mengisi otomatis semua field. Bisa diedit setelah dipilih.
              </span>
            </div>
          </div>

          {/* PANEL 1: Vehicle Specs */}
          <div className="glass-panel">
            <h2 className="panel-title" style={{ color: '#22d3ee', fontSize: '0.85rem' }}>Spesifikasi Kendaraan</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Berat Total (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="glass-input" min="500" max="3000" />
              </div>
              <div className="form-group">
                <label>Tenaga (HP)</label>
                <input type="number" name="horsepower" value={formData.horsepower} onChange={handleChange} className="glass-input" min="50" max="2000" />
              </div>
              <div className="form-group">
                <label>Target Top Speed (km/h)</label>
                <input type="number" name="topSpeed" value={formData.topSpeed} onChange={handleChange} className="glass-input" min="100" max="500" />
              </div>
              <div className="form-group">
                <label>Redline RPM</label>
                <input type="number" name="maxRpm" value={formData.maxRpm} onChange={handleChange} className="glass-input" min="4000" max="12000" step="100" />
              </div>
            </div>
            
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label>Distribusi Berat Depan (%)</label>
              <div className="range-container" style={{ marginTop: '0.5rem' }}>
                <input type="range" name="weightBias" value={formData.weightBias} onChange={handleChange} className="glass-range" min="30" max="70" step="1" />
                <span className="range-value">{formData.weightBias}%</span>
              </div>
            </div>
          </div>

          {/* PANEL 2: Race Profile */}
          <div className="glass-panel">
            <h2 className="panel-title" style={{ color: '#f97316', fontSize: '0.85rem' }}>Profil Balap</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Tipe Trek</label>
                <select name="trackType" value={formData.trackType} onChange={handleChange} className="glass-input">
                  <option value="race">Race / Circuit</option>
                  <option value="street">Street / Sprint</option>
                  <option value="rally">Rally / Dirt</option>
                  <option value="offroad">Cross Country</option>
                  <option value="drift">Drift Zone</option>
                  <option value="drag">Drag Strip</option>
                </select>
              </div>
              <div className="form-group">
                <label>Penggerak</label>
                <select name="drivetrain" value={formData.drivetrain} onChange={handleChange} className="glass-input">
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                  <option value="FWD">FWD</option>
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
                <label>Tipe Suspensi</label>
                <select name="suspensionType" value={formData.suspensionType} onChange={handleChange} className="glass-input">
                  <option value="race">Race</option>
                  <option value="sport">Sport</option>
                  <option value="street">Street</option>
                  <option value="rally">Rally</option>
                  <option value="drift">Drift</option>
                  <option value="drag">Drag</option>
                  <option value="offroad">Offroad</option>
                </select>
              </div>
            </div>
          </div>

          {/* PANEL 3: Wheels & Aero */}
          <div className="glass-panel">
            <h2 className="panel-title" style={{ color: '#22c55e', fontSize: '0.85rem' }}>Roda &amp; Aero</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Aero Depan (kgf)</label>
                <input type="number" name="aeroDownforceFront" value={formData.aeroDownforceFront} onChange={handleChange} className="glass-input" min="0" max="1000" />
              </div>
              <div className="form-group">
                <label>Aero Belakang (kgf)</label>
                <input type="number" name="aeroDownforceRear" value={formData.aeroDownforceRear} onChange={handleChange} className="glass-input" min="0" max="1000" />
              </div>
              <div className="form-group">
                <label>Jumlah Gigi</label>
                <input type="number" name="gearCount" value={formData.gearCount} onChange={handleChange} className="glass-input" min="4" max="10" />
              </div>
              <div className="form-group">
                <label>ABS</label>
                <select name="absEnabled" value={formData.absEnabled} onChange={handleChange} className="glass-input">
                  <option value="off">OFF</option>
                  <option value="on">ON</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* OUTPUT SECTION (RIGHT) */}
        <div className="output-section stagger-3 tune-output">
          <TuneSummarySheet 
            tires={results.tires}
            gearing={results.gearing}
            alignment={results.alignment}
            arb={results.arb}
            springs={results.springs}
            damping={results.damping}
            aero={results.aero}
            brakes={results.brakes}
            differential={results.differential}
            drivetrain={formData.drivetrain}
          />
        </div>

      </div>
    </main>
    </TuneErrorBoundary>
  );
}

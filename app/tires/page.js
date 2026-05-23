'use client';

import { useState, useMemo } from 'react';
import ParticleBackground from '@/components/ParticleBackground';
import WheelIllustration from '@/components/WheelIllustration';
import PressureGauge from '@/components/PressureGauge';
import TireCrossSection from '@/components/TireCrossSection';
import CompoundSelector from '@/components/CompoundSelector';
import DrivetrainSelector from '@/components/DrivetrainSelector';
import WeightSlider from '@/components/WeightSlider';

import UnitToggle from '@/components/UnitToggle';
import ProTip from '@/components/ProTip';
import { calculatePressure, getProTip, getCompoundInfo } from '@/lib/calculator';

const WEIGHT_ADJUSTABLE = ['street', 'sport', 'semiSlick', 'race', 'rally', 'snow', 'offroad'];

export default function Home() {
  const [compound, setCompound] = useState('street');
  const [drivetrain, setDrivetrain] = useState('RWD');
  const [weightDist, setWeightDist] = useState(50);
  const [weight, setWeight] = useState(1200);
  const [horsepower, setHorsepower] = useState(400);
  const [unit, setUnit] = useState('psi');

  const result = useMemo(() => {
    return calculatePressure({ compound, drivetrain, weightDist, weight, horsepower, unit });
  }, [compound, drivetrain, weightDist, weight, horsepower, unit]);

  const compoundInfo = getCompoundInfo(compound);
  const proTip = getProTip(compound, drivetrain);

  const gaugeMin = unit === 'psi' ? 15 : 1.0;
  const gaugeMax = unit === 'psi' ? 55 : 3.8;
  const unitLabel = unit === 'psi' ? 'PSI' : 'BAR';

  const showDrivetrain = compound === 'drag' || compound === 'drift';
  const showWeightControls = WEIGHT_ADJUSTABLE.includes(compound);

  // Convert to PSI for tire visualization (always needs PSI internally)
  const frontPsi = unit === 'psi' ? result.front : result.front * 14.5038;
  const rearPsi = unit === 'psi' ? result.rear : result.rear * 14.5038;

  return (
    <>
      <ParticleBackground />

      {/* ====== HERO SECTION ====== */}
      <section className="hero">
        <WheelIllustration />

        <div className="hero-content">
          <h1 className="logo">FORZA TIRE CALC</h1>

          <div className="logo-accent">
            <div className="logo-accent-line" />
            <div className="logo-accent-flag">
              <span /><span /><span /><span />
              <span /><span /><span /><span />
            </div>
            <div className="logo-accent-line" />
          </div>

          <p className="logo-sub">Kalkulator Tekanan Ban</p>
          <p className="logo-tagline">
            Hitung base tune tekanan ban untuk Forza Horizon — akurat dan instan.
          </p>
        </div>

        <div className="scroll-indicator">
          <span className="scroll-indicator-text">Scroll</span>
          <div className="scroll-indicator-arrow" />
        </div>
      </section>

      {/* ====== MAIN CONTENT — 2 Column Layout ====== */}
      <div className="main-content">

        {/* ====== LEFT: INPUT PANEL ====== */}
        <div className="input-panel">

          {/* Unit Toggle */}
          <div className="glass-card stagger-1">
            <div className="section-title">📐 Satuan Tekanan</div>
            <UnitToggle
              unit={unit}
              onToggle={() => setUnit((u) => (u === 'psi' ? 'bar' : 'psi'))}
            />
          </div>

          {/* Compound Selector */}
          <div className="glass-card stagger-2">
            <div className="section-title">🛞 Jenis Ban (Kompon)</div>
            <CompoundSelector selected={compound} onSelect={setCompound} />
            <DrivetrainSelector
              selected={drivetrain}
              onSelect={setDrivetrain}
              visible={showDrivetrain}
            />
          </div>

          {/* Weight Controls */}
          <div className={`weight-controls ${showWeightControls ? 'weight-controls--visible' : 'weight-controls--hidden'}`}>
            <div className="glass-card stagger-3">
              <div className="section-title">⚖️ Distribusi Berat</div>
              <WeightSlider value={weightDist} onChange={setWeightDist} />

              <div className="section-title" style={{ marginTop: 'var(--space-lg)' }}>
                🏋️ Berat Kendaraan (Kg)
              </div>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(Number(e.target.value))}
                className="glass-input"
                min="500" max="4000"
                style={{ width: '100%', marginTop: '0.5rem' }}
              />
            </div>
          </div>

          {/* Horsepower Input */}
          <div className="glass-card stagger-3" style={{ marginTop: '1rem' }}>
            <div className="section-title">⚡ Tenaga Mesin (HP)</div>
            <input 
              type="number" 
              value={horsepower} 
              onChange={(e) => setHorsepower(Number(e.target.value))}
              className="glass-input"
              min="100" max="2000"
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
            <small style={{ color: '#888', display: 'block', marginTop: '4px' }}>Tenaga &gt;600 HP membutuhkan tekanan awal lebih tinggi untuk mencegah deformasi ban.</small>
          </div>

          {/* Pro Tip */}
          <div className="stagger-4">
            <ProTip text={proTip} />
          </div>

        </div>

        {/* ====== RIGHT: RESULT PANEL (Sticky) ====== */}
        <div className="result-panel">
          <div className="glass-card glass-card--glow">
            <div className="section-title" style={{ justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
              🎯 Hasil Base Tune
            </div>

            <div className="results-inner">
              {/* Front Tire */}
              <div className="result-card">
                <div className="result-pair">
                  <PressureGauge
                    value={result.front}
                    minValue={gaugeMin}
                    maxValue={gaugeMax}
                    label="Depan (Front)"
                    unit={unitLabel}
                    accentColor={compoundInfo.color}
                  />
                  <TireCrossSection
                    pressure={frontPsi}
                    maxPressure={55}
                    accentColor={compoundInfo.color}
                  />
                </div>
              </div>

              {/* Divider */}
              <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--color-border-glow), transparent)',
                margin: '0 var(--space-md)',
              }} />

              {/* Rear Tire */}
              <div className="result-card">
                <div className="result-pair">
                  <PressureGauge
                    value={result.rear}
                    minValue={gaugeMin}
                    maxValue={gaugeMax}
                    label="Belakang (Rear)"
                    unit={unitLabel}
                    accentColor={compoundInfo.color}
                  />
                  <TireCrossSection
                    pressure={rearPsi}
                    maxPressure={55}
                    accentColor={compoundInfo.color}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div className="reminder-banner">
            ⚠️ <strong>Ingat:</strong> Ini adalah <em>Base Tune</em> (titik awal). Lakukan test drive
            dan gunakan <strong>Telemetry</strong> di dalam game untuk fine-tuning.
          </div>
        </div>

      </div>

      {/* ====== FOOTER ====== */}
      <footer className="footer">
        <p>Dibuat untuk komunitas Forza Horizon 🏁</p>
        <p style={{ marginTop: '4px', opacity: 0.6 }}>
          Base Tune Calculator — Sempurnakan dengan Telemetry.
        </p>
      </footer>
    </>
  );
}

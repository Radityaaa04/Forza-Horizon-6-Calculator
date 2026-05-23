/**
 * Calculates optimal Aerodynamic Downforce (Aero) for Forza Horizon.
 * 
 * Physics basis:
 * Downforce ∝ v² (velocity squared). Faster car = exponentially more aero needed.
 * Drag penalty ∝ downforce. More wing angle = more downforce BUT more drag = lower top speed.
 * 
 * Output: Target front and rear downforce in kgf.
 *
 * @param {Object} params
 * @param {number} params.weight - Vehicle weight in kg
 * @param {number} params.horsepower - Vehicle horsepower (HP)
 * @param {string} params.drivetrain - FWD, RWD, AWD
 * @param {string} params.trackType - race, rally, drift, drag, offroad, street
 * @param {string} params.aeroFocus - 'speed' (min aero), 'balanced', 'cornering' (max aero)
 * @param {number} params.targetTopSpeed - Target/average top speed in km/h
 * @returns {Object} Target front and rear downforce in kgf, drag penalty estimate, warnings
 */
export function calculateAero({
  weight,
  horsepower,
  drivetrain = 'RWD',
  trackType = 'race',
  aeroFocus = 'balanced',
  targetTopSpeed = 250
}) {
  const w = parseFloat(weight);
  const hp = parseFloat(horsepower);
  const vMax = parseFloat(targetTopSpeed) || 250;
  const warnings = [];

  if (isNaN(w) || w <= 0) {
    return { error: 'Berat mobil tidak valid.', warnings };
  }
  if (isNaN(hp) || hp <= 0) {
    return { error: 'Horsepower tidak valid.', warnings };
  }

  // ─────────────────────────────────────────────
  // 1. SPEED-DEPENDENT BASE DOWNFORCE
  // Downforce requirement scales with v².
  // Reference point: at 200 km/h, a 1200 kg car needs ~100 kgf total.
  // ─────────────────────────────────────────────
  const vRef = 200; // km/h reference speed
  const wRef = 1200; // kg reference weight
  const dfRef = 100; // kgf reference total downforce at vRef for wRef

  // Speed factor: (v / vRef)² — exponential scaling
  const speedFactor = Math.pow(vMax / vRef, 2);
  
  // Weight factor: heavier cars need more downforce to achieve same cornering G
  const weightFactor = w / wRef;

  // Power factor: more HP = higher corner exit speed = needs more aero stability
  // Scaled gently — HP affects stability, not directly downforce need
  const powerFactor = 1.0 + Math.max(0, (hp - 400) / 2000);

  let totalDownforce = dfRef * speedFactor * weightFactor * powerFactor;

  // ─────────────────────────────────────────────
  // 2. FRONT / REAR SPLIT
  // Default: 45% front, 55% rear (rear slightly more for high-speed stability)
  // ─────────────────────────────────────────────
  let frontSplit = 0.45;
  let rearSplit = 0.55;

  // ─────────────────────────────────────────────
  // 3. DRIVETRAIN ADJUSTMENTS
  // ─────────────────────────────────────────────
  if (drivetrain === 'RWD') {
    // RWD: more rear downforce to plant driven wheels
    frontSplit = 0.40;
    rearSplit = 0.60;
  } else if (drivetrain === 'FWD') {
    // FWD: more front downforce to prevent understeer + plant driven wheels
    frontSplit = 0.55;
    rearSplit = 0.45;
  } else if (drivetrain === 'AWD') {
    // AWD: balanced, slight rear bias for stability
    frontSplit = 0.47;
    rearSplit = 0.53;
  }

  // ─────────────────────────────────────────────
  // 4. AERO FOCUS (User preference)
  // ─────────────────────────────────────────────
  let focusMult = 1.0;
  let dragPenaltyLabel = 'Sedang';

  if (aeroFocus === 'speed') {
    focusMult = 0.4; // Minimum aero → minimum drag → max top speed
    dragPenaltyLabel = 'Rendah';
    warnings.push("Focus Speed: Downforce diminimalkan untuk mengurangi hambatan angin. Top speed naik, tapi grip di tikungan berkurang drastis.");
  } else if (aeroFocus === 'cornering') {
    focusMult = 1.6; // Maximum aero → max grip → sacrifice top speed
    dragPenaltyLabel = 'Tinggi';
    warnings.push("Focus Cornering: Downforce dimaksimalkan. Grip tikungan maksimal tapi top speed turun 10-20 km/h karena hambatan angin.");
  } else {
    dragPenaltyLabel = 'Sedang';
  }

  totalDownforce *= focusMult;

  // ─────────────────────────────────────────────
  // 5. TRACK TYPE OVERRIDES
  // ─────────────────────────────────────────────
  let isDrag = false;

  if (trackType === 'drag') {
    // Drag: absolute minimum aero. Downforce = drag = slower 1/4 mile.
    totalDownforce = 0; // Set minimum possible
    frontSplit = 0.50;
    rearSplit = 0.50;
    dragPenaltyLabel = 'Minimum';
    isDrag = true;
    warnings.push("🏁 DRAG: Set SEMUA aero ke posisi paling kiri (minimum absolut). Setiap kgf downforce menambah drag yang memperlambat akselerasi dan top speed.");
  } else if (trackType === 'drift') {
    // Drift: front aero for steering grip, rear aero minimal for easy slide
    frontSplit = 0.70;
    rearSplit = 0.30;
    totalDownforce *= 0.7; // Overall less aero
    warnings.push("💨 DRIFT: Downforce depan dominan untuk kontrol setir saat angle besar. Belakang diminimalkan agar ekor mudah dilempar.");
  } else if (trackType === 'rally' || trackType === 'offroad') {
    // Rally/Offroad: aero almost irrelevant at low speeds on loose surfaces
    totalDownforce *= 0.3; // Drastically reduce
    warnings.push("⛰️ RALLY/OFFROAD: Aero hampir tidak berpengaruh di permukaan tanah/kerikil karena kecepatan rendah dan ban sudah soft compound. Set minimal kecuali di trek mixed-surface.");
  } else if (trackType === 'street') {
    // Street: mixed environment, less emphasis on aero
    totalDownforce *= 0.8;
  }

  // ─────────────────────────────────────────────
  // 6. CALCULATE FINAL VALUES
  // ─────────────────────────────────────────────
  let frontAero = totalDownforce * frontSplit;
  let rearAero = totalDownforce * rearSplit;

  // Minimum handling:
  // Drag mode = 0 kgf (absolute minimum, no floor)
  // Non-drag modes = minimum 5 kgf (even bodywork alone generates some downforce at speed)
  if (!isDrag) {
    frontAero = Math.max(5, frontAero);
    rearAero = Math.max(5, rearAero);
  }

  // ─────────────────────────────────────────────
  // 7. SLIDER PERCENTAGE MAPPING
  // Forza sliders vary per car. Typical wing ranges:
  //   Front splitter: 0 – 200 kgf
  //   Rear wing:      0 – 350 kgf
  // We output a "slider %" so users can map our target to ANY car's range.
  // Formula: sliderPct = target / typicalMax * 100, clamped 0-100
  // ─────────────────────────────────────────────
  const frontSliderPct = Math.max(0, Math.min(100, Math.round((frontAero / 200) * 100)));
  const rearSliderPct  = Math.max(0, Math.min(100, Math.round((rearAero / 350) * 100)));

  // ─────────────────────────────────────────────
  // 8. STABILITY WARNINGS
  // ─────────────────────────────────────────────
  if (hp > 800 && aeroFocus === 'speed' && trackType !== 'drag') {
    warnings.push("⚠️ BAHAYA: Tenaga >800 HP dengan downforce minimal. Mobil bisa sangat tidak stabil (melayang) di atas 280 km/h.");
  }

  if (vMax > 320 && focusMult < 0.8) {
    warnings.push("⚠️ Target speed >320 km/h dengan aero rendah. Pertimbangkan naikkan downforce belakang untuk stabilitas di kecepatan sangat tinggi.");
  }

  // Estimate drag penalty on top speed (rough approximation)
  const dragPenaltyKmh = Math.round((frontAero + rearAero) * 0.035);

  if (!isDrag) {
    warnings.push(`ℹ️ Slider %: Estimasi posisi slider berdasarkan typical wing range. Jika mobil Anda memiliki range berbeda, sesuaikan proporsional.`);
  }

  return {
    frontAero: Math.round(frontAero),
    rearAero: Math.round(rearAero),
    totalDownforce: Math.round(frontAero + rearAero),
    // NEW: slider percentage for easy mapping
    frontSliderPct,
    rearSliderPct,
    dragPenaltyKmh,
    dragPenaltyLabel,
    speedFactor: speedFactor.toFixed(2),
    warnings
  };
}

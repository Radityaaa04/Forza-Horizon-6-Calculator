export const SUSPENSION_TYPES = {
  street: { minFreq: 1.2, maxFreq: 1.6, label: 'Street', baseClearance: 8.0, travelFactor: 1.2 },
  sport: { minFreq: 1.6, maxFreq: 2.0, label: 'Sport', baseClearance: 7.0, travelFactor: 1.1 },
  race: { minFreq: 2.0, maxFreq: 2.8, label: 'Race', baseClearance: 5.0, travelFactor: 1.0 },
  rally: { minFreq: 1.0, maxFreq: 1.5, label: 'Rally', baseClearance: 12.0, travelFactor: 1.8 },
  drift: { minFreq: 1.8, maxFreq: 2.5, label: 'Drift', baseClearance: 5.5, travelFactor: 1.0 },
  drag: { minFreq: 1.4, maxFreq: 2.0, label: 'Drag', baseClearance: 8.0, travelFactor: 1.5 },
  offroad: { minFreq: 0.8, maxFreq: 1.3, label: 'Off-Road', baseClearance: 18.0, travelFactor: 2.0 },
};

/**
 * Calculates Spring Stiffness and Ride Height based on weight, weight distribution, and suspension type.
 * @param {Object} params
 * @param {number} params.weight - Total vehicle weight in kg
 * @param {number} params.weightBias - Front weight bias percentage (e.g., 52 for 52%)
 * @param {number} params.aeroDownforceFront - Front aero downforce in kgf (optional)
 * @param {number} params.aeroDownforceRear - Rear aero downforce in kgf (optional)
 * @param {string} params.suspensionType - The type of suspension installed (race, rally, drift, etc)
 * @returns {Object} Calculated spring rates (N/mm) and recommended ride height (cm)
 */
export function calculateSprings({
  weight,
  weightBias,
  aeroDownforceFront = 0,
  aeroDownforceRear = 0,
  suspensionType = 'race'
}) {
  const w = parseFloat(weight);
  const bias = parseFloat(weightBias) / 100;
  const aeroF = parseFloat(aeroDownforceFront) || 0;
  const aeroR = parseFloat(aeroDownforceRear) || 0;

  const warnings = [];

  if (isNaN(w) || w <= 0) {
    return { error: 'Berat mobil tidak valid.', warnings };
  }
  if (isNaN(bias) || bias <= 0 || bias >= 1) {
    return { error: 'Distribusi berat tidak valid (harus antara 1-99).', warnings };
  }

  const profile = SUSPENSION_TYPES[suspensionType.toLowerCase()] || SUSPENSION_TYPES.race;

  // Calculate sprung weight (approx 85% of total weight, subtracting unsprung mass like wheels/brakes)
  const sprungWeight = w * 0.85;

  const frontSprungWeight = sprungWeight * bias;
  const rearSprungWeight = sprungWeight * (1 - bias);

  // Calculate target natural frequencies based on suspension type
  // Rear frequency is typically slightly higher (10-15%) than front to reduce pitching
  const targetFreqFront = (profile.minFreq + profile.maxFreq) / 2;
  const targetFreqRear = targetFreqFront * 1.12; 

  // Basic formula: k = (4 * pi^2 * f^2 * m)
  // where k is stiffness in N/m, f is frequency in Hz, m is mass in kg
  const calculateRate = (mass, freq) => {
    return (4 * Math.pow(Math.PI, 2) * Math.pow(freq, 2) * mass) / 1000; // Divide by 1000 for N/mm
  };

  // Convert aero downforce (kgf) to mass equivalent (kg) for spring calculation
  // 1 kgf is roughly the force exerted by 1 kg of mass under gravity, so we can add it directly
  let frontSpringRate = calculateRate(frontSprungWeight + aeroF, targetFreqFront);
  let rearSpringRate = calculateRate(rearSprungWeight + aeroR, targetFreqRear);

  // Adjustments based on suspension type
  if (suspensionType === 'drift') {
    // Drift needs stiffer rear springs relative to front to induce oversteer
    frontSpringRate *= 0.9;
    rearSpringRate *= 1.15;
  } else if (suspensionType === 'drag') {
    // Drag needs very soft front (for weight transfer) and stiff rear (to prevent squat)
    frontSpringRate *= 0.6;
    rearSpringRate *= 1.4;
  } else if (suspensionType === 'rally' || suspensionType === 'offroad') {
    // Rally/Offroad need softer springs overall for bump compliance
    frontSpringRate *= 0.85;
    rearSpringRate *= 0.85;
  }

  // Calculate DYNAMIC Ride Height (in cm)
  // Static Load (Newtons) = Mass (kg) * 9.81
  const frontStaticLoadN = frontSprungWeight * 9.81;
  const rearStaticLoadN = rearSprungWeight * 9.81;

  // Deflection (mm) = Force (N) / Spring Rate (N/mm)
  const frontDeflectionMm = frontStaticLoadN / frontSpringRate;
  const rearDeflectionMm = rearStaticLoadN / rearSpringRate;

  // Convert deflection to cm
  const frontDeflectionCm = frontDeflectionMm / 10;
  const rearDeflectionCm = rearDeflectionMm / 10;

  // Final Ride Height = Base Clearance + (Deflection * Travel Factor)
  let rideHeightFront = profile.baseClearance + (frontDeflectionCm * profile.travelFactor);
  let rideHeightRear = profile.baseClearance + (rearDeflectionCm * profile.travelFactor);

  // Specific geometrical adjustments
  if (suspensionType === 'race' || suspensionType === 'sport' || suspensionType === 'street') {
    rideHeightRear += 0.5;  // Slight positive rake for asphalt aero
  } else if (suspensionType === 'drag') {
    rideHeightFront += 4.0; // Higher front for weight transfer pitch
    rideHeightRear -= 2.0;  // Lower rear for traction
  } else if (suspensionType === 'drift') {
    rideHeightRear += 0.5;  // Slight rake
  }

  // Ride height limits per suspension type (Forza typical ranges in cm)
  const rhLimits = {
    race:    { min: 3.0, max: 12.0 },
    sport:   { min: 4.0, max: 14.0 },
    street:  { min: 5.0, max: 16.0 },
    rally:   { min: 8.0, max: 25.0 },
    drift:   { min: 3.0, max: 12.0 },
    drag:    { min: 3.0, max: 20.0 },
    offroad: { min: 10.0, max: 30.0 },
  };
  const rhLimit = rhLimits[suspensionType.toLowerCase()] || rhLimits.race;
  rideHeightFront = Math.max(rhLimit.min, Math.min(rhLimit.max, rideHeightFront));
  rideHeightRear = Math.max(rhLimit.min, Math.min(rhLimit.max, rideHeightRear));

  if (bias > 0.60) {
    warnings.push("Mobil sangat berat di depan (FWD/AWD). Pertimbangkan untuk mengeraskan spring depan lebih jauh untuk mencegah bottoming out.");
  } else if (bias < 0.40) {
    warnings.push("Mobil sangat berat di belakang (Mid/Rear engine). Hati-hati oversteer saat melepas gas (lift-off oversteer).");
  }

  // ── DUAL-UNIT OUTPUT ──
  // Forza shows kgf/mm for Race/Sport/Drift suspension, N/mm for some setups.
  // 1 kgf/mm = 9.80665 N/mm. Provide both so user can match their slider.
  const frontSpringKgf = frontSpringRate / 9.80665;
  const rearSpringKgf = rearSpringRate / 9.80665;

  return {
    // Primary output (N/mm — used by TuneSummarySheet)
    frontSpring: frontSpringRate,
    rearSpring: rearSpringRate,
    // Secondary output (kgf/mm — what most Forza sliders actually display)
    frontSpringKgf,
    rearSpringKgf,
    // Ride height in cm
    rideHeightFront,
    rideHeightRear,
    // Natural frequency for verification (Hz)
    naturalFreqFront: targetFreqFront,
    naturalFreqRear: targetFreqRear,
    warnings,
    suspensionLabel: profile.label
  };
}

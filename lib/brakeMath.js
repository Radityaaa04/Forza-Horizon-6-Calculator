/**
 * Calculates optimal Braking Balance and Pressure for Forza Horizon.
 * 
 * @param {Object} params
 * @param {number} params.weightBias - Front weight bias percentage
 * @param {number} params.weight - Total vehicle weight in kg
 * @param {string} params.trackType - race, street, rally, offroad, drift, drag
 * @param {string} params.drivetrain - RWD, AWD, FWD
 * @param {string} params.absEnabled - 'on' or 'off'
 * @param {string} params.tireCompound - slick, race, sport, street, rally, offroad
 * @param {number} params.topSpeed - Target top speed in km/h
 * @returns {Object} Target brake balance (%) and pressure (%), plus warnings
 */
export function calculateBrakes({
  weightBias,
  weight,
  trackType = 'race',
  drivetrain = 'RWD',
  absEnabled = 'off',
  tireCompound = 'sport',
  topSpeed = 250
}) {
  const bias = parseFloat(weightBias);
  const w = parseFloat(weight);
  const vMax = parseFloat(topSpeed);
  const warnings = [];

  if (isNaN(bias) || bias <= 0 || bias >= 100) return { error: 'Distribusi berat tidak valid.', warnings };
  if (isNaN(w) || w <= 0) return { error: 'Berat kendaraan tidak valid.', warnings };

  // ==== BRAKE BALANCE (0% - 100%, >50% is Front bias) ====
  // Base balance is tied to weight distribution + dynamic weight transfer under braking.
  // When braking from high speed, ~15-20% of the car's weight transfers to the front.
  let targetBalance = bias + 3.0; // Base static weight transfer estimation

  // Drivetrain Adjustments
  if (drivetrain === 'FWD') {
    targetBalance += 1.5; // FWD needs heavy front bias
  } else if (drivetrain === 'RWD') {
    targetBalance -= 1.0; // Shift slightly rear to help car rotate into corners (trail braking)
  }

  // Track Type Adjustments
  if (trackType === 'rally' || trackType === 'offroad') {
    targetBalance -= 4.0; 
    warnings.push("RALLY/OFFROAD: Balance digeser ke belakang untuk membantu mobil membuang ekor (oversteer) saat masuk tikungan di tanah.");
  } else if (trackType === 'drift') {
    targetBalance -= 6.0; 
    warnings.push("DRIFT: Balance ke belakang. Menginjak rem kaki akan membantu menginisiasi drift tanpa harus tarik e-brake.");
  } else if (trackType === 'drag') {
    targetBalance = 65.0; // All front
    warnings.push("DRAG: Balance dimaksimalkan ke depan (65%) karena stabilitas lurusan lebih penting daripada rotasi.");
  }

  targetBalance = Math.max(0, Math.min(100, targetBalance));

  // ==== BRAKE PRESSURE (0% - 200%) ====
  let targetPressure = 100.0;

  // ABS Adjustments
  if (absEnabled === 'off') {
    targetPressure = 90.0; 
    warnings.push("ABS OFF: Pressure diturunkan untuk mencegah ban mengunci mendadak (lock-up).");
  } else {
    targetPressure = 110.0;
  }

  // Weight Adjustments
  if (w > 1600) {
    targetPressure += 12.0; 
  } else if (w < 1000) {
    targetPressure -= 8.0; 
  }

  // Speed Adjustments (Kinetic Energy = 0.5 * m * v^2)
  if (vMax > 300) {
    targetPressure += 15.0; // Needs extreme stopping power
    warnings.push(`Top Speed ${vMax} km/h: Pressure dinaikkan ekstra karena energi kinetik yang harus dihentikan sangat besar.`);
  } else if (vMax < 150) {
    targetPressure -= 5.0;
  }

  // Tire Grip Adjustments (Additive)
  const compound = tireCompound.toLowerCase();
  if (compound.includes('slick') || compound.includes('race')) {
    targetPressure += 15.0; // High grip handles high pressure
  } else if (compound.includes('rally') || compound.includes('offroad') || compound.includes('snow')) {
    targetPressure -= 15.0; // Loose surface locks up easily
  }

  // Track Type overrides for Pressure (Additive instead of absolute override)
  if (trackType === 'drift') {
    targetPressure += 15.0; // Aggressive bite
  } else if (trackType === 'drag') {
    targetPressure += 25.0; // Need to stop at the end of the strip
  }

  targetPressure = Math.max(0, Math.min(200, targetPressure));

  return {
    balance: Math.round(targetBalance),
    pressure: Math.round(targetPressure),
    warnings
  };
}

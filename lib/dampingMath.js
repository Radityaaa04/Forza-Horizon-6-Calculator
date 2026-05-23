/**
 * Calculates Damping (Rebound and Bump Stiffness) based on weight bias and suspension type.
 * Uses the standard Forza tuning formula: (Max - Min) * Bias + Min.
 * Standard slider min = 1.0, max = 20.0.
 *
 * @param {Object} params
 * @param {number} params.weightBias - Front weight bias percentage (e.g., 52 for 52%)
 * @param {string} params.suspensionType - race, rally, drift, drag, offroad, street
 * @returns {Object} Front and rear rebound, front and rear bump stiffness
 */
export function calculateDamping({
  weightBias,
  suspensionType = 'race'
}) {
  const bias = parseFloat(weightBias);
  const warnings = [];

  if (isNaN(bias) || bias <= 0 || bias >= 100) {
    return { error: 'Distribusi berat tidak valid.', warnings };
  }

  // Standard Forza Damping Sliders
  const minDamping = 1.0;
  const maxDamping = 20.0;
  const range = maxDamping - minDamping;

  const biasDecimal = bias / 100;

  // Base Rebound Calculation
  let frontRebound = (range * biasDecimal) + minDamping;
  let rearRebound = (range * (1 - biasDecimal)) + minDamping;

  let frontBump;
  let rearBump;

  // Track / Suspension Type Adjustments
  if (suspensionType === 'rally' || suspensionType === 'offroad') {
    // Dirt/Offroad requires softer rebound to absorb terrain, and even softer bump (40% of rebound)
    frontRebound *= 0.65;
    rearRebound *= 0.65;
    frontBump = frontRebound * 0.4;
    rearBump = rearRebound * 0.4;
    warnings.push("Tuning Rally/Offroad menggunakan bump stiffness rendah (40% dari rebound) agar roda tetap menempel di jalan bergelombang.");
  } else if (suspensionType === 'drift') {
    // Drift needs quick weight transfer but stable front.
    frontRebound *= 1.1; // Stiffer front
    rearRebound *= 0.8;  // Softer rear to let the back squat and slide smoothly
    frontBump = frontRebound * 0.8; // High bump front
    rearBump = rearRebound * 0.5;   // Low bump rear
    warnings.push("Tuning Drift dirancang agar bagian belakang lebih mudah berayun sambil menjaga traksi depan tetap solid.");
  } else if (suspensionType === 'drag') {
    // Drag is a special case:
    // Front needs to lift immediately (min rebound) and not crash down (max bump)
    // Rear needs to squat immediately (min bump) and hold the squat (max rebound)
    frontRebound = 1.0;
    frontBump = 20.0;
    rearRebound = 20.0;
    rearBump = 1.0;
    warnings.push("Tuning Drag sangat ekstrem: Rebound depan minimal agar hidung mobil terangkat, Rebound belakang maksimal agar pantat mobil tetap jongkok selama akselerasi.");
  } else {
    // Race, Sport, Street
    // Standard rule of thumb: Bump is roughly 60% of Rebound
    frontBump = frontRebound * 0.6;
    rearBump = rearRebound * 0.6;
  }

  // Ensure values don't exceed min/max sliders (1.0 to 20.0)
  const clamp = (val) => Math.max(1.0, Math.min(20.0, val));

  return {
    frontRebound: clamp(frontRebound),
    rearRebound: clamp(rearRebound),
    frontBump: clamp(frontBump),
    rearBump: clamp(rearBump),
    warnings
  };
}

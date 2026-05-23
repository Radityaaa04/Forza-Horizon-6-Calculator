/**
 * Anti-Roll Bar (ARB) Calculator
 * Forza Horizon ARB range: typically 1.0 – 65.0
 * 
 * Core principle:
 * ARB controls how much the car resists body roll during cornering.
 * Higher ARB = less roll = more responsive but can cause inside wheel lift.
 * Lower ARB = more roll = more traction on uneven surfaces, more forgiving.
 *
 * Front/Rear balance is the key:
 * - Front stiffer than Rear → Oversteer tendency
 * - Rear stiffer than Front → Understeer tendency
 * - Balanced → Neutral handling
 */

export function calculateARB({
  weight,           // kg
  weightDistribution, // % front (e.g. 52)
  weightBias,       // alias for weightDistribution (interchangeable)
  drivetrain,       // 'AWD', 'RWD', 'FWD'
  suspensionType,   // 'Race', 'Street', 'Rally', 'Drift', 'Stock' (auto-capitalized)
  trackType,        // 'Road', 'Street', 'Drift', 'Drag', 'Dirt', 'Cross-Country'
  tireCompound,     // 'Street', 'Sport', 'Semi Slick', 'Slick', 'Drag', 'Rally', 'Off-Road', 'Snow'
  handlingBias,     // 'Understeer', 'Neutral', 'Oversteer' (user preference)
}) {
  // Normalize: accept both weightDistribution and weightBias
  weightDistribution = weightDistribution ?? weightBias;
  // Normalize: auto-capitalize suspensionType ('race' → 'Race')
  if (suspensionType && typeof suspensionType === 'string') {
    suspensionType = suspensionType.charAt(0).toUpperCase() + suspensionType.slice(1).toLowerCase();
  }
  const frontPct = weightDistribution / 100;
  const rearPct = 1 - frontPct;

  // ─────────────────────────────────────────────
  // 1. BASE ARB FROM WEIGHT
  // Heavier car = more inertia = needs stiffer ARB to control roll
  // ─────────────────────────────────────────────
  let baseARB = (weight / 1500) * 35;
  // ~800kg → 18.7, ~1200kg → 28, ~1500kg → 35, ~2000kg → 46.7

  // ─────────────────────────────────────────────
  // 2. SUSPENSION TYPE MODIFIER
  // Race suspension is already stiffer — ARB can be softer
  // Stock/Rally is soft — ARB needs to compensate
  // ─────────────────────────────────────────────
  const suspMultiplier = {
    'Race':   0.85,  // Already stiff, ARB can be relaxed
    'Street': 1.0,
    'Stock':  1.15,  // Needs ARB to compensate soft springs
    'Rally':  0.75,  // Off-road needs compliance, very soft ARB
    'Drift':  0.90,
  }[suspensionType] || 1.0;

  baseARB *= suspMultiplier;

  // ─────────────────────────────────────────────
  // 3. TIRE COMPOUND MODIFIER
  // Sticky tires generate more lateral G → more roll moment → need stiffer ARB
  // Off-road/Snow tires need compliance → softer ARB
  // ─────────────────────────────────────────────
  const tireMultiplier = {
    'Stock':     0.85,
    'Street':    0.95,
    'Sport':     1.00,
    'Semi Slick': 1.10,
    'Slick':     1.20,
    'Drift':     0.80,
    'Drag':      1.25,
    'Snow':      0.75,
    'Rally':     0.85,
    'Off-Road':  0.80,
  }[tireCompound] || 1.0;

  baseARB *= tireMultiplier;

  // ─────────────────────────────────────────────
  // 4. FRONT / REAR SPLIT
  // Start with weight-proportional split.
  // The heavier end has more roll moment → needs proportionally more ARB.
  // But we ALSO add drivetrain correction.
  // ─────────────────────────────────────────────
  let frontARB = baseARB * (frontPct / 0.5); // Normalized to 50%
  let rearARB  = baseARB * (rearPct  / 0.5);

  // ─────────────────────────────────────────────
  // 5. DRIVETRAIN CORRECTION
  // RWD: Rear ARB slightly softer → allows rear to squat under power (more traction)
  // FWD: Front ARB softer → reduces understeer. Rear stiffer → helps rotation.
  // AWD: Balanced, slight rear bias to prevent push
  // ─────────────────────────────────────────────
  if (drivetrain === 'RWD') {
    rearARB  *= 0.88; // Soften rear to allow power traction
    frontARB *= 1.05; // Slightly stiffen front for turn-in
  } else if (drivetrain === 'FWD') {
    frontARB *= 0.80; // Soften front significantly — reduces understeer
    rearARB  *= 1.25; // Stiffen rear — helps car rotate (snap oversteer protection)
  } else if (drivetrain === 'AWD') {
    // AWD is balanced but slight rear softening helps apply power
    rearARB  *= 0.92;
    frontARB *= 1.02;
  }

  // ─────────────────────────────────────────────
  // 6. HANDLING BIAS (User Preference)
  // ─────────────────────────────────────────────
  if (handlingBias === 'Oversteer') {
    // Stiffen front relative to rear → car rotates more → oversteer
    frontARB *= 1.15;
    rearARB  *= 0.88;
  } else if (handlingBias === 'Understeer') {
    // Stiffen rear relative to front → car pushes → understeer (safer for novice)
    frontARB *= 0.88;
    rearARB  *= 1.15;
  }

  // ─────────────────────────────────────────────
  // 7. TRACK TYPE / DISCIPLINE OVERRIDE
  // ─────────────────────────────────────────────
  let warnings = [];

  if (trackType === 'Drag') {
    // Drag: Maximum stiffness to prevent lateral weight transfer during launch
    frontARB = Math.min(65, baseARB * 1.6);
    rearARB  = Math.min(65, baseARB * 1.6);
    warnings.push('Drag Mode: ARB diset sangat kaku untuk mencegah body lean saat launch.');
  } else if (trackType === 'Drift') {
    // Drift: Soft rear allows controlled oversteer. Stiffer front for stability.
    frontARB = Math.min(65, baseARB * 1.1);
    rearARB  = Math.max(1, baseARB * 0.45); // Very soft rear
    warnings.push('Drift Mode: Rear ARB sangat lunak agar ekor mudah bergeser.');
  } else if (trackType === 'Dirt') {
    // Rally: Both soft for compliance over bumps
    frontARB = Math.max(1, baseARB * 0.65);
    rearARB  = Math.max(1, baseARB * 0.65);
    warnings.push('Rally/Dirt Mode: ARB dilunak agar ban bisa mengikuti kontur tanah.');
  } else if (trackType === 'Cross-Country') {
    // Cross-Country: Even softer
    frontARB = Math.max(1, baseARB * 0.50);
    rearARB  = Math.max(1, baseARB * 0.50);
    warnings.push('Cross-Country Mode: ARB sangat lunak untuk maksimalkan wheel articulation di medan ekstrem.');
  }

  // ─────────────────────────────────────────────
  // 8. CLAMP to Forza limits (1.0 – 65.0)
  // ─────────────────────────────────────────────
  frontARB = Math.max(1.0, Math.min(65.0, frontARB));
  rearARB  = Math.max(1.0, Math.min(65.0, rearARB));

  // Calculate roll resistance balance (for display)
  const totalARB = frontARB + rearARB;
  const frontBias = Math.round((frontARB / totalARB) * 100);
  const rearBias  = 100 - frontBias;

  let balanceLabel = 'Neutral';
  if (frontBias > 55) balanceLabel = 'Oversteer Bias';
  else if (rearBias > 55) balanceLabel = 'Understeer Bias';

  return {
    frontARB: Math.round(frontARB * 10) / 10,
    rearARB:  Math.round(rearARB  * 10) / 10,
    frontBias,
    rearBias,
    balanceLabel,
    warnings,
  };
}

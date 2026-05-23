/**
 * Calculates optimal Differential settings for Forza Horizon.
 * All values are on the Forza slider scale of 0–100%.
 *
 * RWD: Rear Accel, Rear Decel
 * FWD: Front Accel, Front Decel
 * AWD: Front Accel, Front Decel, Rear Accel, Rear Decel, Center Balance (0=full rear, 100=full front)
 *
 * Accel  (0–100%): How much diff locks when accelerating. High = stable but less rotation.
 * Decel  (0–100%): How much diff locks when braking. High = stable trail brake but less corner entry rotation.
 * Center (0–100%): AWD torque split. 50 = balanced, 0 = rear bias.
 */
export function calculateDifferential({
  drivetrain = 'RWD',
  trackType  = 'race',
  weightBias = '50',
  horsepower = 400,
  tireCompound = 'sport'
}) {
  const bias = parseFloat(weightBias);
  const hp = parseFloat(horsepower);
  const warnings = [];

  if (isNaN(bias) || bias <= 0 || bias >= 100) return { error: 'Distribusi berat tidak valid.', warnings };

  // ── Defaults ──────────────────────────────────────────────────────────────
  let frontAccel  = 50;
  let frontDecel  = 25;
  let rearAccel   = 50;
  let rearDecel   = 25;
  let centerBalance = 50; // AWD only

  // ── Per-track base presets ─────────────────────────────────────────────────
  switch (trackType) {
    case 'race':
    case 'street':
      frontAccel = 55; frontDecel = 20;
      rearAccel  = 55; rearDecel  = 20;
      break;

    case 'drift':
      frontAccel = 20; frontDecel = 80;
      rearAccel  = 85; rearDecel  = 10;
      centerBalance = 35; // Rear-biased AWD for drift
      warnings.push("DRIFT: Rear Accel diset tinggi agar kedua ban belakang selalu spin. Front Decel tinggi untuk trail-brake rotation.");
      break;

    case 'drag':
      frontAccel = 50; frontDecel = 50;
      rearAccel  = 100; rearDecel = 100;
      centerBalance = 50;
      warnings.push("DRAG: Rear Accel 100% (Spool) agar tenaga tersalur merata mutlak tanpa wheelspin sepihak (one-wheel peel).");
      break;

    case 'rally':
    case 'offroad':
      frontAccel = 40; frontDecel = 15; // Lower decel so wheels don't lock on loose surfaces
      rearAccel  = 40; rearDecel  = 15;
      centerBalance = 50;
      warnings.push("RALLY/OFFROAD: Lock diff lebih rendah agar roda tetap bisa menjejak permukaan yang tidak rata.");
      break;

    default:
      break;
  }

  // ── Power & Grip Overrides (Only applicable to Race/Street) ────────────────
  if (trackType === 'race' || trackType === 'street') {
    // High HP = Needs more accel lock to prevent the inside wheel from spinning away the power
    if (hp > 800) {
      rearAccel += 15;
      frontAccel += 10;
      warnings.push(`🔥 High Horsepower (${hp} HP): Accel Diff dikeraskan agar ban dalam tidak kehilangan traksi saat keluar tikungan.`);
    } else if (hp > 500) {
      rearAccel += 8;
    }

    // High grip compound = Can run lower lock for better turning without losing traction
    const compound = tireCompound.toLowerCase();
    if (compound.includes('slick') || compound.includes('race')) {
      rearAccel -= 5;
      frontAccel -= 5;
    }
  }

  // ── Drivetrain overrides ───────────────────────────────────────────────────
  if (drivetrain === 'FWD') {
    if (trackType !== 'drift' && trackType !== 'drag') {
      frontDecel = 35;
      frontAccel = Math.min(frontAccel, 45); // Cap accel strictly to prevent understeer torque steer
    }
    warnings.push("FWD: Menaikkan Front Decel untuk membantu oversteer rotasi saat angkat kaki dari pedal gas (Lift-off Oversteer).");
  }

  if (drivetrain === 'RWD') {
    if (trackType === 'race' || trackType === 'street') {
      rearDecel = Math.max(5, rearDecel - 5); 
      warnings.push("RWD: Rear Decel rendah agar bagian belakang bebas berputar menembus apex tikungan (Trail Braking).");
    }
  }

  if (drivetrain === 'AWD') {
    // AWD Center Balance: weight-bias adjusted
    // 0 = full rear, 50 = balanced, 100 = full front
    if (bias > 55) { // Front heavy (understeers out of corners)
      centerBalance = Math.max(30, 50 - (bias - 55) * 1.5); // Shift REARWARD
      warnings.push("AWD (Front Heavy): Tenaga center diff digeser lebih ke RODA BELAKANG untuk mencegah understeer saat akselerasi.");
    } else if (bias < 45) { // Rear heavy (oversteers on power)
      centerBalance = Math.min(70, 50 + (45 - bias) * 1.5); // Shift FRONTWARD
      warnings.push("AWD (Rear Heavy): Tenaga center diff digeser ke RODA DEPAN untuk menstabilkan mobil dari spin out.");
    }
  }

  // ── Clamp all 0–100 ────────────────────────────────────────────────────────
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

  return {
    drivetrain,
    frontAccel:    clamp(frontAccel),
    frontDecel:    clamp(frontDecel),
    rearAccel:     clamp(rearAccel),
    rearDecel:     clamp(rearDecel),
    centerBalance: clamp(centerBalance),
    warnings,
  };
}

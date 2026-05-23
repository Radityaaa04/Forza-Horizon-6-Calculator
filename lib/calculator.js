/**
 * Forza Horizon Tire Pressure Calculator
 * Pure calculation logic — no side effects, easily testable.
 */

// Base pressures for each tire compound (in PSI)
const BASE_PRESSURES = {
  street: { front: 30.0, rear: 30.0 },
  sport: { front: 29.0, rear: 29.0 },
  semiSlick: { front: 27.5, rear: 27.5 },
  race: { front: 28.0, rear: 28.0 },
  drift: {
    RWD: { front: 29.0, rear: 33.5 },
    FWD: { front: 33.5, rear: 29.0 }, // Front high to lose grip
    AWD: { front: 29.0, rear: 32.0 },
  },
  drag: {
    RWD: { front: 55.0, rear: 15.0 },
    FWD: { front: 15.0, rear: 55.0 },
    AWD: { front: 15.0, rear: 15.0 },
  },
  rally: { front: 25.0, rear: 25.0 },
  snow: { front: 26.0, rear: 26.0 },
  offroad: { front: 21.5, rear: 21.5 },
};

// Weight class modifiers (in PSI)
const WEIGHT_MODIFIERS = {
  light: -1.5,
  normal: 0.0,
  heavy: 1.5,
};

// Compounds that accept weight distribution & weight class modifiers
const ADJUSTABLE_COMPOUNDS = ['street', 'sport', 'semiSlick', 'race', 'rally', 'snow', 'offroad'];

/**
 * Convert PSI to Bar
 */
export function psiToBar(psi) {
  return psi / 14.5038;
}

/**
 * Convert Bar to PSI
 */
export function barToPsi(bar) {
  return bar * 14.5038;
}

/**
 * Calculate base tire pressure
 */
export function calculatePressure({ compound, drivetrain = 'RWD', weightDist = 50, weight = 1200, horsepower = 400, unit = 'psi' }) {
  let front, rear;
  const warnings = [];

  // Step 1: Get base pressure
  if (compound === 'drag' || compound === 'drift') {
    const base = BASE_PRESSURES[compound][drivetrain];
    front = base.front;
    rear = base.rear;
  } else {
    const base = BASE_PRESSURES[compound];
    if (!base) {
      return { front: 30, rear: 30, unit, warnings: ['⚠️ Compound ban tidak dikenali. Menggunakan tekanan default.'] };
    }
    front = base.front;
    rear = base.rear;
  }

  // Step 2: Apply weight distribution modifier (only for adjustable compounds)
  if (ADJUSTABLE_COMPOUNDS.includes(compound)) {
    const deviation = weightDist - 50;
    const distAdjust = deviation * 0.1;
    front += distAdjust;
    rear -= distAdjust;

    if (Math.abs(deviation) > 10) {
      warnings.push(`Distribusi berat ${deviation > 0 ? 'depan' : 'belakang'} ekstrem (${weightDist}%). Tekanan disesuaikan ${Math.abs(distAdjust).toFixed(1)} PSI.`);
    }
  }

  // Step 3: Apply weight modifier (only for adjustable compounds)
  if (ADJUSTABLE_COMPOUNDS.includes(compound)) {
    let weightMod = 0;
    if (weight < 1000) weightMod = -1.5;
    else if (weight > 1600) weightMod = 1.5;
    
    front += weightMod;
    rear += weightMod;
  }

  // Step 3b: HP modifier
  if (ADJUSTABLE_COMPOUNDS.includes(compound) || compound === 'drift') {
    if (horsepower > 900) {
      front += 2.0;
      rear += 2.0;
      warnings.push('Tenaga sangat tinggi (>900 HP). Tekanan dinaikkan +2 PSI untuk menahan deformasi sidewall.');
    } else if (horsepower > 600) {
      front += 1.0;
      rear += 1.0;
      warnings.push('Tenaga tinggi (>600 HP). Tekanan dinaikkan +1 PSI untuk stabilitas tambahan.');
    }
  }

  // Step 4: Clamp values to Forza's allowed range (15.0 - 55.0 PSI)
  front = Math.max(15.0, Math.min(55.0, front));
  rear = Math.max(15.0, Math.min(55.0, rear));

  // Step 5: Convert unit if needed
  if (unit === 'bar') {
    front = psiToBar(front);
    rear = psiToBar(rear);
  }

  // Step 6: Round to 1 decimal place
  front = Math.round(front * 10) / 10;
  rear = Math.round(rear * 10) / 10;

  return { front, rear, unit, warnings };
}

/**
 * Get pro tip text based on selected compound (in Indonesian)
 */
export function getProTip(compound, drivetrain = 'RWD') {
  const tips = {
    street: '💡 Ban Street lambat panas. Jika mobil terasa understeer (susah belok), coba turunkan tekanan depan 0.5 PSI.',
    sport: '💡 Ban Sport adalah jalan tengah. Cukup lengket untuk harian, tapi jangan overheat. Pantau Telemetry suhu ban.',
    semiSlick: '💡 Semi Slick gripnya hampir sekelas ban Race tapi bisa untuk jalanan. Panas ideal di 31-33 PSI.',
    race: '💡 Ban Race/Slick sangat cepat panas! Mulai dengan tekanan rendah ini agar saat balapan, tekanan naik ke zona optimal (32-34 PSI).',
    drift: '💡 Drift RWD: Belakang tinggi agar mudah slide. Drift FWD: Depan tinggi agar understeer / ekor mudah diseret.',
    drag: drivetrain === 'RWD'
      ? '💡 Setup Drag RWD: Ban belakang dikempeskan maksimal untuk traksi launch. Ban depan dikeraskan untuk mengurangi rolling resistance.'
      : drivetrain === 'FWD'
        ? '💡 Setup Drag FWD: Ban depan dikempeskan karena roda depan yang bertugas menarik mobil.'
        : '💡 Setup Drag AWD: Semua ban dikempeskan karena keempat roda menyalurkan tenaga. Traksi maksimal di semua titik kontak!',
    rally: '💡 Ban Rally butuh kelenturan untuk menggaruk kerikil. Jika mobil terlalu banyak slide di tanah, turunkan tekanan 0.3 Bar.',
    snow: '💡 Permukaan salju sangat dingin, ban sulit panas. Tekanan rendah memaksa tapak ban melebar agar paku-paku kecil menancap ke es.',
    offroad: '💡 Ban Offroad butuh tekanan sangat rendah sebagai "suspensi tambahan" saat mendarat dari lompatan.',
  };
  return tips[compound] || '';
}

/**
 * Get compound display info (name, emoji, color)
 */
export function getCompoundInfo(compound) {
  const info = {
    street: { name: 'Street', emoji: '🛣️', color: '#fb923c', description: 'Ban harian aspal' },
    sport: { name: 'Sport', emoji: '🔥', color: '#ff8c00', description: 'Grip aspal medium' },
    semiSlick: { name: 'Semi Slick', emoji: '🏎️', color: '#ff1493', description: 'Grip tinggi, track day' },
    race: { name: 'Race / Slick', emoji: '🏁', color: '#f97316', description: 'Aspal balap, grip max' },
    drift: { name: 'Drift', emoji: '💨', color: '#22d3ee', description: 'Khusus untuk sideways!' },
    drag: { name: 'Drag', emoji: '🚀', color: '#22c55e', description: 'Trek lurus, launch max' },
    rally: { name: 'Rally', emoji: '🌍', color: '#c8a44e', description: 'Tanah & aspal campuran' },
    snow: { name: 'Snow', emoji: '❄️', color: '#22d3ee', description: 'Salju dan es' },
    offroad: { name: 'Offroad', emoji: '⛰️', color: '#8b6914', description: 'Lumpur & cross country' },
  };
  return info[compound] || info.street;
}

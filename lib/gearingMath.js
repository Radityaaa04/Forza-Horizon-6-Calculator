// Track type profiles — mengatur Final Drive multiplier, Gear 1 offset, dan top gear spacing
const TRACK_PROFILES = {
  drag: {
    label: 'Drag',
    finalDriveMultiplier: 1.00,  // Max top speed, gigi panjang
    gear1Offset: 0.00,           // Gigi 1 agresif penuh
    topGearTarget: 0.88,         // Gigi atas dibiarkan renggang (long pull di lurus)
    description: 'Prioritas top speed & launch. Final Drive semaksimal mungkin.'
  },
  road: {
    label: 'Road Race',
    finalDriveMultiplier: 0.90,  // Sedikit diperpendek untuk punch keluar tikungan
    gear1Offset: 0.00,
    topGearTarget: 0.90,
    description: 'Balance antara akselerasi keluar tikungan dan kecepatan di trek lurus.'
  },
  street: {
    label: 'Street',
    finalDriveMultiplier: 0.86,  // Urban mix, trek lurus tidak terlalu panjang
    gear1Offset: 0.05,           // Sedikit lebih panjang untuk trafik padat
    topGearTarget: 0.91,
    description: 'Trek urban campuran, tikungan rapat dan lurus pendek.'
  },
  touge: {
    label: 'Touge',
    finalDriveMultiplier: 0.78,  // Mountain pass, tikungan tajam terus
    gear1Offset: 0.10,           // Harus bisa engine brake masuk tikungan
    topGearTarget: 0.93,         // Gigi atas sangat rapat (tidak butuh top speed)
    description: 'Lintasan pegunungan berkelok. Fokus pada torsi mid-range dan engine brake.'
  },
  dirt: {
    label: 'Dirt',
    finalDriveMultiplier: 0.82,  // Permukaan lepas, top speed tidak relevan
    gear1Offset: 0.20,           // Gigi 1 sangat panjang — ban mudah spin di pasir/tanah
    topGearTarget: 0.92,
    description: 'Permukaan gembur/tanah. Gigi 1 dipanjangkan untuk mencegah wheelspin.'
  },
  crosscountry: {
    label: 'Cross-Country',
    finalDriveMultiplier: 0.72,  // Off-road berat, butuh torsi rendah untuk tanjakan
    gear1Offset: 0.30,           // Gigi 1 paling panjang — medan berat + tanjakan
    topGearTarget: 0.94,
    description: 'Medan berat off-road. Prioritas torsi rendah untuk tanjakan dan obstacle.'
  }
};

const TIRE_GRIP = {
  'Stock': 0.8,
  'Street': 1.0,
  'Sport': 1.2,
  'Semi Slick': 1.4,
  'Slick': 1.8,
  'Drift': 0.8,
  'Drag': 2.2,
  'Snow': 0.9,
  'Rally': 1.3,
  'Off-Road': 1.0,
};

export function calculateGears({ 
  peakTorqueRpm, 
  redlineRpm, 
  numGears, 
  drivetrain = 'AWD', 
  targetTopSpeed = 300, 
  trackType = 'road',
  weight = null,
  horsepower = null,
  tireCompound = 'Street'
}) {
  // Validasi input dasar
  const redline = Math.max(1000, parseInt(redlineRpm) || 8000);
  const peakTorque = Math.max(1000, Math.min(redline - 500, parseInt(peakTorqueRpm) || 4000));
  const gearsCount = Math.max(4, Math.min(10, parseInt(numGears) || 6));
  const topSpeed = Math.max(100, parseInt(targetTopSpeed) || 300);

  // Parse Advanced Physics
  const weightKg = parseFloat(weight) || 1200; // Default 1200kg jika kosong
  const hp = parseFloat(horsepower); // Bisa null/NaN
  const grip = TIRE_GRIP[tireCompound] || 1.0;

  // Ambil profil lintasan
  const profile = TRACK_PROFILES[trackType] || TRACK_PROFILES.road;

  // 1. Tentukan Base Gigi 1 berdasarkan Drivetrain
  let gear1Base = 2.890; // AWD — traksi sempurna
  if (drivetrain === 'RWD') gear1Base = 2.450;
  if (drivetrain === 'FWD') gear1Base = 2.100;

  // --- LOGIKA TRAKSI (WHEELSPIN CONTROL) ---
  // Traction Index = (Berat dalam Ton) * Grip Ban
  // Standar Index = (1.2 Ton * 1.0 Street) = 1.2
  const tractionIndex = (weightKg / 1000) * grip;
  
  // Jika traksi di bawah standar (< 1.2), gigi 1 dipanjangkan (- rasio)
  // Jika traksi di atas standar (> 1.2), gigi 1 dipendekkan (+ rasio, lebih nyentak)
  const tractionModifier = (tractionIndex - 1.2) * 0.4; 
  
  // Kombinasi offset lintasan dan modifier fisika traksi
  let gear1 = gear1Base - profile.gear1Offset + tractionModifier;

  // Forza Individual Gear limit: 0.48 - 6.00
  const clampGear = (val) => Math.max(0.48, Math.min(6.00, val));
  gear1 = clampGear(gear1);

  // Drop ratio berbasis Powerband
  let maxDropRatio = peakTorque / redline;
  maxDropRatio = Math.max(0.55, Math.min(0.75, maxDropRatio));

  const gears = [gear1];
  let currentGear = gear1;

  for (let i = 2; i <= gearsCount; i++) {
    const progress = (i - 2) / (gearsCount - 2 || 1); 

    // Target drop ratio top gear
    const dropRatio = maxDropRatio + progress * (profile.topGearTarget - maxDropRatio);

    currentGear = currentGear * dropRatio;
    gears.push(clampGear(currentGear));
  }

  const formattedGears = gears.map(g => parseFloat(g.toFixed(2)));
  const topGearRatio = formattedGears[formattedGears.length - 1];

  // --- LOGIKA AERODINAMIKA (TOP SPEED REALITY CHECK) ---
  let actualTopSpeed = topSpeed;
  let aeroLimited = false;
  
  if (hp > 0) {
    // Estimasi max speed = 175 * kubik root(HP / 100)
    // Contoh 300HP -> 252 kmh. 800HP -> 350 kmh.
    const aeroCap = 175 * Math.pow((hp / 100), 1/3);
    
    // Jika user minta 400kmh tapi mesinnya cuma bisa 252kmh, limit ke 252.
    // Ini bikin final drive memendek (angka membesar), jadi mobil tetep ngacir.
    if (topSpeed > aeroCap) {
      actualTopSpeed = aeroCap;
      aeroLimited = true;
    }
  }

  // 2. Kalkulasi Final Drive 
  let finalDrive = (redline * 0.12816) / (actualTopSpeed * topGearRatio);

  // Terapkan multiplier lintasan
  finalDrive = finalDrive * profile.finalDriveMultiplier;

  // Forza Final Drive limit: 2.20 - 6.10
  finalDrive = Math.max(2.20, Math.min(6.10, finalDrive));

  // Generate chart data untuk Recharts
  const chartData = [];
  const velocityConstant = 30;

  for (let i = 0; i < gearsCount; i++) {
    const ratio = formattedGears[i];
    const dropRpm = i === 0 ? 0 : redline * (formattedGears[i] / formattedGears[i - 1]);

    const startSpeed = (dropRpm / ratio) * velocityConstant;
    const endSpeed = (redline / ratio) * velocityConstant;

    chartData.push({ speed: Math.round(startSpeed), [`G${i + 1}`]: Math.round(dropRpm) });
    chartData.push({ speed: Math.round(endSpeed), [`G${i + 1}`]: Math.round(redline) });
  }

  return {
    gears: formattedGears,
    chartData,
    finalDrive: parseFloat(finalDrive.toFixed(2)),
    profileDescription: profile.description,
    physicsWarnings: aeroLimited ? `⚠️ Aero Limited: Target top speed terlalu tinggi untuk ${hp} HP. Rasio Final Drive otomatis diperpendek agar mesin tidak kehabisan nafas di kecepatan tinggi.` : null,
    tractionIndex: tractionIndex.toFixed(2)
  };
}

export { TRACK_PROFILES, TIRE_GRIP };

export function calculateAlignment({
  weight,
  weightDistribution, // e.g. 52 for 52% front
  weightBias,         // alias for weightDistribution (interchangeable)
  drivetrain, // AWD, RWD, FWD
  suspensionType, // 'Race', 'Rally', 'Drift', 'Stock', 'Street' (auto-capitalized)
  trackType, // 'race', 'street', 'drag', 'drift', 'rally', 'offroad'
  springStiffness = 'medium' // 'soft', 'medium', 'stiff'
}) {
  // Normalize: accept both weightDistribution and weightBias
  weightDistribution = weightDistribution ?? weightBias;
  // Normalize: auto-capitalize suspensionType ('race' → 'Race')
  if (suspensionType && typeof suspensionType === 'string') {
    suspensionType = suspensionType.charAt(0).toUpperCase() + suspensionType.slice(1).toLowerCase();
  }
  let frontCamber = -1.5;
  let rearCamber = -1.0;
  let frontToe = 0.0;
  let rearToe = 0.0;
  let caster = 5.5;

  let warnings = [];

  // 1. BASELINE CAMBER berdasarkan Suspension Type (Roll Stiffness)
  if (suspensionType === 'Race') {
    frontCamber = -1.2;
    rearCamber = -0.8;
  } else if (suspensionType === 'Rally') {
    frontCamber = -2.0;
    rearCamber = -1.5;
  } else if (suspensionType === 'Street') {
    frontCamber = -1.8;
    rearCamber = -1.2;
  } else if (suspensionType === 'Stock') {
    frontCamber = -2.2;
    rearCamber = -1.5;
  }

  // 1b. MODIFIER SPRING STIFFNESS (Inter-module linking)
  // Per (MacPherson/Double Wishbone) roll geometry: 
  // Stiffer springs = less body roll = tire stays flatter = less static camber needed
  if (springStiffness === 'stiff') {
    frontCamber += 0.3; // Less negative camber
    rearCamber += 0.2;
  } else if (springStiffness === 'soft') {
    frontCamber -= 0.3; // More negative camber to compensate for roll
    rearCamber -= 0.2;
  }

  // 2. MODIFIER BERAT (Mobil berat lebih limbung, butuh camber ekstra)
  if (weight > 1600) {
    frontCamber -= 0.4;
    rearCamber -= 0.2;
  } else if (weight > 1300) {
    frontCamber -= 0.2;
    rearCamber -= 0.1;
  } else if (weight < 1000) {
    frontCamber += 0.3; // Mobil ringan tidak butuh banyak camber
    rearCamber += 0.2;
  }

  // 3. MODIFIER WEIGHT DISTRIBUTION
  if (weightDistribution > 54) {
    frontCamber -= 0.3; // Ekstra grip depan untuk kurangi understeer
  } else if (weightDistribution > 51) {
    frontCamber -= 0.1;
  } else if (weightDistribution < 47) { // Rear engine (Porsche, dll)
    rearCamber -= 0.3;
    frontCamber += 0.2; // Ringankan camber depan agar setir lebih responsif
  }

  // 4. MODIFIER DRIVETRAIN (Toe & Caster base)
  if (drivetrain === 'AWD') {
    frontToe = 0.1; // Sedikit toe out membantu AWD masuk tikungan
    rearToe = -0.1; // Toe in belakang menstabilkan
    caster = 6.0;
    frontCamber -= 0.2; // AWD butuh ekstra camber depan
  } else if (drivetrain === 'RWD') {
    frontToe = 0.0;
    rearToe = -0.1; // Kurangi agresivitas toe in untuk RWD (awalnya -0.2)
    caster = 5.5;
    rearCamber += 0.3; // Lebih rata (mendekati 0) traksi lurus lebih gigit
  } else if (drivetrain === 'FWD') {
    frontToe = 0.2; // FWD paling susah belok (understeer)
    rearToe = -0.2; // Ekornya dibikin sedikit kaku
    caster = 6.5; 
    frontCamber -= 0.3; // Front ban kerja rodi (gas + belok)
    rearCamber += 0.5; // Ban belakang ngikut saja
  }

  // 5. OVERRIDE & PENYESUAIAN TRACK TYPE (Sprint vs Circuit, dsb)
  if (trackType === 'drift' || suspensionType === 'Drift') {
    frontCamber = Math.min(-4.0, frontCamber - 2.5);
    rearCamber = -0.5;
    frontToe = 1.5; 
    rearToe = 0.0;
    caster = 7.0; 
    warnings.push("💨 DRIFT: Front Toe & Camber ekstrem. Mobil akan sangat liar di lintasan lurus tapi punya steering angle grip yang kuat.");
  } else if (trackType === 'drag') {
    frontCamber = 0.0;
    rearCamber = 0.0;
    frontToe = 0.0;
    rearToe = 0.0;
    caster = 7.0; // Stabilitas maksimum di kecepatan tinggi lurusan
    warnings.push("🏁 DRAG: Alignment diset ke 0.0 untuk patch kontak ban maksimal. Mobil sangat sulit dibelokkan.");
  } else if (trackType === 'rally' || trackType === 'offroad') {
    caster = 4.5; // Caster rendah agar setir tidak berat karena gundukan
    rearToe = (drivetrain === 'FWD') ? -0.1 : 0.0; 
  } else if (trackType === 'race') {
    // Technical circuit (banyak tikungan lambat/sedang)
    caster = 5.0; // Responsif belok patah
    frontCamber -= 0.2; // Tambahan grip lateral
  } else if (trackType === 'street') {
    // High-speed sprint (banyak lurusan panjang dan tikungan cepat)
    caster = 6.5; // Stabil di kecepatan tinggi (High speed tracking)
    rearToe = -0.2; // Tambah kestabilan ekor di kecepatan tinggi
    frontCamber += 0.2; // Sedikit lebih datar untuk pengereman lurus optimal
  }

  // BATAS BAWAH DAN ATAS (Sesuai limit slider Forza Horizon)
  frontCamber = Math.max(-5.0, Math.min(5.0, frontCamber));
  rearCamber = Math.max(-5.0, Math.min(5.0, rearCamber));
  frontToe = Math.max(-5.0, Math.min(5.0, frontToe));
  rearToe = Math.max(-5.0, Math.min(5.0, rearToe));
  caster = Math.max(1.0, Math.min(7.0, caster));

  return {
    frontCamber: Number(frontCamber.toFixed(1)),
    rearCamber: Number(rearCamber.toFixed(1)),
    frontToe: Number(frontToe.toFixed(1)),
    rearToe: Number(rearToe.toFixed(1)),
    caster: Number(caster.toFixed(1)),
    warnings
  };
}

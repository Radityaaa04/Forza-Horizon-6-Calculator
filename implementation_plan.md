# Forza Horizon Tire Pressure Calculator — Commercial Web App

A jaw-dropping, premium-grade web calculator for Forza Horizon tire pressure tuning. Built with Next.js for SEO, scalability, and monetization readiness.

## User Review Required

> [!IMPORTANT]
> **Framework Change:** Upgraded from Vanilla JS to **Next.js (App Router)** for commercial viability.
> 
> **Design Philosophy:** The UI will make users feel like they just opened a **AAA racing game menu**. Every element will be animated, polished, and premium. No generic Bootstrap look — this is a product people will pay for.
> 
> Please review the design vision and logic below before I begin coding.

## Open Questions

> [!NOTE]
> 1. Satuan default saat halaman pertama kali dibuka: **PSI** atau **Bar**?
> 2. Apakah Anda ingin ada branding/logo khusus, atau saya buatkan logo teks bergaya racing?
> 3. Bahasa interface: **Bahasa Inggris** (untuk pasar global) atau **Bahasa Indonesia**?

---

## Design Vision: "Tercengang Level"

### Color Palette (Forza Horizon Festival Vibe)
```
Background:     #06060f (Deep Space Black)
Card Surface:   rgba(255, 255, 255, 0.04) (Frosted Glass)
Primary Glow:   #ff2d78 → #ff6b35 (Magenta to Sunset Orange)
Secondary Glow: #00d4ff → #7b61ff (Cyan to Electric Purple)
Accent:         #00ff88 (Neon Green — for "optimal" indicators)
Text Primary:   #f0f0f5
Text Secondary: #8888aa
```

### Typography
- **Headings:** `Outfit` (Google Font) — bold, modern, racing feel
- **Body/Numbers:** `Inter` (Google Font) — clean, professional
- **Pressure Numbers:** `Orbitron` or `Space Grotesk` — futuristic digital readout feel

### Premium UI Elements (What Makes Users Go "WOW")

#### 1. 🎆 Animated Particle Background
- Subtle floating particles (like dust/sparks) drifting across the deep dark background
- Built with lightweight Canvas API (no heavy libraries)
- Creates a "living, breathing" atmosphere

#### 2. 🔥 Animated Gradient Borders
- Every card has a slowly rotating gradient border (magenta → orange → cyan → purple)
- Uses `@property` CSS animation for smooth hue rotation
- Glows softly, like neon lights at a Horizon Festival

#### 3. 🎯 Animated Pressure Gauge (Hero Element)
- A large, circular SVG gauge for each tire (Front & Rear)
- The needle/arc **animates smoothly** when pressure values change
- Color-coded zones: Red (too low) → Green (optimal) → Red (too high)
- Numbers count up/down with easing animation (like a car speedometer)

#### 4. 🛞 Interactive Tire Cross-Section Visualization
- SVG illustration of a tire cross-section showing contact patch
- When pressure is LOW: tire visually flattens, contact patch widens
- When pressure is HIGH: tire visually inflates/bulges, contact patch narrows
- Smooth CSS transitions between states

#### 5. ✨ Glassmorphism Cards
- All containers use `backdrop-filter: blur(20px)` with subtle borders
- Cards have a soft inner glow matching the current tire compound color
- Slight parallax tilt effect on hover (CSS transform perspective)

#### 6. 🎬 Micro-Animations Everywhere
- Input selects: smooth expand/collapse with backdrop blur
- Slider thumb: glowing pulse effect
- Result numbers: counting animation (0 → target value) with spring easing
- Page load: staggered fade-in from bottom (each element appears 100ms after the previous)
- Compound selection: cards slide and glow when selected

#### 7. 📱 Mobile-First Responsive
- Perfectly usable on phone screens (many Forza players tune on their phone while playing)
- Touch-friendly sliders and large tap targets
- Gauges stack vertically on mobile

---

## Proposed Features & Logic

### Input Controls

| Input | Type | Options |
|-------|------|---------|
| Unit Toggle | Switch | PSI / Bar |
| Tire Compound | Card Selector | Street/Sport, Race/Slick, Drift, Drag, Rally, Snow, Offroad |
| Drivetrain | Card Selector | RWD, FWD, AWD *(visible only when Drag is selected)* |
| Weight Distribution | Range Slider | 40% — 60% Front (default: 50%) |
| Vehicle Weight | Card Selector | Light (<1000kg), Normal (1000–1500kg), Heavy (>1500kg) |

### Calculation Engine

#### Base Pressures (PSI)
| Compound | Front | Rear | Notes |
|----------|-------|------|-------|
| Street / Sport | 30.0 | 30.0 | Symmetric start |
| Race / Slick | 28.0 | 28.0 | Lower to compensate for fast heat buildup |
| Drift | 29.0 | 33.5 | Rear intentionally over-inflated for slide |
| Drag (RWD) | 55.0 | 15.0 | Max front, min rear |
| Drag (FWD) | 15.0 | 55.0 | Inverted — drive wheels get min |
| Drag (AWD) | 15.0 | 15.0 | All drive wheels get min |
| Rally | 25.0 | 25.0 | Moderate for mixed surfaces |
| Snow | 26.0 | 26.0 | Low for ice grip |
| Offroad | 21.5 | 21.5 | Very low for shock absorption |

#### Weight Distribution Modifier
*Applies to: Street, Sport, Race, Rally, Snow, Offroad only*

```
deviation = (frontPercent - 50)
frontAdjust = deviation * 0.1
rearAdjust  = deviation * -0.1
```
Example: 54% Front → Front +0.4 PSI, Rear -0.4 PSI

#### Vehicle Weight Modifier
*Applies to: Street, Sport, Race, Rally, Snow, Offroad only*

| Class | Modifier |
|-------|----------|
| Light (<1000kg) | -1.5 PSI |
| Normal (1000–1500kg) | 0.0 PSI |
| Heavy (>1500kg) | +1.5 PSI |

#### Unit Conversion
```
Bar = PSI / 14.5038
```
Display to 1 decimal place for Bar, 1 decimal place for PSI.

### Output Display
- **Two large animated pressure gauges** (Front & Rear)
- **Animated tire cross-section** showing contact patch
- **Pro Tip box**: Context-sensitive advice based on the selected compound
- **"Fine-Tune Reminder" banner**: Always visible — reminding users to verify with Telemetry

---

## Proposed Changes

### Project Structure: `d:/Project/Folder Baru/forza-tire-calc/`

```
forza-tire-calc/
├── app/
│   ├── layout.js          # Root layout, fonts, metadata (SEO)
│   ├── page.js             # Main calculator page
│   └── globals.css         # Global styles, CSS variables, animations
├── components/
│   ├── ParticleBackground.jsx   # Canvas particle effect
│   ├── PressureGauge.jsx        # SVG animated gauge
│   ├── TireCrossSection.jsx     # SVG tire visualization
│   ├── CompoundSelector.jsx     # Tire compound card selector
│   ├── DrivetrainSelector.jsx   # RWD/FWD/AWD selector
│   ├── WeightSlider.jsx         # Weight distribution slider
│   ├── WeightClassSelector.jsx  # Light/Normal/Heavy selector
│   ├── UnitToggle.jsx           # PSI/Bar switch
│   ├── ResultCard.jsx           # Result display with gauge + tire
│   └── ProTip.jsx               # Context-sensitive advice box
├── lib/
│   └── calculator.js            # Pure calculation logic (testable)
├── public/
│   └── (favicon, og-image)
├── package.json
└── next.config.js
```

#### [NEW] `app/layout.js`
Root layout with Google Fonts (Outfit, Inter, Orbitron), SEO meta tags, Open Graph tags.

#### [NEW] `app/page.js`
Main page composing all components. Manages state and passes props.

#### [NEW] `app/globals.css`
Full design system: CSS custom properties, keyframe animations, glassmorphism utilities, responsive breakpoints, gradient border animations.

#### [NEW] `components/ParticleBackground.jsx`
Lightweight Canvas-based particle system. Floating dust/spark particles with subtle parallax.

#### [NEW] `components/PressureGauge.jsx`
SVG circular gauge with animated arc and needle. Color zones (red/green/red). Counting number animation.

#### [NEW] `components/TireCrossSection.jsx`
SVG tire cross-section that morphs based on pressure value. Shows contact patch width changing.

#### [NEW] `components/CompoundSelector.jsx`
Horizontally scrollable card selector with glow effect on active selection. Each compound has an icon/emoji and color accent.

#### [NEW] `components/DrivetrainSelector.jsx`
Conditionally rendered (Drag only). Three-option card selector for RWD/FWD/AWD.

#### [NEW] `components/WeightSlider.jsx`
Custom-styled range slider with gradient track, glowing thumb, and live percentage label.

#### [NEW] `components/WeightClassSelector.jsx`
Three-option card selector for vehicle weight class.

#### [NEW] `components/UnitToggle.jsx`
Animated toggle switch with PSI/Bar labels.

#### [NEW] `components/ResultCard.jsx`
Container for gauge + tire visualization + pressure number. Glassmorphic card with animated border.

#### [NEW] `components/ProTip.jsx`
Dynamic tip box that changes content based on selected compound. Subtle fade transition.

#### [NEW] `lib/calculator.js`
Pure function: `calculatePressure({ compound, drivetrain, weightDist, weightClass, unit })` → `{ front, rear }`. No side effects, easily testable.

---

## Verification Plan

### Automated Tests
- Unit test `lib/calculator.js` for all 7 compounds × 3 weight classes × edge cases
- Verify PSI ↔ Bar conversion accuracy

### Manual Verification
1. Run `npm run dev` and open in browser
2. Visual check: Does the UI genuinely look premium and "AAA game quality"?
3. Test all 7 tire compounds and verify pressure outputs match our established base tunes
4. Test Drag + RWD/FWD/AWD switching behavior
5. Test PSI ↔ Bar toggle (numbers should update instantly with smooth animation)
6. Test weight slider at extremes (40% and 60%) — verify front/rear split changes
7. Test on mobile viewport — verify responsive layout and touch usability
8. Lighthouse audit: Performance, SEO, Accessibility scores

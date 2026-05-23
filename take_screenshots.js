const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const pages = [
    { url: 'http://localhost:3000/tune', name: 'tune' },
    { url: 'http://localhost:3000/tires', name: 'tires' },
    { url: 'http://localhost:3000/gearing', name: 'gearing' },
    { url: 'http://localhost:3000/alignment', name: 'alignment' },
    { url: 'http://localhost:3000/springs', name: 'springs' },
    { url: 'http://localhost:3000/aero', name: 'aero' },
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `screenshot_${p.name}.png`, fullPage: false });
    console.log(`✓ screenshot_${p.name}.png`);
  }

  // Mobile screenshot
  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto('http://localhost:3000/tune', { waitUntil: 'networkidle', timeout: 15000 });
  await mobile.waitForTimeout(1500);
  await mobile.screenshot({ path: 'screenshot_mobile.png', fullPage: false });
  console.log('✓ screenshot_mobile.png');

  await browser.close();
  console.log('DONE');
})();

// Usage: node scripts/recipe-illustrations/render.mjs recipes/images
// Renders the illustrated hero.jpg cards (needs Playwright + Chromium).
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
import { recipes } from './illustrations.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const outRoot = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
for (const [slug, fn] of Object.entries(recipes)) {
  await page.setContent(`<html><body style="margin:0">${fn()}</body></html>`);
  mkdirSync(`${outRoot}/${slug}`, { recursive: true });
  await page.screenshot({ path: `${outRoot}/${slug}/hero.jpg`, type: 'jpeg', quality: 86 });
  console.log('wrote', slug);
}
await browser.close();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== SCOUTGRID FRONTEND AUDIT & VERIFICATION ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Verify CSS variables and color tokens
const globalsCss = fs.readFileSync(path.join(rootDir, 'src/styles/globals.css'), 'utf-8');
assert(globalsCss.includes('--void: #090014;'), 'CSS variable --void is #090014');
assert(globalsCss.includes('--surface: #140026;'), 'CSS variable --surface is #140026');
assert(globalsCss.includes('--plum: #620a96;'), 'CSS variable --plum is #620a96');
assert(globalsCss.includes('--brand: #5662f6;'), 'CSS variable --brand is #5662f6');
assert(globalsCss.includes('--violet: #9b30ff;'), 'CSS variable --violet is #9b30ff');
assert(globalsCss.includes('--lilac: #d187ff;'), 'CSS variable --lilac is #d187ff');
assert(globalsCss.includes('--border: #3f1568;'), 'CSS variable --border is #3f1568');
assert(globalsCss.includes('--text: #f8f0ff;'), 'CSS variable --text is #f8f0ff');
assert(globalsCss.includes('--success: #4ade80;'), 'CSS variable --success is #4ade80');
assert(globalsCss.includes('--warning: #fbbf24;'), 'CSS variable --warning is #fbbf24');
assert(globalsCss.includes('--danger: #f87171;'), 'CSS variable --danger is #f87171');

// 2. Verify Tailwind Configuration
const tailwindConfig = fs.readFileSync(path.join(rootDir, 'tailwind.config.js'), 'utf-8');
assert(tailwindConfig.includes('Bricolage Grotesque'), 'Font Bricolage Grotesque configured');
assert(tailwindConfig.includes('Figtree'), 'Font Figtree configured');
assert(tailwindConfig.includes("void: 'var(--void)'"), 'Tailwind void mapped to CSS variable');
assert(tailwindConfig.includes("surface: 'var(--surface)'"), 'Tailwind surface mapped to CSS variable');

// 3. Verify Production Build Assets
const distHtml = fs.readFileSync(path.join(rootDir, 'dist/index.html'), 'utf-8');
assert(distHtml.includes('Golden Snitch'), 'dist/index.html includes Golden Snitch page title');
assert(distHtml.includes('/assets/index-'), 'dist/index.html references bundled JS/CSS assets');
const distAssets = fs.readdirSync(path.join(rootDir, 'dist/assets'));
assert(distAssets.some(f => f.endsWith('.js')), 'dist/assets contains bundled JavaScript file');
assert(distAssets.some(f => f.endsWith('.css')), 'dist/assets contains bundled CSS file');

// 4. Verify Route Pages Exist (Core + Auth)
const pages = [
  'DashboardPage.tsx',
  'ScoutingPage.tsx',
  'PlayerDatabasePage.tsx',
  'PlayerProfilePage.tsx',
  'ComparePage.tsx',
  'RostersPage.tsx',
  'SynergyPage.tsx',
  'WatchlistPage.tsx',
  'ReportsPage.tsx',
  'SettingsPage.tsx',
  'auth/LoginPage.tsx',
  'auth/RegisterPage.tsx',
  'auth/ForgotPasswordPage.tsx',
  'auth/ResetPasswordPage.tsx',
];
for (const page of pages) {
  const pagePath = path.join(rootDir, 'src/pages', page);
  assert(fs.existsSync(pagePath), `Page exists: src/pages/${page}`);
}

// 5. Verify Mock Data & Case Study
const mockDataContent = fs.readFileSync(path.join(rootDir, 'src/data/mockData.ts'), 'utf-8');
assert(mockDataContent.includes('Mirage'), 'Mock data includes case study candidate Mirage');
assert(mockDataContent.includes('Voltz'), 'Mock data includes case study candidate Voltz');
assert(mockDataContent.includes('Sentinels'), 'Mock data includes Sentinels roster');
assert(mockDataContent.includes('VALORANT'), 'Mock data supports VALORANT');
assert(mockDataContent.includes('Counter-Strike 2'), 'Mock data supports Counter-Strike 2');
assert(mockDataContent.includes('League of Legends'), 'Mock data supports League of Legends');

// 6. Verify Scoring Engine Formulations
const scoringContent = fs.readFileSync(path.join(rootDir, 'src/utils/scoring.ts'), 'utf-8');
assert(scoringContent.includes('ROLE_FORMULAS'), 'Scoring engine defines ROLE_FORMULAS');
assert(scoringContent.includes('calculateConfidence'), 'Scoring engine calculates confidence separately');
assert(scoringContent.includes('High confidence'), 'Scoring engine includes High confidence label');
assert(scoringContent.includes('Medium confidence'), 'Scoring engine includes Medium confidence label');
assert(scoringContent.includes('Low confidence'), 'Scoring engine includes Low confidence label');

console.log(`\nVerification Complete: ${passCount} PASSED, ${failCount} FAILED.`);
if (failCount > 0) process.exit(1);

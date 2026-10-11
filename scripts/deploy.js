#!/usr/bin/env node
/**
 * GetLoud — Deploy to Netlify
 * ============================
 * Builds the project and triggers a Netlify deploy.
 * Requires the Netlify CLI: npm install -g netlify-cli
 *
 * Usage:
 *   node scripts/deploy.js [flags]
 *
 *   --prod       Deploy to production (default: draft/preview deploy)
 *   --message    "Deploy message"
 *   --skip-build Skip the build step (use existing dist/)
 *
 * Examples:
 *   node scripts/deploy.js                     # preview deploy
 *   node scripts/deploy.js --prod              # production deploy
 *   node scripts/deploy.js --prod --message "Day 7 live"
 */

import { execSync } from 'child_process';
import { PROJECT_ROOT, hasFlag, getFlag, runBuild } from './_utils.js';

const args       = process.argv.slice(2);
const isProd     = hasFlag(args, '--prod');
const skipBuild  = hasFlag(args, '--skip-build');
const message    = getFlag(args, '--message', isProd ? 'Production deploy' : 'Preview deploy');

console.log('\n🚀 GetLoud — Deploy');
console.log('====================');
console.log(`   Mode:    ${isProd ? '🟢 PRODUCTION' : '🔵 Preview/Draft'}`);
console.log(`   Message: ${message}`);

// 1. Build (unless skipped)
if (!skipBuild) {
  const ok = runBuild();
  if (!ok) { console.error('❌  Build failed — aborting deploy.'); process.exit(1); }
}

// 2. Check Netlify CLI
try {
  execSync('netlify --version', { stdio: 'pipe' });
} catch {
  console.error('\n❌  Netlify CLI not found. Install it with:\n    npm install -g netlify-cli\n    netlify login');
  process.exit(1);
}

// 3. Deploy
console.log(`\n📡 Deploying to Netlify (${isProd ? 'production' : 'preview'})...`);
try {
  const cmd = isProd
    ? `netlify deploy --prod --message ${JSON.stringify(message)} --dir dist`
    : `netlify deploy --message ${JSON.stringify(message)} --dir dist`;

  execSync(cmd, { cwd: PROJECT_ROOT, stdio: 'inherit' });
  console.log(`\n🎉 Deploy complete!`);
} catch (err) {
  console.error('\n❌  Netlify deploy failed:', err.message);
  process.exit(1);
}

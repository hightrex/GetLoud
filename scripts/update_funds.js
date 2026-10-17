#!/usr/bin/env node
/**
 * GetLoud — Update Fundraising Total
 * =====================================
 * The primary script for logging incoming donations and financial contributions.
 * Updates campaignState.js (campaignConfig.fundsRaisedUsd) and optionally the
 * corresponding week row in weeklyDonations.js.
 *
 * Usage:
 *   node scripts/update_funds.js [flags]
 *
 * Flags:
 *   --amount      50             (USD received, required)
 *   --week        2              (week 1–14 to credit, optional)
 *   --note        "GoFundMe"     (optional source note)
 *   --dry-run                    (preview only, no files modified)
 *   --no-build                   (skip npm run build verification)
 *   --no-commit                  (skip git commit)
 *
 * Examples:
 *   node scripts/update_funds.js --amount 150 --note "Community fundraiser"
 *   node scripts/update_funds.js --amount 20 --week 2 --note "Guest contribution" --no-commit
 *   node scripts/update_funds.js --amount 50 --week 1 --dry-run
 */

import fs from 'fs';
import path from 'path';
import {
  PROJECT_ROOT,
  getFlag,
  hasFlag,
  ask,
  runBuild,
  gitCommitAndLog,
  shouldBuild,
  shouldCommit,
  validateJsSyntax,
} from './_utils.js';

const CAMPAIGN_STATE_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'campaignState.js');
const DONATIONS_PATH      = path.join(PROJECT_ROOT, 'src', 'data', 'weeklyDonations.js');

const args     = process.argv.slice(2);
const isDryRun = hasFlag(args, '--dry-run');

async function collectData() {
  let amountRaw = getFlag(args, '--amount');
  let weekRaw   = getFlag(args, '--week', '');
  let note      = getFlag(args, '--note', '');

  if (!amountRaw) {
    console.log('\n📋 Donation details (or run with flags e.g. --amount 50 --week 2)\n');
    amountRaw = await ask('Amount received in USD');
  }
  if (weekRaw === '' && !hasFlag(args, '--amount')) {
    weekRaw = await ask('Week number to credit (1–14, blank = global total only)', '');
  }
  if (!note && !hasFlag(args, '--amount')) {
    note = await ask('Source / note (optional)', '');
  }

  const amount = parseFloat(amountRaw);
  if (isNaN(amount) || amount <= 0) {
    console.error(`❌ Invalid amount: "${amountRaw}". Must be a positive number.`);
    process.exit(1);
  }

  let week = null;
  if (weekRaw !== null && weekRaw !== '') {
    week = parseInt(weekRaw, 10);
    if (isNaN(week) || week < 1 || week > 14) {
      console.error(`❌ Invalid week: "${weekRaw}". Must be between 1 and 14.`);
      process.exit(1);
    }
  }

  return { amount, week, note: note || null };
}

function updateCampaignState(amount) {
  const content = fs.readFileSync(CAMPAIGN_STATE_PATH, 'utf8');
  const match = content.match(/fundsRaisedUsd:\s*([\d.]+)/);
  if (!match) {
    console.error('❌ Could not locate fundsRaisedUsd in campaignState.js');
    process.exit(1);
  }

  const current = parseFloat(match[1]);
  const newTotal = Math.round((current + amount) * 100) / 100;
  const updated = content.replace(
    /fundsRaisedUsd:\s*[\d.]+/,
    `fundsRaisedUsd: ${newTotal}`
  );

  return { updated, prevTotal: current, newTotal };
}

function updateWeeklyDonations(data) {
  if (!data.week) return null;
  const content = fs.readFileSync(DONATIONS_PATH, 'utf8');

  // Match the specific week object: { ... week: N, ... }
  const weekRegex = new RegExp(`(\\{[^{}]*week:\\s*${data.week},[^{}]*\\})`, 's');
  const match = content.match(weekRegex);

  if (!match) {
    console.warn(`⚠️ Week ${data.week} not found in weeklyDonations.js`);
    return null;
  }

  let entry = match[1];

  // Increment amountUsd
  entry = entry.replace(/amountUsd:\s*([\d.]+)/, (_, n) => {
    const val = Math.round((parseFloat(n) + data.amount) * 100) / 100;
    return `amountUsd: ${val}`;
  });

  // Increment publicDonationsUsd
  entry = entry.replace(/publicDonationsUsd:\s*([\d.]+)/, (_, n) => {
    const val = Math.round((parseFloat(n) + data.amount) * 100) / 100;
    return `publicDonationsUsd: ${val}`;
  });

  // Activate if upcoming
  entry = entry.replace(/status:\s*'upcoming'/, "status: 'active'");

  // Update note if provided
  if (data.note) {
    if (/note:\s*null/.test(entry)) {
      entry = entry.replace(/note:\s*null/, `note: ${JSON.stringify(data.note)}`);
    } else if (/note:\s*'([^']*)'/.test(entry)) {
      entry = entry.replace(/note:\s*'([^']*)'/, (_, prev) => `note: '${prev}; ${data.note}'`);
    }
  }

  return content.replace(weekRegex, entry);
}

async function main() {
  console.log('\n💰 GetLoud — Record Funds');
  console.log('==========================');
  if (isDryRun) console.log('🔍 DRY RUN — no files will be written\n');

  const data = await collectData();

  console.log('\n✅ Recording:');
  console.log(`   Amount:  \$${data.amount.toFixed(2)} USD`);
  if (data.week) console.log(`   Week:    Week ${data.week}`);
  if (data.note) console.log(`   Note:    ${data.note}`);

  const stateResult = updateCampaignState(data.amount);
  console.log(`\n📊 Campaign State Total: \$${stateResult.prevTotal} ➔ \$${stateResult.newTotal} USD`);

  const donationsUpdated = updateWeeklyDonations(data);
  if (donationsUpdated) {
    console.log(`📊 Week ${data.week} row updated in weeklyDonations.js`);
  }

  if (isDryRun) {
    console.log('\n📝 Dry run complete. Rerun without --dry-run to apply changes.');
    return;
  }

  // Write campaign state
  fs.writeFileSync(CAMPAIGN_STATE_PATH, stateResult.updated, 'utf8');
  if (!validateJsSyntax(CAMPAIGN_STATE_PATH)) {
    console.error('❌ Failed syntax check on campaignState.js');
    process.exit(1);
  }

  // Write weekly donations if week was updated
  if (donationsUpdated) {
    fs.writeFileSync(DONATIONS_PATH, donationsUpdated, 'utf8');
    if (!validateJsSyntax(DONATIONS_PATH)) {
      console.error('❌ Failed syntax check on weeklyDonations.js');
      process.exit(1);
    }
  }

  console.log('✅ Data files updated and syntax-verified.');

  // Optional Build verification
  if (shouldBuild(args)) {
    const ok = runBuild();
    if (!ok) {
      console.error('❌ Build failed after updating funds.');
      process.exit(1);
    }
  } else {
    console.log('⏭️  Build skipped (--no-build)');
  }

  // Optional Git commit
  if (shouldCommit(args)) {
    const msg = data.week
      ? `feat: record \$${data.amount} funds — Week ${data.week}${data.note ? ` (${data.note})` : ''}`
      : `feat: record \$${data.amount} funds${data.note ? ` (${data.note})` : ''}`;
    gitCommitAndLog(msg);
  } else {
    console.log('⏭️  Git commit skipped (--no-commit)');
  }

  console.log('\n🎉 Funds successfully updated!');
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});

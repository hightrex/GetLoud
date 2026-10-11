#!/usr/bin/env node
/**
 * GetLoud — Update Fundraising Total
 * =====================================
 * Run this whenever you receive a new donation or want to log a manual
 * contribution. Updates campaignState.js and weeklyDonations.js.
 *
 * Usage:
 *   node scripts/update_funds.js [flags]
 *
 *   --amount      50             (USD received)
 *   --week        2              (which week's tally to update, blank = global only)
 *   --note        "GoFundMe"     (optional source note)
 *   --dry-run
 *
 * Examples:
 *   node scripts/update_funds.js --amount 150 --note "GoFundMe batch"
 *   node scripts/update_funds.js --amount 20 --week 2 --note "Collaborator registration"
 */

import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT, getFlag, hasFlag, ask, runBuild, gitCommitAndLog } from './_utils.js';

const CAMPAIGN_STATE_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'campaignState.js');
const DONATIONS_PATH      = path.join(PROJECT_ROOT, 'src', 'data', 'weeklyDonations.js');

const args     = process.argv.slice(2);
const isDryRun = hasFlag(args, '--dry-run');

async function collectData() {
  let amountRaw = getFlag(args, '--amount');
  let weekRaw   = getFlag(args, '--week', '');
  let note      = getFlag(args, '--note', '');

  console.log('\n📋 Donation details\n');

  if (!amountRaw) amountRaw = await ask('Amount received (USD)');
  if (!weekRaw)   weekRaw   = await ask('Week to credit (blank = global only)', '');
  if (!note)      note      = await ask('Source / note (optional)', '');

  const amount = parseFloat(amountRaw);
  const week   = weekRaw ? parseInt(weekRaw, 10) : null;

  if (isNaN(amount) || amount <= 0) {
    console.error(`❌  Invalid amount: "${amountRaw}"`); process.exit(1);
  }

  return { amount, week, note };
}

function updateCampaignState(amount) {
  let content = fs.readFileSync(CAMPAIGN_STATE_PATH, 'utf8');
  content = content.replace(
    /fundsRaisedUsd:\s*([\d.]+)/,
    (_, n) => `fundsRaisedUsd: ${(parseFloat(n) + amount).toFixed(2)}`
  );
  return content;
}

function updateWeeklyDonations(data) {
  if (!data.week) return null;
  let content = fs.readFileSync(DONATIONS_PATH, 'utf8');

  const weekRegex = new RegExp(`(\\{[^}]*week:\\s*${data.week},[^}]*\\})`, 's');
  const match     = content.match(weekRegex);

  if (match) {
    let entry = match[1];
    entry = entry.replace(
      /publicDonationsUsd:\s*([\d.]+)/,
      (_, n) => `publicDonationsUsd: ${(parseFloat(n) + data.amount).toFixed(2)}`
    );
    entry = entry.replace(
      /amountUsd:\s*([\d.]+)/,
      (_, n) => `amountUsd: ${(parseFloat(n) + data.amount).toFixed(2)}`
    );
    if (data.note) {
      entry = entry.replace(/note:\s*null/, `note: ${JSON.stringify(data.note)}`);
    }
    content = content.replace(weekRegex, entry);
    console.log(`✏️  Week ${data.week} updated in weeklyDonations.js`);
  } else {
    console.warn(`⚠️  Week ${data.week} not found in weeklyDonations.js — only campaignState updated`);
  }

  return content;
}

async function main() {
  console.log('\n💰 GetLoud — Update Funds');
  console.log('==========================');
  if (isDryRun) console.log('🔍 DRY RUN\n');

  const data = await collectData();

  console.log('\n✅ Recording:');
  console.log(`   Amount:  \$${data.amount.toFixed(2)} USD`);
  if (data.week) console.log(`   Week:    ${data.week}`);
  if (data.note) console.log(`   Note:    ${data.note}`);

  const newState  = updateCampaignState(data.amount);
  const newDonations = updateWeeklyDonations(data);

  if (isDryRun) { console.log('\n📝 Dry run — no files written.'); return; }

  fs.writeFileSync(CAMPAIGN_STATE_PATH, newState, 'utf8');
  if (newDonations) fs.writeFileSync(DONATIONS_PATH, newDonations, 'utf8');
  console.log('\n📄 Files updated');

  const ok = runBuild();
  if (!ok) { process.exit(1); }

  const msg = data.week
    ? `feat: record \$${data.amount} donation — Week ${data.week}${data.note ? ` (${data.note})` : ''}`
    : `feat: record \$${data.amount} donation${data.note ? ` (${data.note})` : ''}`;
  gitCommitAndLog(msg);

  console.log('\n🎉 Funds updated and committed!');
}

main().catch(err => { console.error('❌  Unexpected error:', err); process.exit(1); });

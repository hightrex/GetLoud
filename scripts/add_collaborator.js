#!/usr/bin/env node
/**
 * GetLoud — Add Collaborator Confirmation
 * =========================================
 * Run this when a collaborator is confirmed for a specific week.
 * Updates collaborators.js slot (and the matching guest in podcasts.js).
 * Does NOT record donation money unless --record-fee is explicitly passed.
 *
 * Usage:
 *   node scripts/add_collaborator.js [flags]
 *
 * Flags:
 *   --name        "Sarah Jenkins"          (guest name, required)
 *   --week        2                        (week number 1–14, required)
 *   --discipline  "Guitarist"              (creative / athletic discipline, required)
 *   --location    "Fremantle, WA"          (optional Perth location)
 *   --email       "sarah@example.com"      (optional contact email)
 *   --record-fee                           (optional: also log $20 fee via funds tracking)
 *   --dry-run                              (preview only, no files written)
 *   --no-build                             (skip npm run build verification)
 *   --no-commit                            (skip git commit)
 *
 * Examples:
 *   node scripts/add_collaborator.js --name "Sarah Jenkins" --week 2 --discipline "Acoustic Guitarist"
 *   node scripts/add_collaborator.js --name "Mark Davis" --week 4 --discipline "Trail Runner" --record-fee
 */

import fs from 'fs';
import path from 'path';
import {
  PROJECT_ROOT,
  getFlag,
  hasFlag,
  ask,
  jsStr,
  runBuild,
  gitCommitAndLog,
  shouldBuild,
  shouldCommit,
  validateJsSyntax,
} from './_utils.js';

const COLLABORATORS_PATH   = path.join(PROJECT_ROOT, 'src', 'data', 'collaborators.js');
const PODCASTS_PATH        = path.join(PROJECT_ROOT, 'src', 'data', 'podcasts.js');
const CAMPAIGN_STATE_PATH  = path.join(PROJECT_ROOT, 'src', 'data', 'campaignState.js');
const DONATIONS_PATH       = path.join(PROJECT_ROOT, 'src', 'data', 'weeklyDonations.js');

const args      = process.argv.slice(2);
const isDryRun  = hasFlag(args, '--dry-run');
const recordFee = hasFlag(args, '--record-fee');

function disciplineToIcon(discipline) {
  const d = (discipline || '').toLowerCase();
  if (/guitar|bass|music|band|singer|songwriter|vocalist|choir/.test(d)) return 'guitar';
  if (/drum|percuss/.test(d))                                             return 'drum';
  if (/dance|danc/.test(d))                                               return 'dance';
  if (/run|fitness|gym|sport|yoga|karate|martial|athlete/.test(d))        return 'runner';
  if (/photo|film|video|cinema|camera/.test(d))                           return 'camera';
  if (/art|paint|design|illustrat|graphic/.test(d))                       return 'art';
  if (/podcast|radio|host|broadcast|media/.test(d))                       return 'mic';
  if (/tech|it|software|engineer|developer|code|program/.test(d))        return 'code';
  return 'star';
}

function weekToDays(week) {
  if (week === 14) return 'Days 92–100';
  const start = (week - 1) * 7 + 1;
  const end   = week * 7;
  return `Days ${start}–${end}`;
}

async function collectData() {
  let name       = getFlag(args, '--name');
  let weekRaw    = getFlag(args, '--week');
  let discipline = getFlag(args, '--discipline');
  let location   = getFlag(args, '--location', 'Perth, WA');
  let email      = getFlag(args, '--email');

  const isInteractive = !name || !weekRaw || !discipline;
  if (isInteractive) {
    console.log('\n📋 Collaborator Details\n');
    if (!name)       name       = await ask('Collaborator Name');
    if (!weekRaw)    weekRaw    = await ask('Week number (1–14)');
    if (!discipline) discipline = await ask('Creative Discipline / Role (e.g. "Acoustic Guitarist")');
    if (!hasFlag(args, '--location')) location = await ask('Perth Location / Suburb', location);
  }

  const week = parseInt(weekRaw, 10);
  if (isNaN(week) || week < 1 || week > 14) {
    console.error(`❌ Invalid week: "${weekRaw}". Must be 1–14.`);
    process.exit(1);
  }

  return { name, week, discipline, location, email: email || null };
}

function updateCollaboratorSlot(data) {
  const content = fs.readFileSync(COLLABORATORS_PATH, 'utf8');
  const weekRegex = new RegExp(`(\\{[^{}]*week:\\s*${data.week},[^{}]*\\})`, 's');
  const match = content.match(weekRegex);

  if (!match) {
    console.error(`❌ Could not find Week ${data.week} slot in collaborators.js`);
    process.exit(1);
  }

  const icon = disciplineToIcon(data.discipline);
  const days = weekToDays(data.week);
  const title = `Episode ${data.week}: ${data.discipline} Meets Mental Health`;
  const description = `${data.name} joins Karsang for a 5km run and unscripted mental health conversation.`;
  const quote = `Running for mental health awareness with Karsang — proud to be part of GetLoud Perth.`;

  const updatedSlot = `  {
    id: ${data.week},
    week: ${data.week},
    days: "${days}",
    status: "Confirmed",
    isConfirmed: true,
    name: ${jsStr(data.name)},
    category: "Music",
    discipline: ${jsStr(data.discipline)},
    disciplineIcon: ${jsStr(icon)},
    perthLocation: ${jsStr(data.location)},
    badge: "Week ${data.week} Confirmed",
    title: ${jsStr(title)},
    description: ${jsStr(description)},
    duration: "25–30 Min Podcast",
    quote: ${jsStr(quote)},
    avatar: "",
    audioUrl: null,
  }`;

  return content.replace(weekRegex, updatedSlot.trim());
}

function updatePodcastGuest(data) {
  const content = fs.readFileSync(PODCASTS_PATH, 'utf8');
  const epId = `ep-${data.week}`;
  const epRegex = new RegExp(`(\\{[^{}]*id:\\s*'${epId}'[^{}]*\\})`, 's');
  const match = content.match(epRegex);

  if (!match) {
    console.warn(`⚠️ Episode ${epId} not found in podcasts.js — skipping podcast guest update`);
    return null;
  }

  let entry = match[1];
  entry = entry.replace(/guest:\s*'[^']*'/, `guest: ${jsStr(data.name)}`);
  entry = entry.replace(/discipline:\s*'[^']*'/, `discipline: ${jsStr(data.discipline)}`);

  return content.replace(epRegex, entry);
}

function recordFeeInAccounting(week) {
  // 1. Campaign state +20
  const stateContent = fs.readFileSync(CAMPAIGN_STATE_PATH, 'utf8');
  const updatedState = stateContent.replace(/fundsRaisedUsd:\s*([\d.]+)/, (_, n) => {
    return `fundsRaisedUsd: ${parseFloat(n) + 20}`;
  });

  // 2. Weekly donations +20
  const donContent = fs.readFileSync(DONATIONS_PATH, 'utf8');
  const weekRegex = new RegExp(`(\\{[^{}]*week:\\s*${week},[^{}]*\\})`, 's');
  const match = donContent.match(weekRegex);

  let updatedDonations = donContent;
  if (match) {
    let entry = match[1];
    entry = entry.replace(/collaboratorCount:\s*(\d+)/, (_, n) => `collaboratorCount: ${parseInt(n, 10) + 1}`);
    entry = entry.replace(/amountUsd:\s*([\d.]+)/, (_, n) => `amountUsd: ${parseFloat(n) + 20}`);
    entry = entry.replace(/status:\s*'upcoming'/, "status: 'active'");
    updatedDonations = donContent.replace(weekRegex, entry);
  }

  return { updatedState, updatedDonations };
}

async function main() {
  console.log('\n🤝 GetLoud — Confirm Collaborator');
  console.log('=================================');
  if (isDryRun) console.log('🔍 DRY RUN — no files will be written\n');

  const data = await collectData();

  console.log('\n✅ Confirmation details:');
  console.log(`   Name:       ${data.name}`);
  console.log(`   Week:       Week ${data.week} (${weekToDays(data.week)})`);
  console.log(`   Discipline: ${data.discipline}`);
  console.log(`   Location:   ${data.location}`);
  if (recordFee) console.log(`   Fee:        $20 fee will be logged (--record-fee)`);

  const updatedCollabs  = updateCollaboratorSlot(data);
  const updatedPodcasts = updatePodcastGuest(data);

  let accounting = null;
  if (recordFee) {
    accounting = recordFeeInAccounting(data.week);
  }

  if (isDryRun) {
    console.log('\n📝 Dry run complete. Rerun without --dry-run to apply changes.');
    return;
  }

  // Write collaborators
  fs.writeFileSync(COLLABORATORS_PATH, updatedCollabs, 'utf8');
  validateJsSyntax(COLLABORATORS_PATH);

  // Write podcasts
  if (updatedPodcasts) {
    fs.writeFileSync(PODCASTS_PATH, updatedPodcasts, 'utf8');
    validateJsSyntax(PODCASTS_PATH);
  }

  // Write fee if requested
  if (accounting) {
    fs.writeFileSync(CAMPAIGN_STATE_PATH, accounting.updatedState, 'utf8');
    fs.writeFileSync(DONATIONS_PATH, accounting.updatedDonations, 'utf8');
    validateJsSyntax(CAMPAIGN_STATE_PATH);
    validateJsSyntax(DONATIONS_PATH);
    console.log('💰 $20 fee logged to campaign totals.');
  }

  console.log('✅ Data files updated and syntax-verified.');

  // Optional Build verification
  if (shouldBuild(args)) {
    const ok = runBuild();
    if (!ok) {
      console.error('❌ Build failed after adding collaborator.');
      process.exit(1);
    }
  } else {
    console.log('⏭️  Build skipped (--no-build)');
  }

  // Optional Git commit
  if (shouldCommit(args)) {
    gitCommitAndLog(`feat: confirm collaborator ${data.name} for Week ${data.week}`);
  } else {
    console.log('⏭️  Git commit skipped (--no-commit)');
  }

  console.log(`\n🎉 Week ${data.week} is confirmed for ${data.name}!`);
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});

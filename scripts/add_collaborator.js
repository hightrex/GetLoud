#!/usr/bin/env node
/**
 * GetLoud — Add Collaborator Registration
 * =========================================
 * Run this when you receive a collaborator registration email from FormSubmit.
 * It updates collaborators.js, weeklyDonations.js, and podcasts.js in one shot.
 *
 * Usage:
 *   node scripts/add_collaborator.js [flags]
 *
 * All flags are optional — you'll be prompted interactively for anything missing.
 *
 *   --name        "Ishan Thapa"
 *   --email       "ishanthapa577@gmail.com"
 *   --week        2                         (week number, 1–14)
 *   --discipline  "IT Professional"         (their creative/professional discipline)
 *   --amount      20                        (USD paid, default 20)
 *   --payment     "Credit Card / Stripe"    (payment method)
 *   --location    "Perth CBD, WA"           (their Perth suburb/area)
 *   --dry-run                               (preview only)
 *
 * What it does:
 *   1. Updates the collaborator slot in src/data/collaborators.js
 *      → marks it Confirmed, fills in name/discipline/description
 *   2. Updates the matching week in src/data/weeklyDonations.js
 *      → increments collaboratorCount, adds amountUsd
 *   3. Updates the matching episode in src/data/podcasts.js
 *      → fills in guest name + discipline
 *   4. Builds and git-commits
 *
 * Examples:
 *   node scripts/add_collaborator.js
 *   node scripts/add_collaborator.js --name "Ishan Thapa" --week 2 --discipline "IT Professional" --dry-run
 */

import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT, getFlag, hasFlag, ask, jsStr, runBuild, gitCommitAndLog } from './_utils.js';

const COLLABORATORS_PATH   = path.join(PROJECT_ROOT, 'src', 'data', 'collaborators.js');
const DONATIONS_PATH       = path.join(PROJECT_ROOT, 'src', 'data', 'weeklyDonations.js');
const PODCASTS_PATH        = path.join(PROJECT_ROOT, 'src', 'data', 'podcasts.js');

// ─── Argument Parsing ─────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const isDryRun  = hasFlag(args, '--dry-run');

// ─── Discipline → icon mapping ────────────────────────────────────────────────

function disciplineToIcon(discipline) {
  const d = discipline.toLowerCase();
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

// ─── Week number → day range ───────────────────────────────────────────────────

function weekToDays(week) {
  const start = (week - 1) * 7 + 1;
  const end   = week * 7;
  return `Days ${start}–${end}`;
}

// ─── Week number → week label (from donations data) ───────────────────────────

const WEEK_LABELS = {
  1:  'Launch Week',
  2:  'Week 2',
  3:  'Week 3',
  4:  'Week 4',
  5:  'Week 5',
  6:  'Week 6',
  7:  'Week 7',
  8:  '50-Day Midpoint',
  9:  'Week 9',
  10: 'Week 10',
  11: 'Week 11',
  12: 'Week 12',
  13: 'Week 13',
  14: 'Grand Finale Week',
};

// ─── Collect collaborator data interactively ───────────────────────────────────

async function collectData() {
  let name       = getFlag(args, '--name');
  let email      = getFlag(args, '--email');
  let weekRaw    = getFlag(args, '--week');
  let discipline = getFlag(args, '--discipline');
  let amountRaw  = getFlag(args, '--amount', '20');
  let payment    = getFlag(args, '--payment', 'Credit Card / Stripe');
  let location   = getFlag(args, '--location', 'Perth, WA');

  console.log('\n📋 Enter collaborator registration details (from the email)\n');

  if (!name)       name       = await ask('Collaborator Name');
  if (!email)      email      = await ask('Email Address');
  if (!weekRaw)    weekRaw    = await ask('Week number (1–14)');
  if (!discipline) discipline = await ask('Creative Discipline / Role (e.g. "IT Professional")');
  if (!location)   location   = await ask('Perth location / suburb', 'Perth, WA');

  const week   = parseInt(weekRaw, 10);
  const amount = parseFloat(amountRaw);

  if (isNaN(week) || week < 1 || week > 14) {
    console.error(`❌  Invalid week number: "${weekRaw}". Must be 1–14.`);
    process.exit(1);
  }

  return { name, email, week, discipline, amount, payment, location };
}

// ─── Update collaborators.js ───────────────────────────────────────────────────

function updateCollaborators(data) {
  let content = fs.readFileSync(COLLABORATORS_PATH, 'utf8');

  // Find the existing slot for this week (by "week: N,")
  const weekRegex = new RegExp(`\\{[^}]*week:\\s*${data.week},[^}]*\\}`, 's');
  const match     = content.match(weekRegex);

  const icon        = disciplineToIcon(data.discipline);
  const days        = weekToDays(data.week);
  const shortName   = data.name.split(' ')[0];
  const description = `${data.name} joins Karsang for a 5km run and unscripted mental health conversation.`;
  const title       = `Episode ${data.week}: ${data.discipline} Meets Mental Health`;
  const quote       = `Running for mental health awareness with Karsang — proud to be part of GetLoud Perth.`;

  const newEntry = `  {
    id: ${data.week},
    week: ${data.week},
    days: "${days}",
    status: "Confirmed",
    isConfirmed: true,
    name: ${jsStr(data.name)},
    email: ${jsStr(data.email)},
    discipline: ${jsStr(data.discipline)},
    disciplineIcon: ${jsStr(icon)},
    perthLocation: ${jsStr(data.location)},
    badge: "Week ${data.week} Confirmed",
    title: ${jsStr(title)},
    description: ${jsStr(description)},
    duration: "25-30 Min Podcast",
    quote: ${jsStr(quote)},
    avatar: "",
    audioUrl: null,
  }`;

  if (match) {
    // Replace existing slot
    content = content.replace(weekRegex, newEntry);
    console.log(`✏️  Replaced existing Week ${data.week} slot in collaborators.js`);
  } else {
    // Append new entry before closing ];
    const closeIdx = content.lastIndexOf('];');
    if (closeIdx === -1) { console.error('❌  Cannot find end of collaboratorsData array.'); process.exit(1); }
    content = content.slice(0, closeIdx) + newEntry + ',\n' + content.slice(closeIdx);
    console.log(`➕  Added new Week ${data.week} entry in collaborators.js`);
  }

  return content;
}

// ─── Update weeklyDonations.js ─────────────────────────────────────────────────

function updateDonations(data) {
  let content = fs.readFileSync(DONATIONS_PATH, 'utf8');

  // Look for an existing week entry
  const weekRegex = new RegExp(`\\{[^}]*week:\\s*${data.week},[^}]*\\}`, 's');
  const match     = content.match(weekRegex);

  if (match) {
    // Patch: increment collaboratorCount and amountUsd
    let entry = match[0];

    entry = entry.replace(
      /collaboratorCount:\s*(\d+)/,
      (_, n) => `collaboratorCount: ${parseInt(n, 10) + 1}`
    );
    entry = entry.replace(
      /amountUsd:\s*([\d.]+)/,
      (_, n) => `amountUsd: ${(parseFloat(n) + data.amount).toFixed(2)}`
    );
    // Mark active if still upcoming
    entry = entry.replace(/status:\s*'upcoming'/, "status: 'active'");

    content = content.replace(weekRegex, entry);
    console.log(`✏️  Updated Week ${data.week} in weeklyDonations.js (+\$${data.amount})`);
  } else {
    // Create a new week entry
    const label     = WEEK_LABELS[data.week] || `Week ${data.week}`;
    const days      = weekToDays(data.week);
    const newWeek   = `  {
    week: ${data.week},
    days: '${days}',
    label: '${label}',
    amountUsd: ${data.amount.toFixed(2)},
    collaboratorCount: 1,
    publicDonationsUsd: 0,
    status: 'active',
    note: null,
  }`;
    const closeIdx  = content.lastIndexOf('];');
    if (closeIdx === -1) { console.error('❌  Cannot find end of weeklyDonations array.'); process.exit(1); }
    content = content.slice(0, closeIdx) + newWeek + ',\n' + content.slice(closeIdx);
    console.log(`➕  Added Week ${data.week} entry in weeklyDonations.js`);
  }

  return content;
}

// ─── Update podcasts.js ────────────────────────────────────────────────────────

function updatePodcasts(data) {
  let content = fs.readFileSync(PODCASTS_PATH, 'utf8');

  // Look for an existing ep-N entry
  const epId    = `ep-${data.week}`;
  const epRegex = new RegExp(`\\{[^}]*id:\\s*'${epId}'[^}]*\\}`, 's');
  const match   = content.match(epRegex);

  if (match) {
    let entry = match[0];
    entry = entry.replace(/guest:\s*'[^']*'/, `guest: ${jsStr(data.name)}`);
    entry = entry.replace(/discipline:\s*'[^']*'/, `discipline: ${jsStr(data.discipline)}`);
    content = content.replace(epRegex, entry);
    console.log(`✏️  Updated Episode ${data.week} guest in podcasts.js`);
  } else {
    console.log(`⚠️  No podcast episode found for Week ${data.week} — skipping podcasts.js`);
  }

  return content;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎙️  GetLoud — Add Collaborator Registration');
  console.log('============================================');
  if (isDryRun) console.log('🔍 DRY RUN — no files will be written\n');

  const data = await collectData();

  console.log('\n✅ Registration summary:');
  console.log(`   Name:       ${data.name}`);
  console.log(`   Email:      ${data.email}`);
  console.log(`   Week:       ${data.week} (${weekToDays(data.week)})`);
  console.log(`   Discipline: ${data.discipline}`);
  console.log(`   Amount:     \$${data.amount} USD via ${data.payment}`);
  console.log(`   Location:   ${data.location}`);

  const newCollabContent = updateCollaborators(data);
  const newDonationContent = updateDonations(data);
  const newPodcastContent  = updatePodcasts(data);

  if (isDryRun) {
    console.log('\n📝 Dry run complete — no files written. Run without --dry-run to apply.');
    return;
  }

  fs.writeFileSync(COLLABORATORS_PATH, newCollabContent, 'utf8');
  fs.writeFileSync(DONATIONS_PATH,     newDonationContent, 'utf8');
  fs.writeFileSync(PODCASTS_PATH,      newPodcastContent,  'utf8');
  console.log('\n📄 Files updated');

  const ok = runBuild();
  if (!ok) { console.error('    Fix the build error, then re-run or patch manually.'); process.exit(1); }

  gitCommitAndLog(`feat: add collaborator ${data.name} — Week ${data.week} (\$${data.amount})`);

  console.log(`\n🎉 ${data.name} is confirmed for Week ${data.week}! Deploy or run \`npm run dev\` to preview.`);
}

main().catch(err => { console.error('❌  Unexpected error:', err); process.exit(1); });

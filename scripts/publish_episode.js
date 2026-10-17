#!/usr/bin/env node
/**
 * GetLoud — Publish Podcast Episode
 * ===================================
 * Run this when a podcast episode has been recorded and is ready to publish.
 * Updates podcasts.js (status → available, audioUrl, spotifyUrl, etc.)
 * and marks the matching collaborator card in collaborators.js as "Completed".
 *
 * Usage:
 *   node scripts/publish_episode.js [flags]
 *
 * Flags:
 *   --week        2                                 (week / episode number 1–14, or 0 for preview)
 *   --audio-url   "https://..."                     (direct MP3 / stream URL)
 *   --spotify     "https://open.spotify.com/..."    (optional)
 *   --apple       "https://podcasts.apple.com/..."  (optional)
 *   --youtube     "https://youtube.com/..."         (optional)
 *   --duration    "28 min"                          (e.g. "28 min")
 *   --date        "2026-10-14"                      (publish date)
 *   --dry-run                                       (preview only, no files modified)
 *   --no-build                                      (skip build verification)
 *   --no-commit                                     (skip git commit)
 *
 * Examples:
 *   node scripts/publish_episode.js --week 1 --audio-url "https://..." --duration "26 min"
 *   node scripts/publish_episode.js --week 2 --audio-url "https://..." --dry-run
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

const PODCASTS_PATH      = path.join(PROJECT_ROOT, 'src', 'data', 'podcasts.js');
const COLLABORATORS_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'collaborators.js');

const args     = process.argv.slice(2);
const isDryRun = hasFlag(args, '--dry-run');

async function collectData() {
  let weekRaw   = getFlag(args, '--week');
  let audioUrl  = getFlag(args, '--audio-url');
  let spotify   = getFlag(args, '--spotify',  '');
  let apple     = getFlag(args, '--apple',    '');
  let youtube   = getFlag(args, '--youtube',  '');
  let duration  = getFlag(args, '--duration', '');
  let pubDate   = getFlag(args, '--date',     '');

  if (!weekRaw) {
    console.log('\n📋 Episode publish details\n');
    weekRaw = await ask('Episode / Week number (0 for preview, 1–14 for episodes)');
  }

  const week = parseInt(weekRaw, 10);
  if (isNaN(week) || week < 0 || week > 14) {
    console.error(`❌ Invalid week: "${weekRaw}". Must be between 0 and 14.`);
    process.exit(1);
  }

  if (!audioUrl && !hasFlag(args, '--week')) {
    audioUrl = await ask('Audio URL (MP3 or stream, blank to skip)', '');
  }
  if (!duration && !hasFlag(args, '--week')) {
    duration = await ask('Duration (e.g. "28 min")', '25–30 min');
  }
  if (!pubDate && !hasFlag(args, '--week')) {
    pubDate = await ask('Publish date (YYYY-MM-DD, blank = today)', new Date().toISOString().slice(0, 10));
  }

  return {
    week,
    audioUrl: audioUrl || null,
    spotify: spotify || null,
    apple: apple || null,
    youtube: youtube || null,
    duration: duration || '25–30 min',
    pubDate: pubDate || new Date().toISOString().slice(0, 10),
  };
}

function updatePodcasts(data) {
  const content = fs.readFileSync(PODCASTS_PATH, 'utf8');

  const epId    = data.week === 0 ? 'ep-preview' : `ep-${data.week}`;
  const epRegex = new RegExp(`(\\{[^{}]*id:\\s*'${epId}'[^{}]*\\})`, 's');
  const match   = content.match(epRegex);

  if (!match) {
    console.error(`❌ Episode "${epId}" not found in podcasts.js.`);
    process.exit(1);
  }

  let entry = match[1];
  entry = entry.replace(/status:\s*'upcoming'/, "status: 'available'");
  if (data.audioUrl) entry = entry.replace(/audioUrl:\s*(null|'[^']*')/, `audioUrl: ${jsStr(data.audioUrl)}`);
  if (data.spotify)  entry = entry.replace(/spotifyUrl:\s*(null|'[^']*')/, `spotifyUrl: ${jsStr(data.spotify)}`);
  if (data.apple)    entry = entry.replace(/appleUrl:\s*(null|'[^']*')/, `appleUrl: ${jsStr(data.apple)}`);
  if (data.youtube)  entry = entry.replace(/youtubeUrl:\s*(null|'[^']*')/, `youtubeUrl: ${jsStr(data.youtube)}`);
  if (data.duration) entry = entry.replace(/duration:\s*'[^']*'/, `duration: ${jsStr(data.duration)}`);
  if (data.pubDate)  entry = entry.replace(/publishedDate:\s*(null|'[^']*')/, `publishedDate: ${jsStr(data.pubDate)}`);

  return content.replace(epRegex, entry);
}

function updateCollaboratorStatus(week) {
  const content = fs.readFileSync(COLLABORATORS_PATH, 'utf8');
  const weekRegex = new RegExp(`(\\{[^{}]*week:\\s*${week},[^{}]*\\})`, 's');
  const match = content.match(weekRegex);

  if (match) {
    let entry = match[1];
    entry = entry.replace(/status:\s*"Confirmed"/, 'status: "Completed"');
    return content.replace(weekRegex, entry);
  }
  return null;
}

async function main() {
  console.log('\n🎙️ GetLoud — Publish Episode');
  console.log('==============================');
  if (isDryRun) console.log('🔍 DRY RUN — no files will be written\n');

  const data = await collectData();

  console.log('\n✅ Publishing:');
  console.log(`   Episode:  ${data.week === 0 ? 'Preview' : `Episode ${data.week}`}`);
  console.log(`   Audio:    ${data.audioUrl || '(none)'}`);
  console.log(`   Duration: ${data.duration}`);
  console.log(`   Date:     ${data.pubDate}`);

  const newPodcast = updatePodcasts(data);
  const newCollab  = data.week > 0 ? updateCollaboratorStatus(data.week) : null;

  if (isDryRun) {
    console.log('\n📝 Dry run complete — no files written. Rerun without --dry-run to apply.');
    return;
  }

  fs.writeFileSync(PODCASTS_PATH, newPodcast, 'utf8');
  validateJsSyntax(PODCASTS_PATH);

  if (newCollab) {
    fs.writeFileSync(COLLABORATORS_PATH, newCollab, 'utf8');
    validateJsSyntax(COLLABORATORS_PATH);
    console.log(`✏️  Marked Week ${data.week} collaborator status as Completed.`);
  }

  console.log('\n📄 Files updated and verified.');

  // Optional build
  if (shouldBuild(args)) {
    const ok = runBuild();
    if (!ok) {
      console.error('❌ Build failed after publishing episode.');
      process.exit(1);
    }
  } else {
    console.log('⏭️  Build skipped (--no-build)');
  }

  // Optional commit
  const epLabel = data.week === 0 ? 'Preview' : `Episode ${data.week}`;
  if (shouldCommit(args)) {
    gitCommitAndLog(`feat: publish ${epLabel} podcast`);
  } else {
    console.log('⏭️  Git commit skipped (--no-commit)');
  }

  console.log(`\n🎉 ${epLabel} is live!`);
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});

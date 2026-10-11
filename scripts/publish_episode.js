#!/usr/bin/env node
/**
 * GetLoud — Publish Podcast Episode
 * ===================================
 * Run this when a podcast episode has been recorded and is ready to publish.
 * Updates podcasts.js (status → available, audioUrl, spotifyUrl, etc.)
 * and the matching collaborator card in collaborators.js.
 *
 * Usage:
 *   node scripts/publish_episode.js [flags]
 *
 *   --week        2                                 (week / episode number)
 *   --audio-url   "https://..."                     (direct MP3 / stream URL)
 *   --spotify     "https://open.spotify.com/..."    (optional)
 *   --apple       "https://podcasts.apple.com/..."  (optional)
 *   --youtube     "https://youtube.com/..."         (optional)
 *   --duration    "28 min"                          (e.g. "28 min")
 *   --date        "2026-10-14"                      (publish date)
 *   --dry-run
 *
 * Examples:
 *   node scripts/publish_episode.js
 *   node scripts/publish_episode.js --week 2 --audio-url "https://..." --duration "28 min"
 */

import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT, getFlag, hasFlag, ask, jsStr, runBuild, gitCommitAndLog } from './_utils.js';

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

  console.log('\n📋 Episode publish details\n');

  if (!weekRaw)  weekRaw  = await ask('Episode / Week number (1–14)');
  if (!audioUrl) audioUrl = await ask('Audio URL (MP3 or stream, blank to skip)', '');
  if (!duration) duration = await ask('Duration (e.g. "28 min")', '25–30 min');
  if (!pubDate)  pubDate  = await ask('Publish date (YYYY-MM-DD, blank = today)', new Date().toISOString().slice(0, 10));

  const week = parseInt(weekRaw, 10);
  if (isNaN(week) || week < 0 || week > 14) {
    console.error(`❌  Invalid week: "${weekRaw}"`); process.exit(1);
  }

  return { week, audioUrl: audioUrl || null, spotify: spotify || null, apple: apple || null, youtube: youtube || null, duration, pubDate };
}

function updatePodcasts(data) {
  let content = fs.readFileSync(PODCASTS_PATH, 'utf8');

  const epId    = data.week === 0 ? 'ep-preview' : `ep-${data.week}`;
  const epRegex = new RegExp(`(\\{[^}]*id:\\s*'${epId}'[^}]*\\})`, 's');
  const match   = content.match(epRegex);

  if (!match) {
    console.error(`❌  Episode "${epId}" not found in podcasts.js.`); process.exit(1);
  }

  let entry = match[1];
  entry = entry.replace(/status:\s*'upcoming'/, "status: 'available'");
  if (data.audioUrl) entry = entry.replace(/audioUrl:\s*null/, `audioUrl: ${jsStr(data.audioUrl)}`);
  if (data.spotify)  entry = entry.replace(/spotifyUrl:\s*null/, `spotifyUrl: ${jsStr(data.spotify)}`);
  if (data.apple)    entry = entry.replace(/appleUrl:\s*null/, `appleUrl: ${jsStr(data.apple)}`);
  if (data.youtube)  entry = entry.replace(/youtubeUrl:\s*null/, `youtubeUrl: ${jsStr(data.youtube)}`);
  if (data.duration) entry = entry.replace(/duration:\s*'[^']*'/, `duration: ${jsStr(data.duration)}`);
  if (data.pubDate)  entry = entry.replace(/publishedDate:\s*null/, `publishedDate: ${jsStr(data.pubDate)}`);

  content = content.replace(epRegex, entry);
  return content;
}

function updateCollaboratorStatus(week) {
  let content = fs.readFileSync(COLLABORATORS_PATH, 'utf8');
  // Mark status as Completed for this week
  const weekRegex = new RegExp(`(\\{[^}]*week:\\s*${week},[^}]*\\})`, 's');
  const match     = content.match(weekRegex);
  if (match) {
    let entry = match[1];
    entry = entry.replace(/status:\s*"Confirmed"/, 'status: "Completed"');
    content = content.replace(weekRegex, entry);
    console.log(`✏️  Marked Week ${week} collaborator as Completed`);
  }
  return content;
}

async function main() {
  console.log('\n🎙️  GetLoud — Publish Episode');
  console.log('==============================');
  if (isDryRun) console.log('🔍 DRY RUN\n');

  const data = await collectData();

  console.log('\n✅ Publishing:');
  console.log(`   Episode:  ${data.week === 0 ? 'Preview' : `Week ${data.week}`}`);
  console.log(`   Audio:    ${data.audioUrl || '(none)'}`);
  console.log(`   Duration: ${data.duration}`);
  console.log(`   Date:     ${data.pubDate}`);

  const newPodcast    = updatePodcasts(data);
  const newCollab     = data.week > 0 ? updateCollaboratorStatus(data.week) : null;

  if (isDryRun) { console.log('\n📝 Dry run — no files written.'); return; }

  fs.writeFileSync(PODCASTS_PATH, newPodcast, 'utf8');
  if (newCollab) fs.writeFileSync(COLLABORATORS_PATH, newCollab, 'utf8');
  console.log('\n📄 Files updated');

  const ok = runBuild();
  if (!ok) { process.exit(1); }

  const epLabel = data.week === 0 ? 'Preview' : `Episode ${data.week}`;
  gitCommitAndLog(`feat: publish ${epLabel} podcast`);

  console.log(`\n🎉 ${epLabel} is live!`);
}

main().catch(err => { console.error('❌  Unexpected error:', err); process.exit(1); });

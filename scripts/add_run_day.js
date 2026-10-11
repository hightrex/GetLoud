#!/usr/bin/env node
/**
 * GetLoud Daily Run Log Automation Script
 * ========================================
 * Usage:
 *   node scripts/add_run_day.js <path-to-day.jpeg> [options]
 *
 * Required flags (prompted interactively if omitted):
 *   --date          YYYY-MM-DD          e.g. 2026-10-07
 *   --date-label    "D Mon"             e.g. "7 Oct"
 *   --full-date     "DayName, D Mon YYYY"
 *   --time          "H:MM am/pm"        e.g. "7:30 pm"
 *   --duration      "MM:SS"             e.g. "29:51"
 *   --distance      6.04                (km, number)
 *   --calories      334                 (integer)
 *   --pace          "MM'SS\""           e.g. "04'56\""
 *   --fastest-pace  "MM'SS\""           (optional, defaults to avg pace)
 *   --steps         4838                (integer, no commas)
 *
 * Optional flags:
 *   --avg-speed     12.1                (computed from distance+duration if omitted)
 *   --cadence       162                 (spm, optional)
 *   --elevation     34                  (meters, optional)
 *   --route-type    "Evening Loop"      (default: "Evening Loop")
 *   --location      "Perth, WA"         (default: "Perth, WA")
 *   --quote         "Custom quote..."   (optional)
 *   --dry-run                           (preview only, no files written)
 *
 * Examples:
 *   node scripts/add_run_day.js ~/Downloads/day7.jpeg
 *   node scripts/add_run_day.js ~/Downloads/day7.jpeg --dry-run
 *   node scripts/add_run_day.js ~/Downloads/day7.jpeg \
 *     --date 2026-10-07 --date-label "7 Oct" --full-date "Wednesday, 7 Oct 2026" \
 *     --time "7:30 pm" --duration "29:51" --distance 6.04 --calories 334 \
 *     --pace "04'56\"" --steps 4838
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PROJECT_ROOT, getFlag, hasFlag, ask, jsStr, runBuild, gitCommitAndLog } from './_utils.js';

const ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'assets');
const RUNNING_LOGS_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'runningLogs.js');

// ─── Argument Parsing ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const imagePath = args.find(a => !a.startsWith('--'));

if (!imagePath) {
  console.error('❌  Usage: node scripts/add_run_day.js <path-to-day.jpeg> [flags...]');
  process.exit(1);
}

const isDryRun = hasFlag(args, '--dry-run');

const absImagePath = path.resolve(imagePath);
if (!fs.existsSync(absImagePath)) {
  console.error(`❌  Image not found: ${absImagePath}`);
  process.exit(1);
}

// ─── Collect data (flags first, then prompt for anything missing) ─────────────

async function collectRunData() {
  const data = {
    date:        getFlag(args, '--date'),
    dateLabel:   getFlag(args, '--date-label'),
    fullDate:    getFlag(args, '--full-date'),
    time:        getFlag(args, '--time'),
    duration:    getFlag(args, '--duration'),
    distanceKm:  getFlag(args, '--distance')  ? parseFloat(getFlag(args, '--distance'))  : null,
    calories:    getFlag(args, '--calories')   ? parseInt(getFlag(args, '--calories'), 10) : null,
    pace:        getFlag(args, '--pace'),
    fastestPace: getFlag(args, '--fastest-pace'),
    steps:       getFlag(args, '--steps')     ? parseInt(getFlag(args, '--steps').replace(/,/g, ''), 10) : null,
    avgSpeedKmh: getFlag(args, '--avg-speed') ? parseFloat(getFlag(args, '--avg-speed')) : null,
    cadenceSpm:  getFlag(args, '--cadence')   ? parseInt(getFlag(args, '--cadence'), 10) : null,
    elevationM:  getFlag(args, '--elevation') ? parseInt(getFlag(args, '--elevation'), 10) : null,
  };

  const routeType = getFlag(args, '--route-type', 'Evening Loop');
  const location  = getFlag(args, '--location',   'Perth, WA');
  const quote     = getFlag(args, '--quote');

  console.log('\n📋 Enter run data (press Enter to accept the default shown in [brackets])\n');

  if (!data.date)       data.date       = await ask('Date (YYYY-MM-DD)');
  if (!data.dateLabel)  data.dateLabel  = await ask('Date label (e.g. "7 Oct")');
  if (!data.fullDate)   data.fullDate   = await ask('Full date (e.g. "Wednesday, 7 Oct 2026")');
  if (!data.time)       data.time       = await ask('Time (e.g. "7:30 pm")');
  if (!data.duration)   data.duration   = await ask('Duration (MM:SS)');
  if (data.distanceKm === null) data.distanceKm = parseFloat(await ask('Distance (km)'));
  if (data.calories   === null) data.calories   = parseInt(await ask('Calories (kcal)'), 10);
  if (!data.pace)       data.pace       = await ask("Average pace (e.g. 05'04\")");
  if (!data.fastestPace) data.fastestPace = await ask('Fastest pace (leave blank = same as avg)', data.pace);
  if (data.steps === null) data.steps   = parseInt((await ask('Steps (0 if unknown)', '0')).replace(/,/g, ''), 10);

  // Optional fields
  if (data.cadenceSpm === null) {
    const cad = await ask('Cadence (spm, blank = skip)', '');
    data.cadenceSpm = cad ? parseInt(cad, 10) : null;
  }
  if (data.elevationM === null) {
    const elev = await ask('Elevation gain (m, blank = skip)', '');
    data.elevationM = elev ? parseInt(elev, 10) : null;
  }

  // Compute avg speed from distance + duration if not provided
  if (data.avgSpeedKmh === null) {
    data.avgSpeedKmh = computeAvgSpeed(data.distanceKm, data.duration);
  }

  // Validate required fields
  const required = ['date', 'dateLabel', 'fullDate', 'time', 'duration', 'distanceKm', 'calories', 'pace', 'steps'];
  for (const key of required) {
    if (data[key] === null || data[key] === undefined || data[key] === '') {
      console.error(`❌  Missing required value: ${key}`);
      process.exit(1);
    }
  }

  return { data, routeType, location, quote };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeToHours(duration) {
  const [mins, secs] = duration.split(':').map(Number);
  return (mins * 60 + (secs || 0)) / 3600;
}

function computeAvgSpeed(distanceKm, duration) {
  return Math.round((distanceKm / timeToHours(duration)) * 10) / 10;
}

function paceToSeconds(pace) {
  const m = pace?.match(/(\d+)'(\d+)/);
  return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
}

function paceDiffLabel(currSec, prevSec) {
  if (currSec === null || prevSec === null) return '—';
  const diff = currSec - prevSec;
  const abs  = Math.abs(diff);
  return `${diff < 0 ? '-' : '+'}${abs}s/km ${diff < 0 ? 'faster' : 'slower'}`;
}

function getCurrentLogs() {
  const content = fs.readFileSync(RUNNING_LOGS_PATH, 'utf8');
  const dayMatches   = [...content.matchAll(/^\s+day:\s*(\d+),/gm)];
  const distMatches  = [...content.matchAll(/distanceKm:\s*([\d.]+)/g)];
  const paceMatches  = [...content.matchAll(/pace:\s*"([^"]+)"/g)];
  const speedMatches = [...content.matchAll(/avgSpeedKmh:\s*([\d.]+)/g)];
  const stepMatches  = [...content.matchAll(/steps:\s*(\d+)/g)];

  return {
    maxDay:    dayMatches.reduce((max, m) => Math.max(max, parseInt(m[1], 10)), 0),
    lastDist:  distMatches.length  ? parseFloat(distMatches[distMatches.length - 1][1])   : null,
    lastPace:  paceMatches.length  ? paceMatches[paceMatches.length - 1][1]               : null,
    lastSpeed: speedMatches.length ? parseFloat(speedMatches[speedMatches.length - 1][1]) : null,
    lastSteps: stepMatches.length  ? parseInt(stepMatches[stepMatches.length - 1][1], 10) : null,
  };
}

function computeGains(data, prev) {
  if (!prev.lastDist) return null;

  const distDelta = (data.distanceKm - prev.lastDist).toFixed(2);
  const paceDiff  = paceDiffLabel(paceToSeconds(data.pace), paceToSeconds(prev.lastPace));
  const speedDelta = prev.lastSpeed !== null
    ? (data.avgSpeedKmh - prev.lastSpeed).toFixed(1)
    : '—';
  const stepsDiff = prev.lastSteps !== null ? data.steps - prev.lastSteps : null;

  return {
    distanceDelta: `${parseFloat(distDelta) >= 0 ? '+' : ''}${distDelta} km`,
    paceDelta:     paceDiff,
    speedDelta:    `${parseFloat(speedDelta) >= 0 ? '+' : ''}${speedDelta} km/h`,
    stepsDelta:    stepsDiff !== null ? `${stepsDiff >= 0 ? '+' : ''}${stepsDiff.toLocaleString()} steps` : '—',
  };
}

// ─── Build the JS entry ───────────────────────────────────────────────────────

function buildLogEntry(dayNum, data, gains, routeType, location, quote, varName) {
  const autoQuote = quote
    || `Day ${dayNum} done. ${data.distanceKm} km at ${data.pace} — keeping the grind alive.`;
  const autoDesc  = `Day ${dayNum} run. ${data.distanceKm} km in ${data.duration} at ${data.pace}/km average pace.`;

  const gainsBlock = gains ? `
    gains: {
      distanceDelta: ${jsStr(gains.distanceDelta)},
      paceDelta:     ${jsStr(gains.paceDelta)},
      speedDelta:    ${jsStr(gains.speedDelta)},
      stepsDelta:    ${jsStr(gains.stepsDelta)},
    },` : '';

  return `  {
    day: ${dayNum},
    date: ${jsStr(data.date)},
    dateLabel: ${jsStr(data.dateLabel)},
    fullDate: ${jsStr(data.fullDate)},
    time: ${jsStr(data.time)},
    distanceKm: ${data.distanceKm},
    duration: ${jsStr(data.duration)},
    pace: ${jsStr(data.pace)},
    avgSpeedKmh: ${data.avgSpeedKmh},
    fastestPace: ${jsStr(data.fastestPace || data.pace)},
    steps: ${data.steps},
    cadenceSpm: ${data.cadenceSpm ?? 'null'},
    avgStrideM: null,
    calories: ${data.calories},
    elevationM: ${data.elevationM ?? 'null'},
    routeType: ${jsStr(routeType)},
    routeLocation: ${jsStr(location)},
    routeDescription: ${jsStr(autoDesc)},
    image: ${varName},
    mapCard: null,
    mapCrop: null,
    routeSvg: null,
    quote: ${jsStr(autoQuote)},
    source: 'Samsung Health',
    verified: true,${gainsBlock}
  },`;
}

// ─── Update runningLogs.js ────────────────────────────────────────────────────

function updateRunningLogs(dayNum, entryStr, varName, importPath) {
  let content = fs.readFileSync(RUNNING_LOGS_PATH, 'utf8');

  // Add import after the last existing import line
  const lastImportIdx = content.lastIndexOf('import ');
  if (lastImportIdx === -1) { console.error('❌  No imports found in runningLogs.js'); process.exit(1); }
  const lastImportEnd = content.indexOf('\n', lastImportIdx) + 1;
  content = content.slice(0, lastImportEnd)
    + `import ${varName} from '${importPath}';\n`
    + content.slice(lastImportEnd);

  // Insert before the closing ]; of the runningLogs array
  const anchor = content.lastIndexOf('];\n\nexport const GOAL_DISTANCE_KM');
  const insertAt = anchor !== -1 ? anchor : content.lastIndexOf('];');
  if (insertAt === -1) { console.error('❌  Cannot locate end of runningLogs array.'); process.exit(1); }
  content = content.slice(0, insertAt) + entryStr + '\n' + content.slice(insertAt);

  return content;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏃 GetLoud — Add Daily Run');
  console.log('===========================');
  console.log(`📸 Image: ${absImagePath}`);
  if (isDryRun) console.log('🔍 DRY RUN — no files will be written\n');

  const prev   = getCurrentLogs();
  const dayNum = prev.maxDay + 1;
  console.log(`📅 Next day: Day ${dayNum}  (prev: Day ${prev.maxDay})`);

  const { data, routeType, location, quote } = await collectRunData();

  console.log('\n✅ Run summary:');
  console.log(`   ${data.fullDate} at ${data.time}`);
  console.log(`   ${data.distanceKm} km · ${data.duration} · ${data.pace}/km · ${data.calories} kcal · ${data.steps.toLocaleString()} steps`);

  const gains = computeGains(data, prev);
  if (gains) {
    console.log(`\n📈 vs Day ${prev.maxDay}: dist ${gains.distanceDelta}  pace ${gains.paceDelta}  speed ${gains.speedDelta}  steps ${gains.stepsDelta}`);
  }

  const varName      = `day${dayNum}Image`;
  const destFilename = `day${dayNum}.jpeg`;
  const destPath     = path.join(ASSETS_DIR, destFilename);
  const importPath   = `../assets/${destFilename}`;
  const entryStr     = buildLogEntry(dayNum, data, gains, routeType, location, quote, varName);

  if (isDryRun) {
    console.log('\n📝 Would write:\n');
    console.log(entryStr);
    console.log('\n📁 Would copy image to:', destPath);
    return;
  }

  // 1. Copy image asset
  fs.copyFileSync(absImagePath, destPath);
  console.log(`\n📁 Copied → src/assets/${destFilename}`);

  // 2. Update data file
  const updated = updateRunningLogs(dayNum, entryStr, varName, importPath);
  fs.writeFileSync(RUNNING_LOGS_PATH, updated, 'utf8');
  console.log(`✅ runningLogs.js updated`);

  // 3. Build
  const ok = runBuild();
  if (!ok) { console.error('    Fix the build error, then re-run or patch manually.'); process.exit(1); }

  // 4. Git commit
  gitCommitAndLog(`feat: add Day ${dayNum} run — ${data.distanceKm}km · ${data.duration} · ${data.pace}/km`);

  console.log(`\n🎉 Day ${dayNum} is live. Deploy or run \`npm run dev\` to preview.`);
}

main().catch(err => { console.error('❌  Unexpected error:', err); process.exit(1); });
#!/usr/bin/env node
/**
 * GetLoud Daily Run Log Automation Script
 * ========================================
 * Usage:
 *   node scripts/add_run_day.js <path-to-day.jpeg> [options]
 *
 * Required / Recommended flags:
 *   --date          YYYY-MM-DD          e.g. 2026-10-05
 *   --date-label    "D Mon"             e.g. "5 Oct"
 *   --full-date     "DayName, D Mon YYYY"
 *   --time          "H:MM am/pm"        e.g. "5:07 pm"
 *   --duration      "MM:SS"             e.g. "31:11"
 *   --distance      6.34                (km, number)
 *   --calories      358                 (integer)
 *   --pace          "MM'SS\""           e.g. "04'54\""
 *   --fastest-pace  "MM'SS\""           (optional)
 *   --steps         5027                (integer, no commas)
 *   --avg-speed     12.2                (optional – calculated if omitted)
 *
 * Optional:
 *   --route-type    "Evening Loop"      (default: "Evening Loop")
 *   --location      "Perth, WA"         (default: "Perth, WA")
 *   --quote         "Custom quote..."   (optional)
 *   --dry-run                           (preview only)
 *
 * Examples:
 *   node scripts/add_run_day.js ~/Downloads/day5.jpg \
 *     --date 2026-10-05 --date-label "5 Oct" --full-date "Monday, 5 Oct 2026" \
 *     --time "5:07 pm" --duration "31:11" --distance 6.34 --calories 358 \
 *     --pace "04'54\"" --fastest-pace "04'15\"" --steps 5027 --avg-speed 12.2
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'assets');
const RUNNING_LOGS_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'runningLogs.js');

// ─── Argument Parsing ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const imagePath = args.find(a => !a.startsWith('--'));

if (!imagePath) {
  console.error('❌  Usage: node scripts/add_run_day.js <path-to-day.jpeg> [flags...]');
  process.exit(1);
}

const getFlag = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')
    ? args[idx + 1]
    : defaultVal;
};

const isDryRun = args.includes('--dry-run');

const absImagePath = path.resolve(imagePath);
if (!fs.existsSync(absImagePath)) {
  console.error(`❌  Image not found: ${absImagePath}`);
  process.exit(1);
}

// ─── Interactive prompt helper ────────────────────────────────────────────────

function ask(question, defaultValue = '') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

// ─── Collect data (flags first, then prompt for anything missing) ─────────────

async function collectRunData() {
  const data = {
    date: getFlag('--date'),
    dateLabel: getFlag('--date-label'),
    fullDate: getFlag('--full-date'),
    time: getFlag('--time'),
    duration: getFlag('--duration'),
    distanceKm: getFlag('--distance') ? parseFloat(getFlag('--distance')) : null,
    calories: getFlag('--calories') ? parseInt(getFlag('--calories'), 10) : null,
    pace: getFlag('--pace'),
    fastestPace: getFlag('--fastest-pace'),
    steps: getFlag('--steps') ? parseInt(getFlag('--steps').replace(/,/g, ''), 10) : null,
    avgSpeedKmh: getFlag('--avg-speed') ? parseFloat(getFlag('--avg-speed')) : null,
  };

  const routeType = getFlag('--route-type', 'Evening Loop');
  const location = getFlag('--location', 'Perth, WA');
  const quote = getFlag('--quote');

  console.log('\n📋 Collecting run data (press Enter to keep default / skip if already provided via flag)\n');

  if (!data.date) data.date = await ask('Date (YYYY-MM-DD)', '2026-10-05');
  if (!data.dateLabel) data.dateLabel = await ask('Date label (e.g. "5 Oct")', '5 Oct');
  if (!data.fullDate) data.fullDate = await ask('Full date (e.g. "Monday, 5 Oct 2026")', 'Monday, 5 Oct 2026');
  if (!data.time) data.time = await ask('Time (e.g. "5:07 pm")', '5:07 pm');
  if (!data.duration) data.duration = await ask('Duration (MM:SS)', '31:11');
  if (data.distanceKm === null) data.distanceKm = parseFloat(await ask('Distance (km)', '6.34'));
  if (data.calories === null) data.calories = parseInt(await ask('Calories (kcal)', '358'), 10);
  if (!data.pace) data.pace = await ask('Average pace (e.g. 04\'54")', "04'54\"");
  if (!data.fastestPace) data.fastestPace = await ask('Fastest pace (leave blank = same as avg)', data.pace);
  if (data.steps === null) data.steps = parseInt((await ask('Steps', '5027')).replace(/,/g, ''), 10);

  // Average speed – calculate if not given
  if (data.avgSpeedKmh === null) {
    data.avgSpeedKmh = computeAvgSpeed(data.distanceKm, data.duration);
  }

  // Final sanity check
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
  const parts = duration.split(':');
  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1] || '0', 10);
  return (mins * 60 + secs) / 3600;
}

function computeAvgSpeed(distanceKm, duration) {
  const hrs = timeToHours(duration);
  return Math.round((distanceKm / hrs) * 10) / 10;
}

function paceToSeconds(pace) {
  // Handles both "04'54\"" and "04'54"
  const m = pace?.match(/(\d+)'(\d+)/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function secondsToPaceLabel(diff) {
  if (diff === null) return '—';
  const abs = Math.abs(diff);
  const sign = diff < 0 ? '-' : '+';
  return `${sign}${abs}s/km ${diff < 0 ? 'faster' : 'slower'}`;
}

function getCurrentLogs() {
  const content = fs.readFileSync(RUNNING_LOGS_PATH, 'utf8');
  const dayMatches = [...content.matchAll(/^\s+day:\s*(\d+),/gm)];
  const maxDay = dayMatches.reduce((max, m) => Math.max(max, parseInt(m[1], 10)), 0);

  const distMatches = [...content.matchAll(/distanceKm:\s*([\d.]+)/g)];
  const paceMatches = [...content.matchAll(/pace:\s*"([^"]+)"/g)];
  const speedMatches = [...content.matchAll(/avgSpeedKmh:\s*([\d.]+)/g)];
  const stepsMatches = [...content.matchAll(/steps:\s*(\d+)/g)];

  return {
    maxDay,
    lastDist: distMatches.length ? parseFloat(distMatches[distMatches.length - 1][1]) : null,
    lastPace: paceMatches.length ? paceMatches[paceMatches.length - 1][1] : null,
    lastSpeed: speedMatches.length ? parseFloat(speedMatches[speedMatches.length - 1][1]) : null,
    lastSteps: stepsMatches.length ? parseInt(stepsMatches[stepsMatches.length - 1][1], 10) : null,
  };
}

function computeGains(data, prev) {
  if (!prev.lastDist) return null;

  const distDelta = (data.distanceKm - prev.lastDist).toFixed(2);
  const distSign = parseFloat(distDelta) >= 0 ? '+' : '';

  const currPaceSec = paceToSeconds(data.pace);
  const prevPaceSec = paceToSeconds(prev.lastPace);
  const paceDiffSec = (currPaceSec !== null && prevPaceSec !== null) ? currPaceSec - prevPaceSec : null;

  const speedDelta = prev.lastSpeed !== null
    ? (data.avgSpeedKmh - prev.lastSpeed).toFixed(1)
    : '—';
  const speedSign = parseFloat(speedDelta) >= 0 ? '+' : '';

  const stepsDiff = prev.lastSteps !== null ? data.steps - prev.lastSteps : null;
  const stepsLabel = stepsDiff !== null
    ? `${stepsDiff >= 0 ? '+' : ''}${stepsDiff.toLocaleString()} steps`
    : '—';

  return {
    distanceDelta: `${distSign}${distDelta} km`,
    paceDelta: secondsToPaceLabel(paceDiffSec),
    speedDelta: `${speedSign}${speedDelta} km/h`,
    stepsDelta: stepsLabel,
  };
}

// ─── Safe string helper (the key fix) ─────────────────────────────────────────
// Always produces a correctly quoted & escaped JS string literal
function jsString(value) {
  return JSON.stringify(String(value ?? ''));
}

// ─── Build the JS entry ───────────────────────────────────────────────────────

function buildLogEntry(dayNum, data, gains, routeType, location, quote, varName) {
  const autoQuote = quote || `Day ${dayNum} done. ${data.distanceKm} km at ${data.pace} — keeping the grind alive.`;

  const autoRouteDescription = `Day ${dayNum} evening run. ${data.distanceKm} km covered in ${data.duration} at an average pace of ${data.pace}/km.`;

  const gainsBlock = gains
    ? `
    gains: {
      distanceDelta: ${jsString(gains.distanceDelta)},
      paceDelta: ${jsString(gains.paceDelta)},
      speedDelta: ${jsString(gains.speedDelta)},
      stepsDelta: ${jsString(gains.stepsDelta)},
    },`
    : '';

  return `  {
    day: ${dayNum},
    date: ${jsString(data.date)},
    dateLabel: ${jsString(data.dateLabel)},
    fullDate: ${jsString(data.fullDate)},
    time: ${jsString(data.time)},
    distanceKm: ${data.distanceKm},
    duration: ${jsString(data.duration)},
    pace: ${jsString(data.pace)},
    avgSpeedKmh: ${data.avgSpeedKmh},
    fastestPace: ${jsString(data.fastestPace)},
    steps: ${data.steps},
    cadenceSpm: null,
    avgStrideM: null,
    calories: ${data.calories},
    elevationM: null,
    routeType: ${jsString(routeType)},
    routeLocation: ${jsString(location)},
    routeDescription: ${jsString(autoRouteDescription)},
    image: ${varName},
    mapCard: null,
    mapCrop: null,
    routeSvg: null,
    quote: ${jsString(autoQuote)},
    source: 'Samsung Health',
    verified: true,${gainsBlock}
  },`;
}

// ─── Update runningLogs.js ────────────────────────────────────────────────────

function updateRunningLogs(dayNum, entryStr, varName, importPath) {
  let content = fs.readFileSync(RUNNING_LOGS_PATH, 'utf8');

  // Add import after the last existing import
  const lastImportIdx = content.lastIndexOf('import ');
  if (lastImportIdx === -1) {
    console.error('❌  Could not find any import statements in runningLogs.js');
    process.exit(1);
  }
  const lastImportEnd = content.indexOf('\n', lastImportIdx) + 1;
  const newImport = `import ${varName} from '${importPath}';\n`;
  content = content.slice(0, lastImportEnd) + newImport + content.slice(lastImportEnd);

  // Insert before the closing ]; of the array
  const closingBracket = content.lastIndexOf('];\n\nexport const GOAL_DISTANCE_KM');
  if (closingBracket === -1) {
    // fallback – just look for the last ];
    const fallback = content.lastIndexOf('];');
    if (fallback === -1) {
      console.error('❌  Could not find the end of the runningLogs array.');
      process.exit(1);
    }
    content = content.slice(0, fallback) + entryStr + '\n' + content.slice(fallback);
  } else {
    content = content.slice(0, closingBracket) + entryStr + '\n' + content.slice(closingBracket);
  }

  return content;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏃 GetLoud Daily Run Log Automation (manual entry)');
  console.log('=================================================');
  console.log(`📸 Image: ${absImagePath}`);
  if (isDryRun) console.log('🔍 DRY RUN MODE — no files will be written\n');

  const prev = getCurrentLogs();
  const dayNum = prev.maxDay + 1;
  console.log(`📅 Next day will be: Day ${dayNum} (previous highest: Day ${prev.maxDay})`);

  const { data, routeType, location, quote } = await collectRunData();

  console.log('\n✅ Using these values:');
  console.log(`   Date:       ${data.fullDate} at ${data.time}`);
  console.log(`   Distance:   ${data.distanceKm} km`);
  console.log(`   Duration:   ${data.duration}`);
  console.log(`   Pace:       ${data.pace}/km (best: ${data.fastestPace}/km)`);
  console.log(`   Speed:      ${data.avgSpeedKmh} km/h`);
  console.log(`   Steps:      ${data.steps.toLocaleString()}`);
  console.log(`   Calories:   ${data.calories} kcal`);

  const gains = computeGains(data, prev);
  if (gains) {
    console.log('\n📈 Day-over-Day Gains:');
    console.log(`   Distance: ${gains.distanceDelta}`);
    console.log(`   Pace:     ${gains.paceDelta}`);
    console.log(`   Speed:    ${gains.speedDelta}`);
    console.log(`   Steps:    ${gains.stepsDelta}`);
  }

  const varName = `day${dayNum}Image`;
  const destFilename = `day${dayNum}.jpeg`;
  const destPath = path.join(ASSETS_DIR, destFilename);
  const importPath = `../assets/${destFilename}`;

  const entryStr = buildLogEntry(dayNum, data, gains, routeType, location, quote, varName);

  if (isDryRun) {
    console.log('\n📝 Would add this entry to runningLogs.js:\n');
    console.log(entryStr);
    console.log('\n📁 Would copy image to:', destPath);
    console.log('\n✅ Dry run complete. Run without --dry-run to apply changes.');
    return;
  }

  // Copy image
  fs.copyFileSync(absImagePath, destPath);
  console.log(`\n📁 Copied image → src/assets/${destFilename}`);

  // Update runningLogs.js
  const updatedContent = updateRunningLogs(dayNum, entryStr, varName, importPath);
  fs.writeFileSync(RUNNING_LOGS_PATH, updatedContent, 'utf8');
  console.log(`✅ Updated src/data/runningLogs.js with Day ${dayNum} entry`);

  // Build
  console.log('\n🔨 Running build verification...');
  try {
    execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    console.log(`\n🎉 All done! Day ${dayNum} is live.`);
    console.log('   Run `npm run dev` to preview, or deploy.');
  } catch (err) {
    console.error('\n❌  Build failed. Check the error above.');
    console.error('    runningLogs.js has been updated — you may need to fix it manually.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌  Unexpected error:', err);
  process.exit(1);
});
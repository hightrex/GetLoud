import { campaignGoals } from '../data/campaignGoals.js';
import { products, merchConfig } from '../data/products.js';
import { weeklyDonations, donationConfig } from '../data/weeklyDonations.js';
import { podcastEpisodes, podcastConfig } from '../data/podcasts.js';
import { formatKm, formatUsd } from './campaignCalculator.js';

const GOAL_ICONS = {
  run: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  people: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  heart: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
};

export function renderProgressTracker(container, stats, onInspectRun) {
  if (!container) return;

  const { runningLogs, distanceCoveredKm, remainingKm, progressPercent, currentDay, totalDays, avgDistanceKm, totalCalories, totalSteps, avgSpeedKmh, aboveTargetKm } = stats;

  container.innerHTML = `
    <div class="space-y-12">
      <!-- Hero Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl glass-card border border-[#00f098]/30 text-center space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Total Distance</p>
          <p class="text-3xl sm:text-4xl font-extrabold text-[#00f098] font-mono">${formatKm(distanceCoveredKm)} <span class="text-base text-gray-400 font-sans">KM</span></p>
          <p class="text-xs text-gray-500">of ${stats.targetKm} km goal</p>
        </div>
        <div class="p-5 rounded-2xl glass-card border border-gray-800 text-center space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Remaining</p>
          <p class="text-3xl sm:text-4xl font-extrabold text-white font-mono">${formatKm(remainingKm)} <span class="text-base text-gray-400 font-sans">KM</span></p>
          <p class="text-xs text-gray-500">to complete challenge</p>
        </div>
        <div class="p-5 rounded-2xl glass-card border border-gray-800 text-center space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Days Completed</p>
          <p class="text-3xl sm:text-4xl font-extrabold text-white font-mono">${currentDay}<span class="text-lg text-gray-500 font-sans">/${totalDays}</span></p>
          <p class="text-xs text-[#00f098] font-semibold">100% On Schedule</p>
        </div>
        <div class="p-5 rounded-2xl glass-card border border-gray-800 text-center space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Avg per Run</p>
          <p class="text-3xl sm:text-4xl font-extrabold text-[#f59e0b] font-mono">${formatKm(avgDistanceKm)} <span class="text-base text-gray-400 font-sans">KM</span></p>
          <p class="text-xs text-emerald-400">${aboveTargetKm > 0 ? `+${aboveTargetKm} km above daily target` : 'On target daily'}</p>
        </div>
      </div>

      <!-- Main Progress Bar -->
      <div class="p-6 sm:p-8 rounded-3xl glass-card border border-[#00f098]/20 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-extrabold text-white">500 km Challenge Progress</h3>
            <p class="text-xs text-gray-400">5km+ daily for 100 consecutive days across Perth, Western Australia</p>
          </div>
          <span class="text-2xl sm:text-3xl font-extrabold text-[#00f098] font-mono">${progressPercent}%</span>
        </div>
        <div class="relative w-full h-5 bg-gray-900 rounded-full overflow-hidden border border-gray-800 p-0.5">
          <div class="progress-bar-fill h-full bg-gradient-to-r from-[#00f098] via-[#10b981] to-[#059669] rounded-full transition-all duration-1000 relative" style="width: ${Math.max(progressPercent, 3)}%">
            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div class="flex justify-between text-xs font-mono text-gray-400">
          <span>0 km</span>
          <span class="text-[#00f098] font-bold">${formatKm(distanceCoveredKm)} km logged</span>
          <span>500 km</span>
        </div>
        <div class="flex flex-wrap gap-4 pt-3 border-t border-gray-800/80 text-xs text-gray-300">
          <span class="inline-flex items-center gap-1.5">🔥 <strong class="text-white font-mono">${totalCalories.toLocaleString()}</strong> kcal burned</span>
          <span class="inline-flex items-center gap-1.5">👟 <strong class="text-white font-mono">${totalSteps.toLocaleString()}</strong> steps logged</span>
          <span class="inline-flex items-center gap-1.5">⚡ <strong class="text-white font-mono">${avgSpeedKmh ? `${avgSpeedKmh} km/h` : '—'}</strong> avg speed</span>
          <span class="inline-flex items-center gap-1.5 text-[#00f098]">📱 Samsung Health GPS Verified</span>
        </div>
      </div>

      <!-- Daily Shorts Scroller -->
      ${renderDailyShortsScroller(runningLogs)}

      <!-- Daily Run Cards Showcase -->
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-2xl font-extrabold text-white">Official Daily Run Logs & GPS Route Maps</h3>
            <p class="text-xs sm:text-sm text-gray-400">Swipe on phone · tap a card for full telemetry</p>
          </div>
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold self-start sm:self-auto">
            <span class="w-2 h-2 rounded-full bg-[#00f098] animate-ping"></span>
            Verified Official Runs
          </div>
        </div>

        <p class="h-scroll-hint">Swipe for more runs →</p>
        <div id="runCardsGrid" class="h-scroll h-scroll-lg-grid">
          ${[...runningLogs].reverse().map((log) => `
            <div class="run-card-wrapper h-card-wide">${renderRunCard(log)}</div>
          `).join('')}
        </div>
      </div>

      <!-- Day-over-Day Momentum & Progression Spotlight -->
      ${renderProgressionCard(runningLogs)}
    </div>
  `;

  // Attach event listeners for tab switching inside run cards
  container.querySelectorAll('[data-view-toggle]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const day = btn.getAttribute('data-day');
      const view = btn.getAttribute('data-view');
      const card = container.querySelector(`[data-run-card="${day}"]`);
      if (!card) return;

      const mapEl = card.querySelector(`[data-card-visual="map"]`);
      const proofEl = card.querySelector(`[data-card-visual="proof"]`);
      const mapBtn = card.querySelector(`[data-view="map"]`);
      const proofBtn = card.querySelector(`[data-view="proof"]`);

      if (view === 'map') {
        mapEl?.classList.remove('hidden');
        proofEl?.classList.add('hidden');
        mapBtn?.classList.add('bg-[#00f098]', 'text-black', 'shadow-md');
        mapBtn?.classList.remove('bg-gray-800/80', 'text-gray-400');
        proofBtn?.classList.remove('bg-[#00f098]', 'text-black', 'shadow-md');
        proofBtn?.classList.add('bg-gray-800/80', 'text-gray-400');
      } else {
        proofEl?.classList.remove('hidden');
        mapEl?.classList.add('hidden');
        proofBtn?.classList.add('bg-[#00f098]', 'text-black', 'shadow-md');
        proofBtn?.classList.remove('bg-gray-800/80', 'text-gray-400');
        mapBtn?.classList.remove('bg-[#00f098]', 'text-black', 'shadow-md');
        mapBtn?.classList.add('bg-gray-800/80', 'text-gray-400');
      }
    });
  });

  // Attach event listeners for inspecting modal
  container.querySelectorAll('[data-inspect-run]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const day = parseInt(btn.getAttribute('data-inspect-run'), 10);
      const log = runningLogs.find((l) => l.day === day);
      if (log && onInspectRun) {
        onInspectRun(log);
      }
    });
  });
}
function renderRunCard(log) {
  return `
    <article data-run-card="${log.day}"
      class="run-card h-full rounded-2xl glass-card border border-gray-800 hover:border-[#00f098]/40 transition-all overflow-hidden flex flex-col">
      
      <!-- Header -->
      <div class="p-3 sm:p-4 flex items-start justify-between gap-2 border-b border-gray-800/80">
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full bg-[#00f098]/15 text-[#00f098] border border-[#00f098]/30 text-[10px] font-black font-mono">
              DAY ${log.day}
            </span>
            <span class="text-[10px] text-gray-500 font-medium truncate">${log.routeType || 'Run'}</span>
          </div>
          <p class="text-sm font-bold text-white mt-1 truncate">${log.dateLabel} · ${log.time}</p>
          <p class="text-[11px] text-gray-500 truncate">${log.routeLocation || 'Perth, WA'}</p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xl sm:text-2xl font-extrabold text-[#00f098] font-mono leading-none">${log.distanceKm}</p>
          <p class="text-[10px] text-gray-500 uppercase font-bold mt-0.5">km</p>
        </div>
      </div>

      <!-- Proof image: contain so it is not zoomed/cropped -->
      <button type="button" data-inspect-run="${log.day}"
        class="relative w-full bg-gray-950 border-b border-gray-800 flex items-center justify-center"
        style="aspect-ratio: 4 / 3;">
        <img
          src="${log.image}"
          alt="Day ${log.day} Samsung Health proof"
          class="max-w-full max-h-full w-auto h-auto object-contain p-2"
          loading="lazy"
        />
        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-white pointer-events-none">
          Samsung Health
        </span>
      </button>

      <!-- Metrics -->
      <div class="p-3 grid grid-cols-3 gap-2 text-center border-b border-gray-800/60">
        <div>
          <p class="text-[9px] uppercase text-gray-500 font-bold">Pace</p>
          <p class="text-xs sm:text-sm font-extrabold text-white font-mono">${log.pace || '—'}</p>
        </div>
        <div>
          <p class="text-[9px] uppercase text-gray-500 font-bold">Time</p>
          <p class="text-xs sm:text-sm font-extrabold text-white font-mono">${log.duration || '—'}</p>
        </div>
        <div>
          <p class="text-[9px] uppercase text-gray-500 font-bold">Speed</p>
          <p class="text-xs sm:text-sm font-extrabold text-white font-mono">${log.avgSpeedKmh != null ? log.avgSpeedKmh : '—'}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-3 flex items-center justify-between gap-2 mt-auto">
        ${log.youtubeShortUrl ? `
        <a href="${log.youtubeShortUrl}" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/15 text-red-400 border border-red-500/30 text-[11px] font-bold hover:bg-red-600 hover:text-white transition-all">
          Short
        </a>` : `<span class="text-[10px] text-gray-600">—</span>`}
        <button type="button" data-inspect-run="${log.day}"
          class="text-[11px] font-bold text-[#00f098] hover:underline">
          Full details →
        </button>
      </div>
    </article>
  `;
}


function renderDailyShortsScroller(runningLogs) {
  const CHANNEL_URL = 'https://www.youtube.com/@Krashworks/shorts';
  const shorts = runningLogs.filter(l => l.youtubeShortUrl).slice().reverse();
  if (shorts.length === 0) return '';

  const cards = shorts.map(log => `
    <a href="${log.youtubeShortUrl}" target="_blank" rel="noopener noreferrer"
      class="shrink-0 w-36 sm:w-44 rounded-2xl bg-gray-900/90 border border-gray-800 hover:border-red-500/60 transition-all overflow-hidden group flex flex-col">
      <div class="relative bg-gray-950 aspect-[9/16] flex items-center justify-center">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-red-600/30">
            <svg class="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <img src="${log.image}" alt="Day ${log.day} Short" class="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" loading="lazy" />
      </div>
      <div class="p-2.5">
        <p class="text-[11px] font-extrabold text-white">Day ${log.day}</p>
        <p class="text-[10px] text-gray-400 truncate">${log.dateLabel} · ${log.distanceKm} km</p>
      </div>
    </a>
  `).join('');

  return `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 fill-red-500" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 22c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 2c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>
          <h3 class="text-base font-extrabold text-white">Daily Shorts</h3>
          <span class="text-[11px] text-gray-400 font-medium">${shorts.length} available</span>
        </div>
        <a href="${CHANNEL_URL}" target="_blank" rel="noopener noreferrer"
          class="text-[11px] font-bold text-red-400 hover:text-white flex items-center gap-1 transition-colors">
          @Krashworks
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
      </div>
      <div class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent" style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">
        ${cards}
        <a href="${CHANNEL_URL}" target="_blank" rel="noopener noreferrer"
          class="shrink-0 w-36 sm:w-44 rounded-2xl bg-gray-900/60 border border-red-500/30 hover:border-red-500 transition-all flex flex-col items-center justify-center gap-2 p-4 text-center group min-h-[200px]">
          <svg class="w-8 h-8 fill-red-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 22c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 2c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>
          <p class="text-[11px] font-bold text-red-400 group-hover:text-white transition-colors">All Daily Shorts</p>
          <p class="text-[10px] text-gray-500">@Krashworks/shorts</p>
        </a>
      </div>
    </div>
  `;
}

function renderProgressionCard(runningLogs) {
  if (runningLogs.length < 2) return '';
  const prev = runningLogs[runningLogs.length - 2];
  const curr = runningLogs[runningLogs.length - 1];
  const totalDays = runningLogs.length;

  const totalKm = runningLogs.reduce((sum, l) => sum + l.distanceKm, 0);
  const totalSteps = runningLogs.reduce((sum, l) => sum + l.steps, 0);
  const distDiff = (curr.distanceKm - prev.distanceKm).toFixed(2);
  const stepsDiff = curr.steps - prev.steps;
  const speedDiff = (curr.avgSpeedKmh - prev.avgSpeedKmh).toFixed(1);
  const distPct = Math.abs(((curr.distanceKm - prev.distanceKm) / prev.distanceKm) * 100).toFixed(1);

  return `
    <div class="p-6 sm:p-8 rounded-3xl glass-card border border-amber-500/20 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-extrabold uppercase">
            Performance Progression
          </span>
          <h3 class="text-xl sm:text-2xl font-extrabold text-white mt-2">Day ${prev.day} ➔ Day ${curr.day} Momentum</h3>
          <p class="text-xs sm:text-sm text-gray-400">Karsang's ${totalDays}-day cumulative momentum — daily pace, distance, and step volume tracked.</p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xs uppercase font-bold text-gray-500">${totalDays}-Day Combined</p>
          <p class="text-2xl sm:text-3xl font-extrabold text-[#00f098] font-mono">${totalKm.toFixed(2)} KM</p>
          <p class="text-xs text-gray-400">${totalSteps.toLocaleString()} Total Steps</p>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Distance</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-white font-mono">${curr.distanceKm}</span>
            <span class="text-xs font-bold ${parseFloat(distDiff) >= 0 ? 'text-[#00f098]' : 'text-rose-400'} font-mono">${parseFloat(distDiff) >= 0 ? '+' : ''}${distDiff} km (${parseFloat(distDiff) >= 0 ? '+' : ''}${distPct}%)</span>
          </div>
          <p class="text-[11px] text-gray-500">${prev.distanceKm} km (Day ${prev.day}) ➔ ${curr.distanceKm} km (Day ${curr.day})</p>
        </div>

        <div class="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Avg Pace</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-white font-mono">${curr.pace}</span>
            <span class="text-xs font-bold text-amber-400 font-mono">${curr.gains?.paceDelta || '—'}</span>
          </div>
          <p class="text-[11px] text-gray-500">${prev.pace}/km (Day ${prev.day}) ➔ ${curr.pace}/km (Day ${curr.day})</p>
        </div>

        <div class="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Avg Speed</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-white font-mono">${curr.avgSpeedKmh}</span>
            <span class="text-xs font-bold ${parseFloat(speedDiff) >= 0 ? 'text-sky-400' : 'text-rose-400'} font-mono">${parseFloat(speedDiff) >= 0 ? '+' : ''}${speedDiff} km/h</span>
          </div>
          <p class="text-[11px] text-gray-500">${prev.avgSpeedKmh} km/h (Day ${prev.day}) ➔ ${curr.avgSpeedKmh} km/h (Day ${curr.day})</p>
        </div>

        <div class="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Step Volume</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-white font-mono">${curr.steps.toLocaleString()}</span>
            <span class="text-xs font-bold ${stepsDiff >= 0 ? 'text-purple-400' : 'text-rose-400'} font-mono">${stepsDiff >= 0 ? '+' : ''}${stepsDiff.toLocaleString()} steps</span>
          </div>
          <p class="text-[11px] text-gray-500">${prev.steps.toLocaleString()} steps (Day ${prev.day}) ➔ ${curr.steps.toLocaleString()} steps (Day ${curr.day})</p>
        </div>
      </div>
    </div>
  `;
}


export function renderAimAndGoal(container, stats) {
  if (!container) return;

  const { aim, goals, missionStatement, missionAuthor } = campaignGoals;

  const goalValues = {
    distance: `${formatKm(stats.distanceCoveredKm)} / 500 km`,
    days: `${stats.currentDay} / ${stats.totalDays} days`,
    funds: `${formatUsd(stats.fundsRaisedUsd)} raised`,
    collaborators: `${stats.confirmedCollaborators} / 14 guests`,
    podcasts: `${stats.publishedPodcasts} / ${stats.totalPodcastsPlanned} episodes`,
    counseling: `${Math.floor(stats.fundsRaisedUsd / 12)}+ hrs funded`,
  };

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div class="lg:col-span-5 space-y-6">
        <div class="space-y-3">
          <span class="px-3 py-1 rounded-full bg-[#00f098]/10 text-[#00f098] border border-[#00f098]/20 text-xs font-bold uppercase">The Aim</span>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-white leading-tight">${aim.headline}</h3>
          <p class="text-sm text-gray-300 leading-relaxed">${aim.summary}</p>
        </div>
        <div class="space-y-4">
          ${aim.pillars.map((pillar) => `
            <div class="p-4 rounded-2xl glass-card border border-gray-800 flex gap-4 items-start">
              <div class="w-10 h-10 rounded-xl bg-[#00f098]/10 text-[#00f098] flex items-center justify-center shrink-0">
                ${GOAL_ICONS[pillar.icon] || GOAL_ICONS.run}
              </div>
              <div>
                <h4 class="text-sm font-extrabold text-white">${pillar.title}</h4>
                <p class="text-xs text-gray-400 mt-1 leading-relaxed">${pillar.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <blockquote class="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 border-l-4 border-l-[#00f098] italic text-sm text-gray-300">
          ${missionStatement}
          <footer class="mt-3 text-xs font-bold text-[#f59e0b] not-italic">— ${missionAuthor}</footer>
        </blockquote>
      </div>

      <div class="lg:col-span-7">
        <div class="space-y-3 mb-6">
          <span class="px-3 py-1 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 text-xs font-bold uppercase">Measurable Goals</span>
          <h3 class="text-2xl font-extrabold text-white">Campaign Targets & Live Progress</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${goals.map((goal) => `
            <div class="p-5 rounded-2xl glass-card border border-gray-800 space-y-2 hover:border-[#00f098]/30 transition-all">
              <div class="flex items-center justify-between">
                <p class="text-xs font-bold uppercase text-gray-400">${goal.label}</p>
                <span class="text-[10px] font-mono text-gray-500">${goal.target === '100% donated' ? goal.target : `Target: ${goal.target}`}</span>
              </div>
              <p class="text-xl font-extrabold text-white font-mono">${goalValues[goal.id] || goal.target}</p>
              <p class="text-[11px] text-gray-500 leading-relaxed">${goal.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderProducts(container, onEnquire) {
  if (!container) return;

  const items = [
    { id: 'tee', label: 'Official Tee', emoji: '👕', hint: 'Soft cotton · Perth emblem' },
    { id: 'cap', label: 'Running Cap', emoji: '🧢', hint: 'Sunrise-run friendly' },
    { id: 'stickers', label: 'Sticker Pack', emoji: '✨', hint: 'Bottle & laptop' },
  ];

  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-8">
      <!-- Interactive: pick a favourite (local only) -->
      <div class="p-5 sm:p-6 rounded-3xl glass-card border border-purple-500/20 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p class="text-xs font-bold uppercase text-purple-400">Coming soon · teaser</p>
            <h3 class="text-lg font-extrabold text-white">Which drop should we ship first?</h3>
          </div>
          <span id="merchVoteStatus" class="text-xs text-gray-500">Tap one — saved on this device</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" id="merchVoteGrid">
          ${items.map((item) => `
            <button type="button" data-merch-vote="${item.id}"
              class="merch-vote-btn p-4 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-purple-400/50 text-left transition-all space-y-2">
              <span class="text-2xl">${item.emoji}</span>
              <p class="text-sm font-extrabold text-white">${item.label}</p>
              <p class="text-[11px] text-gray-500">${item.hint}</p>
              <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-purple-300">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                Coming soon
              </span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Notify form -->
      <form id="merchNotifyForm"
        action="https://formsubmit.co/krashworks0@gmail.com"
        method="POST"
        class="p-5 sm:p-6 rounded-3xl glass-card border border-gray-800 space-y-4">
        <input type="hidden" name="_subject" value="GetLoud Merch — Launch notify" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="vote" id="merchVoteField" value="" />
        <input type="text" name="_honey" class="hidden" tabindex="-1" autocomplete="off" />

        <p class="text-sm font-extrabold text-white">Get notified when the shop opens</p>
        <div class="flex flex-col sm:flex-row gap-3">
          <input required type="email" name="email" placeholder="you@email.com"
            class="flex-1 px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm focus:border-purple-400 outline-none" />
          <button type="submit"
            class="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm transition-all shrink-0">
            Notify me
          </button>
        </div>
        <p class="text-[11px] text-gray-500">Goes to Krash Productions · no spam · no payment on this site</p>
      </form>
    </div>
  `;

  const voteField = container.querySelector('#merchVoteField');
  const status = container.querySelector('#merchVoteStatus');
  const saved = localStorage.getItem('getloud-merch-vote');

  const applyVote = (id) => {
    container.querySelectorAll('[data-merch-vote]').forEach((btn) => {
      const on = btn.getAttribute('data-merch-vote') === id;
      btn.classList.toggle('border-purple-400', on);
      btn.classList.toggle('bg-purple-500/10', on);
    });
    if (voteField) voteField.value = id || '';
    if (status) status.textContent = id ? `You picked: ${id}` : 'Tap one — saved on this device';
  };

  if (saved) applyVote(saved);

  container.querySelectorAll('[data-merch-vote]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-merch-vote');
      localStorage.setItem('getloud-merch-vote', id);
      applyVote(id);
    });
  });
}
export function renderWeeklyDonations(container, stats) {
  if (!container) return;

  const totalRaised = stats.fundsRaisedUsd;

  container.innerHTML = `
    <div class="space-y-8">
      <div class="p-6 sm:p-8 rounded-3xl glass-card border border-[#f59e0b]/20 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase text-gray-400">Total Raised</p>
            <p class="text-3xl sm:text-4xl font-extrabold text-[#f59e0b] font-mono">${formatUsd(totalRaised)}</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold uppercase text-gray-400">Donation Commitment</p>
            <p class="text-xl font-extrabold text-white font-mono">100% intended for mental health</p>
            <p class="text-[10px] text-gray-500">Partners being confirmed • Coordinated by Krash Productions</p>
          </div>
        </div>
        <p class="text-xs text-gray-400">100% of donations go directly to mental health partners • ${formatUsd(donationConfig.collaboratorFeeUsd)} per weekly collaborator slot</p>
      </div>

      <p class="h-scroll-hint">Swipe weeks →</p>
      <div class="h-scroll h-scroll-lg-grid-4">
        ${weeklyDonations.map((week) => `
          <div class="h-card-sm">${renderDonationWeekCard(week)}</div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDonationWeekCard(week) {
  const statusStyles = {
    active: 'border-[#00f098]/40 bg-[#00f098]/5',
    completed: 'border-emerald-500/30',
    upcoming: 'border-gray-800 opacity-70',
  };
  const statusLabels = {
    active: 'In Progress',
    completed: 'Complete',
    upcoming: 'Upcoming',
  };

  return `
    <div class="p-4 rounded-2xl glass-card border ${statusStyles[week.status] || statusStyles.upcoming} space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono font-bold text-gray-400">Week ${week.week}</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${week.status === 'active' ? 'bg-[#00f098]/20 text-[#00f098]' : week.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}">${statusLabels[week.status]}</span>
      </div>
      <p class="text-sm font-extrabold text-white">${week.label}</p>
      <p class="text-[10px] text-gray-500">${week.days}</p>
      <p class="text-2xl font-extrabold font-mono ${week.amountUsd > 0 ? 'text-[#f59e0b]' : 'text-gray-600'}">${formatUsd(week.amountUsd)}</p>
      ${week.collaboratorCount > 0 ? `<p class="text-[10px] text-gray-400">${week.collaboratorCount} collaborator${week.collaboratorCount !== 1 ? 's' : ''}</p>` : ''}
      ${week.note ? `<p class="text-[10px] text-gray-500 italic">${week.note}</p>` : ''}
    </div>
  `;
}

export function renderPodcasts(container, onPlayEpisode) {
  if (!container) return;

  const available = podcastEpisodes.filter((ep) => ep.status === 'available');
  const nextUp = podcastEpisodes.find((ep) => ep.status === 'upcoming');

  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Status strip -->
      <div class="p-5 rounded-3xl glass-card border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase text-blue-400">Series status</p>
          <p class="text-lg font-extrabold text-white">${podcastConfig.seriesTitle}</p>
          <p class="text-xs text-gray-400 mt-1">Hosted by ${podcastConfig.host} · ${available.length} live · rest in production</p>
        </div>
        <div class="text-left sm:text-right">
          <p class="text-xs text-gray-500">Next focus</p>
          <p class="text-sm font-bold text-white">${nextUp ? nextUp.title : 'TBA'}</p>
          <p class="text-[11px] text-gray-500">${nextUp ? nextUp.perthLocation : ''}</p>
        </div>
      </div>

      <!-- Available only (if any) -->
      ${available.length ? `
      <div class="space-y-3">
        <p class="text-xs font-bold uppercase text-gray-500">Available now</p>
        <div class="space-y-3">
          ${available.map((ep) => `
            <div class="p-4 rounded-2xl glass-card border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p class="text-sm font-extrabold text-white">${ep.title}</p>
                <p class="text-xs text-gray-400">${ep.guest} · ${ep.duration}</p>
              </div>
              <button type="button" data-episode-id="${ep.id}"
                class="px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 border border-gray-700 text-white hover:bg-[#00f098] hover:text-black transition-all">
                ${ep.audioUrl ? 'Listen' : 'Preview soon'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>` : `
      <div class="p-4 rounded-2xl bg-gray-900/60 border border-dashed border-gray-700 text-center text-sm text-gray-400">
        First full episodes drop after weekly runs are recorded. Preview slot is reserved for launch.
      </div>`}

      <!-- Interactive: register interest -->
      <form id="podcastRegisterForm"
        action="https://formsubmit.co/krashworks0@gmail.com"
        method="POST"
        class="p-5 sm:p-6 rounded-3xl glass-card border border-blue-500/20 space-y-4">
        <input type="hidden" name="_subject" value="GetLoud Podcast — Interest / guest idea" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_template" value="table" />
        <input type="text" name="_honey" class="hidden" tabindex="-1" autocomplete="off" />

        <p class="text-sm font-extrabold text-white">Register interest</p>
        <p class="text-xs text-gray-400">Get episode alerts, or pitch yourself / a guest for a week.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required name="name" placeholder="Your name"
            class="px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm outline-none focus:border-blue-400" />
          <input required type="email" name="email" placeholder="Email"
            class="px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm outline-none focus:border-blue-400" />
        </div>

        <select name="interest" class="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm outline-none focus:border-blue-400">
          <option value="notify">Just notify me when episodes drop</option>
          <option value="guest">I’d like to be a podcast guest</option>
          <option value="topic">I have a topic suggestion</option>
        </select>

        <textarea name="message" rows="3" placeholder="Optional: topic, week preference, or link"
          class="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-700 text-white text-sm outline-none focus:border-blue-400 resize-none"></textarea>

        <button type="submit"
          class="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm transition-all">
          Send to Karsang
        </button>
        <p class="text-[11px] text-gray-500">Handled personally · not a booking confirmation until he replies</p>
      </form>
    </div>
  `;

  container.querySelectorAll('[data-episode-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ep = podcastEpisodes.find((e) => e.id === btn.getAttribute('data-episode-id'));
      if (ep) onPlayEpisode?.(ep);
    });
  });
}

function renderPodcastCard(ep) {
  const isAvailable = ep.status === 'available';
  return `
    <article class="p-6 rounded-3xl glass-card border border-gray-800 flex flex-col space-y-4 hover:border-[#00f098]/30 transition-all">
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono font-bold text-gray-400">${ep.week === 0 ? 'Preview' : `Week ${ep.week}`}</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-[#00f098]/20 text-[#00f098]' : 'bg-gray-800 text-gray-500'}">${isAvailable ? 'Available' : 'Upcoming'}</span>
      </div>
      <div>
        <h4 class="text-base font-extrabold text-white">${ep.title}</h4>
        <p class="text-xs text-[#f59e0b] font-semibold mt-1">${ep.guest}</p>
        <p class="text-[10px] text-gray-500">${ep.discipline} • ${ep.duration}</p>
      </div>
      <p class="text-xs text-gray-400 leading-relaxed flex-1">${ep.description}</p>
      <p class="text-[10px] text-gray-500">📍 ${ep.perthLocation}</p>
      <button data-episode-id="${ep.id}" class="w-full py-3 rounded-xl text-xs font-bold ${isAvailable ? 'bg-gray-900 hover:bg-[#00f098] text-white hover:text-black border border-gray-700 hover:border-[#00f098]' : 'bg-gray-900/50 text-gray-500 border border-gray-800 cursor-not-allowed'} transition-all flex items-center justify-center gap-2" ${!isAvailable ? 'disabled' : ''}>
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
        ${isAvailable ? (ep.audioUrl ? 'Listen Now' : 'Preview Episode') : 'Coming Soon'}
      </button>
    </article>
  `;
}

export function updateHeroProgress(stats) {
  const dayText = document.getElementById('heroDayText');
  const progressBar = document.getElementById('heroProgressBar');
  const heroKmText = document.getElementById('heroKmText');
  const heroRemainingText = document.getElementById('heroRemainingText');

  if (dayText) dayText.textContent = `Day ${stats.currentDay} of ${stats.totalDays} — ${formatKm(stats.distanceCoveredKm)} km logged`;
  if (progressBar) progressBar.style.width = `${Math.max(stats.progressPercent, 2)}%`;
  if (heroKmText) heroKmText.textContent = `${formatKm(stats.distanceCoveredKm)} KM`;
  if (heroRemainingText) heroRemainingText.textContent = `${formatKm(stats.remainingKm)} KM LEFT`;
}

export function updateImpactStats(stats) {
  const statKm = document.getElementById('statKm');
  const statDays = document.getElementById('statDays');
  const statFunds = document.getElementById('statFunds');

  if (statKm) statKm.textContent = `${formatKm(stats.distanceCoveredKm)} / ${stats.targetKm}`;
  if (statDays) statDays.textContent = `${stats.currentDay} / ${stats.totalDays}`;
  if (statFunds) statFunds.textContent = formatUsd(stats.fundsRaisedUsd);
}

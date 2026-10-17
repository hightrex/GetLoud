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

      <!-- Daily Run Cards Showcase -->
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-2xl font-extrabold text-white">Official Daily Run Logs & GPS Route Maps</h3>
            <p class="text-xs sm:text-sm text-gray-400">Click tabs to switch between extracted GPS route maps and Samsung Health proof</p>
          </div>
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold self-start sm:self-auto">
            <span class="w-2 h-2 rounded-full bg-[#00f098] animate-ping"></span>
            Verified Official Runs
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          ${runningLogs.map((log) => renderRunCard(log)).join('')}
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
  const hasPrevDay = log.gains !== undefined;
  const hasMap = !!log.mapCard;
  const metrics = [
    { label: 'Distance', value: `${log.distanceKm} km`, highlight: true },
    { label: 'Duration', value: log.duration },
    { label: 'Avg Pace', value: log.pace, sub: '/km', highlight: true },
    { label: 'Best Pace', value: log.fastestPace, sub: '/km' },
    { label: 'Avg Speed', value: `${log.avgSpeedKmh} km/h` },
    { label: 'Total Steps', value: log.steps.toLocaleString() },
    { label: 'Calories', value: `${log.calories} kcal` },
  ];

  return `
    <article data-run-card="${log.day}" class="run-card rounded-3xl glass-card border border-gray-800 hover:border-[#00f098]/40 transition-all overflow-hidden flex flex-col justify-between group">
      <div>
        <!-- Top Badge Header -->
        <div class="p-5 pb-3 flex items-center justify-between border-b border-gray-800/80">
          <div class="flex items-center gap-3">
            <span class="px-3.5 py-1 rounded-full ${log.day === 1 ? 'bg-[#00f098]/20 text-[#00f098] border border-[#00f098]/40' : log.day === 2 ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40' : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'} text-xs font-black uppercase font-mono tracking-wider">
              DAY ${log.day < 10 ? '0' + log.day : log.day}
            </span>
            <div>
              <p class="text-sm font-extrabold text-white">${log.dateLabel} • ${log.time}</p>
              <p class="text-[11px] text-gray-400">${log.fullDate}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xl font-extrabold text-[#00f098] font-mono">${log.distanceKm} KM</span>
            <span class="block text-[10px] uppercase font-bold text-gray-400">${log.routeType}</span>
          </div>
        </div>

        <!-- Interactive Visual Switcher & Frame -->
        <div class="p-5 pb-3 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">${hasMap ? 'Route Map & Proof' : 'Run Proof'}</span>
            <!-- View Mode Switcher (only shown if map exists) -->
            ${hasMap ? `
            <div class="inline-flex p-0.5 rounded-xl bg-gray-900 border border-gray-800">
              <button data-view-toggle data-day="${log.day}" data-view="map" class="px-3 py-1 rounded-lg text-[11px] font-extrabold bg-[#00f098] text-black shadow-md transition-all">
                🛰️ GPS Map
              </button>
              <button data-view-toggle data-day="${log.day}" data-view="proof" class="px-3 py-1 rounded-lg text-[11px] font-extrabold bg-gray-800/80 text-gray-400 hover:text-white transition-all">
                📱 Proof
              </button>
            </div>` : `
            <span class="px-2.5 py-1 rounded-lg bg-gray-900 text-[10px] text-gray-500 border border-gray-800">📱 Samsung Health</span>
            `}
          </div>

          <!-- Visual Display Container -->
          <div class="relative rounded-2xl overflow-hidden bg-gray-950/90 border border-gray-800 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center group/visual cursor-pointer" data-inspect-run="${log.day}" title="Click to inspect full route and telemetry">
            ${hasMap ? `
            <!-- GPS Map View -->
            <div data-card-visual="map" class="w-full h-full relative">
              <img src="${log.mapCard}" alt="Day ${log.day} extracted GPS route map" class="w-full h-full object-cover group-hover/visual:scale-105 transition-transform duration-500" loading="lazy" />
              <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm text-[10px] font-bold text-[#00f098] border border-[#00f098]/30 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#00f098] animate-ping"></span>
                Extracted GPS Trace
              </div>
            </div>` : ''}

            <!-- Samsung Health Proof View -->
            <div data-card-visual="proof" class="w-full h-full relative ${hasMap ? 'hidden' : ''}">
              <img src="${log.image}" alt="Day ${log.day} official Samsung Health run screenshot" class="w-full h-full object-contain p-2 group-hover/visual:scale-105 transition-transform duration-500" loading="lazy" />
              <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20">
                Samsung Health Card
              </div>
            </div>

            <!-- Hover overlay button -->
            <div class="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-bold text-gray-300 opacity-90 group-hover/visual:opacity-100 group-hover/visual:bg-[#00f098] group-hover/visual:text-black transition-all flex items-center gap-1 border border-white/10">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
              <span>Inspect</span>
            </div>
          </div>
        </div>

        <!-- Telemetry Metrics Grid -->
        <div class="px-5 pb-3">
          <div class="grid grid-cols-4 gap-2">
            ${metrics.map((m) => `
              <div class="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-center">
                <p class="text-[9px] uppercase font-bold text-gray-400 tracking-wider">${m.label}</p>
                <p class="text-xs sm:text-sm font-extrabold ${m.highlight ? 'text-[#00f098]' : 'text-white'} font-mono mt-0.5">
                  ${m.value}
                </p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Route Details & Notes -->
        <div class="px-5 pb-4 space-y-2.5">
          <div class="flex items-center gap-2 text-xs text-[#00f098] font-bold">
            <svg class="w-4 h-4 shrink-0 text-[#00f098]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${log.routeLocation}</span>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed">${log.routeDescription}</p>

          <div class="p-3 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300 italic">
            "${log.quote}"
          </div>

          ${hasPrevDay && log.gains ? `
            <div class="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#00f098]/10 to-transparent border border-amber-500/30 space-y-1">
              <div class="flex items-center gap-1.5 text-xs font-bold text-[#f59e0b]">
                <span>⚡ Day-over-Day Momentum Gain</span>
              </div>
              <div class="flex flex-wrap gap-2 text-[11px] font-mono text-gray-300">
                <span class="${log.gains.distanceDelta.startsWith('+') ? 'text-[#00f098]' : 'text-rose-400'} font-bold">${log.gains.distanceDelta}</span> •
                <span class="text-amber-400 font-bold">${log.gains.paceDelta}</span> •
                <span class="text-sky-400 font-bold">${log.gains.speedDelta}</span> •
                <span class="text-purple-400 font-bold">${log.gains.stepsDelta}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Footer Action -->
      <div class="p-5 pt-3 border-t border-gray-800/80 flex items-center justify-between">
        <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
          <svg class="w-3.5 h-3.5 text-[#00f098]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          Samsung Health Tracked
        </span>
        <button data-inspect-run="${log.day}" class="text-xs font-bold text-[#00f098] hover:text-white flex items-center gap-1 hover:underline transition-all">
          <span>Full Telemetry</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </article>
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

  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${products.map((product) => `
        <article class="product-card rounded-3xl glass-card border border-gray-800 overflow-hidden flex flex-col hover:border-[#00f098]/40 transition-all group">
          <div class="relative h-44 bg-gradient-to-br from-gray-900 via-[#0d1726] to-gray-900 flex items-center justify-center border-b border-gray-800">
            <div class="w-20 h-20 rounded-2xl bg-[#00f098]/10 border border-[#00f098]/30 flex items-center justify-center text-[#00f098] group-hover:scale-110 transition-transform">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            ${product.badge ? `<span class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">${product.badge}</span>` : ''}
            ${!product.inStock ? `<span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">Coming Soon</span>` : ''}
          </div>
          <div class="p-5 flex flex-col flex-1 space-y-3">
            <div>
              <span class="text-[10px] font-bold uppercase text-gray-500">${product.category}</span>
              <h4 class="text-base font-extrabold text-white mt-0.5">${product.name}</h4>
            </div>
            <p class="text-xs text-gray-400 leading-relaxed flex-1">${product.description}</p>
            <div class="flex items-center justify-between pt-2 border-t border-gray-800">
              <span class="text-lg font-extrabold text-[#00f098] font-mono">${product.priceLabel}</span>
              <button data-product-id="${product.id}" class="product-enquire-btn px-4 py-2 rounded-xl text-xs font-bold ${product.inStock ? 'bg-[#00f098]/10 text-[#00f098] border border-[#00f098]/30 hover:bg-[#00f098] hover:text-black' : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'} transition-all">
                ${product.inStock ? (product.shopUrl ? 'Shop Now' : 'Enquire') : 'Notify Me'}
              </button>
            </div>
          </div>
        </article>
      `).join('')}
    </div>
    <p class="text-center text-xs text-gray-500 mt-8 italic">${merchConfig.shopNote}</p>
  `;

  container.querySelectorAll('.product-enquire-btn').forEach((btn) => {
    const productId = btn.getAttribute('data-product-id');
    const product = products.find((p) => p.id === productId);
    if (product?.inStock && product?.shopUrl) {
      btn.addEventListener('click', () => window.open(product.shopUrl, '_blank'));
    } else if (product?.inStock) {
      btn.addEventListener('click', () => onEnquire?.(product));
    }
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

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        ${weeklyDonations.map((week) => renderDonationWeekCard(week)).join('')}
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

  container.innerHTML = `
    <div class="space-y-8">
      <div class="flex flex-wrap items-center gap-4 p-4 rounded-2xl glass-card border border-gray-800">
        <div class="flex-1 min-w-[200px]">
          <p class="text-sm font-extrabold text-white">${podcastConfig.seriesTitle}</p>
          <p class="text-xs text-gray-400">Hosted by ${podcastConfig.host} • ${podcastConfig.production}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          ${podcastConfig.platforms.map((p) => `
            <span class="px-3 py-1.5 rounded-lg text-[10px] font-bold ${p.url ? 'bg-[#00f098]/10 text-[#00f098] border border-[#00f098]/30 cursor-pointer hover:bg-[#00f098]/20' : 'bg-gray-900 text-gray-500 border border-gray-800'} transition-all" ${p.url ? `data-platform-url="${p.url}"` : ''}>
              ${p.name}${p.url ? '' : ' (Soon)'}
            </span>
          `).join('')}
        </div>
      </div>
      <p class="text-xs text-gray-500 italic text-center">${podcastConfig.subscribeNote}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${podcastEpisodes.map((ep) => renderPodcastCard(ep)).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-episode-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ep = podcastEpisodes.find((e) => e.id === btn.getAttribute('data-episode-id'));
      if (ep) onPlayEpisode?.(ep);
    });
  });

  container.querySelectorAll('[data-platform-url]').forEach((el) => {
    el.addEventListener('click', () => window.open(el.getAttribute('data-platform-url'), '_blank'));
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

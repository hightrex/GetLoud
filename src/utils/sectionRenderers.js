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

export function renderProgressTracker(container, stats) {
  if (!container) return;

  const { runningLogs, distanceCoveredKm, remainingKm, progressPercent, currentDay, totalDays, avgDistanceKm, totalCalories, totalSteps } = stats;

  container.innerHTML = `
    <div class="space-y-10">
      <!-- Hero Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl glass-card border border-[#00f098]/30 text-center space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Total Distance</p>
          <p class="text-3xl sm:text-4xl font-extrabold text-[#00f098] font-mono">${formatKm(distanceCoveredKm)}</p>
          <p class="text-xs text-gray-500">of ${stats.targetKm} km goal</p>
        </div>
        <div class="p-5 rounded-2xl glass-card border border-gray-800 text-center space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Remaining</p>
          <p class="text-3xl sm:text-4xl font-extrabold text-white font-mono">${formatKm(remainingKm)}</p>
          <p class="text-xs text-gray-500">km to go</p>
        </div>
        <div class="p-5 rounded-2xl glass-card border border-gray-800 text-center space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Days Completed</p>
          <p class="text-3xl sm:text-4xl font-extrabold text-white font-mono">${currentDay}<span class="text-lg text-gray-500">/${totalDays}</span></p>
          <p class="text-xs text-gray-500">consecutive days</p>
        </div>
        <div class="p-5 rounded-2xl glass-card border border-gray-800 text-center space-y-1">
          <p class="text-xs font-bold uppercase text-gray-400">Avg per Run</p>
          <p class="text-3xl sm:text-4xl font-extrabold text-[#f59e0b] font-mono">${formatKm(avgDistanceKm)}</p>
          <p class="text-xs text-gray-500">km / day</p>
        </div>
      </div>

      <!-- Main Progress Bar -->
      <div class="p-6 sm:p-8 rounded-3xl glass-card border border-[#00f098]/20 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-extrabold text-white">500 km Challenge Progress</h3>
          <span class="text-2xl font-extrabold text-[#00f098] font-mono">${progressPercent}%</span>
        </div>
        <div class="relative w-full h-5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <div class="progress-bar-fill h-full bg-gradient-to-r from-[#00f098] via-[#10b981] to-[#059669] rounded-full transition-all duration-1000 relative" style="width: ${progressPercent}%">
            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div class="flex justify-between text-xs font-mono text-gray-400">
          <span>0 km</span>
          <span class="text-[#00f098] font-bold">${formatKm(distanceCoveredKm)} km logged</span>
          <span>500 km</span>
        </div>
        ${totalCalories > 0 || totalSteps > 0 ? `
        <div class="flex flex-wrap gap-4 pt-2 border-t border-gray-800/80 text-xs text-gray-400">
          ${totalCalories > 0 ? `<span>🔥 ${totalCalories.toLocaleString()} kcal burned</span>` : ''}
          ${totalSteps > 0 ? `<span>👟 ${totalSteps.toLocaleString()} steps logged</span>` : ''}
          <span>📱 Tracked via Samsung Health</span>
        </div>` : ''}
      </div>

      <!-- Daily Run Cards -->
      <div>
        <h3 class="text-xl font-extrabold text-white mb-6">Daily Run Log</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          ${runningLogs.map((log) => renderRunCard(log)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderRunCard(log) {
  const stats = [
    log.duration && { label: 'Duration', value: log.duration },
    log.pace && { label: 'Pace', value: log.pace },
    log.avgSpeedKmh && { label: 'Avg Speed', value: `${log.avgSpeedKmh} km/h` },
    log.calories && { label: 'Calories', value: `${log.calories} kcal` },
    log.elevationM && { label: 'Elevation', value: `${log.elevationM} m` },
    log.steps && { label: 'Steps', value: log.steps.toLocaleString() },
    log.fastestPace && { label: 'Best Pace', value: log.fastestPace },
  ].filter(Boolean);

  return `
    <article class="run-card rounded-3xl glass-card border border-gray-800 overflow-hidden group hover:border-[#00f098]/40 transition-all">
      <div class="relative h-48 overflow-hidden bg-gray-900">
        <img src="${log.image}" alt="Day ${log.day} Samsung Health run — ${log.distanceKm} km" class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-xs font-bold text-[#00f098] border border-[#00f098]/30">
          Day ${log.day}
        </div>
        <div class="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-xs font-bold text-white">
          ${log.distanceKm} km
        </div>
      </div>
      <div class="p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-extrabold text-white">${log.dateLabel} • ${log.time}</p>
            <p class="text-[11px] text-gray-500">${log.source}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          ${stats.map((s) => `
            <div class="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-center">
              <p class="text-[10px] uppercase font-bold text-gray-500">${s.label}</p>
              <p class="text-sm font-bold text-white font-mono">${s.value}</p>
            </div>
          `).join('')}
        </div>
        ${log.note ? `<p class="text-[10px] text-amber-400/80 italic">${log.note}</p>` : ''}
      </div>
    </article>
  `;
}

export function renderAimAndGoal(container, stats) {
  if (!container) return;

  const { aim, goals, missionStatement, missionAuthor } = campaignGoals;

  const goalValues = {
    distance: `${formatKm(stats.distanceCoveredKm)} / 500 km`,
    days: `${stats.currentDay} / ${stats.totalDays} days`,
    funds: `${formatUsd(stats.fundsRaisedUsd)} / ${formatUsd(stats.targetFundsUsd)}`,
    collaborators: `${stats.confirmedCollaborators} / 14 guests`,
    podcasts: `${stats.publishedPodcasts} / ${stats.totalPodcastsPlanned} episodes`,
    counseling: `${Math.floor(stats.fundsRaisedUsd / 12)}+ / ${stats.counselingHoursGoal}+ hrs`,
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
                <span class="text-[10px] font-mono text-gray-500">Target: ${goal.target}</span>
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

  const totalRaised = stats.weeklyDonationTotal + stats.fundsRaisedUsd;
  const targetTotal = donationConfig.targetTotalUsd;
  const overallPercent = Math.min(100, Math.round((totalRaised / targetTotal) * 100));

  container.innerHTML = `
    <div class="space-y-8">
      <div class="p-6 sm:p-8 rounded-3xl glass-card border border-[#f59e0b]/20 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase text-gray-400">Total Raised</p>
            <p class="text-3xl sm:text-4xl font-extrabold text-[#f59e0b] font-mono">${formatUsd(totalRaised)}</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold uppercase text-gray-400">Goal</p>
            <p class="text-xl font-extrabold text-white font-mono">${formatUsd(targetTotal)}</p>
          </div>
        </div>
        <div class="relative w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <div class="h-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-full transition-all duration-1000" style="width: ${Math.max(overallPercent, 2)}%"></div>
        </div>
        <p class="text-xs text-gray-500">${overallPercent}% of fundraising goal • ${formatUsd(donationConfig.collaboratorFeeUsd)} per weekly collaborator slot</p>
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
  if (statFunds) statFunds.textContent = `${formatUsd(stats.fundsRaisedUsd)} / ${formatUsd(stats.targetFundsUsd)}`;
}

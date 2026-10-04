import { campaignConfig } from '../data/campaignState.js';
import { collaboratorsData } from '../data/collaborators.js';
import { runningLogs, GOAL_DISTANCE_KM, TOTAL_CHALLENGE_DAYS } from '../data/runningLogs.js';
import { weeklyDonations, donationConfig } from '../data/weeklyDonations.js';
import { podcastEpisodes } from '../data/podcasts.js';

export function getCalculatedCampaignStats() {
  const completedDays = runningLogs.length;
  const distanceCoveredKm = runningLogs.reduce((sum, log) => sum + log.distanceKm, 0);
  const remainingKm = Math.max(0, GOAL_DISTANCE_KM - distanceCoveredKm);
  const progressPercent = Math.min(100, Math.round((distanceCoveredKm / GOAL_DISTANCE_KM) * 100));
  const daysProgressPercent = Math.min(100, Math.round((completedDays / TOTAL_CHALLENGE_DAYS) * 100));

  const avgDistanceKm = completedDays > 0 ? distanceCoveredKm / completedDays : 0;
  const totalCalories = runningLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalSteps = runningLogs.reduce((sum, log) => sum + (log.steps || 0), 0);

  const completedWeeks = collaboratorsData.filter((c) => c.status === 'Completed').length;
  const confirmedCollaborators = collaboratorsData.filter((c) => c.isConfirmed).length;
  const openSlotsCount = collaboratorsData.length - confirmedCollaborators;

  const weeklyDonationTotal = weeklyDonations.reduce((sum, w) => sum + w.amountUsd, 0);
  const totalFundsUsd = campaignConfig.fundsRaisedUsd + weeklyDonationTotal + confirmedCollaborators * campaignConfig.collaboratorFeeUsd;

  const publishedPodcasts = podcastEpisodes.filter((ep) => ep.status === 'available').length;

  return {
    runnerName: campaignConfig.runnerName,
    runnerTitle: campaignConfig.runnerTitle,
    runnerLocation: campaignConfig.runnerLocation,
    productionHouse: campaignConfig.productionHouse,
    statusText: campaignConfig.statusText,
    bio: campaignConfig.bio,

    currentDay: completedDays,
    totalDays: TOTAL_CHALLENGE_DAYS,
    distanceCoveredKm: Math.round(distanceCoveredKm * 100) / 100,
    targetKm: GOAL_DISTANCE_KM,
    remainingKm: Math.round(remainingKm * 100) / 100,
    progressPercent,
    daysProgressPercent,

    avgDistanceKm: Math.round(avgDistanceKm * 100) / 100,
    totalCalories,
    totalSteps,
    runningLogs,

    fundsRaisedUsd: totalFundsUsd,
    weeklyDonationTotal,

    confirmedCollaborators,
    openSlotsCount,
    totalWeeks: 14,
    completedWeeks,

    publishedPodcasts,
    totalPodcastsPlanned: 14,
  };
}

export function formatKm(km) {
  return km.toFixed(2);
}

export function formatUsd(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

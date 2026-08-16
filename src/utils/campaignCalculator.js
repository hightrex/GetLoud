import { campaignConfig } from '../data/campaignState.js';
import { collaboratorsData } from '../data/collaborators.js';

export function getCalculatedCampaignStats() {
  const completedWeeks = collaboratorsData.filter(c => c.status === 'Completed').length;
  const activeWeek = collaboratorsData.find(c => c.status === 'Active');
  
  // Real calculation based on current state (0 completed weeks for pre-launch)
  const activeDaysPartial = activeWeek ? 1 : 0;
  const completedDays = Math.min(campaignConfig.targetDays, (completedWeeks * 7) + activeDaysPartial);
  
  const distanceCoveredKm = completedDays * campaignConfig.dailyDistanceKm;
  const targetKm = campaignConfig.targetDays * campaignConfig.dailyDistanceKm;
  const remainingKm = targetKm - distanceCoveredKm;
  
  const progressPercent = Math.min(100, Math.round((completedDays / campaignConfig.targetDays) * 100));
  
  // Calculate confirmed collaborators and total funds automatically
  const confirmedCollaborators = collaboratorsData.filter(c => c.isConfirmed).length;
  const openSlotsCount = collaboratorsData.length - confirmedCollaborators;
  
  // Real funds raised (0 for pre-launch, updates as collaborators & donors contribute)
  const totalFundsUsd = campaignConfig.fundsRaisedUsd + (confirmedCollaborators * campaignConfig.collaboratorFeeUsd);
  const fundsPercent = Math.min(100, Math.round((totalFundsUsd / campaignConfig.targetFundsUsd) * 100));
  
  // Target impact goals when $10,000 is reached
  const counselingHoursGoal = Math.floor(campaignConfig.targetFundsUsd / 12);
  const schoolWorkshopsGoal = Math.floor(campaignConfig.targetFundsUsd / 220);

  return {
    runnerName: campaignConfig.runnerName,
    runnerTitle: campaignConfig.runnerTitle,
    runnerLocation: campaignConfig.runnerLocation,
    productionHouse: campaignConfig.productionHouse,
    statusText: campaignConfig.statusText,
    bio: campaignConfig.bio,
    
    currentDay: completedDays,
    totalDays: campaignConfig.targetDays,
    distanceCoveredKm,
    targetKm,
    remainingKm,
    progressPercent,
    
    fundsRaisedUsd: totalFundsUsd,
    targetFundsUsd: campaignConfig.targetFundsUsd,
    fundsPercent,
    
    confirmedCollaborators,
    openSlotsCount,
    totalWeeks: 14,
    
    counselingHoursGoal,
    schoolWorkshopsGoal
  };
}

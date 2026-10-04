// CENTRAL CAMPAIGN STATE & CONFIGURATION

import { runningLogs, GOAL_DISTANCE_KM, TOTAL_CHALLENGE_DAYS } from './runningLogs.js';

export const campaignConfig = {
  runnerName: 'Karshang Ghising',
  runnerTitle: 'Singer, Songwriter & Frontman of Snowcoal',
  runnerLocation: 'Perth, Western Australia',
  productionHouse: 'Krash Productions',

  totalDays: TOTAL_CHALLENGE_DAYS,
  dailyDistanceKm: 5,
  targetDistanceKm: GOAL_DISTANCE_KM,
  fundsRaisedUsd: 0,
  collaboratorFeeUsd: 20,

  statusText: `Day ${runningLogs.length} of ${TOTAL_CHALLENGE_DAYS} — Campaign Live`,
  startDateText: 'Launched in Perth, WA',

  bio: 'Perth-based singer, songwriter, and frontman of Snowcoal, Karshang Ghising is running 5km+ every single day for 100 consecutive days across Perth WA. Supported by Krash Productions, Karshang is opening 14 weekly collaborator spots to get loud for mental health awareness.',

  perthRoutes: [
    'Swan River Foreshore & Elizabeth Quay',
    'Kings Park & Botanic Garden Trails',
    'Cottesloe Beach Sunset Loop',
    'Matagarup Bridge & Optus Stadium Reserve',
    'Scarborough Beach Coastal Path',
    'Heirisson Island & South Perth Esplanade',
  ],
};

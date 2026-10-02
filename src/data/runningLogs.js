import day1Image from '../assets/day1.jpeg';
import day2Image from '../assets/day2.jpeg';
import day1MapCard from '../assets/day1_map_card.png';
import day2MapCard from '../assets/day2_map_card.png';
import day1MapCrop from '../assets/day1_map.png';
import day2MapCrop from '../assets/day2_map.png';
import day1RouteSvg from '../assets/day1_route.svg';
import day2RouteSvg from '../assets/day2_route.svg';

/** Official Samsung Health run logs extracted from Karshang Ghising's verified runs */
export const runningLogs = [
  {
    day: 1,
    date: '2026-10-01',
    dateLabel: '1 Oct',
    fullDate: 'Thursday, 1 Oct 2026',
    time: '6:38 pm',
    distanceKm: 7.16,
    duration: '37:49',
    pace: "05'16\"",
    avgSpeedKmh: 11.3,
    fastestPace: "04'02\"",
    steps: 5843,
    cadenceSpm: 155,
    avgStrideM: 1.22,
    calories: 430,
    elevationM: null,
    routeType: 'Linear Trail',
    routeLocation: 'Perth Foreshore Trail, WA',
    routeDescription: 'Linear north-south stretch along Perth waterfront paths. Official Day 1 launch of the 100-day GetLoud challenge.',
    image: day1Image,
    mapCard: day1MapCard,
    mapCrop: day1MapCrop,
    routeSvg: day1RouteSvg,
    quote: 'Official Day 1 launch. First 7.16 km logged on Perth soil to break the silence around mental health.',
    source: 'Samsung Health',
    verified: true,
  },
  {
    day: 2,
    date: '2026-10-02',
    dateLabel: '2 Oct',
    fullDate: 'Friday, 2 Oct 2026',
    time: '5:42 pm',
    distanceKm: 7.68,
    duration: '39:18',
    pace: "05'06\"",
    avgSpeedKmh: 11.7,
    fastestPace: "04'04\"",
    steps: 6231,
    cadenceSpm: 159,
    avgStrideM: 1.23,
    calories: 465,
    elevationM: null,
    routeType: 'Parkland Loop Circuit',
    routeLocation: 'Perth Parks & Reserve Circuit, WA',
    routeDescription: 'Closed circuit loop through Perth parklands. Paced up by 10 sec/km faster than Day 1 with an extra +0.52 km logged.',
    image: day2Image,
    mapCard: day2MapCard,
    mapCrop: day2MapCrop,
    routeSvg: day2RouteSvg,
    quote: 'Day 2 complete. Pushed the pace to 05\'06" and logged 7.68 km around the circuit. 14.84 km in 48 hours!',
    source: 'Samsung Health',
    verified: true,
    gains: {
      distanceDelta: '+0.52 km',
      paceDelta: '-10s/km faster',
      speedDelta: '+0.4 km/h',
      stepsDelta: '+388 steps',
    },
  },
];

export const GOAL_DISTANCE_KM = 500;
export const TOTAL_CHALLENGE_DAYS = 100;

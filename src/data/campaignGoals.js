/** Campaign aim, vision, and measurable goals — update copy as the challenge evolves */
export const campaignGoals = {
  aim: {
    headline: 'Break the Silence. Run the Distance. Get Loud.',
    summary:
      'GetLoud is Karsang Ghising\'s 100-day endurance campaign — running every single day across Perth to turn physical discipline into a loud, visible statement for mental health awareness.',
    pillars: [
      {
        id: 'endurance',
        title: 'Daily Endurance',
        description:
          'Run 5km+ every day for 100 consecutive days — 500km total — without a single day off. Each run is logged on Samsung Health and shared publicly.',
        icon: 'run',
      },
      {
        id: 'community',
        title: 'Community & Collaboration',
        description:
          '14 weekly guest collaborators — musicians, artists, runners — join Karsang for a 5km run and co-host an unscripted mental health podcast episode.',
        icon: 'people',
      },
      {
        id: 'funding',
        title: 'Direct Crisis Funding',
        description:
          '100% of donations go to verified mental health partners funding 24/7 crisis helplines and free youth tele-counseling in Nepal.',
        icon: 'heart',
      },
    ],
  },
  goals: [
    {
      id: 'distance',
      label: 'Total Distance',
      target: '500 km',
      current: null, // calculated dynamically
      unit: 'km',
      description: '100 days × ~5km daily across Perth landmarks',
    },
    {
      id: 'days',
      label: 'Consecutive Days',
      target: '100 days',
      current: null,
      unit: 'days',
      description: 'No rest days — symbolizing persistence in mental health recovery',
    },
    {
      id: 'funds',
      label: 'Fundraising',
      target: '100% donated',
      current: null,
      unit: 'USD',
      description: 'Every donation goes directly to crisis helpline and mental health support.',
    },
    {
      id: 'collaborators',
      label: 'Weekly Collaborators',
      target: '14 guests',
      current: null,
      unit: 'guests',
      description: 'One creative collaborator per week for 14 weeks',
    },
    {
      id: 'podcasts',
      label: 'Podcast Episodes',
      target: '14 episodes',
      current: null,
      unit: 'episodes',
      description: 'Unscripted conversations on resilience, creativity & mental wellbeing',
    },
    {
      id: 'counseling',
      label: 'Counseling Hours Funded',
      target: 'Ongoing',
      current: null,
      unit: 'hrs',
      description: 'Free tele-counseling hours funded through donations.',
    },
  ],
  missionStatement:
    '"Every day we run is a day we break the silence surrounding mental health. This isn\'t just a fitness challenge — it\'s a movement from Perth to Nepal, powered by music, community, and courage."',
  missionAuthor: 'Karsang Ghising — Snowcoal / Krash Productions',
};

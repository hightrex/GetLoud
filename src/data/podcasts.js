/** Podcast episodes — fill in audioUrl and guest details as episodes are recorded */
export const podcastEpisodes = [
  {
    id: 'ep-preview',
    week: 0,
    title: 'GetLoud Perth — Campaign Preview',
    guest: 'Karsang Ghising (Solo Intro)',
    discipline: 'Founder / Snowcoal',
    duration: '8 min',
    status: 'available',
    description:
      'Karsang introduces the 100-day challenge, the mental health mission, and what collaborators can expect when they join a weekly run + podcast session in Perth.',
    audioUrl: null,
    spotifyUrl: null,
    appleUrl: null,
    youtubeUrl: null,
    publishedDate: null,
    perthLocation: 'Krash Productions Studio, Perth WA',
  },
  {
    id: 'ep-1',
    week: 1,
    title: 'Episode 1: Launching 100 Days in Perth',
    guest: 'Week 1 Collaborator — TBC',
    discipline: 'Launch Week Guest',
    duration: '25–30 min',
    status: 'upcoming',
    description:
      'Kick off Day 1 with a 5km sunrise loop around Kings Park. An unscripted conversation on music, endurance, and mental wellbeing.',
    audioUrl: null,
    spotifyUrl: null,
    appleUrl: null,
    youtubeUrl: null,
    publishedDate: null,
    perthLocation: 'Kings Park & Swan River Launch Loop',
  },
  {
    id: 'ep-2',
    week: 2,
    title: 'Episode 2: Pounding Pavement for Mental Health',
    guest: 'Week 2 Collaborator — TBC',
    discipline: 'Movement & Fitness',
    duration: '25–30 min',
    status: 'upcoming',
    description:
      'A 5km run across Matagarup Bridge exploring how physical movement helps reset the mind.',
    audioUrl: null,
    spotifyUrl: null,
    appleUrl: null,
    youtubeUrl: null,
    publishedDate: null,
    perthLocation: 'Matagarup Bridge & Optus Stadium',
  },
];

export const podcastConfig = {
  seriesTitle: 'GetLoud Podcast',
  host: 'Karsang Ghising',
  production: 'Krash Productions',
  totalEpisodesPlanned: 14,
  platforms: [
    { name: 'Spotify', url: null, icon: 'spotify' },
    { name: 'Apple Podcasts', url: null, icon: 'apple' },
    { name: 'YouTube', url: null, icon: 'youtube' },
  ],
  subscribeNote: 'Subscribe links coming soon — episodes release weekly as collaborators join the campaign.',
};

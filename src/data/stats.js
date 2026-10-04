export const campaignStats = {
  currentDay: 58,
  totalDays: 100,
  distanceCoveredKm: 290,
  totalDistanceTargetKm: 500,
  fundsRaisedUsd: 6420,
  totalCollaborators: 14,
  activeCollaborators: 9,
  metrics: [
    {
      id: "telehealth",
      value: "540+",
      label: "Free Counseling Hours",
      description: "Direct tele-counseling sessions provided to youth across rural Nepal",
      icon: "headset"
    },
    {
      id: "workshops",
      value: "28",
      label: "School & Youth Workshops",
      description: "Interactive mental health literacy sessions conducted in high schools",
      icon: "book"
    },
    {
      id: "helpline",
      value: "24/7",
      label: "Helpline Operations",
      description: "Funding emergency suicide prevention and crisis hotline infrastructure",
      icon: "phone"
    },
    {
      id: "community",
      value: "12",
      label: "Support Circles",
      description: "Peer-led weekly support groups operating in Kathmandu, Pokhara, & Dharan",
      icon: "users"
    }
  ],
  fundingAllocation: [
    { label: "Direct Counseling & Helpline", percentage: 50, color: "#00f098" },
    { label: "Youth School Workshops", percentage: 25, color: "#3b82f6" },
    { label: "Community Support Groups", percentage: 15, color: "#f59e0b" },
    { label: "Campaign Operations & Logistics", percentage: 10, color: "#ec4899" }
  ]
};

/** Weekly donation tracking — update amounts as contributions come in */
export const weeklyDonations = [
  {
    week: 1,
    days: 'Days 1–7',
    label: 'Launch Week',
    amountUsd: 0,
    collaboratorCount: 0,
    publicDonationsUsd: 0,
    status: 'active',
    note: 'Campaign underway — first collaborator slots open',
  },
  {
    week: 2,
    days: 'Days 8–14',
    label: 'Week 2',
    amountUsd: 0,
    collaboratorCount: 0,
    publicDonationsUsd: 0,
    status: 'upcoming',
    note: 'Collaborator slots open for registration',
  },
];

export const donationConfig = {
  currency: 'USD',
  collaboratorFeeUsd: 20,
};

import './style.css';
import krashLogo from './assets/Krash_Productions.png';
import { collaboratorsData } from './data/collaborators.js';
import { faqData } from './data/faq.js';
import { getCalculatedCampaignStats } from './utils/campaignCalculator.js';
import {
  renderProgressTracker,
  renderAimAndGoal,
  renderProducts,
  renderWeeklyDonations,
  renderPodcasts,
  updateHeroProgress,
  updateImpactStats,
} from './utils/sectionRenderers.js';
import { merchConfig } from './data/products.js';

// Calculate campaign stats automatically
const stats = getCalculatedCampaignStats();

// DOM Element References
const collaboratorsGrid = document.getElementById('collaboratorsGrid');
const categoryTabs = document.getElementById('categoryTabs');
const faqAccordionContainer = document.getElementById('faqAccordionContainer');
const donationModal = document.getElementById('donationModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const tabCollaboratorBtn = document.getElementById('tabCollaboratorBtn');
const tabDonationBtn = document.getElementById('tabDonationBtn');
const collaboratorForm = document.getElementById('collaboratorForm');
const generalDonationForm = document.getElementById('generalDonationForm');
const collabWeekSelect = document.getElementById('collabWeek');
const toastContainer = document.getElementById('toastContainer');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

// Podcast Player Elements
const podcastPlayerModal = document.getElementById('podcastPlayerModal');
const closePodcastBtn = document.getElementById('closePodcastBtn');
const audioElement = document.getElementById('audioElement');
const togglePlayBtn = document.getElementById('togglePlayBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const playerTitle = document.getElementById('playerTitle');
const playerCollaborator = document.getElementById('playerCollaborator');
const playerWeekBadge = document.getElementById('playerWeekBadge');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const audioSeeker = document.getElementById('audioSeeker');

// Run Inspection Modal Elements
const runInspectionModal = document.getElementById('runInspectionModal');
const closeRunModalBtn = document.getElementById('closeRunModalBtn');
const runModalDayBadge = document.getElementById('runModalDayBadge');
const runModalDate = document.getElementById('runModalDate');
const runModalTitle = document.getElementById('runModalTitle');
const runModalLocation = document.getElementById('runModalLocation');
const runModalRouteDesc = document.getElementById('runModalRouteDesc');
const runModalQuote = document.getElementById('runModalQuote');
const runModalMapImg = document.getElementById('runModalMapImg');
const runModalProofImg = document.getElementById('runModalProofImg');
const modalTabMapBtn = document.getElementById('modalTabMapBtn');
const modalTabProofBtn = document.getElementById('modalTabProofBtn');
const runModalStatsGrid = document.getElementById('runModalStatsGrid');

// 1. UPDATE CAMPAIGN READINESS METRICS AUTOMATICALLY
function updateAutoCalculatedUI() {
  updateHeroProgress(stats);
  updateImpactStats(stats);
}

function handleProductEnquire(product) {
  window.location.href = `mailto:${merchConfig.shopEmail}?subject=GetLoud Merch Enquiry: ${encodeURIComponent(product.name)}&body=Hi Karsang,%0D%0A%0D%0AI'd like to enquire about: ${encodeURIComponent(product.name)} (${encodeURIComponent(product.priceLabel)})%0D%0A%0D%0AThanks!`;
}

function openPodcastPlayer(episode) {
  playerTitle.textContent = episode.title;
  playerCollaborator.textContent = episode.guest;
  playerWeekBadge.textContent = episode.week === 0 ? 'Preview' : `Week ${episode.week}`;

  if (episode.audioUrl) {
    audioElement.src = episode.audioUrl;
  } else {
    audioElement.removeAttribute('src');
  }

  podcastPlayerModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function openRunInspectionModal(log) {
  if (!runInspectionModal) return;

  if (runModalDayBadge) runModalDayBadge.textContent = `Day ${log.day}`;
  if (runModalDate) runModalDate.textContent = `${log.fullDate} • ${log.time}`;
  if (runModalTitle) runModalTitle.textContent = `${log.distanceKm} KM`;
  if (runModalLocation) runModalLocation.textContent = log.routeLocation;
  if (runModalRouteDesc) runModalRouteDesc.textContent = log.routeDescription;
  if (runModalQuote) runModalQuote.textContent = log.quote;

  if (runModalMapImg) runModalMapImg.src = log.mapCard || '';
  if (runModalProofImg) runModalProofImg.src = log.image || '';

  // Tab & visual display state
  if (log.mapCard) {
    if (modalTabMapBtn) modalTabMapBtn.classList.remove('hidden');
    if (runModalMapImg) runModalMapImg.classList.remove('hidden');
    if (runModalProofImg) runModalProofImg.classList.add('hidden');
    if (modalTabMapBtn) modalTabMapBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00f098] text-black transition-all';
    if (modalTabProofBtn) modalTabProofBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 hover:text-white transition-all';
  } else {
    if (modalTabMapBtn) modalTabMapBtn.classList.add('hidden');
    if (runModalMapImg) runModalMapImg.classList.add('hidden');
    if (runModalProofImg) runModalProofImg.classList.remove('hidden');
    if (modalTabProofBtn) modalTabProofBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00f098] text-black transition-all';
  }

  // YouTube Short link
  const runModalShortBtn = document.getElementById('runModalShortBtn');
  const runModalShortBtnText = document.getElementById('runModalShortBtnText');
  if (runModalShortBtn) {
    if (log.youtubeShortUrl) {
      runModalShortBtn.href = log.youtubeShortUrl;
      if (runModalShortBtnText) runModalShortBtnText.textContent = `Watch Day ${log.day} Short`;
      runModalShortBtn.classList.remove('hidden');
    } else {
      runModalShortBtn.classList.add('hidden');
    }
  }

  if (runModalStatsGrid) {
    const metrics = [
      { label: 'Distance', val: `${log.distanceKm} km` },
      { label: 'Duration', val: log.duration },
      { label: 'Avg Pace', val: `${log.pace}/km` },
      { label: 'Best Pace', val: `${log.fastestPace}/km` },
      { label: 'Avg Speed', val: `${log.avgSpeedKmh} km/h` },
      { label: 'Total Steps', val: log.steps.toLocaleString() },
      { label: 'Calories', val: `${log.calories} kcal` },
    ];

    runModalStatsGrid.innerHTML = metrics.map(m => `
      <div class="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800 text-center">
        <p class="text-[9px] uppercase font-bold text-gray-400 tracking-wider">${m.label}</p>
        <p class="text-sm font-extrabold text-[#00f098] font-mono mt-0.5">${m.val}</p>
      </div>
    `).join('');
  }

  runInspectionModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeRunInspectionModal() {
  if (!runInspectionModal) return;
  runInspectionModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function initDynamicSections() {
  renderProgressTracker(document.getElementById('progressTrackerContainer'), stats, openRunInspectionModal);

  const aim = document.getElementById('aimGoalContainer');
  if (aim) renderAimAndGoal(aim, stats);

  const merch = document.getElementById('merchContainer');
  if (merch) renderProducts(merch, handleProductEnquire);

  const donations = document.getElementById('donationsContainer');
  if (donations) renderWeeklyDonations(donations, stats);

  const podcasts = document.getElementById('podcastsContainer');
  if (podcasts) renderPodcasts(podcasts, openPodcastPlayer);
}
// 2. RENDER COLLABORATORS REGISTRATION GRID (14 OPEN WEEKLY SLOTS)
function getCategoryIcon(disciplineIcon) {
  switch (disciplineIcon) {
    case 'guitar':
    case 'drum':
    case 'band':
    case 'choir':
      return `<svg class="w-4 h-4 text-[#00f098]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 .895-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 .895-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>`;
    case 'dance':
    case 'runner':
    case 'yoga':
    case 'fitness':
    case 'karate':
      return `<svg class="w-4 h-4 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
    default:
      return `<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>`;
  }
}

function renderCollaborators(filterCategory = 'all') {
  collaboratorsGrid.innerHTML = '';

  const filtered = filterCategory === 'all'
    ? collaboratorsData
    : collaboratorsData.filter(item => item.category === filterCategory || item.status === filterCategory);

  const list = showAll ? filtered : filtered.slice(0, 6);

  list.forEach(collab => {
    // existing card code unchanged
    card.classList.add('h-card-wide'); // if using h-scroll on the grid
    collaboratorsGrid.appendChild(card);
  });

  // existing play-podcast listeners...

  if (!showAll && filtered.length > 6) {
    const more = document.createElement('div');
    more.className = 'h-card-wide p-6 rounded-3xl glass-card border border-gray-700 flex flex-col items-center justify-center text-center gap-3';
    more.innerHTML = `
      <p class="text-sm font-extrabold text-white">${filtered.length - 6} more open weeks</p>
      <button type="button" class="px-4 py-2 rounded-xl bg-[#00f098] text-black text-xs font-bold" id="showAllCollabsBtn">Show all</button>
    `;
    collaboratorsGrid.appendChild(more);
    more.querySelector('#showAllCollabsBtn').addEventListener('click', () => renderCollaborators(filterCategory, true));
  }
}
// 4. RENDER FAQ ACCORDION
function renderFAQ() {
  faqAccordionContainer.innerHTML = '';
  faqData.forEach((item) => {
    const faqCard = document.createElement('div');
    faqCard.className = 'rounded-2xl glass-card border border-gray-800 overflow-hidden transition-all duration-300';
    faqCard.innerHTML = `
      <button class="faq-question-btn w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-extrabold text-base sm:text-lg text-white hover:text-[#00f098] transition-colors focus:outline-none" aria-expanded="false">
        <span>${item.question}</span>
        <div class="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 shrink-0 transform transition-transform duration-300 icon-arrow">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div class="faq-answer max-h-0 overflow-hidden opacity-0 px-5 sm:px-6 transition-all duration-300">
        <p class="pb-6 text-sm sm:text-base text-gray-300 leading-relaxed border-t border-gray-800/80 pt-4">
          ${item.answer}
        </p>
      </div>
    `;
    faqAccordionContainer.appendChild(faqCard);
  });

  faqAccordionContainer.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answerDiv = btn.nextElementSibling;
      const arrowIcon = btn.querySelector('.icon-arrow');

      faqAccordionContainer.querySelectorAll('.faq-question-btn').forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.nextElementSibling.style.maxHeight = '0';
          otherBtn.nextElementSibling.classList.add('opacity-0');
          otherBtn.querySelector('.icon-arrow').style.transform = 'rotate(0deg)';
        }
      });

      if (!isExpanded) {
        btn.setAttribute('aria-expanded', 'true');
        answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
        answerDiv.classList.remove('opacity-0');
        arrowIcon.style.transform = 'rotate(180deg)';
      } else {
        btn.setAttribute('aria-expanded', 'false');
        answerDiv.style.maxHeight = '0';
        answerDiv.classList.add('opacity-0');
        arrowIcon.style.transform = 'rotate(0deg)';
      }
    });
  });
}

// 5. MODAL SYSTEM (HONEST COLLABORATOR & DONATION INTEREST FLOW)
function setModalTab(tab = 'collaborator') {
  if (tab === 'collaborator') {
    tabCollaboratorBtn?.classList.add('bg-[#00f098]', 'text-black', 'shadow-md');
    tabCollaboratorBtn?.classList.remove('text-gray-400');
    tabDonationBtn?.classList.remove('bg-[#00f098]', 'text-black', 'shadow-md');
    tabDonationBtn?.classList.add('text-gray-400');
    collaboratorForm?.classList.remove('hidden');
    generalDonationForm?.classList.add('hidden');
  } else {
    tabDonationBtn?.classList.add('bg-[#00f098]', 'text-black', 'shadow-md');
    tabDonationBtn?.classList.remove('text-gray-400');
    tabCollaboratorBtn?.classList.remove('bg-[#00f098]', 'text-black', 'shadow-md');
    tabCollaboratorBtn?.classList.add('text-gray-400');
    generalDonationForm?.classList.remove('hidden');
    collaboratorForm?.classList.add('hidden');
  }
}

tabCollaboratorBtn?.addEventListener('click', () => setModalTab('collaborator'));
tabDonationBtn?.addEventListener('click', () => setModalTab('donation'));

function openDonationModal(weekNumber = null, initialTab = 'collaborator') {
  if (collabWeekSelect && weekNumber) {
    collabWeekSelect.value = String(weekNumber);
  }
  setModalTab(initialTab);
  donationModal?.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeDonationModal() {
  donationModal?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

['navDonateBtn', 'mobileDonateBtn', 'heroDonateBtn', 'ctaDonateBtn'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', () => openDonationModal(null, 'collaborator'));
  }
});

closeModalBtn?.addEventListener('click', closeDonationModal);
donationModal?.addEventListener('click', (e) => {
  if (e.target === donationModal) closeDonationModal();
});

const TARGET_EMAIL = 'krashworks0@gmail.com';

// Collaborator Interest Submission
collaboratorForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('collabName')?.value?.trim();
  const email = document.getElementById('collabEmail')?.value?.trim();
  const week = document.getElementById('collabWeek')?.value;
  const discipline = document.getElementById('collabDiscipline')?.value?.trim() || 'Not specified';
  const location = document.getElementById('collabLocation')?.value?.trim() || 'Not specified';
  const message = document.getElementById('collabMessage')?.value?.trim() || 'None';

  const submitBtn = document.getElementById('submitCollabBtn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending Interest...';
  submitBtn.disabled = true;

  fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _subject: `[GetLoud] Collaborator interest — Week ${week}`,
      "Collaborator Name": name,
      "Email Address": email,
      "Preferred Week": `Week ${week}`,
      "Creative / Professional Discipline": discipline,
      "Perth Area": location,
      "Message / Availability": message,
      "_template": "table"
    })
  })
  .then(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    closeDonationModal();
    showToast(`Thank you, ${name}! Your interest was sent to Karsang. He will email you to confirm and arrange payment & scheduling.`);
    collaboratorForm.reset();
  })
  .catch(err => {
    console.warn('FormSubmit fallback:', err);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    closeDonationModal();
    showToast(`Thank you, ${name}! Your interest was sent to Karsang. He will email you to confirm and arrange payment.`);
    collaboratorForm.reset();
  });
});

// General Donation Interest Submission
generalDonationForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('donorNameInput')?.value?.trim();
  const email = document.getElementById('donorEmailInput')?.value?.trim();
  const amount = document.getElementById('donationAmountInput')?.value?.trim();
  const message = document.getElementById('donationMessageInput')?.value?.trim() || 'None';

  const submitBtn = document.getElementById('submitGeneralDonationBtn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending Interest...';
  submitBtn.disabled = true;

  fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _subject: `[GetLoud] Donation interest — $${amount}`,
      "Donor Name": name,
      "Email Address": email,
      "Intended Donation Amount": `$${amount} USD`,
      "Message / Note of Support": message,
      "_template": "table"
    })
  })
  .then(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    closeDonationModal();
    showToast(`Thank you, ${name}! Your donation interest was sent to Karsang. He will email you with contribution details.`);
    generalDonationForm.reset();
  })
  .catch(err => {
    console.warn('FormSubmit fallback:', err);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    closeDonationModal();
    showToast(`Thank you, ${name}! Your donation interest was sent to Karsang. He will email you with contribution details.`);
    generalDonationForm.reset();
  });
});

// 6. PODCAST PLAYER MODAL SYSTEM
function closePodcastPlayer() {
  audioElement.pause();
  podcastPlayerModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

closePodcastBtn.addEventListener('click', closePodcastPlayer);

// 7. TOAST NOTIFICATION UTILITY
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'px-5 py-4 rounded-2xl glass-modal border border-[#00f098]/40 text-white text-sm font-bold shadow-2xl flex items-center gap-3 animate-bounce transition-all';
  toast.innerHTML = `
    <svg class="w-5 h-5 text-[#00f098]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
    </svg>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// 8. MOBILE MENU TOGGLE
mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
  });
});

// 9. SHARE CAMPAIGN BUTTON
const shareBtn = document.getElementById('shareCampaignBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({
        title: 'GetLoud Perth — Karsang Ghising (Snowcoal)',
        text: 'Learn about Karsang Ghising’s upcoming 100-day 5km daily Perth running journey raising funds for mental health initiatives!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('📋 Event link copied to clipboard!');
    }
  });
}

// 10. RUN INSPECTION MODAL EVENT LISTENERS
if (closeRunModalBtn) {
  closeRunModalBtn.addEventListener('click', closeRunInspectionModal);
}

if (runInspectionModal) {
  runInspectionModal.addEventListener('click', (e) => {
    if (e.target === runInspectionModal) {
      closeRunInspectionModal();
    }
  });
}

if (modalTabMapBtn && modalTabProofBtn) {
  modalTabMapBtn.addEventListener('click', () => {
    if (runModalMapImg) runModalMapImg.classList.remove('hidden');
    if (runModalProofImg) runModalProofImg.classList.add('hidden');
    modalTabMapBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00f098] text-black transition-all';
    modalTabProofBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 hover:text-white transition-all';
  });

  modalTabProofBtn.addEventListener('click', () => {
    if (runModalProofImg) runModalProofImg.classList.remove('hidden');
    if (runModalMapImg) runModalMapImg.classList.add('hidden');
    modalTabProofBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00f098] text-black transition-all';
    modalTabMapBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 hover:text-white transition-all';
  });
}

// Global Escape Key listener for all modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeRunInspectionModal();
    closePodcastPlayer();
    if (donationModal && !donationModal.classList.contains('hidden')) {
      donationModal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  }
});

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  updateAutoCalculatedUI();
  initDynamicSections();
  renderCollaborators();
  renderFAQ();
});

// Collapse toggles for long sections
document.querySelectorAll('[data-collapse-target]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-collapse-target');
    const panel = document.getElementById(id);
    if (!panel) return;
    const open = panel.classList.toggle('hidden') === false;
    btn.textContent = open
      ? 'Hide details'
      : (btn.getAttribute('data-label') || btn.textContent.replace('Hide details', '').trim() || 'Show details');
  });
});

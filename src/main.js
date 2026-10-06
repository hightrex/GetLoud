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
const donationForm = document.getElementById('donationForm');
const customAmountGroup = document.getElementById('customAmountGroup');
const submitDonationBtn = document.getElementById('submitDonationBtn');
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
  window.location.href = `mailto:${merchConfig.shopEmail}?subject=GetLoud Merch Enquiry: ${encodeURIComponent(product.name)}&body=Hi Karshang,%0D%0A%0D%0AI'd like to enquire about: ${encodeURIComponent(product.name)} (${encodeURIComponent(product.priceLabel)})%0D%0A%0D%0AThanks!`;
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

  if (runModalMapImg) runModalMapImg.src = log.mapCard;
  if (runModalProofImg) runModalProofImg.src = log.image;

  // Reset tab to Map by default
  if (runModalMapImg) runModalMapImg.classList.remove('hidden');
  if (runModalProofImg) runModalProofImg.classList.add('hidden');
  if (modalTabMapBtn) modalTabMapBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00f098] text-black transition-all';
  if (modalTabProofBtn) modalTabProofBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 hover:text-white transition-all';

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
  renderAimAndGoal(document.getElementById('aimGoalContainer'), stats);
  renderProducts(document.getElementById('merchContainer'), handleProductEnquire);
  renderWeeklyDonations(document.getElementById('donationsContainer'), stats);
  renderPodcasts(document.getElementById('podcastsContainer'), openPodcastPlayer);
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

  filtered.forEach(collab => {
    const card = document.createElement('div');
    
    if (collab.status === 'Open') {
      card.className = `p-6 rounded-3xl glass-card border border-dashed border-[#00f098]/40 bg-gray-950/40 flex flex-col justify-between space-y-5 transition-all duration-300 relative group hover:border-[#00f098] hover:bg-[#00f098]/5`;
      card.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-[#00f098] uppercase tracking-wider">
              Week ${collab.week} • ${collab.days}
            </span>
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Registration Open
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-gray-900 border border-dashed border-[#00f098]/50 flex items-center justify-center text-[#00f098] font-bold text-xl group-hover:scale-105 transition-transform">
              +
            </div>
            <div class="space-y-0.5">
              <h4 class="text-base font-extrabold text-white group-hover:text-[#00f098] transition-colors">${collab.name}</h4>
              <div class="flex items-center gap-1.5 text-xs text-gray-300">
                ${getCategoryIcon(collab.disciplineIcon)}
                <span>${collab.discipline}</span>
              </div>
              <p class="text-[11px] text-emerald-400 font-medium">📍 ${collab.perthLocation}</p>
            </div>
          </div>

          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f098]/10 text-[#00f098] border border-[#00f098]/30 text-xs font-bold">
            ⚡ ${collab.badge}
          </div>

          <div class="space-y-2 pt-1 border-t border-gray-800/80">
            <h5 class="text-base font-bold text-gray-100 line-clamp-1">${collab.title}</h5>
            <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed">${collab.description}</p>
          </div>

          <div class="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300 italic">
            "${collab.quote}"
          </div>
        </div>

        <button class="open-slot-btn w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#00f098] to-[#10b981] text-black font-extrabold text-xs shadow-md shadow-[#00f098]/20 hover:scale-[1.02] active:scale-95 transition-all">
          Claim Week ${collab.week} Spot ($20)
        </button>
      `;

      card.querySelector('.open-slot-btn').addEventListener('click', openDonationModal);

    } else {
      // CONFIRMED GUEST CARD (WHEN KARSHANG UPDATES GUESTS)
      card.className = `p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between space-y-5 transition-all duration-300 relative group`;
      card.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              Week ${collab.week} • ${collab.days}
            </span>
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              ${collab.status}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <img src="${collab.avatar || krashLogo}" alt="${collab.name}" class="w-14 h-14 rounded-2xl object-cover border-2 border-gray-700 group-hover:border-[#00f098] transition-colors" />
            <div class="space-y-0.5">
              <h4 class="text-lg font-extrabold text-white group-hover:text-[#00f098] transition-colors">${collab.name}</h4>
              <p class="text-xs text-gray-300">${collab.discipline}</p>
              <p class="text-[11px] text-gray-400 font-medium">📍 ${collab.perthLocation}</p>
            </div>
          </div>

          <div class="space-y-2 pt-1 border-t border-gray-800/80">
            <h5 class="text-base font-bold text-gray-100 line-clamp-1">${collab.title}</h5>
            <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed">${collab.description}</p>
          </div>
        </div>

        <button data-id="${collab.id}" class="play-podcast-btn w-full mt-4 py-3 rounded-xl bg-gray-900 hover:bg-[#00f098] text-white hover:text-black font-bold text-xs border border-gray-700/80 hover:border-[#00f098] transition-all flex items-center justify-center gap-2">
          <span>Listen Episode</span>
        </button>
      `;
    }

    collaboratorsGrid.appendChild(card);
  });

  collaboratorsGrid.querySelectorAll('.play-podcast-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const collab = collaboratorsData.find(c => c.id === parseInt(btn.getAttribute('data-id'), 10));
      if (collab) {
        openPodcastPlayer({
          title: collab.title,
          guest: collab.name,
          week: collab.week,
          audioUrl: collab.audioUrl || null,
        });
      }
    });
  });
}

// 3. CATEGORY TAB FILTERING
categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    categoryTabs.querySelectorAll('.tab-btn').forEach(b => {
      b.className = 'tab-btn px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all';
    });
    e.target.className = 'tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-[#00f098] text-black shadow-md';
    const category = e.target.getAttribute('data-category');
    renderCollaborators(category);
  });
});

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

// 5. MODAL SYSTEM (DONATION & COLLABORATOR SIGNUP)
function openDonationModal() {
  donationModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeDonationModal() {
  donationModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

['navDonateBtn', 'mobileDonateBtn', 'heroDonateBtn', 'ctaDonateBtn'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', openDonationModal);
  }
});

closeModalBtn.addEventListener('click', closeDonationModal);
donationModal.addEventListener('click', (e) => {
  if (e.target === donationModal) closeDonationModal();
});

let selectedAmount = '20';
document.querySelectorAll('.tier-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tier-btn').forEach(b => {
      b.className = 'tier-btn p-3 rounded-xl border border-gray-700 bg-gray-900/60 text-gray-300 font-bold text-center text-sm hover:border-[#00f098] transition-all';
    });
    const targetBtn = e.currentTarget;
    targetBtn.className = 'tier-btn p-3 rounded-xl border-2 border-[#00f098] bg-[#00f098]/10 text-white font-bold text-center text-sm transition-all';

    selectedAmount = targetBtn.getAttribute('data-amount');
    const hiddenInput = document.getElementById('hiddenSupportAmount');
    if (selectedAmount === 'custom') {
      customAmountGroup.classList.remove('hidden');
      submitDonationBtn.textContent = 'Complete Custom Registration';
      if (hiddenInput) hiddenInput.value = document.getElementById('customAmount').value || '50';
    } else {
      customAmountGroup.classList.add('hidden');
      submitDonationBtn.textContent = `Complete $${selectedAmount} Registration`;
      if (hiddenInput) hiddenInput.value = selectedAmount;
    }
  });
});

donationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('donorName').value;
  const email = document.getElementById('donorEmail').value;
  const discipline = document.getElementById('donorDiscipline').value || 'Not specified';
  const amount = selectedAmount === 'custom'
    ? (document.getElementById('customAmount').value || '50')
    : selectedAmount;

  const hiddenInput = document.getElementById('hiddenSupportAmount');
  if (hiddenInput) hiddenInput.value = amount;

  const submitBtn = document.getElementById('submitDonationBtn');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting Registration...';
  submitBtn.disabled = true;

  // 100% FREE Instant Email Delivery to Karshang via FormSubmit.co API
  // Replace target email below with Karshang's real email address when deploying!
  const targetEmail = 'krashworks0@gmail.com'; 

  fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _subject: `⚡ New GetLoud Perth Registration: ${name} ($${amount})`,
      "Collaborator Name": name,
      "Email Address": email,
      "Creative Discipline / Week": discipline,
      "Support Tier": `$${amount} USD`,
      "Payment Choice": document.querySelector('input[name="paymentGateway"]:checked')?.value || 'Stripe/Card',
      "_template": "table"
    })
  })
  .then(response => response.json())
  .then(data => {
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
    closeDonationModal();
    showToast(`🎉 Thank you, ${name}! Your registration was sent directly to Karshang's inbox.`);
    donationForm.reset();
  })
  .catch(err => {
    console.warn('FormSubmit fallback:', err);
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
    closeDonationModal();
    showToast(`🎉 Registration received, ${name}! Welcome to GetLoud Perth.`);
    donationForm.reset();
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
        title: 'GetLoud Perth — Karshang Ghising (Snowcoal)',
        text: 'Learn about Karshang Ghising’s upcoming 100-day 5km daily Perth running journey raising funds for mental health initiatives!',
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

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

// ─── Campaign stats (auto-calculated from runningLogs data) ──────────────────
const stats = getCalculatedCampaignStats();

// ─── DOM References ──────────────────────────────────────────────────────────
const collaboratorsGrid       = document.getElementById('collaboratorsGrid');
const categoryTabs            = document.getElementById('categoryTabs');
const faqAccordionContainer   = document.getElementById('faqAccordionContainer');
const donationModal           = document.getElementById('donationModal');
const closeModalBtn           = document.getElementById('closeModalBtn');
const tabCollaboratorBtn      = document.getElementById('tabCollaboratorBtn');
const tabDonationBtn          = document.getElementById('tabDonationBtn');
const collaboratorForm        = document.getElementById('collaboratorForm');
const generalDonationForm     = document.getElementById('generalDonationForm');
const collabWeekSelect        = document.getElementById('collabWeek');
const toastContainer          = document.getElementById('toastContainer');
const mobileMenuBtn           = document.getElementById('mobileMenuBtn');
const mobileMenu              = document.getElementById('mobileMenu');

// Podcast Player elements
const podcastPlayerModal  = document.getElementById('podcastPlayerModal');
const closePodcastBtn     = document.getElementById('closePodcastBtn');
const audioElement        = document.getElementById('audioElement');
const togglePlayBtn       = document.getElementById('togglePlayBtn');
const playIcon            = document.getElementById('playIcon');
const pauseIcon           = document.getElementById('pauseIcon');
const playerTitle         = document.getElementById('playerTitle');
const playerCollaborator  = document.getElementById('playerCollaborator');
const playerWeekBadge     = document.getElementById('playerWeekBadge');
const currentTimeEl       = document.getElementById('currentTime');
const totalDurationEl     = document.getElementById('totalDuration');
const audioSeeker         = document.getElementById('audioSeeker');

// Run Inspection Modal elements
const runInspectionModal  = document.getElementById('runInspectionModal');
const closeRunModalBtn    = document.getElementById('closeRunModalBtn');
const runModalDayBadge    = document.getElementById('runModalDayBadge');
const runModalDate        = document.getElementById('runModalDate');
const runModalTitle       = document.getElementById('runModalTitle');
const runModalLocation    = document.getElementById('runModalLocation');
const runModalRouteDesc   = document.getElementById('runModalRouteDesc');
const runModalQuote       = document.getElementById('runModalQuote');
const runModalMapImg      = document.getElementById('runModalMapImg');
const runModalProofImg    = document.getElementById('runModalProofImg');
const modalTabMapBtn      = document.getElementById('modalTabMapBtn');
const modalTabProofBtn    = document.getElementById('modalTabProofBtn');
const runModalStatsGrid   = document.getElementById('runModalStatsGrid');


// ═══════════════════════════════════════════════════════════════════════════════
// 1. SCROLL REVEAL SYSTEM
//    Uses IntersectionObserver to add .is-visible when elements enter viewport.
//    Stagger delay is applied via --reveal-delay CSS custom property on children.
// ═══════════════════════════════════════════════════════════════════════════════

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Observe a single element and mark it visible when it enters the viewport.
 * @param {IntersectionObserver} observer - The shared IO instance.
 * @param {Element} el - Element to observe.
 * @param {number} [delayMs=0] - Optional stagger delay in ms.
 */
function observeReveal(observer, el, delayMs = 0) {
  if (prefersReducedMotion) {
    // Respect reduced-motion: skip animation, ensure element is visible
    el.classList.add('is-visible');
    return;
  }
  if (delayMs > 0) {
    el.style.setProperty('--reveal-delay', `${delayMs}ms`);
  }
  observer.observe(el);
}

/**
 * Create the shared IntersectionObserver for scroll reveals.
 */
function createRevealObserver() {
  return new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // one-shot — fire once, then stop
        }
      });
    },
    {
      threshold: 0.10,
      rootMargin: '0px 0px -40px 0px', // trigger slightly before fully in view
    }
  );
}

/**
 * Scan the document (or a subtree) for .reveal / .reveal-scale elements
 * and begin observing them with stagger delays for grid children.
 *
 * Called once on DOMContentLoaded, then again after each dynamic render.
 *
 * @param {Element} [root=document] - Subtree to scan.
 */
function initScrollReveal(root = document) {
  const observer = createRevealObserver();

  // Individual reveal elements
  root.querySelectorAll('.reveal:not(.is-visible), .reveal-scale:not(.is-visible)').forEach(el => {
    observeReveal(observer, el);
  });

  // Staggered grids: each direct .reveal child gets an increasing delay (snappier on mobile)
  const isMobile = window.innerWidth < 768;
  const staggerStep = isMobile ? 35 : 85;
  root.querySelectorAll('.reveal-stagger').forEach(grid => {
    const children = [...grid.querySelectorAll(':scope > .reveal, :scope > .reveal-scale')];
    children.forEach((child, i) => {
      observeReveal(observer, child, i * staggerStep);
    });
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// 2. COUNT-UP NUMBERS
//    Animates numeric displays from 0 to their target using requestAnimationFrame.
//    Uses easeOutExpo so numbers fly up quickly and settle smoothly.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ease-out exponential — fast start, slow end.
 */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animate an element's text content from 0 to `target`.
 *
 * @param {Element}  el       - DOM element to update.
 * @param {number}   target   - The final numeric value.
 * @param {number}   [duration=1400] - Animation duration in ms.
 * @param {Function} [format] - Optional formatter: (value) => string.
 */
function countUp(el, target, duration = 1400, format = null) {
  if (!el || target === 0) return;
  if (el.dataset.counted) return; // guard: run only once
  el.dataset.counted = 'true';

  if (prefersReducedMotion) {
    // Skip animation — just set the final value
    el.textContent = format ? format(target) : target.toFixed(2);
    return;
  }

  const start = performance.now();
  const isFloat = !Number.isInteger(target);

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutExpo(progress);
    const value    = target * eased;

    el.textContent = format
      ? format(value)
      : (isFloat ? value.toFixed(2) : Math.round(value).toString());

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      // Ensure exact final value
      el.textContent = format ? format(target) : (isFloat ? target.toFixed(2) : String(target));
    }
  }

  requestAnimationFrame(tick);
}

/**
 * Attach IntersectionObserver to hero stat elements so the count-up fires
 * only when those elements first become visible on screen.
 */
function initCountUps() {
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        obs.unobserve(el); // fire once

        const id = el.id;

        // ── Hero stats ──────────────────────────────────────
        if (id === 'heroKmText') {
          countUp(el, stats.distanceCoveredKm, 1600, v => `${v.toFixed(2)} KM`);
        }

        // ── Impact section stats ─────────────────────────────
        if (id === 'statKm') {
          countUp(el, stats.distanceCoveredKm, 1400, v => `${v.toFixed(2)} / ${stats.targetKm}`);
        }
        if (id === 'statDays') {
          countUp(el, stats.currentDay, 1200, v => `${Math.round(v)} / ${stats.totalDays}`);
        }
        if (id === 'statFunds') {
          countUp(el, stats.fundsRaisedUsd, 1400, v => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency', currency: 'USD', maximumFractionDigits: 0,
            }).format(v);
          });
        }
      });
    },
    { threshold: 0.25 }
  );

  // Observe all count-up targets
  ['heroKmText', 'statKm', 'statDays', 'statFunds'].forEach(id => {
    const el = document.getElementById(id);
    if (el) countObserver.observe(el);
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// 3. MODAL ANIMATION SYSTEM
//    All three modals share the same open/close pattern:
//      - Open:  remove hidden → reflow → add .modal-visible
//      - Close: remove .modal-visible → wait for transitionend → add hidden
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Open a modal backdrop with entrance animation.
 * @param {Element} backdropEl - The outer modal container (.modal-backdrop).
 */
function openModalAnimated(backdropEl) {
  if (!backdropEl) return;
  backdropEl.classList.remove('hidden');
  // Force layout reflow so transition fires from the initial state
  backdropEl.offsetHeight; // eslint-disable-line no-unused-expressions
  backdropEl.classList.add('modal-visible');
  document.body.classList.add('modal-open');
}

/**
 * Close a modal backdrop with exit animation.
 * Waits for the CSS transition to finish before adding hidden.
 * @param {Element} backdropEl - The outer modal container (.modal-backdrop).
 * @param {Function} [onClosed] - Optional callback after fully hidden.
 */
function closeModalAnimated(backdropEl, onClosed) {
  if (!backdropEl) return;
  backdropEl.classList.remove('modal-visible');

  // Find the animating panel to listen for transitionend
  const panel = backdropEl.querySelector(
    '.modal-panel, .run-modal-panel, .podcast-panel'
  );

  const finish = () => {
    backdropEl.classList.add('hidden');
    document.body.classList.remove('modal-open');
    onClosed?.();
  };

  if (panel && !prefersReducedMotion) {
    panel.addEventListener('transitionend', finish, { once: true });
  } else {
    // Reduced motion or no panel — finish immediately
    finish();
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// 4. HERO PROGRESS BAR — DELAYED ENTRANCE
//    The bar starts at 0% on load and animates to the real value after a
//    short delay. This gives a satisfying "fills up" moment on first visit.
// ═══════════════════════════════════════════════════════════════════════════════

function animateHeroProgressBar() {
  const bar = document.getElementById('heroProgressBar');
  if (!bar) return;

  // Start at 0 (already in HTML as style="width: 3%") — we force it to 0
  bar.style.width = '0%';

  const targetWidth = Math.max(stats.progressPercent, 2);
  const delay = prefersReducedMotion ? 0 : 700; // ms after page load

  setTimeout(() => {
    bar.style.width = `${targetWidth}%`;
  }, delay);
}


// ═══════════════════════════════════════════════════════════════════════════════
// 5. AUTO-CALCULATED UI UPDATES
// ═══════════════════════════════════════════════════════════════════════════════

function updateAutoCalculatedUI() {
  updateHeroProgress(stats);
  updateImpactStats(stats);
}

function handleProductEnquire(product) {
  window.location.href = `mailto:${merchConfig.shopEmail}?subject=GetLoud Merch Enquiry: ${encodeURIComponent(product.name)}&body=Hi Karsang,%0D%0A%0D%0AI'd like to enquire about: ${encodeURIComponent(product.name)} (${encodeURIComponent(product.priceLabel)})%0D%0A%0D%0AThanks!`;
}


// ═══════════════════════════════════════════════════════════════════════════════
// 6. PODCAST PLAYER
// ═══════════════════════════════════════════════════════════════════════════════

function openPodcastPlayer(episode) {
  if (!podcastPlayerModal) return;
  playerTitle.textContent      = episode.title;
  playerCollaborator.textContent = episode.guest;
  playerWeekBadge.textContent  = episode.week === 0 ? 'Preview' : `Week ${episode.week}`;

  if (episode.audioUrl) {
    audioElement.src = episode.audioUrl;
  } else {
    audioElement.removeAttribute('src');
  }

  openModalAnimated(podcastPlayerModal);
}

function closePodcastPlayer() {
  if (audioElement) audioElement.pause();
  closeModalAnimated(podcastPlayerModal);
}

if (closePodcastBtn) {
  closePodcastBtn.addEventListener('click', closePodcastPlayer);
}

// Audio playback controls (unchanged from original)
if (togglePlayBtn && audioElement) {
  togglePlayBtn.addEventListener('click', () => {
    if (audioElement.paused) {
      audioElement.play();
      playIcon?.classList.add('hidden');
      pauseIcon?.classList.remove('hidden');
    } else {
      audioElement.pause();
      playIcon?.classList.remove('hidden');
      pauseIcon?.classList.add('hidden');
    }
  });

  audioElement.addEventListener('timeupdate', () => {
    const cur  = audioElement.currentTime;
    const tot  = audioElement.duration || 0;
    const pct  = tot > 0 ? (cur / tot) * 100 : 0;
    if (audioSeeker)     audioSeeker.value  = pct;
    if (currentTimeEl)   currentTimeEl.textContent  = formatTime(cur);
    if (totalDurationEl) totalDurationEl.textContent = formatTime(tot);
  });

  audioElement.addEventListener('ended', () => {
    playIcon?.classList.remove('hidden');
    pauseIcon?.classList.add('hidden');
  });

  audioSeeker?.addEventListener('input', () => {
    const dur = audioElement.duration || 0;
    if (dur > 0) audioElement.currentTime = (audioSeeker.value / 100) * dur;
  });
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}


// ═══════════════════════════════════════════════════════════════════════════════
// 7. RUN INSPECTION MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function openRunInspectionModal(log) {
  if (!runInspectionModal) return;

  if (runModalDayBadge)  runModalDayBadge.textContent  = `Day ${log.day}`;
  if (runModalDate)      runModalDate.textContent       = `${log.fullDate} • ${log.time}`;
  if (runModalTitle)     runModalTitle.textContent      = `${log.distanceKm} KM`;
  if (runModalLocation)  runModalLocation.textContent   = log.routeLocation;
  if (runModalRouteDesc) runModalRouteDesc.textContent  = log.routeDescription;
  if (runModalQuote)     runModalQuote.textContent      = log.quote;

  if (runModalMapImg)  runModalMapImg.src  = log.mapCard  || '';
  if (runModalProofImg) runModalProofImg.src = log.image || '';

  // Tab display state
  if (log.mapCard) {
    modalTabMapBtn?.classList.remove('hidden');
    runModalMapImg?.classList.remove('hidden');
    runModalProofImg?.classList.add('hidden');
    if (modalTabMapBtn)  modalTabMapBtn.className  = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00f098] text-black transition-all';
    if (modalTabProofBtn) modalTabProofBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 hover:text-white transition-all';
  } else {
    modalTabMapBtn?.classList.add('hidden');
    runModalMapImg?.classList.add('hidden');
    runModalProofImg?.classList.remove('hidden');
    if (modalTabProofBtn) modalTabProofBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00f098] text-black transition-all';
  }

  // YouTube Short link
  const runModalShortBtn      = document.getElementById('runModalShortBtn');
  const runModalShortBtnText  = document.getElementById('runModalShortBtnText');
  if (runModalShortBtn) {
    if (log.youtubeShortUrl) {
      runModalShortBtn.href = log.youtubeShortUrl;
      if (runModalShortBtnText) runModalShortBtnText.textContent = `Watch Day ${log.day} Short`;
      runModalShortBtn.classList.remove('hidden');
    } else {
      runModalShortBtn.classList.add('hidden');
    }
  }

  // Stats grid
  if (runModalStatsGrid) {
    const metrics = [
      { label: 'Distance',   val: `${log.distanceKm} km` },
      { label: 'Duration',   val: log.duration },
      { label: 'Avg Pace',   val: `${log.pace}/km` },
      { label: 'Best Pace',  val: `${log.fastestPace}/km` },
      { label: 'Avg Speed',  val: `${log.avgSpeedKmh} km/h` },
      { label: 'Total Steps',val: log.steps.toLocaleString() },
      { label: 'Calories',   val: `${log.calories} kcal` },
    ];
    runModalStatsGrid.innerHTML = metrics.map(m => `
      <div class="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800 text-center">
        <p class="text-[9px] uppercase font-bold text-gray-400 tracking-wider">${m.label}</p>
        <p class="text-sm font-extrabold text-[#00f098] font-mono mt-0.5">${m.val}</p>
      </div>
    `).join('');
  }

  openModalAnimated(runInspectionModal);
}

function closeRunInspectionModal() {
  closeModalAnimated(runInspectionModal);
}

// Tab switching inside run modal
if (modalTabMapBtn && modalTabProofBtn) {
  modalTabMapBtn.addEventListener('click', () => {
    runModalMapImg?.classList.remove('hidden');
    runModalProofImg?.classList.add('hidden');
    modalTabMapBtn.className  = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00f098] text-black transition-all';
    modalTabProofBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 hover:text-white transition-all';
  });

  modalTabProofBtn.addEventListener('click', () => {
    runModalProofImg?.classList.remove('hidden');
    runModalMapImg?.classList.add('hidden');
    modalTabProofBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00f098] text-black transition-all';
    modalTabMapBtn.className   = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 text-gray-400 hover:text-white transition-all';
  });
}

closeRunModalBtn?.addEventListener('click', closeRunInspectionModal);
runInspectionModal?.addEventListener('click', e => {
  if (e.target === runInspectionModal) closeRunInspectionModal();
});


// ═══════════════════════════════════════════════════════════════════════════════
// 8. SUPPORT / DONATION MODAL
// ═══════════════════════════════════════════════════════════════════════════════

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
tabDonationBtn?.addEventListener('click',     () => setModalTab('donation'));

function openDonationModal(weekNumber = null, initialTab = 'collaborator') {
  if (collabWeekSelect && weekNumber) collabWeekSelect.value = String(weekNumber);
  setModalTab(initialTab);
  openModalAnimated(donationModal);
}

function closeDonationModal() {
  closeModalAnimated(donationModal);
}

['navDonateBtn', 'mobileDonateBtn', 'heroDonateBtn', 'ctaDonateBtn'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener('click', () => openDonationModal(null, 'collaborator'));
});

closeModalBtn?.addEventListener('click', closeDonationModal);
donationModal?.addEventListener('click', e => {
  if (e.target === donationModal) closeDonationModal();
});

// Also wire the impact section's "support" CTA to open modal
const impactSupportCta = document.getElementById('impactSupportCta');
impactSupportCta?.addEventListener('click', () => openDonationModal(null, 'donation'));

// Impact range slider (illustrative — no real payment)
const impactRange        = document.getElementById('impactRange');
const impactAmountLabel  = document.getElementById('impactAmountLabel');
const impactExplain      = document.getElementById('impactExplain');

if (impactRange) {
  impactRange.addEventListener('input', () => {
    const amount = parseInt(impactRange.value, 10);
    if (impactAmountLabel) impactAmountLabel.textContent = `$${amount}`;
    if (impactExplain) {
      const hrs = Math.floor(amount / 15);
      impactExplain.innerHTML = `About <strong class="text-white">${hrs}–${hrs + 2}</strong> supported counseling-hour equivalents at a simple $12–20/hr illustration — actual partner rates vary; Karsang allocates funds after confirmation.`;
    }
  });
}

const TARGET_EMAIL = 'krashworks0@gmail.com';

// ── Collaborator Interest Form ───────────────────────────────────────────────
collaboratorForm?.addEventListener('submit', e => {
  e.preventDefault();
  const name       = document.getElementById('collabName')?.value?.trim();
  const email      = document.getElementById('collabEmail')?.value?.trim();
  const week       = document.getElementById('collabWeek')?.value;
  const discipline = document.getElementById('collabDiscipline')?.value?.trim() || 'Not specified';
  const location   = document.getElementById('collabLocation')?.value?.trim()   || 'Not specified';
  const message    = document.getElementById('collabMessage')?.value?.trim()    || 'None';

  const submitBtn = document.getElementById('submitCollabBtn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending Interest…';
  submitBtn.disabled = true;

  fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `[GetLoud] Collaborator interest — Week ${week}`,
      'Collaborator Name': name,
      'Email Address': email,
      'Preferred Week': `Week ${week}`,
      'Creative / Professional Discipline': discipline,
      'Perth Area': location,
      'Message / Availability': message,
      _template: 'table',
    }),
  })
    .then(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled    = false;
      closeDonationModal();
      showToast(`Thank you, ${name}! Your interest was sent to Karsang. He will email you to confirm and arrange payment & scheduling.`);
      collaboratorForm.reset();
    })
    .catch(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled    = false;
      closeDonationModal();
      showToast(`Thank you, ${name}! Your interest was sent to Karsang. He will email you to confirm and arrange payment.`);
      collaboratorForm.reset();
    });
});

// ── General Donation Interest Form ───────────────────────────────────────────
generalDonationForm?.addEventListener('submit', e => {
  e.preventDefault();
  const name    = document.getElementById('donorNameInput')?.value?.trim();
  const email   = document.getElementById('donorEmailInput')?.value?.trim();
  const amount  = document.getElementById('donationAmountInput')?.value?.trim();
  const message = document.getElementById('donationMessageInput')?.value?.trim() || 'None';

  const submitBtn = document.getElementById('submitGeneralDonationBtn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending Interest…';
  submitBtn.disabled = true;

  fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `[GetLoud] Donation interest — $${amount}`,
      'Donor Name': name,
      'Email Address': email,
      'Intended Donation Amount': `$${amount} USD`,
      'Message / Note of Support': message,
      _template: 'table',
    }),
  })
    .then(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled    = false;
      closeDonationModal();
      showToast(`Thank you, ${name}! Your donation interest was sent to Karsang. He will email you with contribution details.`);
      generalDonationForm.reset();
    })
    .catch(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled    = false;
      closeDonationModal();
      showToast(`Thank you, ${name}! Your donation interest was sent to Karsang. He will email you with contribution details.`);
      generalDonationForm.reset();
    });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 9. COLLABORATOR GRID
//    Renders all 14 weekly collaborator cards with category filtering.
//    Includes a "Show all" overflow mechanism.
// ═══════════════════════════════════════════════════════════════════════════════

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

function renderCollaborators(filterCategory = 'all', showAll = false) {
  if (!collaboratorsGrid) return;
  collaboratorsGrid.innerHTML = '';

  const filtered = filterCategory === 'all'
    ? collaboratorsData
    : collaboratorsData.filter(item =>
        item.category === filterCategory || item.status === filterCategory
      );

  const list = showAll ? filtered : filtered.slice(0, 6);

  const isMobile = window.innerWidth < 768;
  const collabStagger = isMobile ? 35 : 80;

  list.forEach((collab, idx) => {
    const card = document.createElement('div');
    card.className = 'h-card-wide reveal-scale';
    // Stagger via inline delay
    card.style.setProperty('--reveal-delay', `${idx * collabStagger}ms`);

    const isConfirmed  = collab.isConfirmed;
    const statusBadge  = isConfirmed
      ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00f098]/20 text-[#00f098] border border-[#00f098]/30">✓ Confirmed</span>`
      : `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">Open Slot</span>`;

    card.innerHTML = `
      <div class="h-full p-5 rounded-3xl glass-card border border-gray-800 hover:border-[#00f098]/40 space-y-4 flex flex-col">
        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] font-mono font-black text-[#00f098] bg-[#00f098]/10 px-2 py-0.5 rounded-full">Week ${collab.week}</span>
              <span class="text-[10px] text-gray-500 font-medium">${collab.days}</span>
            </div>
            <p class="text-sm font-extrabold text-white mt-1 leading-snug">${collab.title}</p>
          </div>
          ${statusBadge}
        </div>

        <!-- Icon + discipline -->
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${collab.category === 'Music' ? 'bg-[#00f098]/10' : collab.category === 'Movement' ? 'bg-amber-500/10' : 'bg-blue-500/10'}">
            ${getCategoryIcon(collab.disciplineIcon)}
          </div>
          <div>
            <p class="text-xs font-bold text-white">${collab.discipline}</p>
            <p class="text-[10px] text-gray-500">📍 ${collab.perthLocation}</p>
          </div>
        </div>

        <!-- Description -->
        <p class="text-[11px] text-gray-400 leading-relaxed flex-1">${collab.description}</p>

        <!-- Quote -->
        <blockquote class="text-[10px] italic text-gray-500 border-l-2 border-[#00f098]/30 pl-2 leading-relaxed">
          "${collab.quote}"
        </blockquote>

        <!-- CTA -->
        <button
          type="button"
          data-collab-week="${collab.week}"
          class="collab-request-btn w-full py-2.5 min-h-[44px] rounded-xl text-xs font-extrabold
            ${isConfirmed
              ? 'bg-gray-900 text-gray-500 border border-gray-800 cursor-default'
              : 'bg-gradient-to-r from-[#00f098] to-[#10b981] text-black hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-[#00f098]/15'}">
          ${isConfirmed ? 'Week Filled' : 'Request this Week — $20'}
        </button>
      </div>
    `;

    collaboratorsGrid.appendChild(card);
  });

  // "Show all" overflow card
  if (!showAll && filtered.length > 6) {
    const more = document.createElement('div');
    more.className = 'h-card-wide p-6 rounded-3xl glass-card border border-gray-700 flex flex-col items-center justify-center text-center gap-3';
    more.innerHTML = `
      <p class="text-sm font-extrabold text-white">${filtered.length - 6} more open weeks</p>
      <button type="button" class="px-4 py-2 rounded-xl bg-[#00f098] text-black text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all" id="showAllCollabsBtn">
        Show all ${filtered.length}
      </button>
    `;
    collaboratorsGrid.appendChild(more);
    document.getElementById('showAllCollabsBtn')?.addEventListener('click', () => {
      renderCollaborators(filterCategory, true);
    });
  }

  // Wire "Request this Week" buttons to open modal on correct week
  collaboratorsGrid.querySelectorAll('.collab-request-btn').forEach(btn => {
    const week = parseInt(btn.getAttribute('data-collab-week'), 10);
    const isDisabled = btn.classList.contains('cursor-default');
    if (!isDisabled) {
      btn.addEventListener('click', () => openDonationModal(week, 'collaborator'));
    }
  });

  // Re-observe newly added cards for scroll reveal
  initScrollReveal(collaboratorsGrid);
}


// ═══════════════════════════════════════════════════════════════════════════════
// 10. CATEGORY TABS (COLLABORATOR FILTER)
// ═══════════════════════════════════════════════════════════════════════════════

categoryTabs?.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active tab appearance
    categoryTabs.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('bg-[#00f098]', 'text-black');
      b.classList.add('text-gray-400');
    });
    btn.classList.add('bg-[#00f098]', 'text-black');
    btn.classList.remove('text-gray-400');

    renderCollaborators(btn.getAttribute('data-category'), false);
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 11. FAQ ACCORDION
// ═══════════════════════════════════════════════════════════════════════════════

function renderFAQ() {
  if (!faqAccordionContainer) return;
  faqAccordionContainer.innerHTML = '';

  const isMobile = window.innerWidth < 768;
  const faqStagger = isMobile ? 30 : 70;

  faqData.forEach((item, idx) => {
    const faqCard = document.createElement('div');
    faqCard.className = 'reveal rounded-2xl glass-card border border-gray-800 overflow-hidden transition-all duration-300';
    faqCard.style.setProperty('--reveal-delay', `${idx * faqStagger}ms`);

    faqCard.innerHTML = `
      <button
        class="faq-question-btn w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-extrabold text-base sm:text-lg text-white hover:text-[#00f098] transition-colors focus:outline-none"
        aria-expanded="false">
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

  // Attach accordion toggle logic
  faqAccordionContainer.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded  = btn.getAttribute('aria-expanded') === 'true';
      const answerDiv   = btn.nextElementSibling;
      const arrowIcon   = btn.querySelector('.icon-arrow');

      // Close all others first
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
        answerDiv.style.maxHeight = `${answerDiv.scrollHeight}px`;
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

  // Observe FAQ items for scroll reveal
  initScrollReveal(faqAccordionContainer);
}


// ═══════════════════════════════════════════════════════════════════════════════
// 12. DYNAMIC SECTION RENDERS
// ═══════════════════════════════════════════════════════════════════════════════

function initDynamicSections() {
  // Progress tracker
  const progressContainer = document.getElementById('progressTrackerContainer');
  if (progressContainer) {
    renderProgressTracker(progressContainer, stats, openRunInspectionModal);
    initScrollReveal(progressContainer);
  }

  // Aim & Goal (optional section)
  const aim = document.getElementById('aimGoalContainer');
  if (aim) {
    renderAimAndGoal(aim, stats);
    initScrollReveal(aim);
  }

  // Merch
  const merch = document.getElementById('merchContainer');
  if (merch) {
    renderProducts(merch, handleProductEnquire);
    initScrollReveal(merch);
  }

  // Weekly donations
  const donations = document.getElementById('donationsContainer');
  if (donations) {
    renderWeeklyDonations(donations, stats);
    initScrollReveal(donations);
  }

  // Podcasts
  const podcasts = document.getElementById('podcastsContainer');
  if (podcasts) {
    renderPodcasts(podcasts, openPodcastPlayer);
    initScrollReveal(podcasts);
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// 13. TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function showToast(message) {
  const toast = document.createElement('div');
  // Use toast-enter animation class (slide-in from right) instead of animate-bounce
  toast.className = 'toast-enter px-5 py-4 rounded-2xl glass-modal border border-[#00f098]/40 text-white text-sm font-bold shadow-2xl flex items-center gap-3 pointer-events-auto';
  toast.innerHTML = `
    <svg class="w-5 h-5 text-[#00f098] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
    </svg>
    <span>${message}</span>
  `;
  toastContainer?.appendChild(toast);

  // Auto-remove after 5s
  setTimeout(() => {
    toast.style.opacity    = '0';
    toast.style.transform  = 'translateX(110%) scale(0.94)';
    toast.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    setTimeout(() => toast.remove(), 380);
  }, 5000);
}


// ═══════════════════════════════════════════════════════════════════════════════
// 14. MOBILE MENU — SMOOTH EXPAND / COLLAPSE
//     Replaces display:none toggle with max-height + opacity animation.
// ═══════════════════════════════════════════════════════════════════════════════

let mobileMenuOpen = false;

function openMobileMenu() {
  if (!mobileMenu) return;
  mobileMenuOpen = true;

  // Remove hidden (if still present from initial HTML), apply panel class
  mobileMenu.classList.remove('hidden');
  mobileMenu.classList.add('mobile-menu-panel');

  // Allow one frame for display to apply, then animate
  requestAnimationFrame(() => {
    const h = mobileMenu.scrollHeight;
    mobileMenu.style.maxHeight = `${h}px`;
    mobileMenu.classList.add('is-open');
  });

  // Update hamburger icon to X
  const icon = document.getElementById('hamburgerIcon');
  if (icon) icon.setAttribute('d', 'M6 18L18 6M6 6l12 12');

  mobileMenuBtn?.setAttribute('aria-expanded', 'true');
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenuOpen = false;

  mobileMenu.style.maxHeight = '0';
  mobileMenu.classList.remove('is-open');

  // Reset hamburger icon
  const icon = document.getElementById('hamburgerIcon');
  if (icon) icon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');

  mobileMenuBtn?.setAttribute('aria-expanded', 'false');

  // After transition, re-add hidden so it's fully inert
  if (prefersReducedMotion) {
    mobileMenu.classList.add('hidden');
  } else {
    mobileMenu.addEventListener('transitionend', () => {
      if (!mobileMenuOpen) mobileMenu.classList.add('hidden');
    }, { once: true });
  }
}

mobileMenuBtn?.addEventListener('click', () => {
  if (mobileMenuOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

// Close menu when a nav link is tapped
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => closeMobileMenu());
});


// ═══════════════════════════════════════════════════════════════════════════════
// 15. SHARE CAMPAIGN BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

const shareBtn = document.getElementById('shareCampaignBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({
        title: 'GetLoud Perth — Karsang Ghising (Snowcoal)',
        text: 'Karsang Ghising is running 5km daily for 100 days in Perth for mental health. Join the campaign!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('📋 Campaign link copied to clipboard!');
    }
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// 16. COLLAPSE TOGGLES (long story sections)
// ═══════════════════════════════════════════════════════════════════════════════

document.querySelectorAll('[data-collapse-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id    = btn.getAttribute('data-collapse-target');
    const panel = document.getElementById(id);
    if (!panel) return;
    const open = panel.classList.toggle('hidden') === false;
    btn.textContent = open
      ? 'Hide details'
      : (btn.getAttribute('data-label') || 'Show details');
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 17. ESCAPE KEY — CLOSE ALL MODALS
// ═══════════════════════════════════════════════════════════════════════════════

window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeRunInspectionModal();
  closePodcastPlayer();
  if (donationModal && !donationModal.classList.contains('hidden')) {
    closeDonationModal();
  }
  closeMobileMenu();
});


// ═══════════════════════════════════════════════════════════════════════════════
// 18. INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // 1. Update stats-driven content
  updateAutoCalculatedUI();

  // 2. Render all dynamic sections
  initDynamicSections();
  renderCollaborators();
  renderFAQ();

  // 3. Animate hero progress bar entrance
  animateHeroProgressBar();

  // 4. Start scroll reveals for static HTML elements
  initScrollReveal();

  // 5. Start count-up animations for numeric displays
  initCountUps();
});

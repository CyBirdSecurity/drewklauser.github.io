const params = new URLSearchParams(location.search);
const slug = params.get('r');
const servingsParam = parseInt(params.get('servings'), 10);

let recipe = null;
let factor = 1;
let currentStep = 0;
let wakeLock = null;
const timers = {}; // stepIndex -> { total, remaining, running, intervalId, done }

const stageEl = document.getElementById('cook-stage');
const progressEl = document.getElementById('cook-progress');
const trayEl = document.getElementById('timer-tray');
const prevBtn = document.getElementById('cook-prev');
const nextBtn = document.getElementById('cook-next');
const titleEl = document.getElementById('cook-title');

init();

async function init() {
  if (!slug) {
    stageEl.innerHTML = '<p style="color:var(--c-text-2);">No recipe specified — go back and pick one from the cookbook.</p>';
    return;
  }

  recipe = await loadRecipeBySlug(slug);
  if (!recipe) {
    stageEl.innerHTML = '<p style="color:var(--c-text-2);">Recipe not found.</p>';
    return;
  }

  const baseServings = recipe.servings ?? 1;
  const servings = Number.isFinite(servingsParam) && servingsParam > 0 ? servingsParam : baseServings;
  factor = servings / baseServings;

  titleEl.textContent = recipe.title;
  document.title = `${recipe.title} — Cook Mode`;

  const hashStep = parseInt(location.hash.replace('#step-', ''), 10);
  currentStep = Number.isFinite(hashStep) ? Math.max(0, Math.min(recipe.steps.length - 1, hashStep)) : 0;

  buildProgressDots();
  buildIngredientsSheet(servings);
  renderStep();
  wireNav();
  wireKeyboard();
  wireSwipe();
  wireShare();
  requestWakeLock();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !wakeLock) requestWakeLock();
  });
}

// ── Step navigation ──────────────────────────────────────────────────

function buildProgressDots() {
  progressEl.innerHTML = '';
  recipe.steps.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'cook-dot';
    dot.setAttribute('aria-label', `Go to step ${i + 1}`);
    dot.addEventListener('click', () => goToStep(i));
    progressEl.appendChild(dot);
  });
}

function updateDots() {
  progressEl.querySelectorAll('.cook-dot').forEach((dot, i) => {
    dot.classList.toggle('cook-dot--active', i === currentStep);
    dot.classList.toggle('cook-dot--done', i < currentStep);
  });
}

function goToStep(i) {
  currentStep = Math.max(0, Math.min(recipe.steps.length - 1, i));
  renderStep();
}

function renderStep() {
  const step = recipe.steps[currentStep];
  const imgUrl = stepImageUrl(recipe, step);

  stageEl.innerHTML = '';

  if (imgUrl) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'cook-step-image';
    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = '';
    img.onerror = () => imgWrap.remove();
    imgWrap.appendChild(img);
    stageEl.appendChild(imgWrap);
  }

  const label = document.createElement('p');
  label.className = 'cook-step-label';
  label.textContent = `Step ${currentStep + 1} of ${recipe.steps.length}`;

  const text = document.createElement('p');
  text.className = 'cook-step-text';
  text.textContent = step.text;

  stageEl.append(label, text);

  if (step.ingredients?.length) {
    stageEl.appendChild(buildStepIngredients(step.ingredients));
  }

  if (step.timer_minutes) {
    stageEl.appendChild(buildTimerWidget(currentStep, step.timer_minutes));
  }

  prevBtn.disabled = currentStep === 0;
  nextBtn.textContent = currentStep === recipe.steps.length - 1 ? 'Done ✓' : 'Next →';

  updateDots();
  renderTray();
  history.replaceState(null, '', `#step-${currentStep}`);
}

// The scaled amount for whatever this step actually calls for — without
// this, the step text alone doesn't say how much to add, and the full
// ingredient list is scaled for the WHOLE recipe, not this moment in it.
function buildStepIngredients(indices) {
  const wrap = document.createElement('div');
  wrap.className = 'cook-step-ingredients';
  indices.forEach(i => {
    const ing = recipe.ingredients[i];
    if (!ing) return;
    const chip = document.createElement('span');
    chip.className = 'cook-step-ingredient-chip';
    chip.innerHTML = formatIngredientLine(ing, factor);
    wrap.appendChild(chip);
  });
  return wrap;
}

function wireNav() {
  prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
  nextBtn.addEventListener('click', () => {
    if (currentStep === recipe.steps.length - 1) {
      window.location.href = '../';
    } else {
      goToStep(currentStep + 1);
    }
  });
}

function wireKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft' && currentStep > 0) goToStep(currentStep - 1);
  });
}

// Touch swipe, confined to the stage area (not the screen edges) so it
// doesn't fight the OS edge-swipe-back gesture on iOS/Android.
function wireSwipe() {
  let startX = 0, startY = 0, tracking = false;
  stageEl.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });
  stageEl.addEventListener('touchend', e => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) nextBtn.click();
      else if (currentStep > 0) goToStep(currentStep - 1);
    }
  }, { passive: true });
}

// ── Timers ───────────────────────────────────────────────────────────

function buildTimerWidget(stepIndex, minutes) {
  if (!timers[stepIndex]) {
    timers[stepIndex] = { total: minutes * 60, remaining: minutes * 60, running: false, intervalId: null, done: false };
  }
  const t = timers[stepIndex];

  const wrap = document.createElement('div');
  wrap.className = 'cook-timer';
  wrap.id = `timer-${stepIndex}`;
  if (t.done) wrap.classList.add('cook-timer--done');

  const display = document.createElement('span');
  display.className = 'cook-timer-display';
  display.textContent = formatTime(t.remaining);

  const startBtn = document.createElement('button');
  startBtn.className = 'cook-timer-btn';
  startBtn.textContent = t.running ? 'Pause' : (t.remaining < t.total ? 'Resume' : 'Start Timer');
  startBtn.addEventListener('click', () => {
    if (t.running) pauseTimer(stepIndex); else startTimer(stepIndex);
    refreshTimerWidget(stepIndex);
  });

  const resetBtn = document.createElement('button');
  resetBtn.className = 'cook-timer-btn cook-timer-btn--secondary';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => {
    resetTimer(stepIndex);
    refreshTimerWidget(stepIndex);
  });

  wrap.append(display, startBtn, resetBtn);
  return wrap;
}

function refreshTimerWidget(stepIndex) {
  if (stepIndex === currentStep) {
    const old = document.getElementById(`timer-${stepIndex}`);
    const step = recipe.steps[stepIndex];
    if (old) old.replaceWith(buildTimerWidget(stepIndex, step.timer_minutes));
  }
  renderTray();
}

function startTimer(stepIndex) {
  const t = timers[stepIndex];
  if (t.running || t.remaining <= 0) return;
  t.running = true;
  t.done = false;
  ensureNotificationPermission();
  t.intervalId = setInterval(() => {
    t.remaining -= 1;
    if (stepIndex === currentStep) {
      const displayEl = document.querySelector(`#timer-${stepIndex} .cook-timer-display`);
      if (displayEl) displayEl.textContent = formatTime(t.remaining);
    } else {
      renderTray();
    }
    if (t.remaining <= 0) {
      clearInterval(t.intervalId);
      t.running = false;
      t.done = true;
      onTimerDone(stepIndex);
    }
  }, 1000);
}

function pauseTimer(stepIndex) {
  const t = timers[stepIndex];
  t.running = false;
  clearInterval(t.intervalId);
}

function resetTimer(stepIndex) {
  pauseTimer(stepIndex);
  const t = timers[stepIndex];
  t.remaining = t.total;
  t.done = false;
}

function onTimerDone(stepIndex) {
  refreshTimerWidget(stepIndex);
  playBeep();
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
  if (document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('Timer done', { body: `Step ${stepIndex + 1}: ${recipe.steps[stepIndex].text.slice(0, 70)}` });
  }
}

function ensureNotificationPermission() {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.28, 0.56].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.22);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.25);
    });
  } catch (e) { /* Web Audio unavailable — silently skip the tone */ }
}

function formatTime(sec) {
  sec = Math.max(0, sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Chips for timers running (or paused mid-way) on steps other than the
// one currently on screen — tapping one jumps straight there.
function renderTray() {
  trayEl.innerHTML = '';
  const entries = Object.entries(timers).filter(([idx, t]) => {
    if (Number(idx) === currentStep) return false;
    return t.running || (t.remaining < t.total && t.remaining > 0);
  });
  trayEl.style.padding = entries.length ? '0.5rem 1rem 0.6rem' : '0 1rem';

  entries.forEach(([idx, t]) => {
    const chip = document.createElement('button');
    chip.className = 'timer-tray-chip';
    chip.textContent = `⏱ Step ${Number(idx) + 1} · ${formatTime(t.remaining)}`;
    chip.addEventListener('click', () => goToStep(Number(idx)));
    trayEl.appendChild(chip);
  });
}

// ── Wake lock — keep the screen on while cooking ────────────────────

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (e) { /* e.g. low battery or backgrounded — ignore */ }
}

// ── Ingredient checklist (bottom sheet, persisted per-recipe) ───────

function buildIngredientsSheet(servings) {
  const sheet = document.getElementById('ingredients-sheet');
  const list = document.getElementById('ingredients-checklist');
  const note = document.getElementById('ingredients-servings-note');
  note.textContent = `For ${servings} ${recipe.yield_label || 'servings'}`;

  const storageKey = `recipe-check-${recipe.slug}`;
  let checked = new Set();
  try { checked = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch (e) { /* ignore malformed storage */ }

  list.innerHTML = '';
  (recipe.ingredients ?? []).forEach((ing, i) => {
    const li = document.createElement('li');
    li.className = `check-item${checked.has(i) ? ' checked' : ''}`;
    li.innerHTML = `<input type="checkbox" id="ing-${i}" ${checked.has(i) ? 'checked' : ''}/><span>${formatIngredientLine(ing, factor)}</span>`;
    li.querySelector('input').addEventListener('change', e => {
      if (e.target.checked) checked.add(i); else checked.delete(i);
      li.classList.toggle('checked', e.target.checked);
      localStorage.setItem(storageKey, JSON.stringify([...checked]));
      updateIngredientsBadge(recipe.ingredients.length - checked.size);
    });
    list.appendChild(li);
  });

  updateIngredientsBadge(recipe.ingredients.length - checked.size);

  document.getElementById('ingredients-toggle').addEventListener('click', () => sheet.showModal());
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
}

function updateIngredientsBadge(remaining) {
  const badge = document.getElementById('ingredients-badge');
  if (remaining > 0) { badge.textContent = String(remaining); badge.style.display = ''; }
  else badge.style.display = 'none';
}

// ── Share ────────────────────────────────────────────────────────────

function wireShare() {
  document.getElementById('cook-share-btn').addEventListener('click', async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: recipe.title, url }); } catch (e) { /* user cancelled */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch (e) { /* clipboard blocked */ }
    }
  });
}

function toast(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;left:50%;bottom:110px;transform:translateX(-50%);background:var(--c-text);color:#fff;padding:0.5rem 1.1rem;border-radius:999px;font-size:0.8rem;z-index:50;box-shadow:0 6px 20px rgba(0,0,0,0.25);';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

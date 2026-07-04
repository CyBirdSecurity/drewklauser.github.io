/* ─────────────────────────────────────────────────────────────
   Drew Klauser — myfi.js
   Sidebar navigation + forecast scenario switching for the
   simulated MyFi app demo window
   ───────────────────────────────────────────────────────────── */

'use strict';

/* ── Sidebar section switching ──────────────────────────────────── */
(function initDemoNav() {
  const navBtns = document.querySelectorAll('.mfd-nav-btn');
  if (!navBtns.length) return;

  const titles = {
    'mfd-dashboard': ['Dashboard', 'Your financial snapshot'],
    'mfd-holdings':  ['Holdings', 'All positions across accounts'],
    'mfd-forecast':  ['Retirement Forecast', 'Projected to age 100'],
    'mfd-goals':     ['Goals', 'Track your milestones'],
    'mfd-budget':    ['Budget', 'Monthly spending breakdown'],
    'mfd-taxes':     ['Tax Analysis', 'Optimize your account structure'],
  };

  const titleEl = document.getElementById('mfd-title');
  const subtitleEl = document.getElementById('mfd-subtitle');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.mfd-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === target);
      });

      const meta = titles[target];
      if (meta && titleEl && subtitleEl) {
        titleEl.textContent = meta[0];
        subtitleEl.textContent = meta[1];
      }
    });
  });
})();

/* ── Forecast scenario switching ────────────────────────────────── */
(function initForecastScenarios() {
  const scenarioBtns = document.querySelectorAll('.mfd-scenario-btn');
  if (!scenarioBtns.length) return;

  const SUMMARY = {
    base:        { retire: '$1.16M', at80: '$1.62M', at100: '$2.05M', color: '#818cf8' },
    optimistic:  { retire: '$1.45M', at80: '$2.14M', at100: '$2.85M', color: '#10b981' },
    pessimistic: { retire: '$935,000', at80: '$1.22M', at100: '$1.48M', color: '#f43f5e' },
  };

  const retireEl = document.getElementById('mfd-forecast-retire');
  const at80El   = document.getElementById('mfd-forecast-80');
  const at100El  = document.getElementById('mfd-forecast-100');

  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = btn.getAttribute('data-scenario');

      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      ['pessimistic', 'base', 'optimistic'].forEach(key => {
        const path = document.getElementById(`mfd-path-${key}`);
        if (path) path.setAttribute('opacity', key === scenario ? '1' : '0.3');
      });

      const s = SUMMARY[scenario];
      if (s) {
        [retireEl, at80El, at100El].forEach(el => el && (el.style.color = s.color));
        if (retireEl) retireEl.textContent = s.retire;
        if (at80El)   at80El.textContent = s.at80;
        if (at100El)  at100El.textContent = s.at100;
      }
    });
  });
})();

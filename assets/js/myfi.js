/* ─────────────────────────────────────────────────────────────
   Drew Klauser — myfi.js
   Tab switching for the simulated MyFi demo window
   ───────────────────────────────────────────────────────────── */

'use strict';

(function initDemoTabs() {
  const tabs = document.querySelectorAll('.demo-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.demo-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === target);
      });
    });
  });
})();

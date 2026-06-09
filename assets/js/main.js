/* ─────────────────────────────────────────────────────────────
   Drew Klauser — main.js
   ───────────────────────────────────────────────────────────── */

'use strict';

/* ── Featured repos config ──────────────────────────────────────── */
const SECURITY_REPOS = [
  {
    owner: 'CyBirdSecurity',
    repo:  'Claude-Security-Scanner',
    badge: 'AI-Powered',
    fallback: {
      name:        'Claude-Security-Scanner',
      description: 'An AI-powered security scanner leveraging Claude to analyze codebases for vulnerabilities, misconfigurations, and security anti-patterns.',
      language:    'Python',
      stars:       0,
      forks:       0,
      updatedAt:   null,
    },
  },
  {
    owner: 'CyBirdSecurity',
    repo:  'PinnR',
    badge: 'Supply Chain',
    fallback: {
      name:        'PinnR',
      description: 'PinnR automatically resolves tags and branches to their exact commit SHAs and adds inline comments to preserve human-readable version information. Supply Chain Security!',
      language:    'Shell',
      stars:       0,
      forks:       0,
      updatedAt:   null,
    },
  },
  {
    owner: 'CyBirdSecurity',
    repo:  'ActionLoggR',
    badge: 'CI/CD Security',
    fallback: {
      name:        'ActionLoggR',
      description: 'DNS traffic logger for GitHub Actions workflows. Monitors and logs outbound DNS requests during CI/CD runs to detect unexpected network activity and potential supply chain threats.',
      language:    'Python',
      stars:       0,
      forks:       0,
      updatedAt:   null,
    },
  },
];

const PERSONAL_REPOS = [
  {
    owner:   'CyBirdSecurity',
    repo:    'CISSP',
    badge:   'Study Tool',
    fallback: {
      name:        'CISSP Study Tool',
      description: 'Interactive CISSP exam prep with 96 practice questions and 120 flashcards across all 8 exam domains. Built with React/Next.js, featuring real-time feedback, progress tracking, and a distraction-free interface.',
      language:    'TypeScript',
      stars:       0,
      forks:       0,
      updatedAt:   null,
    },
  },
  {
    owner:   'CyBirdSecurity',
    repo:    'SecurityPlus',
    badge:   'Study Tool',
    fallback: {
      name:        'SecurityPlus Study Tool',
      description: 'Interactive CompTIA Security+ exam prep and study guide. Covers all exam domains with practice questions and study materials to help security professionals earn their certification.',
      language:    'JavaScript',
      stars:       0,
      forks:       0,
      updatedAt:   null,
    },
  },
];

/* Language → dot color mapping */
const LANG_COLORS = {
  Python:     '#3572A5',
  Shell:      '#89e051',
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Go:         '#00ADD8',
  Ruby:       '#701516',
  Rust:       '#dea584',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  C:          '#555555',
};

/* ── Typing animation ─────────────────────────────────────────────── */
(function initTyping() {
  const el = document.getElementById('typedWord');
  if (!el) return;

  const words = [
    'secure systems',
    'resilient teams',
    'supply chains',
    'compliance programs',
    'security tooling',
  ];

  let wordIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  let pauseMs  = 0;

  function tick() {
    const current = words[wordIdx];

    if (deleting) {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        wordIdx  = (wordIdx + 1) % words.length;
        pauseMs  = 400;
      }
    } else {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        pauseMs  = 1800;
      }
    }

    const speed = deleting ? 45 : 85;
    setTimeout(tick, pauseMs || speed);
    pauseMs = 0;
  }

  setTimeout(tick, 900);
})();

/* ── Navbar scroll behaviour ──────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile nav toggle ────────────────────────────────────────────────── */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ── Scroll-reveal (IntersectionObserver) ───────────────────────────────────── */
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── Footer year ───────────────────────────────────────────────────────────── */
(function setFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── GitHub API: fetch repo data ──────────────────────────────────────────── */
async function fetchRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function relativeDate(isoString) {
  if (!isoString) return null;
  const diff  = Date.now() - new Date(isoString).getTime();
  const days  = Math.floor(diff / 86_400_000);
  if (days === 0)  return 'Today';
  if (days === 1)  return 'Yesterday';
  if (days < 30)   return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function starIcon() {
  return `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 11.817l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>
  </svg>`;
}

function forkIcon() {
  return `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878zm3.75 7.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm3-8.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z"/>
  </svg>`;
}

function githubIcon() {
  return `<svg class="project-github-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>`;
}

/* ── Build a project card element ───────────────────────────────────────── */
function buildCard(config, data) {
  const {
    name        = config.fallback.name,
    description = config.fallback.description,
    language    = config.fallback.language,
    stargazers_count: stars = config.fallback.stars,
    forks_count: forks      = config.fallback.forks,
    updated_at: updatedAt   = config.fallback.updatedAt,
    html_url    = `https://github.com/${config.owner}/${config.repo}`,
  } = data || {};

  const langColor = language ? (LANG_COLORS[language] || '#94a3b8') : null;
  const updated   = relativeDate(updatedAt);
  const hasLive   = !!config.liveUrl;

  const card = document.createElement(hasLive ? 'div' : 'a');
  card.className = 'project-card reveal';
  if (!hasLive) {
    card.href   = html_url;
    card.target = '_blank';
    card.rel    = 'noopener noreferrer';
    card.setAttribute('aria-label', `View ${name} on GitHub`);
  }

  card.innerHTML = `
    <div class="project-card-top">
      <span class="project-badge">${config.badge}</span>
      ${githubIcon()}
    </div>

    <div>
      <h3 class="project-name">${name}</h3>
    </div>

    <p class="project-description">${description || 'No description provided.'}</p>

    <div class="project-footer">
      <div class="project-meta">
        ${langColor ? `
          <span class="project-lang">
            <span class="lang-dot" style="background:${langColor}" aria-hidden="true"></span>
            ${language}
          </span>
        ` : ''}
        <span class="project-stat" title="${stars} stars">
          ${starIcon()}
          ${stars}
        </span>
        <span class="project-stat" title="${forks} forks">
          ${forkIcon()}
          ${forks}
        </span>
      </div>
      ${hasLive ? `
        <div class="project-actions">
          <a href="${config.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-action-link project-action-link--primary" aria-label="Launch ${name} live tool">
            Launch Tool
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a href="${html_url}" target="_blank" rel="noopener noreferrer" class="project-action-link" aria-label="View ${name} source on GitHub">
            Source
            ${githubIcon()}
          </a>
        </div>
      ` : updated ? `<span class="project-updated" aria-label="Updated ${updated}">${updated}</span>` : ''}
    </div>
  `;

  return card;
}

/* ── Render projects ─────────────────────────────────────────────────────────── */
function observeCard(card) {
  setTimeout(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(card);
  }, 0);
}

async function renderRepoGroup(repos, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const results = await Promise.allSettled(
    repos.map(cfg => fetchRepo(cfg.owner, cfg.repo))
  );

  grid.innerHTML = '';

  repos.forEach((cfg, i) => {
    const data = results[i].status === 'fulfilled' ? results[i].value : null;
    const card = buildCard(cfg, data);
    grid.appendChild(card);
    observeCard(card);
  });
}

async function renderProjects() {
  await Promise.all([
    renderRepoGroup(SECURITY_REPOS,  'projectsGrid'),
    renderRepoGroup(PERSONAL_REPOS,  'personalProjectsGrid'),
  ]);
}

renderProjects();

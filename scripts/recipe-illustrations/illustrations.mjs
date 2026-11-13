// Illustrated hero cards for recipes without a photo. Each export returns a
// 1600x1200 SVG string. Key subject kept inside y≈170–1030 so it survives
// both the 4:3 card crop and the 16:9 modal crop.

const W = 1600, H = 1200;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

const svg = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
    <stop offset="60%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#2a1d10" stop-opacity="0.28"/>
  </radialGradient>
  <linearGradient id="glassHi" x1="0" x2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="soft2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
  ${defs}
</defs>
${body}
<rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg>`;

// ---------- Backgrounds ----------

function counter(seed) {
  const r = rng(seed);
  let s = '';
  // beadboard backsplash
  s += `<rect width="${W}" height="400" fill="#f3efe7"/>`;
  for (let x = 40; x < W; x += 80) s += `<rect x="${x}" y="0" width="5" height="400" fill="#e2dccf"/>`;
  s += `<rect y="0" width="${W}" height="400" fill="url(#wallLight)"/>`;
  // counter
  s += `<rect y="390" width="${W}" height="${H - 390}" fill="url(#granite)"/>`;
  const cols = ['#8d8478', '#5c554c', '#b7aea0', '#efe9df', '#3e3a35', '#a08d76'];
  for (let i = 0; i < 2600; i++) {
    const y = 400 + Math.pow(r(), 0.9) * (H - 400);
    const scale = 0.5 + (y - 400) / (H - 400);
    s += `<ellipse cx="${(r() * W).toFixed(1)}" cy="${y.toFixed(1)}" rx="${(scale * (1 + r() * 3.5)).toFixed(1)}" ry="${(scale * (0.6 + r() * 2)).toFixed(1)}" fill="${pick(r, cols)}" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`;
  }
  s += `<rect y="388" width="${W}" height="8" fill="#cfc6b8"/>`;
  s += `<rect y="396" width="${W}" height="40" fill="#000" opacity="0.06"/>`;
  return s;
}
const counterDefs = `
  <linearGradient id="granite" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#cfc8bc"/><stop offset="1" stop-color="#e4ddd2"/>
  </linearGradient>
  <linearGradient id="wallLight" x1="0" x2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0.05"/>
  </linearGradient>`;

function patio(seed) {
  const r = rng(seed);
  let s = '';
  s += `<rect width="${W}" height="520" fill="url(#sky)"/>`;
  // distant tree canopy
  for (let i = 0; i < 26; i++) {
    const cx = r() * W, cy = 120 + r() * 120, rr = 70 + r() * 90;
    s += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rr.toFixed(0)}" fill="${pick(r, ['#6f8f55', '#5d7d48', '#86a265', '#4f6d3e'])}" opacity="0.9"/>`;
  }
  // wood fence
  s += `<rect y="200" width="${W}" height="340" fill="#a07a55"/>`;
  for (let x = 0; x < W; x += 34) {
    const shade = pick(r, ['#9a7550', '#a8825c', '#93704c', '#ad8862']);
    s += `<rect x="${x}" y="${196 + r() * 8}" width="31" height="344" fill="${shade}"/>`;
  }
  s += `<rect y="250" width="${W}" height="16" fill="#7d5c3e" opacity="0.6"/><rect y="460" width="${W}" height="16" fill="#7d5c3e" opacity="0.6"/>`;
  s += `<rect y="200" width="${W}" height="340" fill="url(#fenceLight)"/>`;
  // grass
  s += `<rect y="520" width="${W}" height="140" fill="#6f9a4a"/>`;
  for (let i = 0; i < 900; i++) {
    const x = r() * W, y = 525 + r() * 135;
    s += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x + (r() - 0.5) * 8).toFixed(0)}" y2="${(y - 6 - r() * 10).toFixed(0)}" stroke="${pick(r, ['#5a8a3a', '#82ad58', '#4c7a31'])}" stroke-width="3" stroke-linecap="round"/>`;
  }
  // glass table top
  s += `<rect y="640" width="${W}" height="${H - 640}" fill="url(#tableGlass)"/>`;
  for (let i = 0; i < 70; i++) {
    const y = 650 + Math.pow(r(), 0.8) * (H - 650);
    const x = r() * W, w = 60 + r() * 160;
    s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q ${(w / 4).toFixed(0)} -8 ${(w / 2).toFixed(0)} 0 t ${(w / 2).toFixed(0)} 0" stroke="#fff" stroke-opacity="${(0.12 + r() * 0.18).toFixed(2)}" stroke-width="3" fill="none"/>`;
  }
  s += `<rect y="636" width="${W}" height="8" fill="#dfe8ea" opacity="0.8"/>`;
  return s;
}
const patioDefs = `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#bcd6e6"/><stop offset="1" stop-color="#eef1e6"/>
  </linearGradient>
  <linearGradient id="fenceLight" x1="0" x2="1">
    <stop offset="0" stop-color="#ffe9b8" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/>
  </linearGradient>
  <linearGradient id="tableGlass" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8fa6ad"/><stop offset="0.5" stop-color="#6d858d"/><stop offset="1" stop-color="#5a6f76"/>
  </linearGradient>`;

const shadow = (cx, cy, rx, ry, op = 0.3) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#1d150c" opacity="${op}" filter="url(#soft)"/>`;

// ---------- Props ----------

function rosemary(x0, y0, x1, y1, n = 14, needle = 34, seed = 1) {
  const r = rng(seed);
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len, px = -uy, py = ux;
  let s = `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="#6b5a3a" stroke-width="7" stroke-linecap="round"/>`;
  for (let i = 0; i < n; i++) {
    const t = 0.06 + (i / n) * 0.92;
    const bx = x0 + dx * t, by = y0 + dy * t;
    for (const side of [-1, 1]) {
      const l = needle * (1 - t * 0.45) * (0.8 + r() * 0.4);
      const ex = bx + (px * side * 0.85 + ux * 0.5) * l, ey = by + (py * side * 0.85 + uy * 0.5) * l;
      s += `<line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${pick(r, ['#3f6136', '#4d7343', '#567d49'])}" stroke-width="8" stroke-linecap="round"/>`;
    }
  }
  return s;
}

function cranberry(cx, cy, rad, dim = false) {
  return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${dim ? '#7a0f1e' : '#b3132b'}"/>
  <circle cx="${cx - rad * 0.35}" cy="${cy - rad * 0.35}" r="${rad * 0.28}" fill="#fff" opacity="${dim ? 0.25 : 0.55}"/>
  <circle cx="${cx + rad * 0.15}" cy="${cy - rad * 0.8}" r="${rad * 0.12}" fill="#3d0a10" opacity="0.6"/>`;
}

function cinnamon(x, y, len, angle) {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">
    <rect x="0" y="-20" width="${len}" height="40" rx="10" fill="#8a5326"/>
    <rect x="0" y="-20" width="${len}" height="12" rx="6" fill="#a8693a"/>
    <path d="M8 6 L${len - 8} 6" stroke="#6a3c18" stroke-width="3"/>
    <ellipse cx="${len}" cy="0" rx="10" ry="20" fill="#6e3f1a"/>
    <path d="M${len} -12 a 8 12 0 1 1 0 24 a 5 8 0 1 1 0 -16" stroke="#a8693a" stroke-width="3" fill="none"/>
  </g>`;
}

function clove(x, y, a) {
  return `<g transform="translate(${x} ${y}) rotate(${a})">
    <path d="M0 0 L36 0" stroke="#4a2a16" stroke-width="7" stroke-linecap="round"/>
    <circle cx="-4" cy="0" r="9" fill="#5a331b"/><circle cx="-6" cy="-3" r="3" fill="#7a4a2a"/>
  </g>`;
}

function masonJar(cx, top, w, h, liquidTop, liquidId, inside = '') {
  const x = cx - w / 2;
  const lx = x + 14;
  return `
  ${shadow(cx + 40, top + h + 10, w * 0.62, 34, 0.35)}
  <clipPath id="jarClip${liquidId}"><rect x="${x + 10}" y="${top + 50}" width="${w - 20}" height="${h - 60}" rx="44"/></clipPath>
  <rect x="${x}" y="${top + 40}" width="${w}" height="${h - 40}" rx="54" fill="#eef3f1" opacity="0.35" stroke="#c9d3d0" stroke-width="6"/>
  <g clip-path="url(#jarClip${liquidId})">
    <rect x="${x}" y="${liquidTop}" width="${w}" height="${top + h - liquidTop}" fill="url(#${liquidId})"/>
    <ellipse cx="${cx}" cy="${liquidTop}" rx="${w / 2}" ry="14" fill="#fff" opacity="0.18"/>
    ${inside}
  </g>
  <rect x="${lx}" y="${top + 80}" width="26" height="${h - 160}" rx="13" fill="url(#glassHi)"/>
  <rect x="${x + w - 50}" y="${top + 110}" width="12" height="${h - 220}" rx="6" fill="#fff" opacity="0.25"/>
  <rect x="${x + 22}" y="${top}" width="${w - 44}" height="56" rx="10" fill="url(#lid)"/>
  ${Array.from({ length: 5 }, (_, i) => `<rect x="${x + 22}" y="${top + 8 + i * 10}" width="${w - 44}" height="3" fill="#8a7a55" opacity="0.5"/>`).join('')}
  <rect x="${x + 30}" y="${top - 12}" width="${w - 60}" height="18" rx="8" fill="#d8c99a"/>`;
}
const lidDef = `<linearGradient id="lid" x1="0" x2="1">
  <stop offset="0" stop-color="#b9a774"/><stop offset="0.35" stop-color="#efe2b4"/><stop offset="1" stop-color="#9c8a5a"/>
</linearGradient>`;

// ---------- Recipes ----------

export function winterSimpleSyrup() {
  const r = rng(11);
  let inside = '';
  for (let i = 0; i < 9; i++) inside += cranberry(640 + r() * 320, 820 + r() * 130, 16 + r() * 6, true);
  inside += `<g opacity="0.75">${rosemary(700, 960, 860, 520, 14, 36, 4)}</g>`;
  let loose = '';
  const spots = [[420, 960], [470, 1010], [380, 1020], [1150, 990], [1210, 940], [1240, 1030], [530, 1060], [1100, 1060]];
  spots.forEach(([x, y], i) => { loose += shadow(x + 6, y + 18, 26, 8, 0.25) + cranberry(x, y, 24 + (i % 3) * 3); });
  return svg(counterDefs + lidDef + `
    <linearGradient id="winterLiq" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d33a55"/><stop offset="1" stop-color="#8e1430"/>
    </linearGradient>`,
    counter(5) +
    masonJar(800, 300, 400, 720, 470, 'winterLiq', inside) +
    `<g>${rosemary(250, 1090, 560, 880, 16, 40, 9)}</g>` +
    `<g>${rosemary(1050, 1120, 1380, 900, 14, 38, 12)}</g>` +
    loose);
}

export function spicedSimpleSyrup() {
  const r = rng(21);
  let inside = '';
  for (let i = 0; i < 7; i++) inside += clove(640 + r() * 300, 880 + r() * 90, r() * 360);
  inside += `<g opacity="0.8">${cinnamon(760, 940, 300, -72).replace('#8a5326', '#5e3415')}</g>`;
  let props = '';
  props += shadow(330, 1050, 200, 22, 0.3) + cinnamon(200, 1010, 320, -8);
  props += shadow(370, 1100, 200, 22, 0.3) + cinnamon(230, 1070, 300, 4);
  for (let i = 0; i < 14; i++) props += clove(1080 + r() * 280, 960 + r() * 140, r() * 360);
  // orange peel strip
  props += shadow(1230, 900, 140, 20, 0.25) + `<g transform="rotate(-12 1230 860)">
    <path d="M1100 860 C 1150 800, 1310 800, 1360 860 C 1310 900, 1150 905, 1100 860 Z" fill="#e7781e"/>
    <path d="M1120 858 C 1165 815, 1295 815, 1340 858 C 1295 885, 1165 888, 1120 858 Z" fill="#f6d9a8"/>
    <path d="M1100 860 C 1150 800, 1310 800, 1360 860" stroke="#f5a24a" stroke-width="8" fill="none"/></g>`;
  return svg(counterDefs + lidDef + `
    <linearGradient id="spiceLiq" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c27a32"/><stop offset="1" stop-color="#6a3612"/>
    </linearGradient>`,
    counter(7) + masonJar(800, 300, 400, 720, 450, 'spiceLiq', inside) + props);
}

function coupe(cx, rimY, rx, liqTop, liquidFill, foam = true, garnish = '') {
  const bowlBottom = rimY + 210;
  const bowl = `M${cx - rx} ${rimY} C ${cx - rx} ${rimY + 150}, ${cx - 60} ${bowlBottom}, ${cx} ${bowlBottom} C ${cx + 60} ${bowlBottom}, ${cx + rx} ${rimY + 150}, ${cx + rx} ${rimY} Z`;
  const footY = rimY + 520;
  return `
  ${shadow(cx + 50, footY + 10, 170, 26, 0.35)}
  <clipPath id="bowlClip"><path d="${bowl}"/></clipPath>
  <path d="${bowl}" fill="#e9f1f2" opacity="0.25"/>
  <g clip-path="url(#bowlClip)">
    <rect x="${cx - rx}" y="${liqTop}" width="${rx * 2}" height="300" fill="${liquidFill}"/>
    ${foam ? `<rect x="${cx - rx}" y="${liqTop}" width="${rx * 2}" height="34" fill="#f6ead2"/>` : ''}
  </g>
  <ellipse cx="${cx}" cy="${liqTop}" rx="${rx - 14}" ry="22" fill="${foam ? '#fbf3e2' : '#fff'}" opacity="${foam ? 1 : 0.25}"/>
  ${garnish}
  <ellipse cx="${cx}" cy="${rimY}" rx="${rx}" ry="26" fill="none" stroke="#f4f8f8" stroke-width="5" opacity="0.9"/>
  <path d="${bowl}" fill="none" stroke="#dfe7e8" stroke-width="5" opacity="0.9"/>
  <path d="M${cx - rx + 30} ${rimY + 30} C ${cx - rx + 30} ${rimY + 120}, ${cx - 80} ${rimY + 180}, ${cx - 60} ${rimY + 190}" stroke="#fff" stroke-width="12" fill="none" opacity="0.5" stroke-linecap="round"/>
  <rect x="${cx - 9}" y="${bowlBottom - 4}" width="18" height="${footY - bowlBottom}" fill="#e4eced" opacity="0.85"/>
  <rect x="${cx - 4}" y="${bowlBottom}" width="5" height="${footY - bowlBottom - 10}" fill="#fff" opacity="0.7"/>
  <ellipse cx="${cx}" cy="${footY}" rx="130" ry="24" fill="#e4eced" opacity="0.8"/>
  <ellipse cx="${cx}" cy="${footY - 4}" rx="110" ry="16" fill="#fff" opacity="0.35"/>`;
}

export function amarettoStoneSour() {
  const cx = 800, rimY = 380, liqTop = 410;
  const peel = `<path d="M${cx - 120} ${liqTop + 2} C ${cx - 60} ${liqTop - 30}, ${cx + 40} ${liqTop + 30}, ${cx + 130} ${liqTop - 6}" stroke="#e8761f" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M${cx - 120} ${liqTop - 6} C ${cx - 60} ${liqTop - 38}, ${cx + 40} ${liqTop + 22}, ${cx + 130} ${liqTop - 14}" stroke="#f7a64e" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  return svg(patioDefs + `
    <linearGradient id="stoneLiq" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f0a54a"/><stop offset="1" stop-color="#c46a1c"/>
    </linearGradient>`,
    patio(3) + coupe(cx, rimY, 230, liqTop, 'url(#stoneLiq)', true, peel) +
    // orange half on table
    shadow(1240, 980, 120, 22, 0.3) +
    `<ellipse cx="1220" cy="940" rx="120" ry="58" fill="#e8761f"/><ellipse cx="1220" cy="930" rx="108" ry="48" fill="#f7a64e"/>
     ${Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return `<line x1="1220" y1="930" x2="${(1220 + Math.cos(a) * 96).toFixed(0)}" y2="${(930 + Math.sin(a) * 40).toFixed(0)}" stroke="#fde3b8" stroke-width="5"/>`; }).join('')}
     <ellipse cx="1220" cy="930" rx="14" ry="7" fill="#fde3b8"/>`);
}

function rocksGlass(cx, top, bottom, wTop, wBot, liqTop, fill, ice = true, seed = 1) {
  const r = rng(seed);
  const body = `M${cx - wTop / 2} ${top} L${cx - wBot / 2} ${bottom} Q ${cx} ${bottom + 18} ${cx + wBot / 2} ${bottom} L${cx + wTop / 2} ${top} Z`;
  let cubes = '';
  if (ice) for (let i = 0; i < 6; i++) {
    const x = cx - wTop / 2 + 30 + r() * (wTop - 150), y = liqTop - 30 + r() * (bottom - liqTop - 140);
    cubes += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(90 + r() * 30).toFixed(0)}" height="${(80 + r() * 30).toFixed(0)}" rx="16" fill="#fff" opacity="0.28" transform="rotate(${((r() - 0.5) * 30).toFixed(0)} ${x + 50} ${y + 45})"/>`;
  }
  return {
    id: `rg${seed}`,
    draw: (rimDecor = '', topDecor = '') => `
    ${shadow(cx + 50, bottom + 16, wBot * 0.75, 30, 0.38)}
    <clipPath id="rg${seed}"><path d="${body}"/></clipPath>
    <path d="${body}" fill="#eef4f4" opacity="0.28"/>
    <g clip-path="url(#rg${seed})">
      <rect x="${cx - wTop / 2}" y="${liqTop}" width="${wTop}" height="${bottom - liqTop + 30}" fill="${fill}"/>
      ${cubes}
      <rect x="${cx - wTop / 2}" y="${bottom - 46}" width="${wTop}" height="60" fill="#fff" opacity="0.22"/>
    </g>
    <ellipse cx="${cx}" cy="${liqTop}" rx="${wTop / 2 - 8}" ry="16" fill="#fff" opacity="0.22"/>
    ${rimDecor}
    <path d="${body}" fill="none" stroke="#e6eeee" stroke-width="6" opacity="0.9"/>
    <ellipse cx="${cx}" cy="${top}" rx="${wTop / 2}" ry="20" fill="none" stroke="#f5f9f9" stroke-width="5"/>
    <path d="M${cx - wTop / 2 + 34} ${top + 40} L${cx - wBot / 2 + 30} ${bottom - 40}" stroke="#fff" stroke-width="16" opacity="0.4" stroke-linecap="round"/>
    ${topDecor}`
  };
}

function limeWheel(cx, cy, rad, rot = 0) {
  let segs = '';
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2 + 0.06, a1 = ((i + 1) / 8) * Math.PI * 2 - 0.06;
    const ri = rad * 0.8;
    segs += `<path d="M${cx} ${cy} L${(cx + Math.cos(a0) * ri).toFixed(1)} ${(cy + Math.sin(a0) * ri).toFixed(1)} A ${ri} ${ri} 0 0 1 ${(cx + Math.cos(a1) * ri).toFixed(1)} ${(cy + Math.sin(a1) * ri).toFixed(1)} Z" fill="#b9d86a"/>`;
  }
  return `<g transform="rotate(${rot} ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="${rad}" fill="#4f8a2a"/><circle cx="${cx}" cy="${cy}" r="${rad * 0.88}" fill="#eef4cf"/>${segs}<circle cx="${cx}" cy="${cy}" r="${rad * 0.1}" fill="#eef4cf"/></g>`;
}

export function aperolMargarita() {
  const r = rng(31);
  const cx = 800, top = 540, bottom = 960, wTop = 440, wBot = 380;
  let salt = '';
  for (let i = 0; i < 260; i++) {
    const a = r() * Math.PI * 2, x = cx + Math.cos(a) * (wTop / 2) + (r() - 0.5) * 12;
    const y = top + Math.sin(a) * 20 + r() * 34 - 6;
    salt += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(4 + r() * 5).toFixed(1)}" height="${(4 + r() * 5).toFixed(1)}" fill="#fff" opacity="${(0.75 + r() * 0.25).toFixed(2)}" transform="rotate(${(r() * 90).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  const g = rocksGlass(cx, top, bottom, wTop, wBot, 590, 'url(#aperolLiq)', true, 5);
  // salt dish + limes on table
  let extras = shadow(1250, 1000, 150, 26, 0.3) +
    `<ellipse cx="1240" cy="975" rx="150" ry="48" fill="#ece7dc"/><ellipse cx="1240" cy="968" rx="124" ry="36" fill="#fbfaf6"/>`;
  for (let i = 0; i < 120; i++) extras += `<rect x="${(1140 + r() * 200).toFixed(0)}" y="${(950 + r() * 36).toFixed(0)}" width="5" height="5" fill="#d9d6cf"/>`;
  extras += shadow(380, 1030, 130, 22, 0.3) +
    `<ellipse cx="370" cy="990" rx="120" ry="70" fill="#5a9a2e"/><ellipse cx="350" cy="972" rx="60" ry="22" fill="#8cc152" opacity="0.6"/>` +
    `<g transform="translate(470 1040) scale(1 0.55)">${limeWheel(0, 0, 80)}</g>`;
  return svg(patioDefs + `
    <linearGradient id="aperolLiq" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7823a"/><stop offset="1" stop-color="#e2461f"/>
    </linearGradient>`,
    patio(9) + extras + g.draw(salt, limeWheel(cx + 170, top - 10, 82, 12)));
}

export function mashedSweetPotatoes() {
  const r = rng(41);
  const x0 = 300, y0 = 360, w = 1000, h = 560;
  let topping = '';
  for (let i = 0; i < 70; i++) {
    const cx = x0 + 70 + r() * (w - 140), cy = y0 + 70 + r() * (h - 140);
    topping += `<ellipse filter="url(#soft2)" cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${(30 + r() * 60).toFixed(0)}" ry="${(18 + r() * 34).toFixed(0)}" fill="${pick(r, ['#f0c35a', '#e9b043', '#f6d77c'])}" opacity="0.85"/>`;
  }
  for (let i = 0; i < 70; i++) {
    const cx = x0 + 70 + r() * (w - 140), cy = y0 + 70 + r() * (h - 140);
    topping += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${(10 + r() * 26).toFixed(0)}" ry="${(7 + r() * 16).toFixed(0)}" fill="${pick(r, ['#b8732a', '#a2611f', '#c98a3c'])}" opacity="0.7" filter="url(#soft2)"/>`;
  }
  for (let i = 0; i < 500; i++) {
    const cx = x0 + 60 + r() * (w - 120), cy = y0 + 60 + r() * (h - 120);
    topping += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(2 + r() * 4).toFixed(1)}" fill="${pick(r, ['#d9a04a', '#fbe3a0', '#9c5a1d'])}"/>`;
  }
  for (let i = 0; i < 40; i++) {
    const cx = x0 + 80 + r() * (w - 160), cy = y0 + 80 + r() * (h - 160), a = r() * 180;
    topping += `<rect x="${cx.toFixed(0)}" y="${cy.toFixed(0)}" width="16" height="5" rx="2.5" fill="#3f6a34" transform="rotate(${a.toFixed(0)} ${cx.toFixed(0)} ${cy.toFixed(0)})"/>`;
  }
  // sweet potato peeking at the edges
  const dish = `
    ${shadow(800, 1000, 560, 60, 0.4)}
    <rect x="${x0 - 50}" y="${y0 - 40}" width="${w + 100}" height="${h + 170}" rx="70" fill="#f5f1ea"/>
    <rect x="${x0 - 50}" y="${y0 + h + 40}" width="${w + 100}" height="90" rx="40" fill="#d8d1c4"/>
    <path d="M${x0 - 50} ${y0 + h + 60} H ${x0 + w + 50}" stroke="#c6beb0" stroke-width="4"/>
    <rect x="${x0 - 50}" y="${y0 - 40}" width="${w + 100}" height="${h + 110}" rx="70" fill="#fbf8f2"/>
    <clipPath id="dishIn"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="40"/></clipPath>
    <g clip-path="url(#dishIn)">
      <rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#e57a2a"/><rect x="${x0+40}" y="${y0+40}" width="${w-80}" height="${h-80}" rx="80" fill="#e8b04a" filter="url(#soft)"/>
      ${topping}
      <rect x="${x0}" y="${y0}" width="${w}" height="40" fill="#000" opacity="0.10"/>
    </g>
    <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="40" fill="none" stroke="#e6dfd3" stroke-width="8"/>`;
  // serving spoon
  const spoon = `${shadow(1300, 860, 160, 22, 0.25)}
    <g transform="rotate(-28 1180 700)">
      <rect x="1180" y="690" width="360" height="26" rx="13" fill="#b8bcbf"/>
      <rect x="1180" y="692" width="360" height="8" rx="4" fill="#e9ecee"/>
      <ellipse cx="1130" cy="703" rx="90" ry="58" fill="#a9aeb2"/>
      <ellipse cx="1130" cy="700" rx="76" ry="46" fill="#e57a2a"/>
      <ellipse cx="1120" cy="690" rx="52" ry="26" fill="#f0c35a" opacity="0.8"/>
    </g>`;
  return svg(counterDefs, counter(13) + dish + spoon + rosemary(110, 1150, 330, 1000, 12, 34, 5));
}

function muffin(cx, base, s, seed) {
  const r = rng(seed);
  const lw = 180 * s, lh = 120 * s;
  let pleats = '';
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    const xt = cx - lw / 2 + lw * t, xb = cx - lw * 0.4 + lw * 0.8 * t;
    pleats += `<line x1="${xt.toFixed(1)}" y1="${(base - lh).toFixed(1)}" x2="${xb.toFixed(1)}" y2="${base}" stroke="#9fb8cf" stroke-width="${3 * s}"/>`;
  }
  const domeW = lw * 0.8;
  let dome = `<path d="M${cx - lw / 2 - 30 * s} ${base - lh + 10 * s} C ${cx - domeW} ${base - lh - 140 * s}, ${cx + domeW} ${base - lh - 140 * s}, ${cx + lw / 2 + 30 * s} ${base - lh + 10 * s} Q ${cx} ${base - lh + 24 * s} ${cx - lw / 2 - 30 * s} ${base - lh + 10 * s} Z" fill="url(#muffinTop)"/>`;
  // cracks
  dome += `<path d="M${cx - 50 * s} ${base - lh - 70 * s} q ${30 * s} ${12 * s} ${70 * s} ${-6 * s}" stroke="#a8692a" stroke-width="${5 * s}" fill="none" stroke-linecap="round" opacity="0.6"/>`;
  for (let i = 0; i < 7; i++) {
    const bx = cx + (r() - 0.5) * lw * 0.9, by = base - lh - 20 * s - r() * 70 * s;
    const br = (11 + r() * 6) * s;
    dome += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(br + 5 * s).toFixed(1)}" fill="#6a3b6e" opacity="0.35"/><circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${br.toFixed(1)}" fill="#3a3f8a"/><circle cx="${(bx - br * 0.3).toFixed(1)}" cy="${(by - br * 0.35).toFixed(1)}" r="${(br * 0.3).toFixed(1)}" fill="#aab3e8" opacity="0.7"/>`;
  }
  for (let i = 0; i < 60; i++) {
    const bx = cx + (r() - 0.5) * lw, by = base - lh - r() * 95 * s;
    dome += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(1.5 + r() * 2.5) * s}" fill="${pick(r, ['#7a3f16', '#c98a3c', '#5e2f10'])}" opacity="0.8"/>`;
  }
  return `${shadow(cx + 20 * s, base + 6, lw * 0.6, 18 * s, 0.35)}
    <path d="M${cx - lw / 2} ${base - lh} L${cx - lw * 0.4} ${base} L${cx + lw * 0.4} ${base} L${cx + lw / 2} ${base - lh} Z" fill="#dfeaf3"/>
    ${pleats}${dome}`;
}

export function blueberryMuffins() {
  let rack = shadow(800, 1000, 600, 50, 0.3);
  rack += `<rect x="230" y="560" width="1140" height="440" rx="24" fill="none" stroke="#6d6a66" stroke-width="10"/>`;
  for (let x = 290; x < 1370; x += 60) rack += `<line x1="${x}" y1="560" x2="${x}" y2="1000" stroke="#7c7975" stroke-width="5"/>`;
  for (let y = 620; y < 1000; y += 64) rack += `<line x1="230" y1="${y}" x2="1370" y2="${y}" stroke="#8a8783" stroke-width="4"/>`;
  const back = [[530, 700, 0.95], [800, 690, 0.98], [1070, 700, 0.95]];
  const front = [[400, 930, 1.15], [800, 940, 1.2], [1200, 930, 1.15]];
  let m = '';
  back.forEach(([x, y, s], i) => (m += muffin(x, y, s, 100 + i)));
  front.forEach(([x, y, s], i) => (m += muffin(x, y, s, 200 + i)));
  return svg(counterDefs + `
    <radialGradient id="muffinTop" cx="45%" cy="35%" r="70%">
      <stop offset="0" stop-color="#f3c879"/><stop offset="0.7" stop-color="#d79a4a"/><stop offset="1" stop-color="#b5732f"/>
    </radialGradient>`, counter(17) + `<g transform="translate(800 820) scale(1.25) translate(-800 -800)">${rack + m}</g>`);
}

export function homemadeIrishCream() {
  const cx = 640;
  const bottle = `
    ${shadow(cx + 50, 1010, 200, 30, 0.38)}
    <clipPath id="btl"><path d="M${cx - 150} 1000 V 560 C ${cx - 150} 470, ${cx - 60} 450, ${cx - 52} 380 V 250 H ${cx + 52} V 380 C ${cx + 60} 450, ${cx + 150} 470, ${cx + 150} 560 V 1000 Z"/></clipPath>
    <path d="M${cx - 150} 1000 V 560 C ${cx - 150} 470, ${cx - 60} 450, ${cx - 52} 380 V 250 H ${cx + 52} V 380 C ${cx + 60} 450, ${cx + 150} 470, ${cx + 150} 560 V 1000 Z" fill="#eef4f2" opacity="0.4"/>
    <g clip-path="url(#btl)">
      <rect x="${cx - 160}" y="420" width="320" height="600" fill="url(#creamLiq)"/>
      <ellipse cx="${cx}" cy="420" rx="70" ry="8" fill="#fff" opacity="0.3"/>
    </g>
    <path d="M${cx - 150} 1000 V 560 C ${cx - 150} 470, ${cx - 60} 450, ${cx - 52} 380 V 250 H ${cx + 52} V 380 C ${cx + 60} 450, ${cx + 150} 470, ${cx + 150} 560 V 1000 Z" fill="none" stroke="#d3dcd9" stroke-width="6"/>
    <rect x="${cx - 120}" y="560" width="30" height="380" rx="15" fill="url(#glassHi)"/>
    <!-- swing top -->
    <rect x="${cx - 46}" y="196" width="92" height="58" rx="14" fill="#f0ece4"/>
    <rect x="${cx - 52}" y="244" width="104" height="14" rx="6" fill="#c0392b"/>
    <path d="M${cx - 58} 300 C ${cx - 90} 240, ${cx - 70} 200, ${cx - 40} 210" stroke="#9aa0a4" stroke-width="7" fill="none"/>
    <path d="M${cx + 58} 300 C ${cx + 90} 240, ${cx + 70} 200, ${cx + 40} 210" stroke="#9aa0a4" stroke-width="7" fill="none"/>
    <rect x="${cx - 62}" y="292" width="124" height="14" rx="7" fill="#9aa0a4"/>
    <!-- kraft tag -->
    <path d="M${cx + 20} 330 L ${cx + 150} 400" stroke="#8a6a46" stroke-width="3"/>
    <g transform="rotate(14 ${cx + 190} 430)"><rect x="${cx + 140}" y="395" width="110" height="70" rx="8" fill="#c9a77a"/><circle cx="${cx + 155}" cy="430" r="7" fill="#f3efe7"/></g>`;
  const g = rocksGlass(1080, 560, 980, 340, 290, 680, 'url(#creamLiq)', true, 9);
  // coffee beans + chocolate
  const r = rng(51);
  let beans = '';
  for (let i = 0; i < 12; i++) {
    const x = 1300 + r() * 160, y = 1020 + r() * 90, a = r() * 180;
    beans += `<g transform="rotate(${a.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"><ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="20" ry="14" fill="#4a2c1a"/><path d="M${(x - 16).toFixed(0)} ${y.toFixed(0)} q 16 6 32 0" stroke="#24140b" stroke-width="3" fill="none"/></g>`;
  }
  return svg(counterDefs + `
    <linearGradient id="creamLiq" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e2c29b"/><stop offset="1" stop-color="#b98a5c"/>
    </linearGradient>`, counter(23) + bottle + g.draw() + beans);
}

export const recipes = {
  'winter-simple-syrup': winterSimpleSyrup,
  'spiced-simple-syrup': spicedSimpleSyrup,
  'amaretto-stone-sour': amarettoStoneSour,
  'aperol-margarita': aperolMargarita,
  'mashed-sweet-potatoes': mashedSweetPotatoes,
  'blueberry-muffins': blueberryMuffins,
  'homemade-irish-cream': homemadeIrishCream,
};

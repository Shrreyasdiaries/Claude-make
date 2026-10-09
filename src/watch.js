// Procedural SVG watch. Every part shares one 400×560 viewBox so the
// layers can be stacked or pulled apart for the exploded view.

const CX = 200;
const CY = 280;
let uid = 0;

const METALS = {
  steel: ['#f6f7f9', '#b9bec6', '#6b7079', '#e3e6ea', '#3c4047'],
  gold: ['#fff1cf', '#d9b36d', '#8a6427', '#f0d498', '#4f3711'],
  black: ['#6a6e75', '#34373c', '#121315', '#4a4e54', '#050506'],
};

export const VARIANTS = {
  midnight: { dial: '#0f2140', dialLight: '#2f5590', metal: 'steel', accent: '#c8a96a' },
  glacier: { dial: '#8fb3c9', dialLight: '#e3f0f7', metal: 'steel', accent: '#1d3557' },
  forest: { dial: '#12301f', dialLight: '#3c7a52', metal: 'gold', accent: '#f0d498' },
  obsidian: { dial: '#0c0c0d', dialLight: '#3a3a3e', metal: 'black', accent: '#d4553a' },
  sand: { dial: '#b99a70', dialLight: '#f1e2c6', metal: 'gold', accent: '#5a3d16' },
};

const circlePath = (r) =>
  `M ${CX - r} ${CY} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;

function polygon(n, r, offsetDeg = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ((i * 360) / n + offsetDeg) * (Math.PI / 180);
    d += `${i ? 'L' : 'M'} ${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)} `;
  }
  return d + 'Z';
}

function gearPath(cx, cy, r, teeth, depth = 6) {
  const step = (Math.PI * 2) / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts = [
      [r - depth, a],
      [r, a + step * 0.2],
      [r, a + step * 0.5],
      [r - depth, a + step * 0.7],
    ];
    pts.forEach(([rr, aa], j) => {
      d += `${i === 0 && j === 0 ? 'M' : 'L'} ${(cx + rr * Math.cos(aa)).toFixed(2)} ${(cy + rr * Math.sin(aa)).toFixed(2)} `;
    });
  }
  return d + 'Z';
}

function defs(id, o) {
  const m = METALS[o.metal];
  return `
  <defs>
    <linearGradient id="${id}-brushed" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${m[2]}"/><stop offset=".18" stop-color="${m[1]}"/>
      <stop offset=".45" stop-color="${m[0]}"/><stop offset=".62" stop-color="${m[3]}"/>
      <stop offset=".85" stop-color="${m[1]}"/><stop offset="1" stop-color="${m[2]}"/>
    </linearGradient>
    <linearGradient id="${id}-polish" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${m[0]}"/><stop offset=".35" stop-color="${m[2]}"/>
      <stop offset=".55" stop-color="${m[0]}"/><stop offset=".8" stop-color="${m[1]}"/>
      <stop offset="1" stop-color="${m[4]}"/>
    </linearGradient>
    <radialGradient id="${id}-dial" cx=".38" cy=".3" r=".85">
      <stop offset="0" stop-color="${o.dialLight}"/><stop offset=".55" stop-color="${o.dial}"/>
      <stop offset="1" stop-color="${o.dial}" stop-opacity=".95"/>
    </radialGradient>
    <linearGradient id="${id}-clou" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".45"/>
    </linearGradient>
    <pattern id="${id}-grid" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45 ${CX} ${CY})">
      <rect x="1" y="1" width="7" height="7" rx=".6" fill="url(#${id}-clou)"/>
    </pattern>
    <linearGradient id="${id}-glass" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".35" stop-color="#fff" stop-opacity=".04"/>
      <stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/>
    </linearGradient>
    <pattern id="${id}-geneva" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
      <rect width="14" height="14" fill="${m[1]}"/><rect width="7" height="14" fill="${m[0]}" opacity=".55"/>
    </pattern>
    <pattern id="${id}-perlage" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="${m[2]}"/>
      <circle cx="6" cy="6" r="5.5" fill="none" stroke="${m[0]}" stroke-opacity=".25"/>
      <circle cx="6" cy="6" r="2.5" fill="${m[1]}" opacity=".5"/>
    </pattern>
    <clipPath id="${id}-dialclip"><circle cx="${CX}" cy="${CY}" r="118"/></clipPath>
    <filter id="${id}-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000" flood-opacity=".45"/>
    </filter>
  </defs>`;
}

function bracelet(id) {
  let out = '';
  const rows = 5;
  for (let half = 0; half < 2; half++) {
    for (let k = 0; k < rows; k++) {
      const h = 24;
      const w = 128 + k * 16;
      const y = half === 0 ? 8 + k * 27 : 552 - (8 + k * 27) - h;
      const x0 = CX - w / 2;
      const outer = w * 0.3;
      out += `
        <rect x="${x0}" y="${y}" width="${outer - 3}" height="${h}" rx="4" fill="url(#${id}-brushed)"/>
        <rect x="${x0 + outer}" y="${y}" width="${w - outer * 2}" height="${h}" rx="4" fill="url(#${id}-polish)"/>
        <rect x="${x0 + w - outer + 3}" y="${y}" width="${outer - 3}" height="${h}" rx="4" fill="url(#${id}-brushed)"/>`;
    }
  }
  return `<g class="w-bracelet">${out}</g>`;
}

function caseBody(id) {
  return `
  <g class="w-case" filter="url(#${id}-shadow)">
    <path d="M ${CX - 112} 140 L ${CX + 112} 140 L ${CX + 168} ${CY} L ${CX + 112} 420 L ${CX - 112} 420 L ${CX - 168} ${CY} Z"
      fill="url(#${id}-brushed)" stroke="#000" stroke-opacity=".2"/>
    <circle cx="${CX}" cy="${CY}" r="158" fill="url(#${id}-polish)"/>
    <rect x="${CX + 154}" y="${CY - 15}" width="20" height="30" rx="4" fill="url(#${id}-polish)"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${CX + 158 + i * 2.6}" y="${CY - 15}" width="1" height="30" fill="#000" opacity=".3"/>`).join('')}
    <circle cx="${CX}" cy="${CY}" r="124" fill="#050505"/>
  </g>`;
}

function bezel(id) {
  const studs = [45, 135, 225, 315]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      const x = CX + 139 * Math.cos(a);
      const y = CY + 139 * Math.sin(a);
      return `<circle cx="${x}" cy="${y}" r="5.5" fill="url(#${id}-polish)" stroke="#000" stroke-opacity=".35"/>
              <circle cx="${x - 1.4}" cy="${y - 1.4}" r="1.6" fill="#fff" opacity=".7"/>`;
    })
    .join('');
  return `
  <g class="w-bezel" filter="url(#${id}-shadow)">
    <path d="${polygon(12, 152, 15)} ${circlePath(122)}" fill-rule="evenodd" fill="url(#${id}-polish)"
      stroke="#000" stroke-opacity=".25" stroke-linejoin="round" stroke-width="2"/>
    <path d="${polygon(12, 146, 15)}" fill="none" stroke="#fff" stroke-opacity=".35"/>
    <circle cx="${CX}" cy="${CY}" r="122" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3"/>
    ${studs}
  </g>`;
}

function dial(id, o) {
  const m = METALS[o.metal];
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    ticks += `<line x1="${CX}" y1="${CY - 116}" x2="${CX}" y2="${CY - 111}" stroke="#fff" stroke-opacity=".55" stroke-width="1" transform="rotate(${i * 6} ${CX} ${CY})"/>`;
  }
  let idx = '';
  for (let i = 0; i < 12; i++) {
    if (i === 3) continue;
    const baton = (dx) =>
      `<rect x="${CX - 3.5 + dx}" y="${CY - 106}" width="7" height="26" rx="1.5" fill="url(#${id}-polish)"/>
       <rect x="${CX - 1.2 + dx}" y="${CY - 103}" width="2.4" height="20" rx="1" fill="#eaf5e4" opacity=".9"/>`;
    idx += `<g transform="rotate(${i * 30} ${CX} ${CY})">${i === 0 ? baton(-6) + baton(6) : baton(0)}</g>`;
  }
  const day = new Date().getDate();
  return `
  <g class="w-dial">
    <circle cx="${CX}" cy="${CY}" r="118" fill="url(#${id}-dial)"/>
    <g clip-path="url(#${id}-dialclip)">
      <rect x="${CX - 130}" y="${CY - 130}" width="260" height="260" fill="url(#${id}-grid)" opacity=".75"/>
    </g>
    <circle cx="${CX}" cy="${CY}" r="108" fill="none" stroke="#fff" stroke-opacity=".12"/>
    ${ticks}${idx}
    <rect x="${CX + 66}" y="${CY - 11}" width="28" height="22" rx="2" fill="#f5f2ea" stroke="url(#${id}-polish)" stroke-width="2"/>
    <text x="${CX + 80}" y="${CY + 5.5}" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#111">${day}</text>
    <text x="${CX}" y="${CY - 50}" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="17" letter-spacing="5" fill="${m[0]}">VAUCLAIR</text>
    <text x="${CX}" y="${CY - 36}" text-anchor="middle" font-family="Inter, sans-serif" font-size="5.5" letter-spacing="3" fill="#fff" opacity=".6">GENÈVE</text>
    <text x="${CX}" y="${CY + 56}" text-anchor="middle" font-family="Inter, sans-serif" font-size="6" letter-spacing="3.5" fill="#fff" opacity=".7">AUTOMATIC</text>
    <text x="${CX}" y="${CY + 92}" text-anchor="middle" font-family="Inter, sans-serif" font-size="4.5" letter-spacing="2" fill="#fff" opacity=".5">SWISS MADE</text>
  </g>`;
}

function hands(id, o) {
  return `
  <g class="w-hands" filter="url(#${id}-shadow)">
    <g class="hand-h">
      <path d="M ${CX - 6} ${CY + 14} L ${CX - 6} ${CY - 50} L ${CX} ${CY - 64} L ${CX + 6} ${CY - 50} L ${CX + 6} ${CY + 14} Z" fill="url(#${id}-polish)"/>
      <path d="M ${CX - 2.5} ${CY - 12} L ${CX - 2.5} ${CY - 50} L ${CX} ${CY - 56} L ${CX + 2.5} ${CY - 50} L ${CX + 2.5} ${CY - 12} Z" fill="#eaf5e4"/>
    </g>
    <g class="hand-m">
      <path d="M ${CX - 5} ${CY + 18} L ${CX - 5} ${CY - 86} L ${CX} ${CY - 100} L ${CX + 5} ${CY - 86} L ${CX + 5} ${CY + 18} Z" fill="url(#${id}-polish)"/>
      <path d="M ${CX - 2} ${CY - 14} L ${CX - 2} ${CY - 86} L ${CX} ${CY - 92} L ${CX + 2} ${CY - 86} L ${CX + 2} ${CY - 14} Z" fill="#eaf5e4"/>
    </g>
    <g class="hand-s">
      <rect x="${CX - 0.9}" y="${CY - 110}" width="1.8" height="138" fill="${o.accent}"/>
      <circle cx="${CX}" cy="${CY + 26}" r="4.5" fill="${o.accent}"/>
    </g>
    <circle cx="${CX}" cy="${CY}" r="5" fill="url(#${id}-polish)"/>
    <circle cx="${CX}" cy="${CY}" r="1.6" fill="#222"/>
  </g>`;
}

function crystal(id) {
  return `
  <g class="w-crystal" pointer-events="none">
    <circle cx="${CX}" cy="${CY}" r="121" fill="url(#${id}-glass)"/>
    <path d="M ${CX - 100} ${CY - 40} A 110 110 0 0 1 ${CX + 30} ${CY - 112} A 130 130 0 0 0 ${CX - 100} ${CY - 40} Z"
      fill="#fff" opacity=".18"/>
  </g>`;
}

function movement(id) {
  const g = (cx, cy, r, t, dur, rev = false, extra = '') => `
    <g class="gear ${rev ? 'rev' : ''}" style="animation-duration:${dur}s">
      <path d="${gearPath(cx, cy, r, t, Math.max(3, r * 0.12))}" fill="url(#${id}-polish)" stroke="#000" stroke-opacity=".3"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="${r * 0.2}"/>
      <circle cx="${cx}" cy="${cy}" r="${Math.max(2.5, r * 0.14)}" fill="#a3122a"/>${extra}
    </g>`;
  const jewel = (x, y) =>
    `<circle cx="${x}" cy="${y}" r="4" fill="#9c1027"/><circle cx="${x - 1}" cy="${y - 1}" r="1.3" fill="#ff8fa0" opacity=".8"/>`;
  return `
  <g class="w-movement">
    <circle cx="${CX}" cy="${CY}" r="158" fill="url(#${id}-polish)"/>
    <circle cx="${CX}" cy="${CY}" r="132" fill="url(#${id}-perlage)"/>
    ${g(CX - 45, CY + 35, 34, 30, 14)}
    ${g(CX + 20, CY + 60, 22, 20, 9, true)}
    ${g(CX + 55, CY - 10, 28, 24, 11)}
    ${g(CX - 10, CY - 55, 18, 16, 6, true)}
    <path d="M ${CX - 120} ${CY - 20} Q ${CX - 40} ${CY - 120} ${CX + 70} ${CY - 95} L ${CX + 95} ${CY - 55} Q ${CX} ${CY - 60} ${CX - 95} ${CY + 25} Z"
      fill="url(#${id}-geneva)" stroke="#000" stroke-opacity=".35"/>
    <path d="M ${CX + 120} ${CY + 30} Q ${CX + 60} ${CY + 120} ${CX - 30} ${CY + 118} L ${CX - 25} ${CY + 90} Q ${CX + 50} ${CY + 85} ${CX + 95} ${CY + 15} Z"
      fill="url(#${id}-geneva)" stroke="#000" stroke-opacity=".35"/>
    ${jewel(CX - 70, CY - 32)}${jewel(CX + 40, CY - 72)}${jewel(CX + 75, CY + 50)}${jewel(CX - 5, CY + 102)}
    <g class="balance">
      <circle cx="${CX - 62}" cy="${CY + 72}" r="26" fill="none" stroke="url(#${id}-polish)" stroke-width="4"/>
      <line x1="${CX - 88}" y1="${CY + 72}" x2="${CX - 36}" y2="${CY + 72}" stroke="url(#${id}-polish)" stroke-width="3"/>
      <circle cx="${CX - 62}" cy="${CY + 72}" r="4" fill="#9c1027"/>
    </g>
    <g class="rotor">
      <path d="M ${CX - 128} ${CY} A 128 128 0 0 1 ${CX + 128} ${CY} L ${CX + 38} ${CY} A 38 38 0 0 0 ${CX - 38} ${CY} Z"
        fill="url(#${id}-brushed)" opacity=".88" stroke="#000" stroke-opacity=".3"/>
      <text x="${CX}" y="${CY - 70}" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-size="13" letter-spacing="4" fill="#222" opacity=".7">CALIBRE V-1874</text>
      <circle cx="${CX}" cy="${CY}" r="10" fill="url(#${id}-polish)"/>
    </g>
  </g>`;
}

/**
 * @param {object} opts
 * @param {keyof VARIANTS} [opts.variant]
 * @param {string[]} [opts.parts] subset of: bracelet case dial hands bezel crystal movement
 */
export function createWatch({ variant = 'midnight', parts } = {}) {
  const o = VARIANTS[variant];
  const id = `w${uid++}`;
  const all = ['bracelet', 'case', 'dial', 'hands', 'bezel', 'crystal'];
  const use = new Set(parts || all);
  const build = {
    bracelet: () => bracelet(id),
    case: () => caseBody(id),
    dial: () => dial(id, o),
    hands: () => hands(id, o),
    bezel: () => bezel(id),
    crystal: () => crystal(id),
    movement: () => movement(id),
  };
  const order = ['movement', ...all];
  const body = order.filter((p) => use.has(p)).map((p) => build[p]()).join('');
  return `<svg class="watch-svg" viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs(id, o)}${body}</svg>`;
}

// Drive every hand on the page from one clock, with a smooth sweeping seconds hand.
export function startClock() {
  const groups = ['.hand-h', '.hand-m', '.hand-s'].map((sel) => [...document.querySelectorAll(sel)]);
  const tick = () => {
    const now = new Date();
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    [h * 30, m * 6, s * 6].forEach((deg, i) =>
      groups[i].forEach((el) => el.setAttribute('transform', `rotate(${deg} ${CX} ${CY})`))
    );
    requestAnimationFrame(tick);
  };
  tick();
}

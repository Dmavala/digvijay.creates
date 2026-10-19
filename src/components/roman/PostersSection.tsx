import React, { useRef, useEffect } from 'react';
import './posterWall.css';

interface PostersSectionProps {
  isActive: boolean;
  onBackToReel?: () => void;
}

export const PostersSection: React.FC<PostersSectionProps> = ({ isActive, onBackToReel }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const svg = container.querySelector<SVGSVGElement>('.gun svg');
    if (svg && !svg.querySelector('.sheet')) {
      const t = (x: number, y: number, s: string | number, c = '', a = 'start', extra = '') =>
        `<text x="${x}" y="${y}" class="${c}" text-anchor="${a}" ${extra}>${s}</text>`;

      // id, centre x, centre y, rotation, explode dx, dy, printed letters, text offset
      const PARTS: [number, number, number, number, number, number, string, number][] = [
        [1, 356, 428, 0, 0, -34, 'ke', -4],
        [2, 206.5, 467, 0, -30, 0, 'ke', -10],
        [3, 298, 467, 0, -10, 0, 'Co', 4],
        [4, 387.5, 467, 0, 10, 0, 'ke', -12],
        [5, 477.5, 467, 0, 30, 0, 'Co', 6],
        [6, 543, 468, -90, 40, 0, 'Co', 0],
        [7, 300, 529.5, -90, -4, 34, 'Co', 8],
        [8, 403.5, 530, -90, 10, 34, 'ke', -8],
      ];

      let html = PARTS.map(
        ([, cx, cy, r, dx, dy, s, tx]) => `
        <g class="part" style="--dx:${dx}px;--dy:${dy}px"><g transform="translate(${cx} ${cy}) rotate(${r})">
          <g class="real"><use href="#canBody"/>
            <text x="${tx}" y="10" class="print" clip-path="url(#canClip)">${s}</text>
            <use href="#canGloss"/></g>
          <g class="bp"><use href="#canBP"/></g></g></g>`
      ).join('');

      // numbered balloons: n, balloon x, y, leader from, leader to
      const BAL: [number, number, number, number, number, number, number][] = [
        [1, 356, 361, 356, 367.5, 356, 373],
        [2, 176, 429, 176, 435.5, 176, 448],
        [3, 288, 429, 288, 435.5, 288, 448],
        [4, 433, 429, 430, 434.5, 421, 448],
        [5, 507, 429, 507, 435.5, 507, 448],
        [6, 626, 468, 619.5, 468, 603, 468],
        [7, 296, 632, 296, 625.5, 296, 609],
        [8, 413, 632, 413, 625.5, 413, 610],
      ];

      html +=
        `<g class="callouts">` +
        BAL.map(
          ([n, x, y, a, b, c, d]) =>
            `<path d="M${a} ${b}L${c} ${d}"/><circle cx="${x}" cy="${y}" r="6.5"/>${t(
              x,
              y + 2.8,
              n,
              '',
              'middle'
            )}`
        ).join('') +
        `</g>`;

      // the sheet: border, zones, title, dimensions, inset, parts list, notes, title block
      let s = `<g class="sheet">
        <rect x="66" y="306" width="608" height="388" class="thick"/><rect x="80" y="320" width="580" height="360"/>`;
      for (let i = 1; i < 6; i++) {
        const x = 80 + (i * 580) / 6;
        s += `<path d="M${x} 306V320M${x} 680V694"/>`;
      }
      for (let i = 1; i < 4; i++) {
        const y = 320 + i * 90;
        s += `<path d="M66 ${y}H80M660 ${y}H674"/>`;
      }
      for (let i = 0; i < 6; i++) {
        const x = 80 + ((i + 0.5) * 580) / 6;
        s += t(x, 315, i + 1, 'sm', 'middle') + t(x, 690, i + 1, 'sm', 'middle');
      }
      'ABCD'.split('').forEach((l, i) => {
        const y = 320 + (i + 0.5) * 90 + 2;
        s += t(73, y, l, 'sm', 'middle') + t(667, y, l, 'sm', 'middle');
      });

      s += t(92, 335, 'FIG. 1  EXPLODED VIEW  -  DIET COKE CAN ASSEMBLY, WALL MOUNT', 'big');
      s += t(648, 335, 'SHEET 1 / 1', 'mid', 'end');
      // overall exploded span
      s +=
        `<path d="M131 346H602" class="dim"/><path d="M131 340V352M602 340V352"/>` +
        t(366, 343, '701 mm  (EXPLODED SPAN)', '', 'middle');
      // one can: length and diameter
      s +=
        `<path d="M131 489V504M221 489V504M131 500H221" class="dim"/>` +
        t(176, 497, '134', '', 'middle');
      s +=
        `<path d="M99 448H129M99 486H129M105 448V486" class="dim"/>` +
        t(102, 467, '&#216;58', '', 'middle', 'transform="rotate(-90 102 467)"');
      // assembled inset, scale 0.3
      s += `<rect x="88" y="354" width="128" height="64" stroke-dasharray="3 2"/>`;
      s +=
        `<g transform="translate(152 380) scale(.3) translate(-362 -492)" style="--sw:3">` +
        PARTS.map(([, cx, cy, r]) => `<use href="#canBP" transform="translate(${cx} ${cy}) rotate(${r})"/>`).join('') +
        `</g>`;
      s += t(92, 414, 'DETAIL A  ASSEMBLED  (597 x 250 mm)', 'sm');
      // parts list
      s += t(92, 560, 'PARTS LIST', 'mid');
      const cols = [92, 122, 212, 236, 276];
      const rows = [
        ['ITEM', 'DESCRIPTION', 'QTY', 'MATL'],
        ['1', 'SIGHT CAN', '1', 'AL 3004'],
        ['2-5', 'BARREL CAN', '4', 'AL 3004'],
        ['6', 'STOCK CAN', '1', 'AL 3004'],
        ['7', 'GRIP CAN', '1', 'AL 3004'],
        ['8', 'MAG CAN', '1', 'AL 3004'],
      ];
      s += `<rect x="92" y="565" width="184" height="${rows.length * 12}"/>`;
      rows.forEach((r, i) => {
        const y = 565 + i * 12;
        if (i) s += `<path d="M92 ${y}H276"/>`;
        r.forEach((c, j) => (s += t(cols[j] + 3, y + 8.3, c)));
      });
      cols.slice(1, 4).forEach((x) => (s += `<path d="M${x} 565V${565 + rows.length * 12}"/>`));
      // notes
      s += t(470, 556, 'NOTES', 'mid');
      [
        '1. ALL CANS EMPTY, TABS CLOSED.',
        '2. ADHESIVE MOUNT, 0 mm GAP BETWEEN CANS.',
        '3. TOLERANCE +/- 1 mm UNLESS STATED.',
        '4. DISPLAY ONLY. DO NOT SHAKE.',
      ].forEach((n, i) => (s += t(470, 568 + i * 10, n)));
      // title block
      s += `<rect x="440" y="620" width="220" height="60" class="thick"/><path d="M440 640H660M440 654H660M440 667H660M550 640V680"/>`;
      s +=
        t(448, 633, 'DIET COKE CAN ASSEMBLY', 'big') +
        t(448, 649, 'DRG NO.  DC-001') +
        t(558, 649, 'SCALE  2 : 3') +
        t(448, 662, 'DRAWN  S.W.A.') +
        t(558, 662, 'DATE  10 OCT 2026') +
        t(448, 675, 'MATERIAL  AL 3004') +
        t(558, 675, 'REV A  /  UNITS mm');
      s += `</g>`;

      svg.insertAdjacentHTML('beforeend', html + s);
    }

    // Fit the blueprint to the screen when opened
    const fit = () => {
      const gun = container.querySelector<HTMLElement>('.gun');
      if (!gun) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = gun.offsetWidth;
      const h = gun.offsetHeight;
      if (!w || !h) return;
      const rot = vw < 700 && vh > vw * 1.1; // phones in portrait: turn the sheet sideways
      const z = Math.min((rot ? vh : vw) * 0.94 / w, (rot ? vw : vh) * 0.9 / h, 1300 / w);
      gun.style.setProperty('--zoom', z.toFixed(3));
      gun.style.setProperty('--rot', rot ? '90deg' : '0deg');
    };

    fit();
    window.addEventListener('resize', fit);

    // Touch screen toggle support
    const handleTouch = (e: MouseEvent) => {
      const hit = (e.target as Element).closest('.item');
      const items = container.querySelectorAll('.item');
      items.forEach((i) => i !== hit && i.classList.remove('on'));
      if (hit) hit.classList.toggle('on');
    };

    if (window.matchMedia('(hover: none)').matches) {
      container.addEventListener('click', handleTouch);
    }

    // Mouse tracking for interactive torch / specular highlight
    const handleMouseMove = (e: MouseEvent) => {
      const wall = container.querySelector<HTMLElement>('.wall');
      if (!wall) return;
      const x = ((e.clientX / window.innerWidth) * 100).toFixed(1);
      const y = ((e.clientY / window.innerHeight) * 100).toFixed(1);
      wall.style.setProperty('--mx', `${x}%`);
      wall.style.setProperty('--my', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleTouch);
    };
  }, []);

  // Keyboard shortcut: Escape to return to film reel
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBackToReel) {
        onBackToReel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onBackToReel]);

  return (
    <div
      ref={containerRef}
      className={`poster-wall-root section page__posters !p-0 w-full h-full overflow-hidden relative select-none ${
        isActive ? 'active' : ''
      }`}
      id="posters"
    >
      {/* Texture + lighting filters */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="plaster" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={3} seed={4} result="n" />
          <feDiffuseLighting in="n" surfaceScale={1.1} diffuseConstant={1.1} lightingColor="#fbf1d8">
            <feDistantLight azimuth={230} elevation={52} />
          </feDiffuseLighting>
        </filter>
        <filter id="mottle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".004 .009" numOctaves={3} seed={8} />
          <feColorMatrix values="0 0 0 0 .62  0 0 0 0 .5  0 0 0 0 .28  0 0 0 1.5 -.62" />
        </filter>
      </svg>

      <main className="wall">
        {/* Layered Architectural Lighting System */}
        <div className="tex" />
        <div className="sun-gobo" />
        <div className="gallery-spots" />
        <div className="mouse-light" />
        <div className="room-vignette" />

        <div className="stage">
          {/* ===== POSTER SLOTS DISTRIBUTED ACROSS THE WALL (3:4 PORTRAIT RATIO) ===== */}
          {/* Far-Left Column */}
          <figure
            className="item slot"
            tabIndex={0}
            style={{ '--x': 8.5, '--y': 8.0, '--w': 12.0, '--h': 26.5 } as React.CSSProperties}
          >
            <img alt="" />
          </figure>
          <figure
            className="item slot"
            tabIndex={0}
            style={{ '--x': 8.5, '--y': 65.5, '--w': 12.0, '--h': 26.5 } as React.CSSProperties}
          >
            <img alt="" />
          </figure>

          {/* Mid-Left: Glossy Vinyl Sticker */}
          <figure
            className="item slot sticker"
            tabIndex={0}
            style={{ '--x': 22.5, '--y': 39.5, '--w': 9.5, '--h': 21.0 } as React.CSSProperties}
          >
            <img alt="" />
          </figure>

          {/* Center Column: Top & Bottom Posters flanking the Centerpiece */}
          <figure
            className="item slot"
            tabIndex={0}
            style={{ '--x': 44.0, '--y': 6.0, '--w': 12.0, '--h': 26.5 } as React.CSSProperties}
          >
            <img alt="" />
          </figure>
          <figure
            className="item slot"
            tabIndex={0}
            style={{ '--x': 44.0, '--y': 67.5, '--w': 12.0, '--h': 26.5 } as React.CSSProperties}
          >
            <img alt="" />
          </figure>

          {/* Mid-Right: Embossed Metal License Plate */}
          <figure
            className="item slot plate"
            tabIndex={0}
            style={{ '--x': 68.0, '--y': 39.5, '--w': 9.5, '--h': 21.0 } as React.CSSProperties}
          >
            <img alt="" />
          </figure>

          {/* Far-Right Column */}
          <figure
            className="item slot"
            tabIndex={0}
            style={{ '--x': 79.5, '--y': 8.0, '--w': 12.0, '--h': 26.5 } as React.CSSProperties}
          >
            <img alt="" />
          </figure>
          <figure
            className="item slot"
            tabIndex={0}
            style={{ '--x': 79.5, '--y': 65.5, '--w': 12.0, '--h': 26.5 } as React.CSSProperties}
          >
            <img alt="" />
          </figure>

          {/* ===== THE CAN SCULPTURE ===== */}
          <div
            className="item gun"
            tabIndex={0}
            style={{ '--x': 34.0, '--y': 36.0, '--w': 32.0, '--h': 28.0 } as React.CSSProperties}
          >
            <svg viewBox="60 300 620 400" role="img" aria-label="Diet Coke cans arranged on the wall">
              <defs>
                <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#5d636a" />
                  <stop offset=".09" stopColor="#b9bec4" />
                  <stop offset=".2" stopColor="#fbfcfc" />
                  <stop offset=".36" stopColor="#dfe3e6" />
                  <stop offset=".55" stopColor="#b3b8be" />
                  <stop offset=".74" stopColor="#e9ecee" />
                  <stop offset=".92" stopColor="#8a9097" />
                  <stop offset="1" stopColor="#565c63" />
                </linearGradient>
                <linearGradient id="neck" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#4b5157" />
                  <stop offset=".3" stopColor="#a3a9af" />
                  <stop offset=".6" stopColor="#7d838a" />
                  <stop offset="1" stopColor="#454b51" />
                </linearGradient>
                <clipPath id="canClip">
                  <rect x="-37" y="-19" width="74" height="38" />
                </clipPath>
                <pattern
                  id="hatch"
                  width="3"
                  height="3"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <path d="M0 0v3" stroke="#dcecff" strokeWidth=".5" opacity=".45" />
                </pattern>
                <marker
                  id="arr"
                  viewBox="0 0 6 6"
                  refX="5.5"
                  refY="3"
                  markerWidth={5}
                  markerHeight={5}
                  orient="auto-start-reverse"
                >
                  <path d="M0 .5L6 3L0 5.5z" fill="#dcecff" stroke="none" />
                </marker>
                <path
                  id="canShape"
                  d="M-44-12Q-44-15-41-17L-37-19H37L41-17Q44-15 44-12V12Q44 15 41 17L37 19H-37L-41 17Q-44 15-44 12Z"
                />
                <g id="canBody">
                  <use href="#canShape" fill="url(#body)" />
                  <path d="M-37-19L-41-12V12L-37 19ZM37-19L41-12V12L37 19Z" fill="url(#neck)" />
                  <path
                    d="M-44-12V12M44-12V12M-41-12V12M41-12V12"
                    stroke="#3d4349"
                    strokeWidth=".8"
                    opacity=".7"
                  />
                </g>
                <g id="canGloss">
                  <rect x="-34" y="-14.5" width="68" height="3.4" rx="1.7" fill="#fff" opacity=".8" />
                  <rect x="-36" y="9" width="72" height="2.6" rx="1.3" fill="#fff" opacity=".28" />
                  <rect x="-37" y="12.5" width="74" height="6.5" fill="#dccb9f" opacity=".2" />
                  <use href="#canShape" fill="none" stroke="#2c3237" strokeWidth=".5" opacity=".6" />
                </g>
                <g id="canBP" fill="none" stroke="#dcecff" strokeLinejoin="round" style={{ strokeWidth: 'var(--sw,1.1)' }}>
                  <rect x="-44" y="9" width="88" height="10" fill="url(#hatch)" stroke="none" />
                  <use href="#canShape" />
                  <path d="M-37-19L-41-12V12L-37 19M37-19L41-12V12L37 19" />
                  <path d="M-22-7h44M-22 7h44" strokeDasharray="2 2" strokeWidth=".6" />
                  <path d="M-53 0h106" strokeWidth=".5" strokeDasharray="6 2 1 2" />
                </g>
              </defs>
              <rect className="hit" x="158" y="402" width="408" height="180" fill="transparent" />
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
};

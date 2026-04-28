/**
 * Topic-matching SVG illustrations.
 *
 * Pure CSS / SVG — no network fetch, CC0 because we wrote them. Each builder
 * is deterministic for a given (seed, props) tuple so a listing's photos are
 * stable across renders. Returns the SVG as a data URL ready for `<img src>`.
 *
 * Why these instead of Lorem Picsum? Picsum returns RANDOM Unsplash photos
 * that don't match the listing description (an apartment card might show a
 * mountain or a sandwich). These illustrations always match the topic
 * (apartment building / townhome row / sedan / SUV / cargo van / etc.).
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(seed: string, opts: T[], salt = ''): T {
  return opts[hash(seed + salt) % opts.length];
}

function dataUrl(svg: string): string {
  // base64 keeps the URL short and avoids percent-encoding edge cases.
  if (typeof Buffer !== 'undefined') {
    return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
  }
  // Browser fallback (server build prefers Buffer):
  if (typeof btoa !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const W = 800, H = 520;

// Time-of-day skies — used for variant rotation
const SKIES = [
  { name: 'day',    top: '#cfeaff', mid: '#a4d3f7', sun: '#fff5b3' },
  { name: 'sunset', top: '#ffb37a', mid: '#ff7a52', sun: '#ffd270' },
  { name: 'dusk',   top: '#3a2c52', mid: '#1f1638', sun: '#ffd17a' },
];

function skyRect(idx: number): string {
  const s = SKIES[idx % SKIES.length];
  return `
    <defs>
      <linearGradient id="sky-${idx}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${s.top}"/>
        <stop offset="100%" stop-color="${s.mid}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H * 0.7}" fill="url(#sky-${idx})"/>
    <circle cx="${W * 0.78}" cy="${H * 0.18}" r="34" fill="${s.sun}" opacity="0.85"/>
  `;
}

function ground(): string {
  return `
    <rect x="0" y="${H * 0.7}" width="${W}" height="${H * 0.3}" fill="#5e3914"/>
    <rect x="0" y="${H * 0.7}" width="${W}" height="6" fill="#3f260d"/>
  `;
}

// ---------------------------------------------------------------------------
// Apartment building (3 variants by sky time-of-day)
// ---------------------------------------------------------------------------

export function apartmentBuildingVariants(seed: string): string[] {
  const floors = 4 + (hash(seed) % 4); // 4–7 floors
  const tone = pick(seed, ['#dca257', '#c98538', '#a86926', '#b8782a'], 'wall');
  const accent = pick(seed, ['#34db00', '#ff4f5e', '#75ff45', '#a86926'], 'accent');

  return SKIES.map((_sky, idx) => {
    const buildingTop = H * 0.22;
    const buildingHeight = H * 0.7 - buildingTop;
    const buildingLeft = W * 0.12;
    const buildingWidth = W * 0.76;
    const floorHeight = buildingHeight / floors;

    let windows = '';
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < 6; c++) {
        const lit = (hash(seed + f + c + idx) % 5) > (idx === 2 ? 0 : 2); // more lit at dusk
        const wx = buildingLeft + 26 + c * (buildingWidth - 52) / 5;
        const wy = buildingTop + 14 + f * floorHeight;
        windows += `<rect x="${wx}" y="${wy}" width="44" height="${floorHeight - 18}" rx="4" fill="${lit ? '#fff5b3' : '#3c2412'}" opacity="${lit ? 0.95 : 0.6}"/>`;
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      ${skyRect(idx)}
      ${ground()}
      <!-- Distant skyline -->
      <g opacity="0.6">
        <rect x="${W * 0.02}" y="${H * 0.45}" width="60" height="120" fill="#5e3914"/>
        <rect x="${W * 0.10}" y="${H * 0.40}" width="80" height="170" fill="#3f260d"/>
        <rect x="${W * 0.86}" y="${H * 0.42}" width="70" height="150" fill="#5e3914"/>
      </g>
      <!-- Main apartment -->
      <rect x="${buildingLeft}" y="${buildingTop}" width="${buildingWidth}" height="${buildingHeight}" rx="6" fill="${tone}" stroke="#5e3914" stroke-width="3"/>
      <!-- Frosting roof -->
      <rect x="${buildingLeft - 6}" y="${buildingTop - 14}" width="${buildingWidth + 12}" height="20" rx="4" fill="#fffaf0" stroke="#a86926" stroke-width="2"/>
      ${windows}
      <!-- Entry awning + door -->
      <rect x="${W / 2 - 36}" y="${H * 0.58}" width="72" height="14" fill="${accent}" stroke="#1a0d05" stroke-width="2"/>
      <rect x="${W / 2 - 22}" y="${H * 0.62}" width="44" height="${H * 0.08}" rx="4" fill="#3f260d" stroke="#5e3914" stroke-width="2"/>
      <circle cx="${W / 2 + 8}" cy="${H * 0.66}" r="2" fill="${accent}"/>
      <!-- Lightning McGreen Living watermark -->
      <text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="800" fill="#fffaf0" opacity="0.65">⚡ LIGHTNING McGREEN LIVING · ${SKIES[idx].name.toUpperCase()}</text>
    </svg>`;
    return dataUrl(svg);
  });
}

// ---------------------------------------------------------------------------
// Townhome row
// ---------------------------------------------------------------------------

export function townhomeRowVariants(seed: string): string[] {
  const rowTones = ['#dca257', '#c98538', '#b8782a', '#a86926'];
  const accent = pick(seed, ['#34db00', '#ff4f5e', '#75ff45'], 'accent');

  return SKIES.map((_sky, idx) => {
    let row = '';
    const count = 4;
    const baseLeft = W * 0.06;
    const totalWidth = W * 0.88;
    const unitWidth = totalWidth / count;
    const unitTop = H * 0.30;
    const unitBottom = H * 0.70;

    for (let i = 0; i < count; i++) {
      const x = baseLeft + i * unitWidth;
      const tone = rowTones[(hash(seed + i + idx) % rowTones.length)];
      // Roof gable
      row += `<polygon points="${x},${unitTop} ${x + unitWidth / 2},${unitTop - 38} ${x + unitWidth},${unitTop}" fill="#fffaf0" stroke="#a86926" stroke-width="2"/>`;
      // Body
      row += `<rect x="${x + 4}" y="${unitTop}" width="${unitWidth - 8}" height="${unitBottom - unitTop}" fill="${tone}" stroke="#5e3914" stroke-width="2"/>`;
      // Window upper
      row += `<rect x="${x + unitWidth * 0.18}" y="${unitTop + 16}" width="${unitWidth * 0.30}" height="42" fill="#fff5b3" stroke="#fffaf0" stroke-width="2" opacity="0.92"/>`;
      row += `<rect x="${x + unitWidth * 0.52}" y="${unitTop + 16}" width="${unitWidth * 0.30}" height="42" fill="#fff5b3" stroke="#fffaf0" stroke-width="2" opacity="0.92"/>`;
      // Garage
      row += `<rect x="${x + unitWidth * 0.10}" y="${unitBottom - 70}" width="${unitWidth * 0.42}" height="60" rx="3" fill="#3f260d" stroke="#fffaf0" stroke-width="2"/>`;
      for (let g = 0; g < 4; g++) {
        row += `<line x1="${x + unitWidth * 0.10}" y1="${unitBottom - 70 + 12 + g * 12}" x2="${x + unitWidth * 0.52}" y2="${unitBottom - 70 + 12 + g * 12}" stroke="#1a0d05" stroke-width="1"/>`;
      }
      // Door
      row += `<rect x="${x + unitWidth * 0.62}" y="${unitBottom - 60}" width="${unitWidth * 0.20}" height="50" rx="2" fill="#5e3914" stroke="#fffaf0" stroke-width="2"/>`;
      row += `<circle cx="${x + unitWidth * 0.78}" cy="${unitBottom - 35}" r="2" fill="${accent}"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      ${skyRect(idx)}
      ${ground()}
      ${row}
      <text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="800" fill="#fffaf0" opacity="0.65">⚡ LIGHTNING McGREEN LIVING · TOWNHOME ROW</text>
    </svg>`;
    return dataUrl(svg);
  });
}

// ---------------------------------------------------------------------------
// Vehicle (cars, by body type)
// ---------------------------------------------------------------------------

const BRAND_HUE: Record<string, string> = {
  Honda: '#c8102e',
  Toyota: '#eb0a1e',
  Tesla: '#cc0000',
  Mazda: '#990033',
  Ford: '#003478',
  Chevrolet: '#c5a572',
  Jeep: '#1d6f42',
  Subaru: '#274faa',
  Kia: '#bb162b',
  Volkswagen: '#3949ab',
  Nissan: '#c3002f',
  BMW: '#1c69d4',
  Hyundai: '#002c5f',
};

type BodyType = 'Sedan' | 'SUV' | 'Pickup' | 'Hatchback' | 'Coupe' | string | undefined;

export function vehicleVariants(args: {
  seed: string;
  make?: string;
  body_type?: BodyType;
  fuel_type?: string;
}): string[] {
  const color = BRAND_HUE[args.make ?? ''] ?? '#34db00';
  const body: BodyType = (args.body_type ?? 'Sedan') as BodyType;

  return SKIES.map((_sky, idx) => {
    const car = bodySvg(body, color, idx);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      ${skyRect(idx)}
      <rect x="0" y="${H * 0.70}" width="${W}" height="${H * 0.30}" fill="#1a0d05"/>
      <!-- Lane stripes -->
      <g opacity="0.85">
        <rect x="${W * 0.10}" y="${H * 0.85}" width="60" height="6" fill="#f4cf2b"/>
        <rect x="${W * 0.30}" y="${H * 0.85}" width="60" height="6" fill="#f4cf2b"/>
        <rect x="${W * 0.50}" y="${H * 0.85}" width="60" height="6" fill="#f4cf2b"/>
        <rect x="${W * 0.70}" y="${H * 0.85}" width="60" height="6" fill="#f4cf2b"/>
      </g>
      <!-- Car centered, slight rotation per variant -->
      <g transform="translate(${W / 2 - 220}, ${H * 0.50}) ${idx === 1 ? 'rotate(-1)' : idx === 2 ? 'rotate(1)' : ''}">${car}</g>
      ${args.fuel_type === 'Electric' ? `<text x="${W - 18}" y="${H * 0.78}" text-anchor="end" font-family="ui-sans-serif" font-size="14" font-weight="800" fill="#75ff45">⚡ EV</text>` : ''}
      <text x="18" y="${H * 0.78}" font-family="ui-sans-serif" font-size="14" font-weight="800" fill="#fffaf0" opacity="0.85">${(args.make ?? '').toUpperCase()} · ${(body ?? '').toUpperCase()}</text>
      <text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="800" fill="#fffaf0" opacity="0.65">⚡ LIGHTNING McGREEN LIVING · ${SKIES[idx].name.toUpperCase()}</text>
    </svg>`;
    return dataUrl(svg);
  });
}

function bodySvg(body: BodyType, color: string, idx: number): string {
  const stroke = '#0c0a02';
  const window = '#cfe8ff';
  const wheel = '#1a0d05';
  const wheelInner = '#fffaf0';
  const wheels = `
    <circle cx="60" cy="118" r="22" fill="${wheel}" stroke="${wheelInner}" stroke-width="3"/>
    <circle cx="60" cy="118" r="6" fill="${wheelInner}"/>
    <circle cx="380" cy="118" r="22" fill="${wheel}" stroke="${wheelInner}" stroke-width="3"/>
    <circle cx="380" cy="118" r="6" fill="${wheelInner}"/>
  `;

  switch ((body ?? '').toLowerCase()) {
    case 'suv':
      return `
        <ellipse cx="220" cy="135" rx="200" ry="6" fill="rgba(0,0,0,0.35)"/>
        <path d="M10 110 L10 80 Q10 56 36 50 L120 38 Q170 22 240 22 L320 22 Q360 22 400 50 L430 80 L430 110 Q430 122 420 122 L20 122 Q10 122 10 110 Z" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <path d="M50 50 Q70 28 130 28 L220 28 Q270 28 305 50 L305 70 L50 70 Z" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <line x1="180" y1="28" x2="180" y2="70" stroke="${stroke}" stroke-width="2"/>
        ${wheels}
      `;
    case 'pickup':
      return `
        <ellipse cx="220" cy="135" rx="200" ry="6" fill="rgba(0,0,0,0.35)"/>
        <path d="M10 116 L10 96 Q10 72 36 64 L120 50 Q160 36 200 36 L240 36 L240 96 L430 96 L430 116 Q430 124 420 124 L20 124 Q10 124 10 116 Z" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <rect x="240" y="60" width="180" height="36" fill="${stroke}" opacity="0.85"/>
        <path d="M50 60 Q70 40 130 40 L200 40 L200 80 L50 80 Z" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        ${wheels}
      `;
    case 'hatchback':
      return `
        <ellipse cx="220" cy="135" rx="200" ry="6" fill="rgba(0,0,0,0.35)"/>
        <path d="M10 116 L10 90 Q14 70 40 62 L120 48 Q170 34 230 34 L300 34 Q360 34 400 62 L420 80 Q428 98 428 116 Q428 124 420 124 L20 124 Q10 124 10 116 Z" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <path d="M50 62 Q70 42 130 42 L240 42 Q300 42 320 62 L320 82 L50 82 Z" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <line x1="190" y1="42" x2="190" y2="82" stroke="${stroke}" stroke-width="2"/>
        ${wheels}
      `;
    case 'coupe':
      return `
        <ellipse cx="220" cy="135" rx="200" ry="6" fill="rgba(0,0,0,0.35)"/>
        <path d="M10 118 L10 96 Q14 78 40 70 L130 56 Q200 40 280 40 L340 50 Q400 64 420 90 L428 110 Q428 122 420 122 L20 122 Q10 122 10 118 Z" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <path d="M70 70 Q120 50 200 50 L300 56 Q360 64 380 88 L70 88 Z" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        ${wheels}
      `;
    case 'sedan':
    default:
      return `
        <ellipse cx="220" cy="135" rx="200" ry="6" fill="rgba(0,0,0,0.35)"/>
        <path d="M10 118 L10 96 Q14 78 40 72 L120 60 Q170 44 220 44 L300 44 Q360 44 410 72 L424 90 Q430 100 430 116 Q430 124 420 124 L20 124 Q10 124 10 118 Z" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <path d="M50 70 Q70 52 130 50 L240 50 Q300 50 330 70 L330 90 L50 90 Z" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <line x1="190" y1="50" x2="190" y2="90" stroke="${stroke}" stroke-width="2"/>
        ${wheels}
      `;
  }
}

// ---------------------------------------------------------------------------
// Work vehicle (cargo van, box truck, pickup, stake bed, flatbed, passenger
// van, refrigerated)
// ---------------------------------------------------------------------------

type WorkType =
  | 'cargo-van' | 'box-truck' | 'pickup' | 'stake-bed' | 'flatbed' | 'passenger-van' | 'refrigerated';

export function workVehicleVariants(args: { seed: string; vehicle_type: WorkType }): string[] {
  return SKIES.map((_sky, idx) => {
    const wv = workSvg(args.vehicle_type, idx);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      ${skyRect(idx)}
      <rect x="0" y="${H * 0.70}" width="${W}" height="${H * 0.30}" fill="#1a0d05"/>
      <g opacity="0.85">
        <rect x="${W * 0.12}" y="${H * 0.85}" width="60" height="6" fill="#f4cf2b"/>
        <rect x="${W * 0.40}" y="${H * 0.85}" width="60" height="6" fill="#f4cf2b"/>
        <rect x="${W * 0.68}" y="${H * 0.85}" width="60" height="6" fill="#f4cf2b"/>
      </g>
      <g transform="translate(${W / 2 - 240}, ${H * 0.46})">${wv}</g>
      <text x="18" y="${H * 0.78}" font-family="ui-sans-serif" font-size="14" font-weight="800" fill="#fffaf0" opacity="0.85">${args.vehicle_type.replace('-', ' ').toUpperCase()}</text>
      <text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="800" fill="#fffaf0" opacity="0.65">⚡ LIGHTNING McGREEN LIVING · WORK FLEET</text>
    </svg>`;
    return dataUrl(svg);
  });
}

function workSvg(type: WorkType, _idx: number): string {
  const stroke = '#0c0a02';
  const window = '#cfe8ff';
  const wheel = '#1a0d05';
  const wheelInner = '#fffaf0';
  const wheels = (x1 = 70, x2 = 400) => `
    <circle cx="${x1}" cy="160" r="24" fill="${wheel}" stroke="${wheelInner}" stroke-width="3"/>
    <circle cx="${x1}" cy="160" r="7" fill="${wheelInner}"/>
    <circle cx="${x2}" cy="160" r="24" fill="${wheel}" stroke="${wheelInner}" stroke-width="3"/>
    <circle cx="${x2}" cy="160" r="7" fill="${wheelInner}"/>
  `;
  switch (type) {
    case 'cargo-van':
      return `
        <rect x="10" y="40" width="430" height="120" rx="6" fill="#fffaf0" stroke="${stroke}" stroke-width="3"/>
        <rect x="320" y="56" width="100" height="40" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <rect x="20" y="96" width="280" height="20" fill="#34db00" opacity="0.9"/>
        <text x="160" y="111" text-anchor="middle" font-family="ui-sans-serif" font-size="14" font-weight="900" fill="#1a0d05">CARGO VAN</text>
        ${wheels()}
      `;
    case 'box-truck':
      return `
        <rect x="10" y="20" width="290" height="140" fill="#fffaf0" stroke="${stroke}" stroke-width="3"/>
        <rect x="300" y="60" width="140" height="100" fill="#fff3dc" stroke="${stroke}" stroke-width="3"/>
        <rect x="320" y="76" width="100" height="40" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <text x="155" y="100" text-anchor="middle" font-family="ui-sans-serif" font-size="20" font-weight="900" fill="#5e3914">BOX TRUCK</text>
        ${wheels(60, 410)}
      `;
    case 'pickup':
      return `
        <path d="M10 160 L10 100 Q14 76 40 70 L120 56 L220 56 L220 100 L440 100 L440 160 Z" fill="#34db00" stroke="${stroke}" stroke-width="3"/>
        <rect x="220" y="64" width="220" height="36" fill="#1a0d05" opacity="0.85"/>
        <path d="M50 70 Q70 50 130 50 L210 50 L210 90 L50 90 Z" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <text x="330" y="86" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="900" fill="#fffaf0">PICKUP BED</text>
        ${wheels()}
      `;
    case 'stake-bed':
      return `
        <path d="M10 160 L10 100 Q14 76 40 70 L120 56 L220 56 L220 100 L440 100 L440 160 Z" fill="#dca257" stroke="${stroke}" stroke-width="3"/>
        <path d="M50 70 Q70 50 130 50 L210 50 L210 90 L50 90 Z" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <!-- Stake rails -->
        <rect x="232" y="40" width="6" height="60" fill="${stroke}"/>
        <rect x="320" y="40" width="6" height="60" fill="${stroke}"/>
        <rect x="408" y="40" width="6" height="60" fill="${stroke}"/>
        <line x1="220" y1="44" x2="440" y2="44" stroke="${stroke}" stroke-width="3"/>
        <line x1="220" y1="100" x2="440" y2="100" stroke="${stroke}" stroke-width="3"/>
        ${wheels()}
      `;
    case 'flatbed':
      return `
        <path d="M10 160 L10 110 Q14 90 40 84 L120 70 L220 70 L220 100 L440 100 L440 110 L440 160 Z" fill="#a86926" stroke="${stroke}" stroke-width="3"/>
        <path d="M50 84 Q70 64 130 64 L210 64 L210 100 L50 100 Z" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <text x="330" y="86" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="900" fill="#fffaf0">FLATBED</text>
        ${wheels()}
      `;
    case 'passenger-van':
      return `
        <rect x="10" y="40" width="430" height="120" rx="10" fill="#3a8eff" stroke="${stroke}" stroke-width="3"/>
        <rect x="40" y="60" width="80" height="40" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <rect x="140" y="60" width="80" height="40" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <rect x="240" y="60" width="80" height="40" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <rect x="340" y="60" width="80" height="40" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        ${wheels()}
      `;
    case 'refrigerated':
      return `
        <rect x="10" y="20" width="290" height="140" fill="#e8f3ff" stroke="${stroke}" stroke-width="3"/>
        <rect x="300" y="60" width="140" height="100" fill="#fff3dc" stroke="${stroke}" stroke-width="3"/>
        <rect x="320" y="76" width="100" height="40" fill="${window}" stroke="${stroke}" stroke-width="2"/>
        <text x="155" y="60" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="900" fill="#3a8eff">❄ REFRIGERATED</text>
        <text x="155" y="110" text-anchor="middle" font-family="ui-sans-serif" font-size="20" font-weight="900" fill="#5e3914">REEFER</text>
        ${wheels(60, 410)}
      `;
  }
}

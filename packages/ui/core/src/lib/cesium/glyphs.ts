/**
 * Inline SVG glyph factory for the live-entity wrappers. All glyphs are
 * generated as data URIs so consumers don't need to host any assets.
 *
 * Each function returns a string suitable for assignment to
 * `billboard.image`. The viewBox is always 32×32 unless otherwise noted,
 * so a `size` prop of e.g. 24 px scales 1:1.
 */

function dataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Filled circular dot with a soft outer glow. Used by `TrackedEntitiesLayer`
 * as the universal default glyph.
 */
export function circleDot(color: string, outline = "rgba(255,255,255,0.55)"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs>
      <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
    <circle cx="32" cy="32" r="20" fill="${color}" opacity="0.55" filter="url(#g)" />
    <circle cx="32" cy="32" r="13" fill="${color}" stroke="${outline}" stroke-width="2.5" />
  </svg>`;
  return dataUri(svg);
}

/** Top-down aeroplane silhouette. Heading 0° points up. */
export function airplane(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <path d="M20 4 L24 16 L36 18 L36 22 L24 22 L24 30 L28 32 L28 34 L20 34 L12 34 L12 32 L16 30 L16 22 L4 22 L4 18 L16 16 Z"
          fill="${color}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`;
  return dataUri(svg);
}

/** Top-down vessel silhouette. Heading 0° points up. */
export function ship(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 2 L24 18 L24 32 L20 36 L12 36 L8 32 L8 18 Z"
          fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linejoin="round"/>
    <line x1="16" y1="6" x2="16" y2="32" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>
  </svg>`;
  return dataUri(svg);
}

/** Satellite-style cross with a body and two solar wings. */
export function satellite(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect x="14" y="14" width="12" height="12" fill="${color}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
    <rect x="2" y="16" width="10" height="8" fill="${color}" opacity="0.7"/>
    <rect x="28" y="16" width="10" height="8" fill="${color}" opacity="0.7"/>
    <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.8)"/>
  </svg>`;
  return dataUri(svg);
}

/** Pulsing dot for seismic events. */
export function quakeMark(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="20" fill="${color}" opacity="0.18"/>
    <circle cx="24" cy="24" r="14" fill="${color}" opacity="0.35"/>
    <circle cx="24" cy="24" r="8" fill="${color}" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
  </svg>`;
  return dataUri(svg);
}

/** Flame-shaped wildfire icon. */
export function flame(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 2 C20 10 28 14 24 24 C28 30 22 38 16 38 C10 38 4 30 8 24 C4 14 12 10 16 2 Z"
          fill="${color}" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
  </svg>`;
  return dataUri(svg);
}

/** Triangular volcano with a steaming cap. */
export function volcanoCone(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <path d="M4 34 L16 8 L24 8 L36 34 Z" fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
    <ellipse cx="20" cy="8" rx="4" ry="2" fill="rgba(255,255,255,0.7)"/>
  </svg>`;
  return dataUri(svg);
}

/** Airport plane-in-circle. */
export function airportPin(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="14" fill="${color}" opacity="0.85" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
    <path d="M18 6 L20 14 L28 16 L28 18 L20 18 L20 22 L22 24 L22 25 L18 25 L14 25 L14 24 L16 22 L16 18 L8 18 L8 16 L16 14 Z"
          fill="white" stroke="none" transform="scale(0.65) translate(10 10)"/>
  </svg>`;
  return dataUri(svg);
}

/** Antenna-on-pole silhouette for radio / cell towers. */
export function towerMast(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <line x1="16" y1="4" x2="6" y2="36" stroke="${color}" stroke-width="2"/>
    <line x1="16" y1="4" x2="26" y2="36" stroke="${color}" stroke-width="2"/>
    <line x1="10" y1="20" x2="22" y2="20" stroke="${color}" stroke-width="1.5"/>
    <line x1="8" y1="28" x2="24" y2="28" stroke="${color}" stroke-width="1.5"/>
    <circle cx="16" cy="3" r="2" fill="${color}"/>
  </svg>`;
  return dataUri(svg);
}

/** Camera body for webcams. */
export function camera(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="32" viewBox="0 0 36 32">
    <rect x="2" y="8" width="32" height="20" rx="3" fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
    <rect x="12" y="4" width="12" height="6" rx="1.5" fill="${color}"/>
    <circle cx="18" cy="18" r="6" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
    <circle cx="18" cy="18" r="3" fill="rgba(255,255,255,0.9)"/>
  </svg>`;
  return dataUri(svg);
}

/** Bolt-in-circle for power plants (fuel-specific colour comes from caller). */
export function powerPlant(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="14" fill="${color}" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
    <path d="M20 4 L8 20 L16 20 L14 32 L28 14 L20 14 Z" fill="rgba(255,255,255,0.9)"/>
  </svg>`;
  return dataUri(svg);
}

/** Square cloud for air-quality stations. */
export function airQuality(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <rect x="4" y="4" width="28" height="28" rx="6" fill="${color}" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
    <path d="M10 22 Q10 16 16 16 Q18 12 22 14 Q28 14 28 20 Q28 24 24 24 L12 24 Q10 24 10 22 Z"
          fill="rgba(255,255,255,0.85)"/>
  </svg>`;
  return dataUri(svg);
}

/** Diamond marker for tide gauges. */
export function tideGauge(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M16 3 L29 16 L16 29 L3 16 Z" fill="${color}" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
    <path d="M8 18 Q12 14 16 18 T24 18" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2"/>
  </svg>`;
  return dataUri(svg);
}

/** Concentric ring for tsunami buoys. */
export function buoy(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="16" fill="${color}" opacity="0.22"/>
    <circle cx="20" cy="20" r="10" fill="${color}" opacity="0.5"/>
    <circle cx="20" cy="20" r="5" fill="${color}" stroke="rgba(255,255,255,0.85)" stroke-width="2"/>
  </svg>`;
  return dataUri(svg);
}

/** Triangle warning for GDACS-style alerts. */
export function alertTriangle(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <path d="M18 3 L34 31 L2 31 Z" fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linejoin="round"/>
    <text x="18" y="26" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="rgba(255,255,255,0.95)">!</text>
  </svg>`;
  return dataUri(svg);
}

/** Crop plant for farms. */
export function cropPlant(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M16 30 L16 14" stroke="${color}" stroke-width="2"/>
    <path d="M16 16 Q8 14 6 6 Q14 8 16 16 Z" fill="${color}"/>
    <path d="M16 16 Q24 14 26 6 Q18 8 16 16 Z" fill="${color}" opacity="0.85"/>
    <path d="M16 22 Q10 22 8 16 Q14 16 16 22 Z" fill="${color}" opacity="0.7"/>
  </svg>`;
  return dataUri(svg);
}

/** Crosshair-in-ring for the user's own location. */
export function userPin(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill="${color}" opacity="0.15"/>
    <circle cx="24" cy="24" r="10" fill="${color}" opacity="0.4"/>
    <circle cx="24" cy="24" r="5" fill="${color}" stroke="white" stroke-width="2.5"/>
  </svg>`;
  return dataUri(svg);
}

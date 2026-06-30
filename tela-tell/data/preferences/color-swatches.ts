export type ColorToken = {
  label: string;
  hex: string;
};

const COLOR_HEX: Record<string, string> = {
  'blush pink': '#F4C2C2',
  'powder blue': '#B0E0E6',
  lavender: '#C4B5FD',
  mint: '#98D8C8',
  grey: '#9CA3AF',
  gray: '#9CA3AF',
  navy: '#1E3A5F',
  charcoal: '#36454F',
  'crisp white': '#FAFAFA',
  sapphire: '#0F52BA',
  emerald: '#50C878',
  ruby: '#E0115F',
  'soft white': '#F5F5F0',
  'dove grey': '#B8B8B8',
  'pale blue': '#AEC6CF',
  'light taupe': '#B8A99A',
  peach: '#FFCBA4',
  lilac: '#C8A2C8',
  'sky blue': '#87CEEB',
  'soft mint': '#BDFCC9',
  'dusty rose': '#DCAE96',
  'sage green': '#9CAF88',
  'stark black': '#1A1A1A',
  coral: '#FF7F50',
  teal: '#008080',
  'soft olive': '#A8B88A',
  'denim blue': '#3B5998',
  camel: '#C19A6B',
  mauve: '#E0B0FF',
  terracotta: '#E2725B',
  'forest green': '#228B22',
  maroon: '#800000',
  mustard: '#FFDB58',
  taupe: '#8B8589',
  brown: '#8B4513',
  olive: '#808000',
  copper: '#B87333',
  caramel: '#C68E17',
  cream: '#FFFDD0',
  rust: '#B7410E',
  'warm beige': '#F5F5DC',
  bronze: '#CD7F32',
  fuchsia: '#FF00FF',
  gold: '#FFD700',
  'burnt orange': '#CC5500',
  magenta: '#FF00AF',
  'bright white': '#FFFFFF',
  'true white': '#FFFFFF',
  black: '#111111',
  cobalt: '#0047AB',
  'icy blue': '#A5F2F3',
  'silver grey': '#C0C0C0',
  'berry pink': '#D45087',
  'true navy': '#000080',
  'golden yellow': '#FFDF00',
  'warm olive': '#6B8E23',
  'burnt sienna': '#E97451',
  'true red': '#CC0000',
  'jade green': '#00A86B',
  'medium denim': '#4A6FA5',
  'balanced taupe': '#A09080',
  plum: '#8E4585',
  burgundy: '#800020',
  'harsh neon': '#39FF14',
  'overly washed-out beige': '#E8E0D5',
  'yellow-green': '#ADFF2F',
  'neon brights': '#FF10F0',
  'muddy brown-grey': '#7A6A5A',
  'overly pale yellow': '#FFF9C4',
  'dusty grey': '#A9A9A9',
  'harsh orange': '#FF6600',
  'muddy brown-on-brown': '#6B4423',
  'neon orange': '#FF4500',
  'pale yellow': '#FFFFE0',
  'pale pink': '#FFD1DC',
  'cool beige': '#D4C4B0',
  'dull brown-grey': '#6E5C4C',
  'muddy olive': '#6B6B47',
  'washed-out pastels': '#E8D5E3',
  'orange-heavy rust': '#B7410E',
  'golden mustard': '#D4AF37',
  'warm camel': '#C19A6B',
  'icy pastels': '#E0F4FF',
  'cool grey-beige': '#C8BFB0',
  'blue-based pinks': '#F4C2D7',
  'extreme neons': '#FF073A',
  'bright orange': '#FF8C00',
  'lime green': '#32CD32',
  'cool baby pink': '#F8C8DC',
};

const FALLBACK_HEX = '#D1D5DB';

function normalizeColorKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function lookupHex(label: string): string {
  const key = normalizeColorKey(label);
  if (COLOR_HEX[key]) {
    return COLOR_HEX[key];
  }

  for (const [name, hex] of Object.entries(COLOR_HEX)) {
    if (key.includes(name) || name.includes(key)) {
      return hex;
    }
  }

  return FALLBACK_HEX;
}

export function tokenizeColorString(colorsString: string): ColorToken[] {
  const cleaned = colorsString
    .replace(/\s*[—–-]\s*in small doses/gi, '')
    .replace(/\s*[—–-]\s*near the face/gi, '')
    .replace(/\s*[—–-]\s*at neckline/gi, '')
    .replace(/\s*[—–-]\s*that dulls warmth/gi, '')
    .replace(/\s*[—–-]\s*that dulls the complexion/gi, '')
    .replace(/\s*[—–-]\s*that washes out warm depth/gi, '')
    .replace(/\s*[—–-]\s*that turns ashy/gi, '')
    .replace(/\s*[—–-]\s*that clashes/gi, '')
    .replace(/\s*[—–-]\s*that look ashy/gi, '');

  return cleaned
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      hex: lookupHex(label),
    }));
}

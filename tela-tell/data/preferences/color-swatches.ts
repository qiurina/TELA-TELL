export type ColorToken = {
  label: string;
  hex: string;
};

const COLOR_HEX: Record<string, string> = {
  // Season-specific additions
  'warm mint': '#A8D8B9',
  apricot: '#FBCEB1',
  'light coral': '#F08080',
  'light aqua': '#B2D8D8',
  'warm sky': '#87CEEB',
  'pale gold': '#EEE8AA',
  'warm ivory': '#FFFFF0',
  'powder pink': '#FFB6C1',
  buttercup: '#FAD961',
  'soft peach': '#FFDAB9',
  'warm yellow': '#FFD700',
  'fresh lime': '#90EE90',
  'golden orange': '#FF8C00',
  'warm turquoise': '#40E0D0',
  'bright coral': '#FF7F50',
  'sunny yellow': '#FFE135',
  'spring green': '#00FF7F',
  'warm aqua': '#00CED1',
  'electric orange': '#FF6700',
  'hot pink': '#FF69B4',
  'pure white': '#FFFFFF',
  'warm tan': '#D2B48C',
  'bright camel': '#C19A6B',
  'vivid lime': '#BFFF00',
  'baby blue': '#89CFF0',
  'rose quartz': '#F7CAC9',
  periwinkle: '#CCCCFF',
  'soft lilac': '#C8A2C8',
  'soft pink': '#FFB7C5',
  'powder blue': '#B0E0E6',
  'light mint': '#98FF98',
  'pale blue grey': '#B0C4DE',
  'dove grey': '#B8B8B8',
  'rose beige': '#ECC8AF',
  'soft navy': '#4A6FA5',
  'dusty blue': '#7B9EB9',
  'muted teal': '#5F9EA0',
  'smoky lavender': '#9E90A2',
  'greyish pink': '#C8A8A8',
  'soft blue green': '#8FBC8F',
  'cool taupe': '#8B8682',
  'ash grey': '#B2BEB5',
  'rose grey': '#C4A0A0',
  'greyish beige': '#C8B8A8',
  'cool stone': '#918E85',
  'ash taupe': '#A09080',
  'slate blue': '#6A8CAF',
  'soft plum': '#9B4F6A',
  'muted gold': '#B5A642',
  'warm caramel': '#C68642',
  'dusty terracotta': '#C8735A',
  'warm taupe': '#9E8872',
  'soft rust': '#C46050',
  'muted olive': '#8A8A4A',
  sand: '#C2B280',
  'peach beige': '#F5CBA7',
  'bronze tan': '#9E7B50',
  'warm teal': '#2E8B8B',
  'dark camel': '#9E6B3A',
  'warm burgundy': '#8B2252',
  'deep teal': '#004040',
  'dark olive': '#4A4A1A',
  'dark amber': '#B8860B',
  'deep rust': '#8B3A2A',
  'dark gold': '#A07800',
  'warm plum': '#6A3050',
  'black brown': '#2C1810',
  'dark copper': '#8C4A2A',
  'deep blue': '#003080',
  'dark emerald': '#004020',
  'deep burgundy': '#5A0020',
  'dark navy': '#000050',
  'deep plum': '#4A0040',
  'dark teal': '#004050',
  crimson: '#DC143C',
  'royal blue': '#4169E1',
  'cool red': '#CC2244',
  'electric teal': '#00FFCF',
  'electric blue': '#0077FF',
  'bright silver': '#C0C0C0',
  'vivid emerald': '#10C070',
  'icy pink': '#FFB3C6',
  'vivid teal': '#00B2A9',
  'neon blue': '#1F51FF',
  'earthy tones': '#A07850',
  'blush pink': '#F4C2C2',
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
  chocolate: '#3D2314',
  'chocolate brown': '#3D2314',
  'warm copper': '#B87333',
  amber: '#FFBF00',
  'cool pink': '#E8A0BF',
  'cool blue': '#6B8CAE',
  'cool grey': '#8A8D8F',
  silver: '#C0C0C0',
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
    // Some guidance strings omit the dash (e.g. "yellow-green near the face").
    .replace(/\s*in small doses/gi, '')
    .replace(/\s*[—–-]\s*near the face/gi, '')
    .replace(/\s*near the face/gi, '')
    .replace(/\s*[—–-]\s*at neckline/gi, '')
    .replace(/\s*at neckline/gi, '')
    .replace(/\s*[—–-]\s*that dulls warmth/gi, '')
    .replace(/\s*that dulls warmth/gi, '')
    .replace(/\s*[—–-]\s*that dulls the complexion/gi, '')
    .replace(/\s*that dulls the complexion/gi, '')
    .replace(/\s*[—–-]\s*that washes out warm depth/gi, '')
    .replace(/\s*that washes out warm depth/gi, '')
    .replace(/\s*[—–-]\s*that turns ashy/gi, '')
    .replace(/\s*that turns ashy/gi, '')
    .replace(/\s*[—–-]\s*that clashes/gi, '')
    .replace(/\s*that clashes/gi, '')
    .replace(/\s*[—–-]\s*that look ashy/gi, '')
    .replace(/\s*that look ashy/gi, '');

  return cleaned
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      hex: lookupHex(label),
    }));
}

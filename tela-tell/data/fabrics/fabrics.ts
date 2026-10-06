/**
 * Twelve supported fiber / material types.
 *
 * The Synthetic/Semi-synthetic split follows ISO 2076 ("Textiles — Man-made fibres —
 * Generic names"), the international standard defining man-made fibre categories and
 * distinguishing them from naturally-occurring fibrous materials — the same standard
 * that underlies the FTC's Textile Fiber Products Identification Act categories already
 * cited in scan-confidence.ts. Rayon (regenerated cellulose) is "Semi-synthetic" because
 * ISO 2076 classifies regenerated/man-made cellulosic fibres distinctly from fully
 * synthetic (petroleum-polymer) ones like polyester or nylon. Abaca's "Philippine native"
 * categorization reflects its status as an indigenous Philippine plant fiber (Musa
 * textilis), documented by PhilFIDA (see fiber-profiles.ts's Abaca entry for the full
 * citation).
 */

export type FabricCategory =
  | 'Natural'
  | 'Synthetic'
  | 'Semi-synthetic'
  | 'Animal material'
  | 'Philippine native';

export type FabricDefinition = {
  id: number;
  name: string;
  category: FabricCategory;
};

export const FABRIC_REGISTRY: FabricDefinition[] = [
  { id: 1, name: 'Cotton', category: 'Natural' },
  { id: 2, name: 'Wool', category: 'Natural' },
  { id: 3, name: 'Silk', category: 'Natural' },
  { id: 4, name: 'Linen', category: 'Natural' },
  { id: 5, name: 'Polyester', category: 'Synthetic' },
  { id: 6, name: 'Nylon', category: 'Synthetic' },
  { id: 7, name: 'Acrylic', category: 'Synthetic' },
  { id: 8, name: 'Spandex', category: 'Synthetic' },
  { id: 9, name: 'Rayon', category: 'Semi-synthetic' },
  { id: 10, name: 'Leather', category: 'Animal material' },
  { id: 11, name: 'Suede', category: 'Animal material' },
  { id: 12, name: 'Abaca', category: 'Philippine native' },
];

export const SUPPORTED_FABRICS = [
  'Cotton',
  'Wool',
  'Silk',
  'Linen',
  'Polyester',
  'Nylon',
  'Acrylic',
  'Spandex',
  'Rayon',
  'Leather',
  'Suede',
  'Abaca',
] as const;

export type SupportedFabric = (typeof SUPPORTED_FABRICS)[number];

/** Model / label aliases mapped to canonical app fiber names. */
export const FABRIC_ALIASES: Record<string, SupportedFabric> = {
  spandex: 'Spandex',
  elastane: 'Spandex',
  lycra: 'Spandex',
  suede: 'Suede',
  leather: 'Leather',
  // Names that appear on care tags for fibers the model knows under another name.
  viscose: 'Rayon',
  lyocell: 'Rayon',
  tencel: 'Rayon',
  modal: 'Rayon',
  flax: 'Linen',
  polyamide: 'Nylon',
  abaka: 'Abaca',
};

/**
 * Fibers that show up on tags but that the model cannot recognize. A label naming only these
 * cannot be checked, and must not be reported as "matching" the scan.
 */
const UNSUPPORTED_FIBER_TERMS = [
  'cashmere',
  'mohair',
  'angora',
  'alpaca',
  'hemp',
  'jute',
  'ramie',
  'bamboo',
  'cupro',
  'acetate',
  'triacetate',
  'polypropylene',
  'microfiber',
  'microfibre',
] as const;

/** "Faux leather", "PU leather", "pleather" ... are plastic, not the animal-hide fibers. */
const IMITATION_LEATHER_PATTERN =
  /\b(?:faux|synthetic|vegan|artificial|pu|pvc)\s+(?:leather|suede)\b|\bleatherette\b|\bpleather\b/g;

function stripImitationLeather(normalized: string): { text: string; imitations: string[] } {
  const imitations = normalized.match(IMITATION_LEATHER_PATTERN) ?? [];
  return { text: normalized.replace(IMITATION_LEATHER_PATTERN, ' '), imitations };
}

/** Fiber names in a label that TELA-TELL cannot check (see UNSUPPORTED_FIBER_TERMS). */
export function findUnsupportedFibers(text: string): string[] {
  const { text: withoutImitations, imitations } = stripImitationLeather(text.trim().toLowerCase());
  const found = [...new Set(imitations)];

  for (const term of UNSUPPORTED_FIBER_TERMS) {
    if (new RegExp(`\\b${term}\\b`).test(withoutImitations) && !found.includes(term)) {
      found.push(term);
    }
  }

  return found;
}

const FABRIC_CATEGORY_MAP = Object.fromEntries(
  FABRIC_REGISTRY.map((fabric) => [fabric.name, fabric.category]),
) as Record<SupportedFabric, FabricCategory>;

export function getFabricCategory(material: string): FabricCategory | undefined {
  return FABRIC_CATEGORY_MAP[material as SupportedFabric];
}

export function isSupportedFabric(material: string): material is SupportedFabric {
  return SUPPORTED_FABRICS.includes(material as SupportedFabric);
}

export function resolveFabricAlias(text: string): SupportedFabric | null {
  const all = resolveAllFabricAliases(text);
  return all[0] ?? null;
}

/** Every supported fiber named in a seller tag or scan string (order preserved). */
export function resolveAllFabricAliases(text: string): SupportedFabric[] {
  const normalized = stripImitationLeather(text.trim().toLowerCase()).text.trim();
  if (!normalized) {
    return [];
  }

  const found: SupportedFabric[] = [];

  for (const fabric of SUPPORTED_FABRICS) {
    const needle = fabric.toLowerCase();
    // Word-ish match so "cotton" does not need to be alone, but avoid tiny false hits.
    if (normalized.includes(needle) && !found.includes(fabric)) {
      found.push(fabric);
    }
  }

  for (const [alias, fabric] of Object.entries(FABRIC_ALIASES)) {
    if (normalized.includes(alias) && !found.includes(fabric)) {
      found.push(fabric);
    }
  }

  return found;
}

export const FABRIC_CATEGORY_COLORS: Record<
  FabricCategory,
  { text: string; background: string; border: string }
> = {
  Natural: { text: '#15803d', background: '#f0fdf4', border: '#bbf7d0' },
  Synthetic: { text: '#c2410c', background: '#fff7ed', border: '#fed7aa' },
  'Semi-synthetic': { text: '#6d28d9', background: '#f5f3ff', border: '#ddd6fe' },
  'Animal material': { text: '#92400e', background: '#fef3c7', border: '#fde68a' },
  'Philippine native': { text: '#0f766e', background: '#f0fdfa', border: '#99f6e4' },
};

// Synthetic vs semi-synthetic follows ISO 2076.
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

export const FABRIC_ALIASES: Record<string, SupportedFabric> = {
  spandex: 'Spandex',
  elastane: 'Spandex',
  lycra: 'Spandex',
  suede: 'Suede',
  leather: 'Leather',
  viscose: 'Rayon',
  lyocell: 'Rayon',
  tencel: 'Rayon',
  modal: 'Rayon',
  flax: 'Linen',
  polyamide: 'Nylon',
  abaka: 'Abaca',
};

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

const IMITATION_LEATHER_PATTERN =
  /\b(?:faux|synthetic|vegan|artificial|pu|pvc)\s+(?:leather|suede)\b|\bleatherette\b|\bpleather\b/g;

function stripImitationLeather(normalized: string): { text: string; imitations: string[] } {
  const imitations = normalized.match(IMITATION_LEATHER_PATTERN) ?? [];
  return { text: normalized.replace(IMITATION_LEATHER_PATTERN, ' '), imitations };
}

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

export function resolveFabricAlias(text: string): SupportedFabric | null {
  const all = resolveAllFabricAliases(text);
  return all[0] ?? null;
}

export function resolveAllFabricAliases(text: string): SupportedFabric[] {
  const normalized = stripImitationLeather(text.trim().toLowerCase()).text.trim();
  if (!normalized) {
    return [];
  }

  const found: SupportedFabric[] = [];

  for (const fabric of SUPPORTED_FABRICS) {
    const needle = fabric.toLowerCase();
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

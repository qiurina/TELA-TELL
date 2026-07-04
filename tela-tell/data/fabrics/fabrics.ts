/** Ten supported fiber / material types — aligned with capstone study taxonomy. */

export type FabricCategory =
  | 'Natural'
  | 'Synthetic'
  | 'Semi-synthetic'
  | 'Philippine native fiber';

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
  { id: 8, name: 'Rayon', category: 'Semi-synthetic' },
  { id: 9, name: 'Abaca', category: 'Philippine native fiber' },
  { id: 10, name: 'Piña', category: 'Philippine native fiber' },
];

export const SUPPORTED_FABRICS = [
  'Cotton',
  'Wool',
  'Silk',
  'Linen',
  'Polyester',
  'Nylon',
  'Acrylic',
  'Rayon',
  'Abaca',
  'Piña',
] as const;

export type SupportedFabric = (typeof SUPPORTED_FABRICS)[number];

const FABRIC_CATEGORY_MAP = Object.fromEntries(
  FABRIC_REGISTRY.map((fabric) => [fabric.name, fabric.category]),
) as Record<SupportedFabric, FabricCategory>;

export function getFabricCategory(material: string): FabricCategory | undefined {
  return FABRIC_CATEGORY_MAP[material as SupportedFabric];
}

export function isSupportedFabric(material: string): material is SupportedFabric {
  return SUPPORTED_FABRICS.includes(material as SupportedFabric);
}

export const FABRIC_CATEGORY_COLORS: Record<
  FabricCategory,
  { text: string; background: string; border: string }
> = {
  Natural: { text: '#15803d', background: '#f0fdf4', border: '#bbf7d0' },
  Synthetic: { text: '#c2410c', background: '#fff7ed', border: '#fed7aa' },
  'Semi-synthetic': { text: '#6d28d9', background: '#f5f3ff', border: '#ddd6fe' },
  'Philippine native fiber': { text: '#0f766e', background: '#f0fdfa', border: '#99f6e4' },
};

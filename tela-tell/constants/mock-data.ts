export type SustainabilityRating = 'green' | 'yellow' | 'red';

export type FabricComposition = {
  material: string;
  percentage: number;
};

export type CareInstruction = {
  text: string;
  recommended: boolean;
};

export type FabricProfile = {
  texture: string;
  weave: string;
  breathability: string;
  durability: string;
  stretch: string;
  careInstructions: CareInstruction[];
  useCases: string[];
};

export type SuitabilityLevel = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export type GarmentPurposeItem = {
  purpose: string;
  suitability: SuitabilityLevel;
  note: string;
};

export type EcoAlternative = {
  name: string;
  description: string;
};

export type ScanRecommendations = {
  garmentPurposes: GarmentPurposeItem[];
  ecoAlternatives: EcoAlternative[];
  recycledAwareness: string;
  reuse: {
    resale: string;
    donate: string;
    upcycle: string;
  };
};

export type ScanResult = {
  id: string;
  dominantFabric: string;
  compositions: FabricComposition[];
  confidence: number;
  scannedAt: string;
  sellerLabel?: string;
  sustainability: {
    rating: SustainabilityRating;
    label: string;
    score: number;
  };
  mislabeling: {
    detected: boolean;
    title: string;
    message: string;
  };
  profile: FabricProfile;
  recommendations: ScanRecommendations;
};

export const SCAN_RESULTS: ScanResult[] = [
  {
    id: '1',
    dominantFabric: 'Cotton dominant',
    compositions: [
      { material: 'Cotton', percentage: 65 },
      { material: 'Polyester', percentage: 28 },
      { material: 'Linen', percentage: 7 },
    ],
    confidence: 87,
    scannedAt: 'Today, 10:30 AM',
    sellerLabel: 'Pure Silk',
    sustainability: {
      rating: 'green',
      label: 'Good',
      score: 7,
    },
    mislabeling: {
      detected: true,
      title: 'Possible Mislabeling Detected',
      message:
        "Seller stated 'Pure Silk' but fabric appears to be cotton dominant. Consider negotiating price.",
    },
    profile: {
      texture: 'Soft',
      weave: 'Plain weave',
      breathability: 'High',
      durability: 'Medium',
      stretch: 'Low',
      careInstructions: [
        { text: 'Machine wash warm', recommended: true },
        { text: 'Tumble dry low heat', recommended: true },
        { text: 'Avoid bleach', recommended: false },
      ],
      useCases: ['Casual wear', 'Shirts', 'Everyday dresses', 'Uniforms'],
    },
    recommendations: {
      garmentPurposes: [
        {
          purpose: 'Everyday tops',
          suitability: 'Excellent',
          note: 'Breathable cotton blend works well for daily shirts and blouses.',
        },
        {
          purpose: 'Activewear',
          suitability: 'Fair',
          note: 'Polyester content may feel warm during intense workouts.',
        },
        {
          purpose: 'Business casual',
          suitability: 'Good',
          note: 'Structured enough for office wear with regular ironing.',
        },
        {
          purpose: 'Outerwear lining',
          suitability: 'Poor',
          note: 'Too lightweight for jackets or heavy layered pieces.',
        },
      ],
      ecoAlternatives: [
        {
          name: 'Jusi',
          description: 'Local Philippine fiber. Biodegradable.',
        },
        {
          name: 'Abaca',
          description: 'Strong natural fiber from Mindanao.',
        },
        {
          name: 'Organic Cotton',
          description: 'Less pesticides. Similar soft feel.',
        },
      ],
      recycledAwareness:
        'Choose GRS-certified recycled polyester (rPET) in cotton-poly blends.',
      reuse: {
        resale: 'List as a cotton blend on secondhand apps if gently used.',
        donate: 'Accepted by most textile donation programs.',
        upcycle: 'Repurpose into tote bags, cloths, or patchwork.',
      },
    },
  },
  {
    id: '2',
    dominantFabric: 'Linen dominant',
    compositions: [
      { material: 'Linen', percentage: 78 },
      { material: 'Cotton', percentage: 22 },
    ],
    confidence: 84,
    scannedAt: 'Yesterday, 3:45 PM',
    sustainability: {
      rating: 'green',
      label: 'Good',
      score: 8,
    },
    mislabeling: {
      detected: false,
      title: 'Label Check Passed',
      message: 'No seller label was provided or the label matches the detected composition.',
    },
    profile: {
      texture: 'Natural',
      weave: 'Basket weave',
      breathability: 'Very high',
      durability: 'Moderate',
      stretch: 'None',
      careInstructions: [
        { text: 'Hand wash, line dry', recommended: true },
        { text: 'Iron while damp', recommended: true },
        { text: 'Avoid machine drying', recommended: false },
      ],
      useCases: ['Summer tops', 'Loose trousers', 'Breathable layers', 'Resort wear'],
    },
    recommendations: {
      garmentPurposes: [
        {
          purpose: 'Summer tops',
          suitability: 'Excellent',
          note: 'Linen blend stays cool and airy in hot weather.',
        },
        {
          purpose: 'Loose trousers',
          suitability: 'Good',
          note: 'Comfortable drape, though wrinkles easily without blending.',
        },
        {
          purpose: 'Formal suiting',
          suitability: 'Fair',
          note: 'Natural creasing makes it less ideal for sharp tailoring.',
        },
        {
          purpose: 'Winter layering',
          suitability: 'Poor',
          note: 'Too breathable for cold-weather base layers.',
        },
      ],
      ecoAlternatives: [
        {
          name: 'European Flax Linen',
          description: 'Low water use. Minimal processing.',
        },
        {
          name: 'Hemp',
          description: 'Durable natural fiber. Needs little water.',
        },
        {
          name: 'Ramie',
          description: 'Breathable plant fiber. Linen-like feel.',
        },
      ],
      recycledAwareness:
        'For linen blends, choose organic or European flax sourcing.',
      reuse: {
        resale: 'Popular for summer vintage markets.',
        donate: 'Good for warm-weather clothing drives.',
        upcycle: 'Use for napkins, runners, or home decor.',
      },
    },
  },
];

export function getScanResult(id: string): ScanResult | undefined {
  return SCAN_RESULTS.find((result) => result.id === id);
}

export function resolveScanId(rawId: string | string[] | undefined): string {
  if (Array.isArray(rawId)) {
    return rawId[0] ?? '1';
  }

  return rawId ?? '1';
}

export function formatDetectedCompositions(compositions: FabricComposition[]): string {
  return compositions.map((item) => `${item.material} (${item.percentage}%)`).join(', ');
}

export type RecentScanPreview = {
  id: string;
  primaryFabric: string;
  composition: string;
  scannedAt: string;
  sustainability: SustainabilityRating;
  sustainabilityLabel: string;
  mislabeling: boolean;
  sellerLabel?: string;
};

export const RECENT_SCANS_PREVIEW: RecentScanPreview[] = SCAN_RESULTS.map((scan) => ({
  id: scan.id,
  primaryFabric: scan.dominantFabric.replace(' dominant', ' Blend'),
  composition: scan.compositions.map((c) => `${c.material} ${c.percentage}%`).join(' · '),
  scannedAt: scan.scannedAt,
  sustainability: scan.sustainability.rating,
  sustainabilityLabel: scan.sustainability.label,
  mislabeling: scan.mislabeling.detected,
  sellerLabel: scan.sellerLabel,
}));

export const SUSTAINABILITY_DOT: Record<SustainabilityRating, string> = {
  green: '#16a34a',
  yellow: '#ca8a04',
  red: '#dc2626',
};

export const SUSTAINABILITY_BORDER: Record<SustainabilityRating, string> = {
  green: '#bbf7d0',
  yellow: '#fde68a',
  red: '#fecaca',
};

export const SUSTAINABILITY_BG: Record<SustainabilityRating, string> = {
  green: '#f0fdf4',
  yellow: '#fffbeb',
  red: '#fef2f2',
};

export const SUITABILITY_COLOR: Record<SuitabilityLevel, string> = {
  Excellent: '#16a34a',
  Good: '#22c55e',
  Fair: '#ca8a04',
  Poor: '#dc2626',
};

export const FABRIC_PROPERTY_COLOR = {
  high: '#16a34a',
  medium: '#ca8a04',
  low: '#dc2626',
  neutral: '#212121',
} as const;

export function getFabricPropertyColor(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes('very high') || normalized === 'high' || normalized.includes('excellent')) {
    return FABRIC_PROPERTY_COLOR.high;
  }
  if (normalized.includes('medium') || normalized.includes('moderate') || normalized.includes('fair')) {
    return FABRIC_PROPERTY_COLOR.medium;
  }
  if (normalized.includes('very low') || normalized === 'low' || normalized.includes('poor') || normalized === 'none') {
    return FABRIC_PROPERTY_COLOR.low;
  }

  return FABRIC_PROPERTY_COLOR.neutral;
}

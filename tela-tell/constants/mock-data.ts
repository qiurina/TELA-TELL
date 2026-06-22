export type SustainabilityRating = 'green' | 'yellow' | 'red';

export type FabricComposition = {
  material: string;
  percentage: number;
};

export type FabricProfile = {
  texture: string;
  weave: string;
  breathability: string;
  durability: string;
  stretch: string;
  care: string;
  useCases: string;
};

export type SuitabilityLevel = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export type GarmentPurposeItem = {
  purpose: string;
  suitability: SuitabilityLevel;
  note: string;
};

export type ScanRecommendations = {
  garmentPurposes: GarmentPurposeItem[];
  ecoAwareness: {
    summary: string;
    tips: string[];
    alternative: string;
  };
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
      care: 'Machine wash warm',
      useCases: 'Shirts, dresses, everyday wear',
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
      ecoAwareness: {
        summary:
          'This blend mixes natural cotton with virgin polyester. When buying similar items, prioritize recycled or organic options.',
        tips: [
          'Look for GRS-certified recycled polyester blends',
          'Choose organic cotton to reduce pesticide use',
          'Support brands with transparent fabric sourcing',
        ],
        alternative: 'Recycled cotton–poly blend with a similar soft hand feel',
      },
      reuse: {
        resale:
          'Good resale potential if gently used. List accurately as a cotton blend on secondhand marketplaces.',
        donate:
          'Accepted by most textile donation programs. Cotton content makes it easy to sort for reuse.',
        upcycle:
          'Repurpose into tote bags, cleaning cloths, or patchwork projects. Holds up well for craft use.',
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
      care: 'Hand wash, line dry',
      useCases: 'Summer tops, loose trousers, breathable layers',
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
      ecoAwareness: {
        summary:
          'Linen is a low-impact natural fiber. This blend is a strong eco choice compared to fully synthetic fabrics.',
        tips: [
          'Linen requires less water than cotton during growing',
          'Blend extends garment life by reducing wrinkling',
          'Air-drying saves energy and preserves fiber quality',
        ],
        alternative: '100% European flax linen for maximum sustainability',
      },
      reuse: {
        resale:
          'Popular for summer vintage markets. Mention linen content to attract eco-conscious buyers.',
        donate:
          'Great for donation drives focused on warm-weather clothing and household textiles.',
        upcycle:
          'Use for napkins, table runners, or relaxed home decor. Natural texture suits rustic projects.',
      },
    },
  },
];

export function getScanResult(id: string): ScanResult | undefined {
  return SCAN_RESULTS.find((result) => result.id === id);
}

export type RecentScanPreview = {
  id: string;
  primaryFabric: string;
  composition: string;
  scannedAt: string;
  sustainability: SustainabilityRating;
  mislabeling: boolean;
  sellerLabel?: string;
};

export const RECENT_SCANS_PREVIEW: RecentScanPreview[] = SCAN_RESULTS.map((scan) => ({
  id: scan.id,
  primaryFabric: scan.dominantFabric.replace(' dominant', ' Blend'),
  composition: scan.compositions
    .slice(0, 2)
    .map((c) => `${c.material} ${c.percentage}%`)
    .join(' · '),
  scannedAt: scan.scannedAt,
  sustainability: scan.sustainability.rating,
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

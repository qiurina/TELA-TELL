import type { ImageSourcePropType } from 'react-native';

export type SustainabilityRating = 'green' | 'yellow' | 'red';

export type SustainabilityFactor = {
  text: string;
  positive: boolean;
};

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
  /** Functional similarity line — used by eco-alternatives lookup. */
  similarity?: string;
  /** Legacy mock scan entries — fallback when `similarity` is absent. */
  description?: string;
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
  scannedAtDate: string;
  sellerLabel?: string;
  /** Local capture URI when saved from Scan (same image as review preview). */
  imageUri?: string | null;
  sustainability: {
    rating: SustainabilityRating;
    label: string;
    score: number;
    factors: SustainabilityFactor[];
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
    scannedAtDate: '2026-07-04',
    sellerLabel: 'Pure Silk',
    sustainability: {
      rating: 'green',
      label: 'Good',
      score: 7,
      factors: [
        { text: 'Natural cotton is the dominant fiber', positive: true },
        { text: 'Contains polyester synthetic blend', positive: false },
        { text: 'Suitable for everyday reuse and donation', positive: true },
      ],
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
          name: 'Rayon',
          description: 'Flowy semi-synthetic with a similar soft hand-feel.',
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
    scannedAtDate: '2026-07-03',
    sellerLabel: 'Linen / Cotton blend',
    sustainability: {
      rating: 'green',
      label: 'Good',
      score: 8,
      factors: [
        { text: 'High linen content, breathable natural fiber', positive: true },
        { text: 'Low synthetic content in blend', positive: true },
        { text: 'Wrinkles easily, moderate care impact', positive: false },
      ],
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
  {
    id: '3',
    dominantFabric: 'Mixed fibers',
    compositions: [
      { material: 'Cotton', percentage: 38 },
      { material: 'Polyester', percentage: 35 },
      { material: 'Rayon', percentage: 27 },
    ],
    confidence: 45,
    scannedAt: 'Today, just now',
    scannedAtDate: '2026-07-04',
    sellerLabel: 'Cotton / Polyester blend',
    sustainability: {
      rating: 'yellow',
      label: 'Moderate',
      score: 5,
      factors: [
        { text: 'Blend composition unclear at low confidence', positive: false },
        { text: 'Contains synthetic fibers', positive: false },
        { text: 'Rescan recommended before reuse decisions', positive: true },
      ],
    },
    mislabeling: {
      detected: false,
      title: 'Label Check Passed',
      message: 'No seller label was provided or the label matches the detected composition.',
    },
    profile: {
      texture: 'Unclear',
      weave: 'Unknown',
      breathability: 'Moderate',
      durability: 'Moderate',
      stretch: 'Low',
      careInstructions: [
        { text: 'Rescan under even lighting before relying on care guidance', recommended: true },
        { text: 'Cold wash if fiber type is uncertain', recommended: true },
        { text: 'High-heat drying', recommended: false },
      ],
      useCases: ['Rescan recommended', 'Handle with care until verified'],
    },
    recommendations: {
      garmentPurposes: [
        {
          purpose: 'Everyday wear',
          suitability: 'Fair',
          note: 'Low scan confidence. Verify the fabric before committing to a garment plan.',
        },
      ],
      ecoAlternatives: [
        {
          name: 'Recycled cotton blend',
          description: 'Choose verified natural-dominant blends when composition is uncertain.',
        },
      ],
      recycledAwareness: 'Rescan in even lighting for a clearer fiber estimate before buying alternatives.',
      reuse: {
        resale: 'Verify fabric type before listing.',
        donate: 'Only donate after a clearer scan or label check.',
        upcycle: 'Test a small swatch before cutting into projects.',
      },
    },
  },
  {
    id: '4',
    dominantFabric: 'Abaca dominant',
    compositions: [
      { material: 'Abaca', percentage: 82 },
      { material: 'Cotton', percentage: 12 },
      { material: 'Rayon', percentage: 6 },
    ],
    confidence: 86,
    scannedAt: 'Today, 2:15 PM',
    scannedAtDate: '2026-07-04',
    sellerLabel: 'Abaca blend',
    sustainability: {
      rating: 'green',
      label: 'Good',
      score: 8,
      factors: [
        { text: 'Philippine abaca, strong natural plant fiber', positive: true },
        { text: 'Low synthetic content in blend', positive: true },
        { text: 'Hand-wash care may limit everyday reuse', positive: false },
      ],
    },
    mislabeling: {
      detected: false,
      title: 'Label Check Passed',
      message: 'No seller label was provided or the label matches the detected composition.',
    },
    profile: {
      texture: 'Firm',
      weave: 'Plain weave',
      breathability: 'High',
      durability: 'High',
      stretch: 'Low',
      careInstructions: [
        { text: 'Hand wash gently, line dry', recommended: true },
        { text: 'Iron on low if needed', recommended: true },
        { text: 'Machine wash hot', recommended: false },
      ],
      useCases: ['Sinamay accents', 'Bags', 'Home decor', 'Structured barong trim'],
    },
    recommendations: {
      garmentPurposes: [
        {
          purpose: 'Formal barong trim',
          suitability: 'Excellent',
          note: 'Abaca holds shape well for traditional Filipino formal wear details.',
        },
        {
          purpose: 'Everyday shirts',
          suitability: 'Fair',
          note: 'Stiffer hand-feel than cotton. Better for structured pieces.',
        },
        {
          purpose: 'Bags & accessories',
          suitability: 'Good',
          note: 'Durable fiber suited to totes and craft projects.',
        },
        {
          purpose: 'Activewear',
          suitability: 'Poor',
          note: 'Not ideal for stretch or high-sweat use.',
        },
      ],
      ecoAlternatives: [
        {
          name: 'Linen',
          description: 'Similar breathable natural feel for warm-climate wear.',
        },
        {
          name: 'Organic cotton',
          description: 'Softer everyday option with wide ukay availability.',
        },
      ],
      recycledAwareness:
        'Support Mindanao abaca growers and handwoven sources when buying new. In ukay, check for mildew on plant fibers.',
      reuse: {
        resale: 'List as Philippine abaca or sinamay on local craft and vintage markets.',
        donate: 'Craft groups often accept natural plant fibers for weaving.',
        upcycle: 'Use for placemats, coasters, or bag panels.',
      },
    },
  },
  {
    id: '6',
    dominantFabric: 'Rayon dominant',
    compositions: [
      { material: 'Rayon', percentage: 72 },
      { material: 'Polyester', percentage: 18 },
      { material: 'Cotton', percentage: 10 },
    ],
    confidence: 79,
    scannedAt: '2 days ago, 4:30 PM',
    scannedAtDate: '2026-07-02',
    sellerLabel: 'Rayon blend',
    sustainability: {
      rating: 'yellow',
      label: 'Moderate',
      score: 6,
      factors: [
        { text: 'Rayon offers soft drape for dresses and blouses', positive: true },
        { text: 'Contains polyester synthetic blend', positive: false },
        { text: 'Semi-synthetic fiber with moderate environmental impact', positive: false },
      ],
    },
    mislabeling: {
      detected: false,
      title: 'Label Check Passed',
      message: 'No seller label was provided or the label matches the detected composition.',
    },
    profile: {
      texture: 'Smooth',
      weave: 'Plain weave',
      breathability: 'Moderate',
      durability: 'Moderate',
      stretch: 'Low',
      careInstructions: [
        { text: 'Hand wash or delicate cycle', recommended: true },
        { text: 'Lay flat to dry', recommended: true },
        { text: 'High-heat tumble dry', recommended: false },
      ],
      useCases: ['Dresses', 'Blouses', 'Flowy skirts', 'Office separates'],
    },
    recommendations: {
      garmentPurposes: [
        {
          purpose: 'Office wear',
          suitability: 'Good',
          note: 'Soft drape works well for tropical office blouses and skirts.',
        },
        {
          purpose: 'Casual outings',
          suitability: 'Excellent',
          note: 'Comfortable flowy hand-feel for everyday ukay finds.',
        },
        {
          purpose: 'Sportswear',
          suitability: 'Poor',
          note: 'Not built for stretch or moisture-heavy activity.',
        },
        {
          purpose: 'Rainy season outer layer',
          suitability: 'Fair',
          note: 'Can weaken when wet. Dry promptly after habagat showers.',
        },
      ],
      ecoAlternatives: [
        {
          name: 'Tencel / lyocell',
          description: 'Closed-loop cellulose with a similar flowy drape.',
        },
        {
          name: 'Organic cotton',
          description: 'Breathable natural alternative for everyday tops.',
        },
        {
          name: 'Linen blend',
          description: 'Airy structure with better wrinkle recovery in humidity.',
        },
      ],
      recycledAwareness:
        'Rayon weakens when wet. Handle gently when washing ukay finds. Shrinkage is common.',
      reuse: {
        resale: 'Flowy dresses and blouses sell well. Note shrink history if known.',
        donate: 'Community dress drives often accept clean rayon separates.',
        upcycle: 'Repurpose panels into scarves or hair accessories if worn.',
      },
    },
  },
];

export type DualSwatchRegion = {
  label: string;
  dominantFabric: string;
  compositions: FabricComposition[];
  confidence: number;
  region?: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

function getDualSwatchPrimaryResult(): ScanResult {
  return SCAN_RESULTS.find((scan) => scan.id === '2')!;
}

export function getScanResult(id: string): ScanResult | undefined {
  if (id === 'dual') {
    return getDualSwatchPrimaryResult();
  }

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

const SCAN_THUMBNAIL = require('@/assets/images/testfabric.jpg') as ImageSourcePropType;

export type RecentScanPreview = {
  id: string;
  primaryFabric: string;
  composition: string;
  scannedAt: string;
  scannedAtDate: string;
  sustainability: SustainabilityRating;
  sustainabilityLabel: string;
  mislabeling: boolean;
  sellerLabel?: string;
  image: ImageSourcePropType;
  isFavorite?: boolean;
  /** ISO timestamp when soft-deleted; only set for trash items. */
  deletedAt?: string | null;
  /** Whole days remaining before auto-purge (deleted gallery). */
  daysRemaining?: number;
};

export const RECENT_SCANS_PREVIEW: RecentScanPreview[] = SCAN_RESULTS.map((scan) => ({
  id: scan.id,
  primaryFabric: scan.dominantFabric.replace(' dominant', ' Blend'),
  composition: scan.compositions.map((c) => `${c.material} ${c.percentage}%`).join(' · '),
  scannedAt: scan.scannedAt,
  scannedAtDate: scan.scannedAtDate,
  sustainability: scan.sustainability.rating,
  sustainabilityLabel: scan.sustainability.label,
  mislabeling: scan.mislabeling.detected,
  sellerLabel: scan.sellerLabel,
  image: SCAN_THUMBNAIL,
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

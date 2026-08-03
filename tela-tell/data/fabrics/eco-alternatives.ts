import type { EcoAlternative, FabricComposition } from '@/data/scans/mock-data';
import {
  getFabricCategory,
  resolveFabricAlias,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import { getSignificantFibers, isBlendDetected } from '@/data/scans/analysis';

export type EcoGuidance = {
  ecoAlternatives: EcoAlternative[];
  recycledAwareness: string;
  reuse: {
    resale: string;
    donate: string;
    upcycle: string;
  };
};

export type EcoGuidanceContext = {
  kind: 'blend' | 'mostly' | 'mixed';
  title: string;
  detail?: string;
};

export type EcoGuidanceResult = EcoGuidance & {
  context: EcoGuidanceContext;
};

type EcoFiberGuide = EcoGuidance;

const ECO_GUIDANCE_BY_FIBER: Record<SupportedFabric, EcoFiberGuide> = {
  Cotton: {
    ecoAlternatives: [
      {
        name: 'Organic cotton',
        similarity: 'Soft, breathable everyday wear. Look for GOTS tags in ukay.',
      },
      {
        name: 'Linen-cotton blend',
        similarity: 'Comfortable with a crisper hand. Holds shape in humidity.',
      },
      {
        name: 'Recycled cotton (rCotton)',
        similarity: 'Same hand-feel for shirts and dresses. Popular with upcyclers.',
      },
    ],
    recycledAwareness:
      'Check for GOTS or recycled cotton tags. Verify fiber on blends before reselling.',
    reuse: {
      resale: 'List as cotton or blend on Carousell or Facebook Marketplace if gently used.',
      donate: 'Most barangay textile drives accept cotton garments.',
      upcycle: 'Cut into cleaning cloths, tote bags, or patchwork quilts.',
    },
  },
  Wool: {
    ecoAlternatives: [
      {
        name: 'Recycled wool',
        similarity: 'Warm layers with loft. RWS labels appear in imported ukay.',
      },
      {
        name: 'Lightweight cotton blend',
        similarity: 'Light layering without heavy insulation. Suited to cool climates.',
      },
      {
        name: 'Abaca',
        similarity: 'Strong outer layers. Mindanao plant fiber, breathable in heat.',
      },
    ],
    recycledAwareness:
      'Wool is rare in Philippine ukay. Store with moth protection; felted scraps suit crafters.',
    reuse: {
      resale: 'Niche winter-wear buyers online. Note pilling honestly.',
      donate: 'Check if local craft groups accept wool for felting.',
      upcycle: 'Felt into slippers, coasters, or insulation padding.',
    },
  },
  Silk: {
    ecoAlternatives: [
      {
        name: 'Abaca',
        similarity: 'Lustrous plant fiber for barong and Filipiniana. Common in formal ukay.',
      },
      {
        name: 'Rayon',
        similarity: 'Smooth formal hand-feel for flowy blouses and pre-owned formal wear.',
      },
      {
        name: 'Peace silk (ahimsa)',
        similarity: 'Comparable sheen and drape. Ethical alternative for formal wear.',
      },
    ],
    recycledAwareness:
      'Heritage silk in ukay is often underpriced. Inspect for snags and yellowing.',
    reuse: {
      resale: 'Market to formal-wear and cultural costume buyers with clear fiber notes.',
      donate: 'School theater or cultural groups may accept verified silk garments.',
      upcycle: 'Small panels can become hair accessories or ceremonial sashes.',
    },
  },
  Linen: {
    ecoAlternatives: [
      {
        name: 'European flax linen',
        similarity: 'Crisp, breathable summer fabric for tropical heat.',
      },
      {
        name: 'Abaca',
        similarity: 'Airy and strong. Good for resort wear and bags.',
      },
      {
        name: 'Cotton-linen blend',
        similarity: 'Relaxed feel with less wrinkling in humid storage.',
      },
    ],
    recycledAwareness:
      'Linen wrinkles in humidity. Note care when listing on ukay.',
    reuse: {
      resale: 'Summer linen sells well in vintage markets. Steam before photos.',
      donate: 'Warm-weather drives welcome linen blends.',
      upcycle: 'Napkins, table runners, or beach cover-ups.',
    },
  },
  Polyester: {
    ecoAlternatives: [
      {
        name: 'Recycled polyester (rPET)',
        similarity: 'Durable activewear from plastic bottles. Common in PH secondhand.',
      },
      {
        name: 'Recycled nylon',
        similarity: 'Stretch and moisture-wicking. Better for sportswear than cotton.',
      },
      {
        name: 'Tencel / lyocell blend',
        similarity: 'Soft drape with closed-loop processing. Good for flowy pieces.',
      },
    ],
    recycledAwareness:
      'Synthetics shed microplastics in wash. Use a Guppyfriend bag and air-dry.',
    reuse: {
      resale: 'Note odor and wear on listings. Athletic wear has steady demand.',
      donate: 'Confirm programs accept synthetics; not all drives do.',
      upcycle: 'Stuffing for pillows, pet beds, or craft insulation.',
    },
  },
  Nylon: {
    ecoAlternatives: [
      {
        name: 'Recycled nylon (Econyl)',
        similarity: 'Stretch, strength, and quick-dry. Made from nets and waste.',
      },
      {
        name: 'Recycled PET blend',
        similarity: 'Durable and abrasion-resistant. Good for bags and jackets.',
      },
      {
        name: 'Organic cotton (low-intensity)',
        similarity: 'Natural option when stretch matters less. Breathable in tropical heat.',
      },
    ],
    recycledAwareness:
      'Check elasticity and seams on nylon activewear before buying to resell.',
    reuse: {
      resale: 'List sportswear and bags separately with clear photos of wear.',
      donate: 'Limited acceptance. Prefer upcycle if heavily worn.',
      upcycle: 'Straps, cords, and patch reinforcements for bags.',
    },
  },
  Acrylic: {
    ecoAlternatives: [
      {
        name: 'Recycled acrylic knit',
        similarity: 'Lightweight warmth. Some brands offer recycled knits; check labels.',
      },
      {
        name: 'Wool blend',
        similarity: 'Natural insulation for short cool seasons vs. pure acrylic.',
      },
      {
        name: 'Cotton knit',
        similarity: 'Breathable everyday knits. Less heat-trapping in PH weather.',
      },
    ],
    recycledAwareness:
      'Acrylic knits pill quickly in ukay. Price accordingly and photograph texture.',
    reuse: {
      resale: 'Budget knitwear market. Disclose pilling and stretch loss.',
      donate: 'Craft groups may take acrylic yarn from unraveled garments.',
      upcycle: 'Amigurumi stuffing, draft stoppers, or pet blankets.',
    },
  },
  Spandex: {
    ecoAlternatives: [
      {
        name: 'Recycled elastane blends',
        similarity: 'Stretch and recovery. Some activewear lines use recycled spandex.',
      },
      {
        name: 'Cotton-spandex blend (GOTS)',
        similarity: 'Natural-dominant stretch for jeans and tees. Check fiber ratio on tags.',
      },
      {
        name: 'Loose linen or cotton',
        similarity: 'Non-stretch option when fit recovery matters less in tropical heat.',
      },
    ],
    recycledAwareness:
      'Spandex is almost always blended. Check labels; stretch-heavy synthetics shed more.',
    reuse: {
      resale: 'List activewear and stretch denim with clear fiber notes.',
      donate: 'Confirm programs accept synthetic blends.',
      upcycle: 'Hair ties, elastic bands, or craft stretch panels.',
    },
  },
  Rayon: {
    ecoAlternatives: [
      {
        name: 'Tencel / lyocell',
        similarity: 'Flowy, lightweight drape. Gentler closed-loop cellulose processing.',
      },
      {
        name: 'Cotton voile',
        similarity: 'Soft blouse hand-feel. Breathable for dresses and tops.',
      },
      {
        name: 'Abaca',
        similarity: 'Philippine plant fiber with comparable breathability for formal wear.',
      },
    ],
    recycledAwareness:
      'Rayon weakens when wet. Wash gently; shrinkage is common on ukay finds.',
    reuse: {
      resale: 'Flowy dresses and blouses sell well. Note shrink history if known.',
      donate: 'General textile drives usually accept rayon blends.',
      upcycle: 'Lining fabric, scarves, or craft backing.',
    },
  },
  Leather: {
    ecoAlternatives: [
      {
        name: 'Recycled leather (verified)',
        similarity: 'Durable bags and belts. Look for certified recycled hide labels.',
      },
      {
        name: 'Plant-based leather (verified)',
        similarity: 'Vegan structure for bags and shoes.',
      },
      {
        name: 'Heavy cotton canvas',
        similarity: 'Natural alternative for totes and outerwear.',
      },
    ],
    recycledAwareness:
      'Leather ages with humidity. Condition before resale and note scuffs honestly.',
    reuse: {
      resale: 'Vintage leather market. Photograph grain, seams, and odor.',
      donate: 'Craft groups may accept clean leather scraps.',
      upcycle: 'Patches, bookmarks, or small accessory panels.',
    },
  },
  Suede: {
    ecoAlternatives: [
      {
        name: 'Recycled suede (verified)',
        similarity: 'Napped finish. Check certified recycled sources in premium secondhand.',
      },
      {
        name: 'Microfiber suede',
        similarity: 'Synthetic napped option without animal hide. Common in budget footwear.',
      },
      {
        name: 'Brushed cotton twill',
        similarity: 'Soft matte texture for casual layers without animal material.',
      },
    ],
    recycledAwareness:
      'Suede stains easily in humid storage. Brush nap and disclose water marks.',
    reuse: {
      resale: 'Note nap direction and wear. Suede buyers inspect texture closely.',
      donate: 'Limited acceptance. Prefer upcycle if heavily stained.',
      upcycle: 'Small pouches, patches, or craft appliqué.',
    },
  },
  Abaca: {
    ecoAlternatives: [
      {
        name: 'Cotton-linen blend',
        similarity: 'Softer everyday drape for warm climate pieces.',
      },
      {
        name: 'Linen',
        similarity: 'Breathable warm climate apparel. European flax with similar airiness.',
      },
      {
        name: 'Sisal / maguey blends',
        similarity: 'Strong ropes, bags, and home textiles from other PH plant fibers.',
      },
    ],
    recycledAwareness:
      'Support Mindanao abaca weavers when buying new. In ukay, look for sinamay and barong panels.',
    reuse: {
      resale: 'List as Philippine abaca or sinamay to craft and formal-wear buyers.',
      donate: 'Weaving cooperatives may accept clean plant-fiber yardage.',
      upcycle: 'Placemats, coasters, lampshades, or bag panels.',
    },
  },
};

const MIXED_FIBER_GUIDANCE: EcoGuidance = {
  ecoAlternatives: [
    {
      name: 'Natural-dominant blend',
      similarity: 'Everyday comfort when labels are unclear. Choose cotton, linen, or PH fiber tags.',
    },
    {
      name: 'Recycled blended yarn',
      similarity: 'Mixed performance with less virgin synthetic. Ask sellers about fiber content.',
    },
      {
        name: 'Single-fiber rescan',
        similarity: 'Clearer match for alternatives. Rescan one fabric area in even lighting.',
      },
  ],
  recycledAwareness:
    'Mixed ukay finds are common. Rescan under even light or check the garment tag first.',
  reuse: {
    resale: 'Verify fiber type before listing. Buyers ask for composition on blends.',
    donate: 'Donate only after a clearer scan or label check.',
    upcycle: 'Test a small swatch before cutting into a project.',
  },
};

function resolvePrimaryFiber(
  dominantFabric: string,
  compositions?: FabricComposition[],
): SupportedFabric | null {
  const fromDominant = resolveFabricAlias(dominantFabric);
  if (fromDominant) {
    return fromDominant;
  }

  const sorted = [...(compositions ?? [])].sort((a, b) => b.percentage - a.percentage);
  const top = sorted[0]?.material;

  if (top) {
    return resolveFabricAlias(top);
  }

  return null;
}

function resolveSignificantSupported(
  compositions: FabricComposition[],
): { fabric: SupportedFabric; percentage: number }[] {
  const significant = getSignificantFibers(compositions);
  const resolved: { fabric: SupportedFabric; percentage: number }[] = [];

  for (const item of significant) {
    const fabric = resolveFabricAlias(item.material);
    if (!fabric) {
      continue;
    }
    if (resolved.some((entry) => entry.fabric === fabric)) {
      continue;
    }
    resolved.push({ fabric, percentage: item.percentage });
  }

  return resolved;
}

function formatFiberPhrase(fibers: SupportedFabric[]): string {
  const labels = fibers.map((fiber) => fiber.toLowerCase());
  if (labels.length === 0) {
    return 'mixed fibers';
  }
  if (labels.length === 1) {
    return labels[0];
  }
  if (labels.length === 2) {
    return `${labels[0]}-${labels[1]}`;
  }
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function dedupeAlternatives(items: EcoAlternative[], max = 3): EcoAlternative[] {
  const seen = new Set<string>();
  const result: EcoAlternative[] = [];

  for (const item of items) {
    const key = item.name.trim().toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
    if (result.length >= max) {
      break;
    }
  }

  return result;
}

function buildBlendAlternatives(
  primary: SupportedFabric,
  fibers: { fabric: SupportedFabric; percentage: number }[],
): EcoAlternative[] {
  const primaryGuide = ECO_GUIDANCE_BY_FIBER[primary];
  const syntheticShare = fibers
    .filter((item) => getFabricCategory(item.fabric) === 'Synthetic')
    .reduce((sum, item) => sum + item.percentage, 0);
  const hasPolyester = fibers.some((item) => item.fabric === 'Polyester');
  const hasAcrylic = fibers.some((item) => item.fabric === 'Acrylic');

  const blendFirst: EcoAlternative[] = [];

  if (syntheticShare >= 15) {
    blendFirst.push({
      name: 'Natural-dominant blend',
      similarity:
        'Choose cotton, linen, or abaca-heavy pieces next time to cut synthetic share and shedding.',
    });
  }

  if (hasPolyester) {
    blendFirst.push({
      name: 'Recycled polyester (rPET) blend',
      similarity:
        'If you still need poly performance, look for GRS or rPET tags instead of virgin polyester.',
    });
  }

  if (hasAcrylic) {
    blendFirst.push({
      name: 'Cotton or wool knit',
      similarity: 'Warmer knits with less acrylic shedding. Check loft and pilling before buying.',
    });
  }

  if (syntheticShare < 40) {
    blendFirst.push(...primaryGuide.ecoAlternatives);
  } else {
    blendFirst.push(
      {
        name: 'Organic cotton',
        similarity: 'Softer everyday option with lower microplastic load than heavy synthetics.',
      },
      ...primaryGuide.ecoAlternatives,
    );
  }

  return dedupeAlternatives(blendFirst, 3);
}

function buildBlendReuse(
  fibers: { fabric: SupportedFabric; percentage: number }[],
): EcoGuidance['reuse'] {
  const names = fibers.map((item) => item.fabric);
  const phrase = formatFiberPhrase(names);
  const syntheticShare = fibers
    .filter((item) => getFabricCategory(item.fabric) === 'Synthetic')
    .reduce((sum, item) => sum + item.percentage, 0);

  return {
    resale: `List as a ${phrase} blend and mention the estimated mix. Buyers ask about composition on ukay pieces.`,
    donate:
      syntheticShare >= 25
        ? 'Check if the donation program accepts synthetic blends before dropping it off.'
        : 'Most barangay textile drives accept natural-leaning blends when clean and usable.',
    upcycle:
      syntheticShare >= 25
        ? 'Synthetics in the blend may not compost. Better as cleaning cloths, bags, or patchwork than garden use.'
        : 'Natural-leaning blends can become cloths, tote panels, or patchwork more easily.',
  };
}

function buildBlendRecycledAwareness(
  primary: SupportedFabric,
  fibers: { fabric: SupportedFabric; percentage: number }[],
): string {
  const syntheticShare = fibers
    .filter((item) => getFabricCategory(item.fabric) === 'Synthetic')
    .reduce((sum, item) => sum + item.percentage, 0);
  const primaryNote = ECO_GUIDANCE_BY_FIBER[primary].recycledAwareness;

  if (syntheticShare >= 25) {
    return `This looks like a blend with about ${Math.round(syntheticShare)}% synthetic content. Prefer recycled or natural-dominant tags when buying again. ${primaryNote}`;
  }

  return `Detected as a blend. Keep the full mix in mind when comparing tags. ${primaryNote}`;
}

export function getEcoGuidance(
  dominantFabric: string,
  compositions: FabricComposition[] = [],
): EcoGuidanceResult {
  const items = compositions.length > 0 ? compositions : [];
  const significant = resolveSignificantSupported(items);
  const primary = resolvePrimaryFiber(dominantFabric, items) ?? significant[0]?.fabric ?? null;
  const blend = isBlendDetected(items) && significant.length >= 2;

  if (!primary) {
    return {
      ...MIXED_FIBER_GUIDANCE,
      context: {
        kind: 'mixed',
        title: 'Mixed fibers',
        detail: 'Check the garment tag when you can',
      },
    };
  }

  if (blend) {
    return {
      ecoAlternatives: buildBlendAlternatives(primary, significant),
      recycledAwareness: buildBlendRecycledAwareness(primary, significant),
      reuse: buildBlendReuse(significant),
      context: {
        kind: 'blend',
        title: 'Blend',
      },
    };
  }

  return {
    ...ECO_GUIDANCE_BY_FIBER[primary],
    context: {
      kind: 'mostly',
      title: `Mostly ${primary}`,
    },
  };
}

export function formatDetectedLabel(dominantFabric: string): string {
  const trimmed = dominantFabric.trim();
  if (/^detected:/i.test(trimmed)) {
    return trimmed.replace(/^detected:\s*/i, '').trim() || trimmed;
  }

  return trimmed;
}

export function getEcoAlternativeText(alternative: EcoAlternative): string {
  return alternative.similarity ?? alternative.description ?? '';
}

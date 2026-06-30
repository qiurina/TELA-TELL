import type { EcoAlternative, FabricComposition } from '@/data/scans/mock-data';
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';

export type EcoGuidance = {
  ecoAlternatives: EcoAlternative[];
  recycledAwareness: string;
  reuse: {
    resale: string;
    donate: string;
    upcycle: string;
  };
};

type EcoFiberGuide = EcoGuidance;

const ECO_GUIDANCE_BY_FIBER: Record<SupportedFabric, EcoFiberGuide> = {
  Cotton: {
    ecoAlternatives: [
      {
        name: 'Organic cotton',
        similarity:
          'Same softness and breathability for everyday wear — look for GOTS tags in curated ukay shops.',
      },
      {
        name: 'Linen-cotton blend',
        similarity:
          'Similar comfort with a crisper hand-feel — holds shape better in Philippine humidity.',
      },
      {
        name: 'Recycled cotton (rCotton)',
        similarity:
          'Same hand-feel for shirts and dresses — post-consumer waste, popular with upcyclers.',
      },
    ],
    recycledAwareness:
      'In ukay-ukay bins, check for GOTS or recycled cotton tags. Blend pieces are common — verify fiber before reselling.',
    reuse: {
      resale: 'List as cotton or cotton blend on Carousell or Facebook Marketplace if gently used.',
      donate: 'Most barangay textile drives accept cotton garments.',
      upcycle: 'Cut into cleaning cloths, tote bags, or patchwork quilts.',
    },
  },
  Wool: {
    ecoAlternatives: [
      {
        name: 'Recycled wool',
        similarity:
          'Same warmth and loft for cool layers — RWS-certified labels appear in imported ukay finds.',
      },
      {
        name: 'Lightweight cotton blend',
        similarity:
          'Similar light layering without heavy insulation — better suited to Baguio-style climates.',
      },
      {
        name: 'Abaca',
        similarity:
          'Comparable strength for structured outer layers — Mindanao plant fiber, breathable in heat.',
      },
    ],
    recycledAwareness:
      'Wool is rare in Philippine ukay — store with moth protection if keeping. Felted wool scraps are valued by crafters.',
    reuse: {
      resale: 'Niche winter-wear buyers online — note any pilling honestly in listings.',
      donate: 'Check if local craft groups accept wool for felting projects.',
      upcycle: 'Felt into slippers, coasters, or insulation padding.',
    },
  },
  Silk: {
    ecoAlternatives: [
      {
        name: 'Piña',
        similarity:
          'Same lustrous drape for barong and Filipiniana — Aklan heirloom fiber, common in formal ukay.',
      },
      {
        name: 'Jusi',
        similarity:
          'Similar smooth formal hand-feel — piña-silk blend at a lower price point in pre-owned barong.',
      },
      {
        name: 'Peace silk (ahimsa)',
        similarity:
          'Comparable sheen and drape — ethical alternative when piña is unavailable.',
      },
    ],
    recycledAwareness:
      'Heritage silk and piña pieces in ukay are often underpriced — inspect for snags and yellowing before resale.',
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
        similarity:
          'Same crisp breathability and summer weight — low-water natural fiber for tropical heat.',
      },
      {
        name: 'Abaca',
        similarity:
          'Similar airy structure and strength — Philippine plant fiber for resort wear and bags.',
      },
      {
        name: 'Cotton-linen blend',
        similarity:
          'Same relaxed hand-feel with less wrinkling — easier care in humid ukay storage.',
      },
    ],
    recycledAwareness:
      'Linen wrinkles easily in humidity — mention care honestly when listing on ukay platforms.',
    reuse: {
      resale: 'Summer linen sells well in vintage markets — steam before photographing.',
      donate: 'Warm-weather clothing drives welcome linen blends.',
      upcycle: 'Napkins, table runners, or relaxed beach cover-ups.',
    },
  },
  Polyester: {
    ecoAlternatives: [
      {
        name: 'Recycled polyester (rPET)',
        similarity:
          'Same feel and durability for activewear — made from plastic bottles, common in PH athletic secondhand.',
      },
      {
        name: 'Recycled nylon',
        similarity:
          'Similar stretch and moisture-wicking — better for sportswear than switching to cotton.',
      },
      {
        name: 'Tencel / lyocell blend',
        similarity:
          'Comparable drape with softer hand-feel — closed-loop processing, good for flowy pieces.',
      },
    ],
    recycledAwareness:
      'Synthetic ukay finds shed microplastics in wash — use a Guppyfriend bag and air-dry when possible.',
    reuse: {
      resale: 'Note synthetic odor and wear on listings — athletic wear has a steady secondhand market.',
      donate: 'Confirm programs accept synthetics; not all drives do.',
      upcycle: 'Stuffing for pillows, pet beds, or craft insulation.',
    },
  },
  Nylon: {
    ecoAlternatives: [
      {
        name: 'Recycled nylon (Econyl)',
        similarity:
          'Same stretch, strength, and quick-dry performance — regenerated from fishing nets and waste.',
      },
      {
        name: 'Recycled PET blend',
        similarity:
          'Similar durability and abrasion resistance — good for bags, jackets, and outer shells.',
      },
      {
        name: 'Organic cotton (low-intensity)',
        similarity:
          'Natural alternative when stretch is less critical — breathable for casual tropical wear.',
      },
    ],
    recycledAwareness:
      'Nylon activewear in ukay — check elasticity and seams before buying to resell.',
    reuse: {
      resale: 'List sportswear and bags separately with clear photos of wear.',
      donate: 'Limited acceptance — prefer upcycle if heavily worn.',
      upcycle: 'Straps, cords, and patch reinforcements for bags.',
    },
  },
  Acrylic: {
    ecoAlternatives: [
      {
        name: 'Recycled acrylic knit',
        similarity:
          'Same loft and lightweight warmth — some brands offer recycled synthetic knits; check labels.',
      },
      {
        name: 'Wool blend',
        similarity:
          'Similar insulation with natural fiber content — better for short cool seasons than pure acrylic.',
      },
      {
        name: 'Cotton knit',
        similarity:
          'Breathable alternative for everyday knits — less heat-trapping in Philippine weather.',
      },
    ],
    recycledAwareness:
      'Acrylic knits pill quickly in ukay — price accordingly and photograph texture clearly.',
    reuse: {
      resale: 'Budget knitwear market — disclose pilling and stretch loss.',
      donate: 'Craft groups may take acrylic yarn from unraveled garments.',
      upcycle: 'Amigurumi stuffing, draft stoppers, or pet blankets.',
    },
  },
  Rayon: {
    ecoAlternatives: [
      {
        name: 'Tencel / lyocell',
        similarity:
          'Same flowy drape and lightweight feel — closed-loop cellulose with gentler processing.',
      },
      {
        name: 'Cotton voile',
        similarity:
          'Similar soft blouse hand-feel — breathable natural for dresses and tops.',
      },
      {
        name: 'Piña or abaca',
        similarity:
          'Philippine plant fibers with comparable breathability — formal alternatives in local weaving.',
      },
    ],
    recycledAwareness:
      'Rayon weakens when wet — handle gently when washing ukay finds. Shrinkage is common.',
    reuse: {
      resale: 'Flowy dresses and blouses sell well — note shrink history if known.',
      donate: 'General textile drives usually accept rayon blends.',
      upcycle: 'Lining fabric, scarves, or craft backing.',
    },
  },
  Abaca: {
    ecoAlternatives: [
      {
        name: 'Piña',
        similarity:
          'Finer similar drape for formal Philippine textiles — prized in heritage and barong pieces.',
      },
      {
        name: 'Linen',
        similarity:
          'Same breathable structure for warm-climate apparel — European flax with comparable airiness.',
      },
      {
        name: 'Sisal / maguey blends',
        similarity:
          'Comparable strength for ropes, bags, and home textiles — other Philippine plant fibers.',
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
  'Piña': {
    ecoAlternatives: [
      {
        name: 'Jusi',
        similarity:
          'Same formal luster for barong — piña-silk blend with similar drape at lower cost.',
      },
      {
        name: 'Peace silk',
        similarity:
          'Comparable sheen when authentic piña is out of budget — smooth formal alternative.',
      },
      {
        name: 'Abaca',
        similarity:
          'Stronger similar plant fiber for structured barong details — holds shape in humid events.',
      },
    ],
    recycledAwareness:
      'Authentic Aklan piña is labor-intensive — verify luster and weave in ukay before reselling as heritage fabric.',
    reuse: {
      resale: 'Highlight piña or barong fabric — collectors pay for verified heritage pieces.',
      donate: 'Cultural archives or costume shops may accept authenticated garments.',
      upcycle: 'Only if damaged — frame small samples as textile art.',
    },
  },
  Jusi: {
    ecoAlternatives: [
      {
        name: 'Pure piña',
        similarity:
          'Finer similar formal luster for special occasions — heirloom upgrade from jusi blends.',
      },
      {
        name: 'Abaca-silk blend',
        similarity:
          'Same body and structure for humid formal events — more support than sheer jusi alone.',
      },
      {
        name: 'Tencel formal blend',
        similarity:
          'Similar drape with easier care — office formal in tropical climates.',
      },
    ],
    recycledAwareness:
      'Jusi barong is common pre-owned near June and December — check embroidery and armpit stains in ukay.',
    reuse: {
      resale: 'Market to formal-wear buyers — note jusi vs organza honestly.',
      donate: 'Church or school events sometimes accept formal barong.',
      upcycle: 'Table runners or ceremonial sashes from worn panels.',
    },
  },
};

const MIXED_FIBER_GUIDANCE: EcoGuidance = {
  ecoAlternatives: [
    {
      name: 'Natural-dominant blend',
      similarity:
        'Similar everyday comfort when fiber label is unclear — choose cotton, linen, or PH fiber tags in ukay.',
    },
    {
      name: 'Recycled blended yarn',
      similarity:
        'Comparable mixed performance with lower virgin synthetic use — ask sellers about fiber content.',
    },
    {
      name: 'Single-fiber rescan',
      similarity:
        'Clearer dominant match for better alternative picks — rescan one fabric area with the IoT device.',
    },
  ],
  recycledAwareness:
    'Mixed ukay finds are common — rescan under even light or check the garment tag before buying to resell.',
  reuse: {
    resale: 'Verify fiber type before listing — buyers ask for composition on blended pieces.',
    donate: 'Donate only after a clearer scan or label check.',
    upcycle: 'Test a small swatch before cutting into a project.',
  },
};

function resolvePrimaryFiber(
  dominantFabric: string,
  compositions?: FabricComposition[],
): SupportedFabric | null {
  const normalized = dominantFabric.trim().toLowerCase();

  for (const fabric of SUPPORTED_FABRICS) {
    if (normalized.includes(fabric.toLowerCase())) {
      return fabric;
    }
  }

  const sorted = [...(compositions ?? [])].sort((a, b) => b.percentage - a.percentage);
  const top = sorted[0]?.material;

  if (top && SUPPORTED_FABRICS.includes(top as SupportedFabric)) {
    return top as SupportedFabric;
  }

  return null;
}

export function getDetectedFiberName(
  dominantFabric: string,
  compositions?: FabricComposition[],
): string {
  return resolvePrimaryFiber(dominantFabric, compositions) ?? 'this material';
}

export function getEcoGuidance(
  dominantFabric: string,
  compositions?: FabricComposition[],
): EcoGuidance {
  const primary = resolvePrimaryFiber(dominantFabric, compositions);

  if (!primary) {
    return MIXED_FIBER_GUIDANCE;
  }

  return ECO_GUIDANCE_BY_FIBER[primary];
}

export function formatDetectedLabel(dominantFabric: string): string {
  const trimmed = dominantFabric.trim();
  if (/^detected:/i.test(trimmed)) {
    return trimmed;
  }

  return `Primary material: ${trimmed}`;
}

export function getEcoAlternativeText(alternative: EcoAlternative): string {
  return alternative.similarity ?? alternative.description ?? '';
}

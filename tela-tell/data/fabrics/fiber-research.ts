import type { SupportedFabric } from '@/data/fabrics/fabrics';
import type { EcoClaim } from '@/data/scans/mock-data';

/**
 * "What research says" on the fiber profile's Eco tab. It replaces the retired sustainability
 * score (archived in docs/sustainability-score-archive.md). Every finding here:
 *  - is one lab test result, with its conditions stated in the sentence;
 *  - names the source (ids in source-registry.ts), whose "Keep in mind" notes say whether the full
 *    text or only the abstract was read;
 *  - is about the fiber or yarn that was tested, never a finished garment's impact.
 * A fiber with no usable evidence has an empty list and the screen says so.
 */

export const RESEARCH_SECTION_TITLE = 'What research says';

export const RESEARCH_BANNER =
  'Results from specific lab studies, under the conditions stated. They describe the fiber or yarn tested, not a finished garment, and they do not show what happens in the environment.';

export const RESEARCH_INSUFFICIENT =
  'Insufficient evidence in our current sources.';

/** Shown under any fiber that has findings, so breakdown is not read as shedding. */
export const RESEARCH_SHEDDING_NOTE =
  'Fiber breakdown in a test is not the same as fiber shedding from a garment. See Shedding tendency above.';

export const RESEARCH_SHEET_TITLE = 'About these findings';

export const RESEARCH_SHEET_NOTE =
  'Each finding is one study and one set of test conditions. The app does not combine them into a score or rank fibers. Each source below says whether the full text or only the abstract was read.';

export const RESEARCH_SHEET_FACTS_LABEL = 'WHAT THE TESTS FOUND';

export type ResearchFinding = {
  /** Short row heading, e.g. "Lab breakdown". */
  title: string;
  text: string;
  sourceIds: string[];
  /** Whether the full text of the source(s) was read; mirrors the source's "Keep in mind" note. */
  evidence: 'full text' | 'abstract only';
};

const COMPOSTING_CONDITIONS =
  'In an industrial-composting test (shredded fabric, 58 °C, 181 days), ';
const COMPOSTING_LIMIT =
  ' Industrial composting is a controlled facility, not home compost, landfill or nature.';

function waterTest(fiber: string): string {
  return `In a lab test, ${fiber} yarns reached more than 70% biodegradation in activated sludge and lake water and about 50% in seawater. The authors say this shows potential under the tested conditions, not what happens in nature.`;
}

const ZAMBRANO = 'zambrano-2020';
const COLLIE = 'collie-2024';

export const FIBER_RESEARCH: Record<SupportedFabric, ResearchFinding[]> = {
  Cotton: [
    {
      title: 'Lab breakdown',
      text: waterTest('cotton'),
      sourceIds: [ZAMBRANO],
      evidence: 'abstract only',
    },
  ],
  Wool: [
    {
      title: 'Lab breakdown',
      text: `${COMPOSTING_CONDITIONS}about 48% of the carbon in untreated wool and about 68% in machine-washable wool was converted to CO2, which is how the test measures biodegradation.${COMPOSTING_LIMIT}`,
      sourceIds: [COLLIE],
      evidence: 'full text',
    },
  ],
  Rayon: [
    {
      title: 'Lab breakdown (composting)',
      text: `${COMPOSTING_CONDITIONS}about 83% of the carbon in viscose rayon was converted to CO2.${COMPOSTING_LIMIT}`,
      sourceIds: [COLLIE],
      evidence: 'full text',
    },
    {
      title: 'Lab breakdown (water)',
      text: waterTest('rayon'),
      sourceIds: [ZAMBRANO],
      evidence: 'abstract only',
    },
  ],
  Polyester: [
    {
      title: 'Lab breakdown (composting)',
      text: `${COMPOSTING_CONDITIONS}polyester showed no biodegradation (about 0%).${COMPOSTING_LIMIT}`,
      sourceIds: [COLLIE],
      evidence: 'full text',
    },
    {
      title: 'Lab breakdown (water)',
      text: 'In a lab test of yarns in water and sludge, polyester did not appreciably degrade. The authors say such results show potential, not what happens in nature.',
      sourceIds: [ZAMBRANO],
      evidence: 'abstract only',
    },
  ],
  Nylon: [
    {
      title: 'Lab breakdown',
      text: `${COMPOSTING_CONDITIONS}nylon (polyamide) reached about 2% biodegradation, which the authors report as not biodegrading under these conditions.${COMPOSTING_LIMIT}`,
      sourceIds: [COLLIE],
      evidence: 'full text',
    },
  ],
  // No comparable evidence in our current sources: the screen shows RESEARCH_INSUFFICIENT.
  Silk: [],
  Linen: [],
  Abaca: [],
  Acrylic: [],
  Spandex: [],
  Leather: [],
  Suede: [],
};

export function getFiberResearch(fabric: SupportedFabric): ResearchFinding[] {
  return FIBER_RESEARCH[fabric] ?? [];
}

/** The findings as sourced facts, for the shared source sheet. */
export function getResearchClaims(fabric: SupportedFabric): EcoClaim[] {
  return getFiberResearch(fabric).map((finding) => ({
    kind: 'fact',
    aspect: finding.title,
    text: finding.text,
    sourceIds: finding.sourceIds,
  }));
}

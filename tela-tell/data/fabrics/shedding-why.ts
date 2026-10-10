import type { InfoSection } from '@/data/fabrics/assessment-disclaimers';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';

/**
 * The "why this level?" line on the shedding card. It is built from the scan's most likely fiber. It has no figures and no source list; the studies stay in the About
 * screen's References, and the numbers are recorded in `shedding-basis.ts` (not shown in the app).
 *
 * Every fiber line is plain wording for something the verified studies found. `sourceIds` names
 * the studies, and a test checks each is cited by a claim in `SHEDDING_BASIS_CLAIMS`, so a line
 * cannot be added without evidence. Each line names the fabrics or test it comes from and does not generalize it to all garments of that fiber, and never says a fiber is harmful; and
 * the levels themselves (`FIBER_RISK_LEVELS`) are the app's own summary and are not changed here.
 */
export type SheddingLevel = 'low' | 'moderate' | 'high';

type FiberReason = { text: string; sourceIds: string[] };

export const SHEDDING_FIBER_REASONS: Partial<Record<SupportedFabric, FiberReason>> = {
  Polyester: {
    text: 'Polyester is a plastic-based fiber. Studies found that polyester clothes can release tiny plastic fibers during washing. How much they release depends on how the fabric is made.',
    sourceIds: ['napper-thompson-2016', 'vassilenko-2021', 'carney-almroth-2018', 'de-falco-2020'],
  },
  Acrylic: {
    text: 'Acrylic is a plastic-based fiber. Studies found that acrylic fabrics can release tiny plastic fibers during washing. However, only some types of acrylic fabric have been tested.',
    sourceIds: ['napper-thompson-2016', 'carney-almroth-2018'],
  },
  Nylon: {
    text: 'Nylon is a plastic-based fiber. Studies found that nylon fabrics can release tiny plastic fibers during washing. The amount released varies with the type of fabric.',
    sourceIds: ['vassilenko-2021', 'carney-almroth-2018'],
  },
  Spandex: {
    text: "Spandex is the stretchy fiber used in many fitted clothes. Studies found that the tested cotton fabrics with more spandex released more tiny fibers during washing, and some of those fibers were spandex. Your garment's actual fiber content may differ.",
    sourceIds: ['rathinamoorthy-2023', 'azevedo-2025-elastane'],
  },
};

/**
 * What the app says about shedding for each of the 12 classified fibers, on the fiber profile page
 * (the "Shedding tendency" row and its sheet). `value` is the app's own estimate: High / Moderate
 * only for the four synthetic fibers that already had one (unchanged), and "Not rated" for the rest,
 * because the references here do not support a level for them. A study showing that a fabric sheds
 * fibers does not by itself rank it against other fibers.
 *
 * Wording rules: the synthetic fibers say studies found plastic fibers release; the natural and
 * cellulose-based fibers say they shed fibers too but are not called microplastics; a fiber with no
 * suitable study says so ("we did not find"), which is not a claim that it does not shed.
 * `sourceIds` is empty when the text is only a definition or a statement that no study was found.
 */
export type FiberSheddingValue = 'High' | 'Moderate' | 'Not rated';

export type FiberSheddingInfo = {
  value: FiberSheddingValue;
  text: string;
  sourceIds: string[];
};

const NO_STUDY = 'These references do not show how much it sheds, and that does not mean it does not shed.';

export const FIBER_SHEDDING_INFO: Record<SupportedFabric, FiberSheddingInfo> = {
  Polyester: { value: 'High', ...SHEDDING_FIBER_REASONS.Polyester! },
  Acrylic: { value: 'High', ...SHEDDING_FIBER_REASONS.Acrylic! },
  Nylon: { value: 'Moderate', ...SHEDDING_FIBER_REASONS.Nylon! },
  Spandex: { value: 'Moderate', ...SHEDDING_FIBER_REASONS.Spandex! },
  Cotton: {
    value: 'Not rated',
    text: 'Cotton fibers are cellulose-based, not plastic. Studies found cotton fabrics shed fibers during washing too, and in some of the fabrics and conditions tested, as much or more by weight than polyester. That is not a ranking, and fiber weight alone does not show plastic pollution or environmental impact. A garment can also contain blends, coatings or finishes, so not every fiber it releases is necessarily cotton.',
    sourceIds: ['vassilenko-2021', 'zambrano-2019', 'fernandes-2024', 'gundogdu-2026'],
  },
  Wool: {
    value: 'Not rated',
    text: 'Wool is a natural protein fiber, not plastic, and it can shed fibers. In one study, a group of four spun-staple knits that included one wool fabric (the others were cotton and cotton-polyester blends) shed about as much fiber by weight as the polyester fabrics tested. That is too few wool fabrics to describe wool in general.',
    sourceIds: ['vassilenko-2021'],
  },
  Silk: {
    value: 'Not rated',
    text: `Silk is a natural protein fiber, not plastic. We did not find a laundry study on silk in our current references. ${NO_STUDY}`,
    sourceIds: [],
  },
  Linen: {
    value: 'Not rated',
    text: `Linen is a natural plant fiber, not plastic. We did not find a laundry study on linen in our current references. ${NO_STUDY}`,
    sourceIds: [],
  },
  Abaca: {
    value: 'Not rated',
    text: `Abaca is a natural plant fiber, not plastic. We did not find a laundry study on abaca in our current references. ${NO_STUDY}`,
    sourceIds: [],
  },
  Rayon: {
    value: 'Not rated',
    text: 'Rayon is a cellulose-based fiber made from plant material and chemically processed. In accelerated lab washing of knitted fabrics, rayon and cotton released more fiber by weight than polyester, which is not a ranking and does not show plastic pollution. In lab biodegradation tests, rayon and cotton yarns broke down by about 50% in seawater and over 70% in lake water and sludge while polyester did not appreciably degrade, but the authors say this shows potential under the tested conditions, not what happens in every environment.',
    sourceIds: ['zambrano-2019', 'zambrano-2020'],
  },
  Leather: {
    value: 'Not rated',
    text: 'Genuine leather is made from animal hide, not plastic. Some imitation leathers contain synthetic polymers, and the app cannot confirm whether a scanned material is genuine or imitation. We did not find evidence on fibers or microplastics released by real leather in our current references.',
    sourceIds: [],
  },
  Suede: {
    value: 'Not rated',
    text: 'Genuine suede is made from animal hide, not plastic. Some imitation suedes contain synthetic polymers, and the app cannot confirm whether a scanned material is genuine or imitation. We did not find evidence on fibers or microplastics released by real suede in our current references.',
    sourceIds: [],
  },
};

/** The short "keep in mind" block on the fiber profile sheet. */
export const FIBER_SHEDDING_KEEP_IN_MIND =
  "These are lab and real-use tests of particular fabrics, not of your garment, and the app cannot measure how many fibers a garment releases. A blend can release plastic fibers even if it is mostly natural. High and Moderate are the app's estimates based on selected studies, and Not rated means our references do not support a level. None is an established scientific ranking.";

/** The fiber profile's (i) sheet: what the references say about this fiber, and what to keep in mind. */
export function getFiberSheddingSheet(fabric: SupportedFabric): InfoSection[] {
  return [
    { heading: 'What studies found', body: FIBER_SHEDDING_INFO[fabric].text },
    { heading: 'Keep in mind', body: FIBER_SHEDDING_KEEP_IN_MIND },
  ];
}

const LOW_REASON =
  "Few synthetic fibers were identified in this scan. This does not mean the fabric won't shed fibers.";

/** The (i) sheet. The detail (confidence, studies, limits) is on the "Why synthetics shed" page. */
export const SHEDDING_LIMITS_SECTIONS: InfoSection[] = [
  {
    heading: 'What this result means',
    body: 'This is an estimate based on the fiber the app predicts is most likely. The prediction may be wrong. The app cannot measure how many tiny fibers your garment releases.',
  },
  {
    heading: 'Keep in mind',
    body: "Shedding depends on the fabric, how it is made, its condition, and how it is washed. Natural fibers can shed too.\n\nHigh, Moderate, and Low are the app's estimates based on selected studies, not an established scientific ranking. This result does not assess health effects.",
  },
];

/**
 * One or two plain sentences on why this scan got its level, shown on the card. It is about the
 * most likely fiber only, so it always matches the scan's main result.
 */
export function buildSheddingReason(topFiber: SupportedFabric): string {
  return SHEDDING_FIBER_REASONS[topFiber]?.text ?? LOW_REASON;
}

/** Title of the informational card shown on Results for a natural or cellulose-based top fiber. */
export const FIBER_INFORMATION_TITLE = 'Fiber information';

/** The card's (i) sheet. It is information about the predicted fiber, not a rating. */
export const FIBER_INFORMATION_SHEET: InfoSection[] = [
  {
    heading: 'What this means',
    body: 'This information is based on the fiber the app predicts is most likely, which may be wrong. The app cannot detect or measure microplastics or the fibers your garment releases.',
  },
  { heading: 'Keep in mind', body: FIBER_SHEDDING_KEEP_IN_MIND },
];

export type FiberInformation = {
  fabric: SupportedFabric;
  text: string;
  sourceIds: string[];
};

/**
 * The informational card for a scan whose most likely fiber has no shedding rating (everything
 * except Polyester, Acrylic, Nylon and Spandex, which have the rated "Fiber shedding" card). No
 * level is shown. Null for an unknown fiber name.
 */
export function getFiberInformation(dominantFabric: string): FiberInformation | null {
  const fabric = resolveFabricAlias(dominantFabric);
  if (!fabric || FIBER_SHEDDING_INFO[fabric].value !== 'Not rated') {
    return null;
  }
  return { fabric, text: FIBER_SHEDDING_INFO[fabric].text, sourceIds: FIBER_SHEDDING_INFO[fabric].sourceIds };
}

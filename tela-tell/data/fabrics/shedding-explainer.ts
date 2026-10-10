/**
 * "Why synthetics shed": a short, offline explainer reachable from About. Plain wording only, with
 * no figures and no study list; the studies are under References on the About screen and their
 * numbers are recorded in `shedding-basis.ts`. Each statement below matches a verified claim there
 * (construction, wear and washing matter; polyester, acrylic, nylon and elastane fabrics shed in
 * lab studies; blend studies disagree). The page is about shedding only and makes no health claim.
 */
export const SHEDDING_EXPLAINER_TITLE = 'Why synthetics shed';

/** One short paragraph, with the references that support it. Empty `sourceIds` = a statement of limits. */
export type ExplainerItem = { text: string; sourceIds?: string[] };

export type ExplainerSection = {
  heading: string;
  items: ExplainerItem[];
};

export const SHEDDING_EXPLAINER_INTRO =
  'A short guide to how and why some fabrics release tiny fibers, what the studies found, and what the estimate in the app means.';

export const SHEDDING_EXPLAINER_SECTIONS: ExplainerSection[] = [
  {
    heading: 'Why fabrics shed',
    items: [
      {
        text: 'Washing, drying and wearing can pull tiny fibers loose from fabric. Synthetic fabrics are made of plastic-based fibers, so the fibers that come off them are plastic (microplastics).',
        sourceIds: ['napper-thompson-2016', 'karkkainen-2021', 'de-falco-2020'],
      },
      {
        text: 'Natural fibers like cotton and wool can shed fibers too, and in some of the fabrics and conditions tested, cotton released as much or more fiber by weight than polyester. That is not a ranking, and cotton and wool fibers are not plastic.',
        sourceIds: ['vassilenko-2021', 'lant-2020', 'zambrano-2019', 'fernandes-2024', 'gundogdu-2026'],
      },
      {
        text: 'Three things are separate: how much fiber a fabric sheds, what the fibers are made of, and how long they last in the environment. Fiber weight alone does not show plastic pollution or environmental impact.',
        sourceIds: ['zambrano-2019', 'vassilenko-2021'],
      },
      {
        text: 'In lab tests, cotton and rayon yarns biodegraded under the conditions tested (about 50% in seawater, over 70% in lake water and sludge) while polyester did not appreciably degrade. The authors say this shows potential, not what happens in every environment.',
        sourceIds: ['zambrano-2019', 'zambrano-2020'],
      },
    ],
  },
  {
    heading: 'What affects shedding',
    items: [
      {
        text: 'In the studies, some thick fabrics and some loosely knitted (open, stretchy) fabrics, such as fleece, released more fibers than tightly woven ones.',
        sourceIds: ['vassilenko-2021', 'carney-almroth-2018', 'de-falco-2020'],
      },
      {
        text: 'Washing mattered too. Fuller loads and cycles that use less water for the load released fewer fibers, and hotter water increased release from knitted cotton, rayon and polyester fabrics.',
        sourceIds: ['lant-2020', 'kelly-2019', 'zambrano-2019'],
      },
      {
        text: "Studies differ on whether worn clothes shed more. In real-use studies, older garments and worn shirts released more fibers, while in one test a polyester fleece's release fell after repeated washing.",
        sourceIds: ['fernandes-2024', 'lara-2025', 'lant-2020', 'carney-almroth-2018'],
      },
    ],
  },
  {
    heading: 'What studies found',
    items: [
      {
        text: 'Polyester, acrylic and nylon fabrics released tiny plastic fibers in lab washing tests. The amounts varied a lot between fabrics, and only some acrylic fabrics have been tested.',
        sourceIds: ['napper-thompson-2016', 'vassilenko-2021', 'carney-almroth-2018'],
      },
      {
        text: 'In one comparison, woven nylon released fewer fibers than mostly polyester fleece, but the fabrics were made differently, so the fiber alone may not explain it.',
        sourceIds: ['vassilenko-2021'],
      },
      {
        text: 'In the tested cotton fabrics with spandex, all released tiny fibers during washing, and those with more spandex released more. Some of the fibers released were spandex. Stretch fabrics usually contain about 2-10% spandex, and more in compression wear and shapewear. That is a general range, not a measurement of your garment.',
        sourceIds: ['rathinamoorthy-2023', 'azevedo-2025-elastane'],
      },
      {
        text: 'Studies of fabrics that mix fibers disagree because they used different materials and methods.',
        sourceIds: ['napper-thompson-2016', 'zhang-2025'],
      },
      {
        text: 'The cooler, shorter wash tip comes from studies that changed the temperature and the wash time together, so they cannot say which one made the difference. A separate study found that hotter water increased release from knitted fabrics. Tumble drying also released fibers in a study of synthetic textiles. Its heat was not tested.',
        sourceIds: ['lant-2020', 'cotton-2020', 'zambrano-2019', 'karkkainen-2021'],
      },
    ],
  },
  {
    heading: 'What the estimate means',
    items: [
      {
        text: 'The app predicts the most likely fiber, and the shedding estimate follows it. The prediction may be wrong.',
      },
      {
        text: 'The confidence percentage shows how sure the app is about its prediction. It does not show how much of that fiber is in the garment.',
      },
      {
        text: 'The app cannot see or measure how many tiny fibers your garment releases. These are lab tests of particular fabrics and washes.',
      },
      {
        text: 'We did not find laundry studies on silk, linen, abaca, leather or suede in our current references, so they do not show how much these shed. That is not evidence that they do not shed. Genuine leather and suede are animal hide, not plastic, but some imitations contain synthetic polymers and the app cannot confirm whether a scanned material is genuine or imitation.',
      },
      {
        text: "High, Moderate and Low are the app's estimates based on selected studies, not an established scientific ranking. No study we checked compares all four fibers.",
      },
      {
        text: 'This page covers shedding only. It makes no claim about health effects and is not medical advice.',
      },
    ],
  },
];

export const SHEDDING_REFERENCES_HEADING = 'References';

/** The registry sources behind the shedding wording, in the order the References section lists them. */
export const SHEDDING_REFERENCE_IDS: string[] = [
  'napper-thompson-2016',
  'de-falco-2019',
  'carney-almroth-2018',
  'vassilenko-2021',
  'karkkainen-2021',
  'rathinamoorthy-2023',
  'zhang-2025',
  'de-falco-2020',
  'persson-2026',
  'azevedo-2025-elastane',
  'kelly-2019',
  'lant-2020',
  'zambrano-2019',
  'zambrano-2020',
  'fernandes-2024',
  'lara-2025',
  'cotton-2020',
  'gundogdu-2026',
  // Clothing-care guidance for the practical-suggestion tips. Not research.
  'earthday-fashion-guide-2021',
  'earthday-care-toolkit',
  'emf-new-textiles-economy-2017',
];

export const SHEDDING_EXPLAINER_FOOTNOTE =
  'Numbers in brackets match the full References list on the About screen.';

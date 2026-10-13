export type InfoSection = { heading: string; body: string };

export const FIBER_GUIDANCE_CAPTION =
  'General guidance for the predicted fiber types, not measured on your garment.';

export const SHEDDING_CAPTION =
  'General guidance for the predicted fiber type, not a measurement of your garment.';

export const SHEDDING_SHEET_TITLE = 'Shedding estimate';

export const LABEL_CHECK_SHEET_TITLE = 'Label check';

export const LABEL_CHECK_SHEET_SECTIONS: InfoSection[] = [
  {
    heading: 'What it does',
    body: 'Compares your label with the fibers the app predicted.',
  },
  {
    heading: "What it isn't",
    body: 'Proof. Photos can be misread, so check the care tag before deciding.',
  },
];

export const COMPOSITION_SHEET_TITLE = 'About these percentages';

export const COMPOSITION_SHEET_SECTIONS: InfoSection[] = [
  {
    heading: 'What they are',
    body: 'How confident the model is in each fiber.',
  },
  {
    heading: "What they aren't",
    body: "How much of each fiber is in the garment. The scan names one most likely fiber and can't see blends, and fabrics can look alike in photos, so the top match can be wrong. Check the care tag for the real composition.",
  },
];

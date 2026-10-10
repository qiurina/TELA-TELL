// Shared wording for the explanation sheets behind the (i) buttons. Each is two short blocks, "what
// it is" and "what it isn't", so the sheet says only what matters. That results are visual
// predictions rather than lab tests is stated once, in the confidence banner and on the About
// screen, not repeated in every sheet. Citations stay on the About screen's Sources card; the
// shedding explanation lives in HEALTH_RISK_DISCLAIMER (synthetic-health-risk.ts).

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

export const COMFORT_SHEET_TITLE = 'Comfort estimate';

export const COMFORT_SHEET_SECTIONS: InfoSection[] = [
  {
    heading: 'What it is',
    body: 'A general estimate from the predicted fibers (breathability, moisture, heat, and feel), based on published research.',
  },
  {
    heading: "What it isn't",
    body: 'A skin or medical assessment. Weave or knit, fit, dyes, and finishes also change how a garment feels.',
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
    body: 'How much of each fiber is in the garment. Fabrics can look alike in photos, so the top match can be wrong. Check the care tag for the real composition.',
  },
];

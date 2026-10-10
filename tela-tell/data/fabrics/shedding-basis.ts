import type { EcoClaim } from '@/data/scans/mock-data';

/**
 * Evidence record for the "Shedding tendency" card: what published laundry studies found, with
 * their units and limits. It is NOT shown in the app (the numbers and source cards were too much
 * for a shopping screen). The app's wording in `shedding-why.ts` and `shedding-explainer.ts` is
 * plain language for these findings, and tests check each line is backed by a claim here. The
 * studies themselves are listed under References on the About screen.
 *
 * Every figure here was checked against the study's abstract, except where the registry says the full text was read (Vassilenko 2021, Lant 2020, Azevedo 2025, Carney Almroth 2018, Karkkainen 2021 and De Falco 2019, on PubMed Central); see
 * docs/shedding-evidence-2026-10-10.md. Figures whose unit could not be confirmed are left out
 * (for example the 640,000 to 1,500,000 fiber count in De Falco et al. 2019).
 *
 * This is separate from the 2% confidence floor in scan-confidence.ts, which is an engineering
 * limit on the model's confidence and is not based on any of these studies. It is also separate
 * from the High / Moderate levels themselves (FIBER_RISK_LEVELS), which this record does not change.
 */
export const SHEDDING_BASIS_CLAIMS: EcoClaim[] = [
  {
    kind: 'fact',
    aspect: 'Household washes',
    text: 'In washes of commercial clothes, the microfibers released ranged from 124 to 308 mg per kg of washed fabric. The fiber type in the yarn and the yarn twist influenced the amount.',
    sourceIds: ['de-falco-2019'],
  },
  {
    kind: 'fact',
    aspect: 'Polyester, acrylic and a blend',
    text: 'A polyester-cotton blend shed significantly fewer fibers than polyester or acrylic. The authors estimate that over 700,000 fibers could be released from an average 6 kg load of acrylic fabric.',
    sourceIds: ['napper-thompson-2016'],
  },
  {
    kind: 'fact',
    aspect: 'Polyester and nylon',
    text: 'Across 37 apparel textiles washed five times, mechanically treated polyester (mostly fleeces and jerseys) released 161 ± 173 mg per kg per wash, and woven filament-yarn nylon released 27 ± 14 mg per kg per wash.',
    sourceIds: ['vassilenko-2021'],
  },
  {
    kind: 'fact',
    aspect: 'Acrylic, nylon and polyester knits',
    text: 'In knitted textiles, all of the acrylic, nylon and polyester samples shed. Polyester fleece shed the most, and loose constructions and worn fabrics shed more.',
    sourceIds: ['carney-almroth-2018'],
  },
  {
    kind: 'fact',
    aspect: 'Elastane',
    text: 'Cotton and elastane knits with 2%, 5% and 8% elastane all released microfibers, and more elastane meant more total microfibers.',
    sourceIds: ['rathinamoorthy-2023'],
  },
  {
    kind: 'fact',
    aspect: 'Elastane share',
    text: 'Elastane is typically in the range of 2% to 10% by weight for stretch fabrics, although higher contents may be used in specialized compression or shapewear applications.',
    sourceIds: ['azevedo-2025-elastane'],
  },
  {
    kind: 'fact',
    aspect: 'Washing and drying',
    text: 'For synthetic textiles, the first wash released 1.0 × 10⁵ to 6.3 × 10⁶ fibers per kg, and the first tumble drying released 10 to 1,700 mg of fibers per kg.',
    sourceIds: ['karkkainen-2021'],
  },
  {
    kind: 'fact',
    aspect: 'Recycled polyester',
    text: 'In polyester fabric with 30% recycled fiber, fiber recycled once showed no clear difference from new polyester, while fiber recycled twice or three times released about 4.3 and 6.2 times more microfibers in laundering.',
    sourceIds: ['persson-2026'],
  },
  {
    kind: 'fact',
    aspect: 'Fiber traps',
    text: 'Two commercial fiber traps captured 39% and 10% of the polyester fibers discharged in washings. Two lint traps in another study kept up to 90% of polyester fibers and 46% of nylon fibers.',
    sourceIds: ['karkkainen-2021', 'vassilenko-2021'],
  },
  {
    kind: 'fact',
    aspect: 'Natural fibers',
    text: 'In the same study, a group of four knit spun-staple textiles described as natural (one cotton, one wool and two cotton-polyester blends in its sample table) shed 165 ± 44 mg per kg per wash, similar to the polyester samples.',
    sourceIds: ['vassilenko-2021'],
  },
  {
    kind: 'fact',
    aspect: 'Thickness',
    text: 'Fiber shedding rose with fabric thickness for nylon and polyester.',
    sourceIds: ['vassilenko-2021'],
  },
  {
    kind: 'fact',
    aspect: 'Wash load size',
    text: 'In soiled household wash loads, loads of 3.5 to 6.0 kg released 66.3 ± 27.0 mg per kg, against 132.4 ± 68.6 mg per kg for loads of 1.0 to 3.5 kg.',
    sourceIds: ['lant-2020'],
  },
  {
    kind: 'fact',
    aspect: 'Wash cycle',
    text: 'A colder, quicker cycle (15 °C for 30 minutes) released 30% fewer microfibers than a 40 °C cycle of 85 minutes.',
    sourceIds: ['lant-2020'],
  },
  {
    kind: 'fact',
    aspect: 'Wash water volume',
    text: 'In tests on polyester textiles, delicate cycles, which use more water relative to the load, released more microfibers than a lower-water standard wash (94 mg per kg more in the first wash).',
    sourceIds: ['kelly-2019'],
  },
  {
    kind: 'fact',
    aspect: 'Cellulose fabrics',
    text: 'In accelerated laundering of knitted fabrics, cellulose-based fabrics (cotton and rayon) released more microfibers by weight (0.2 to 4 mg per g of fabric) than polyester (0.1 to 1 mg per g).',
    sourceIds: ['zambrano-2019'],
  },
  {
    kind: 'fact',
    aspect: 'Cotton by weight',
    text: 'Cotton released a greater total fiber mass than polyester or polyamide (1.85 mg per g), but its fibers were longer and fewer in number. In used garments, the mass released was greater in garments with more cotton.',
    sourceIds: ['gundogdu-2026', 'fernandes-2024'],
  },
  {
    kind: 'fact',
    aspect: 'Water temperature',
    text: 'Shedding from knitted cotton, rayon and polyester fabrics increased with higher water temperature and detergent use.',
    sourceIds: ['zambrano-2019'],
  },
  {
    kind: 'fact',
    aspect: 'Cold, quick cycle',
    text: 'Microfibre release from retail clothing was significantly greater for a 40 °C, 85-minute cycle than for a cold-quick (25 °C, 30-minute) cycle.',
    sourceIds: ['cotton-2020'],
  },
  {
    kind: 'fact',
    aspect: 'Garment age and wear',
    text: 'Garments aged 15 to 31 years released nearly twice as many fibers as garments aged 1 to 10 years, and worn polo shirts released significantly more microfibers than unworn controls.',
    sourceIds: ['fernandes-2024', 'lara-2025'],
  },
  {
    kind: 'fact',
    aspect: 'Biodegradation',
    text: 'In lab tests, cotton and rayon microfibers degraded in lake water, sludge and (about half) in seawater, while polyester did not appreciably degrade. The authors say this shows potential, not absolutes in nature.',
    sourceIds: ['zambrano-2019', 'zambrano-2020'],
  },
  {
    kind: 'fact',
    aspect: 'Elastane fibers released',
    text: 'Elastane made up 13.40% of the microfibers released from the 98/2 cotton/elastane fabric and 19.60% from the 92/8 fabric.',
    sourceIds: ['rathinamoorthy-2023'],
  },
  {
    kind: 'tradeoff',
    aspect: 'Wash cycle',
    text: 'In that test, temperature and cycle length changed together, so it does not show the effect of temperature alone.',
    sourceIds: ['lant-2020'],
  },
  {
    kind: 'tradeoff',
    aspect: 'Wear and age',
    text: 'Studies disagree on whether worn fabrics shed more than new ones. One found worn knits shed more; another found polyester fleece release fell and then stayed low from the eighth wash on.',
    sourceIds: ['carney-almroth-2018', 'lant-2020'],
  },
  {
    kind: 'tradeoff',
    aspect: 'Construction matters',
    text: 'Among polyester garments, a very compact woven garment with highly twisted continuous-filament yarns released the least, and looser knitted, short-staple, low-twist ones released more. Only polyester was compared.',
    sourceIds: ['de-falco-2020'],
  },
  {
    kind: 'tradeoff',
    aspect: 'Fiber is not the only factor',
    text: 'The polyester and nylon samples above differ in construction as well as fiber, so their gap is not caused by fiber alone.',
    sourceIds: ['vassilenko-2021'],
  },
  {
    kind: 'tradeoff',
    aspect: 'Blends',
    text: 'Findings on blends differ. One study found a polyester-cotton blend shed fewer fibers than polyester, while another found polyester release was significantly higher from cotton/polyester blends than from polyester alone. This app rates the predicted fiber and does not model blends.',
    sourceIds: ['napper-thompson-2016', 'zhang-2025'],
  },
];

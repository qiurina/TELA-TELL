/**
 * Local registry of the sources cited by the eco-alternative and reuse guidance. Everything shown
 * in the "Basis" sheets and the About screen's reference list comes from here, so it works
 * offline; only opening a link needs a connection.
 *
 * Each entry is written for a quick read: a one-line `gist`, a few short `says` points (what the
 * source states, limited to the claims this app shows, attributed), and short `caveats` (scope,
 * funding, version or comparability limits). Add an id here before referencing it from
 * `eco-alternatives.ts` (a test checks every reference resolves).
 */
export type Source = {
  id: string;
  /** Plain-language name used as the heading on the Basis sheet. */
  shortName: string;
  organization: string;
  title: string;
  /** `null` when the document carries no publication date. */
  year: number | null;
  url: string;
  /** One line saying what this source is. */
  gist: string;
  /** What the source states, one short point each. */
  says: string[];
  /** What to keep in mind about the source, one short point each. */
  caveats: string[];
  /** Short note for the About screen on which content uses the source. */
  usedFor: string;
};

export const SOURCE_LIST = [
  {
    id: 'gots-8-0',
    shortName: 'GOTS organic label',
    organization: 'Global Standard gGmbH',
    title: 'Global Organic Textile Standard (GOTS), Version 8.0',
    year: 2026,
    url: 'https://global-standard.org/images/resource-library/documents/standard-and-manual/GOTS_v8.0_signed.pdf',
    gist: 'A label that certifies how organic-fiber clothes are made.',
    says: [
      'GOTS is a label for textiles made with at least 70% certified organic natural fibers.',
      '"Organic" means at least 95% certified organic fiber.',
      '"Made with organic materials" means at least 70%.',
      'It covers how the fabric is made and sold. It does not cover the farm itself.',
    ],
    caveats: [
      'Written by the group that runs GOTS.',
      'Version 8.0 came out March 2, 2026 and is required from March 1, 2027.',
      'It tells you what was certified, not how your garment affects the environment.',
    ],
    usedFor: 'GOTS label wording on organic cotton and cotton-spandex cards.',
  },
  {
    id: 'textile-exchange-organic-cotton-lca-2014',
    shortName: 'Organic cotton study',
    organization: 'Textile Exchange (study by PE International)',
    title: 'The Life Cycle Assessment of Organic Cotton Fiber: A Global Average, Summary of Findings',
    year: 2014,
    url: 'https://textileexchange.org/app/uploads/2025/01/the-life-cycle-assessment-of-organic-cotton-fiber_38172.pdf',
    gist: 'A 2014 industry-funded life-cycle study of organic cotton fiber.',
    says: [
      'A 2014 life-cycle study by PE International, commissioned by Textile Exchange, measured organic cotton fiber and set the results against a separate study of conventional cotton.',
      'It estimated these potential savings for organic cotton, per 1,000 kg of fiber:',
      '46% less global warming potential',
      '70% less acidification',
      '26% less nutrient pollution of water (eutrophication)',
      '91% less blue (freshwater) water use',
      '62% less non-renewable energy',
    ],
    caveats: [
      'Industry-funded: paid for by brands and groups including GOTS, H&M, Nike and Kering.',
      'Covers farming and ginning only, not spinning, dyeing, wearing or disposal.',
      'A global average using 2014 data.',
      'Compared with a separate 2012 study of conventional cotton. The study says this comparison "has not been verified in the critical review."',
      'The savings are "potentials," not measurements of a garment. Biodiversity and soil carbon were not measured.',
      'The study says it does not intend to make a formal comparative claim under the ISO life-cycle standards.',
    ],
    usedFor: 'Cotton Basis sheet (organic cotton).',
  },
  {
    id: 'grs-manual-4-2',
    shortName: 'GRS recycled label (manual)',
    organization: 'Textile Exchange',
    title: 'Global Recycled Standard (GRS) Implementation Manual 4.2',
    year: 2019,
    url: 'https://textileexchange.org/app/uploads/2021/02/GRS-v4.2-Implementation-Manual.pdf',
    gist: 'The rules behind the GRS recycled-content label (older version).',
    says: [
      'GRS applies to products with 20% or more recycled content.',
      'Only products with at least 50% recycled content can carry the GRS label.',
      'It also sets social and environmental rules for how certified products are made.',
    ],
    caveats: [
      'Older version of the standard (effective November 21, 2019). Newer rules may apply today.',
      'Written by the group that runs GRS.',
      'The label certifies the recycled content and supply chain, not the benefit of your garment.',
    ],
    usedFor: 'GRS label wording on the recycled wool card.',
  },
  {
    id: 'grs-quick-guide-2020',
    shortName: 'GRS recycled label (guide)',
    organization: 'Textile Exchange',
    title: 'Quick Guide to the Recycled Claim Standard (RCS) and Global Recycled Standard (GRS)',
    year: 2020,
    url: 'https://textileexchange.org/app/uploads/2021/02/GRS-403-V4.0-Quick-Guide-to-the-RCS-and-GRS.pdf',
    gist: 'A short guide to what the GRS checks.',
    says: [
      'GRS is a voluntary standard for finished products.',
      'Outside (third-party) auditors check the recycled material, how it is tracked through the supply chain, social and environmental practices, and chemical limits.',
    ],
    caveats: [
      'Older version (GRS 4.0, dated July 13, 2020).',
      'Written by the group that runs GRS.',
      '"Reducing harmful impacts" is its stated goal, not a measured result.',
    ],
    usedFor: 'GRS label wording on the recycled wool card.',
  },
  {
    id: 'masters-of-flax-fibre-claims-2025',
    shortName: 'Masters of FLAX FIBRE mark',
    organization: 'Alliance for European Flax-Linen & Hemp',
    title: 'The claims pertaining to Masters of FLAX FIBRE™ (formerly European Flax™)',
    year: 2025,
    url: 'https://allianceflaxlinenhemp.eu/rails/active_storage/disk/eyJfcmFpbHMiOnsiZGF0YSI6eyJrZXkiOiI3MTRidTAzc3lrOWlxZ2Q2czdnNDM4aGJqbThtIiwiZGlzcG9zaXRpb24iOiJpbmxpbmU7IGZpbGVuYW1lPVwiTWFzdGVycyBvZiBGTEFYIEZJQlJFLUE0LWFsbGVnYXRpb25zLW1hcnF1ZXMtRU4tMjAyNjAxMTQucGRmXCI7IGZpbGVuYW1lKj1VVEYtOCcnTWFzdGVycyUyMG9mJTIwRkxBWCUyMEZJQlJFLUE0LWFsbGVnYXRpb25zLW1hcnF1ZXMtRU4tMjAyNjAxMTQucGRmIiwiY29udGVudF90eXBlIjoiYXBwbGljYXRpb24vcGRmIiwic2VydmljZV9uYW1lIjoibWVkaWEifSwicHVyIjoiYmxvYl9rZXkifX0=--706b531137c74fcec9d4105dcf7d2a462f48afc6/Masters%20of%20FLAX%20FIBRE-A4-allegations-marques-EN-20260114.pdf',
    gist: 'A farming and origin mark for European-grown linen.',
    says: [
      'Covers flax grown in France, Belgium and the Netherlands, tracked from fiber to finished product.',
      'Flax is usually grown without irrigation (only when specifically needed).',
      'Stalks are left in the field to loosen the fibers. Soaking them in water is banned.',
      'Seeds are certified GMO-free.',
    ],
    caveats: [
      "From the flax industry's own trade body, describing its own mark.",
      'Independent audits by Bureau Veritas Certification start in 2026.',
      'Describes farming practices, not a measured comparison with other fibers.',
    ],
    usedFor: 'Linen note.',
  },
  {
    id: 'persson-2026',
    shortName: 'Recycled polyester study',
    organization: 'Persson, de Lima, Kadi & Persson',
    title:
      'Mechanically Recycled Textiles: A Source of Microplastic Fiber Emissions. Environmental Science & Technology 60(2), 1810-1818',
    year: 2026,
    url: 'https://doi.org/10.1021/acs.est.5c14973',
    gist: 'One lab study of washing polyester fabric that contains recycled fiber.',
    says: [
      'The fabrics were 30% recycled polyester fiber and 70% new polyester.',
      'Fiber recycled once: no clear difference in microfiber release from new polyester.',
      'Fiber recycled twice or three times: about 4.3 and 6.2 times more microfibers.',
    ],
    caveats: [
      'One lab study with few repeat tests and one fabric structure.',
      'Funded by the Swedish Environmental Protection Agency. The paper declares no competing financial interest.',
      'Dry rubbing gave different results from washing.',
      'The authors say the effect may apply only to moderate amounts of recycled fiber.',
      'The result applies to these test conditions. It does not apply to all recycled polyester.',
    ],
    usedFor: 'Recycled polyester card and shedding basis sheet.',
  },
  {
    id: 'aquafil-epd-econyl-2018',
    shortName: 'ECONYL declaration',
    organization: 'Aquafil S.p.A.',
    title: 'Environmental Product Declaration for ECONYL® Nylon Textile Filament Yarns (Rev. 3)',
    year: 2018,
    url: 'https://www.aquafil.com/assets/uploads/20181010_EPD_ECONYL_NTF_Yarns_HR.pdf',
    gist: "The maker's 2018 declaration about its ECONYL yarn.",
    says: [
      'Aquafil says its ECONYL yarns are made from 100% recycled nylon 6.',
      'The recycled content (from used products and factory waste) is certified by an independent third party (DNV).',
      'The declaration was checked by Bureau Veritas.',
    ],
    caveats: [
      'Comes from the maker.',
      'The declaration expired on April 10, 2020. It shows what the maker stated then, not current performance.',
      'It covers production up to the factory gate, not use or disposal.',
    ],
    usedFor: 'Recycled nylon (ECONYL) card.',
  },
  {
    id: 'aquafil-sustainability-2023',
    shortName: 'Aquafil report',
    organization: 'Aquafil S.p.A.',
    title: 'Sustainability Report 2023 (consolidated non-financial statement)',
    year: 2023,
    url: 'https://www.aquafil.com/assets/uploads/Aquafil-DNF-2023-ENG-1.pdf',
    gist: "Aquafil's own report on where its recycled nylon comes from.",
    says: [
      'Aquafil says it regenerates fishing nets and other nylon waste.',
      'The waste it collects is mainly carpets, rugs and fishing nets.',
    ],
    caveats: [
      "The maker's own report, not independently checked.",
      'Its other marketing claims (quality, lower emissions) are not repeated in the app.',
    ],
    usedFor: 'Recycled nylon (ECONYL) card.',
  },
  {
    id: 'oleksinska-2026-bio-leather',
    shortName: 'Plant-based leather review',
    organization: 'Oleksińska-Merida, Puchalski & Herczyńska',
    title:
      'Bio-Based and Sustainable Alternatives to Conventional and Synthetic Leather. Materials 19(6), 1198',
    year: 2026,
    url: 'https://doi.org/10.3390/ma19061198',
    gist: 'A 2026 review of plant- and fungus-based leather alternatives.',
    says: [
      'Many commercial versions still use petroleum-based resins or coatings to be durable enough.',
      'Common PU (plastic) coatings stand in the way of being fully biodegradable.',
    ],
    caveats: [
      'A review article.',
      'It describes products in general, so it does not show that every plant-based leather contains plastic.',
      'It has at least one claim without a clear basis, so only the points above are used.',
    ],
    usedFor: 'Leather note.',
  },
  {
    id: 'sandin-peters-2018',
    shortName: 'Reuse review',
    organization: 'Sandin & Peters',
    title:
      'Environmental impact of textile reuse and recycling: A review. Journal of Cleaner Production 184, 353-365',
    year: 2018,
    url: 'https://doi.org/10.1016/j.jclepro.2018.02.266',
    gist: 'A review of 41 studies on reusing and recycling clothes.',
    says: [
      'Reusing and recycling textiles usually has less environmental impact than burning or dumping them.',
      'Reuse is better than recycling.',
      'The benefit mostly comes from not making a new item. It can disappear if the reused item does not replace a new purchase.',
      'Extra travel to get an item can cancel it out unless the garment is worn long enough.',
    ],
    caveats: [
      'Cotton and polyester were studied most.',
      'Most studies assumed one reused item replaces one new item without proving it.',
      'Not specific to the Philippines or secondhand markets here.',
      'Covers reuse and recycling, not repair or upcycling.',
    ],
    usedFor: 'Resale and donate tips (reuse sheet).',
  },
  {
    id: 'philfida-abaca-manual',
    shortName: 'Abaca manual',
    organization: 'PhilFIDA, with GIZ and Glatfelter',
    title: 'Abaca Sustainability Manual',
    year: null,
    url: 'https://philfida.da.gov.ph/images/Publications/abacasustainabilitymanual/ASM.pdf',
    gist: "PhilFIDA's farming guide for abaca.",
    says: [
      'Names abaca as Musa textilis.',
      'Lists its uses as ropes, textiles and specialty papers, among others.',
    ],
    caveats: [
      'An undated farming guide, not a clothing source.',
      'Its production statistics come from a 2015 bulletin. They are old and are not shown in the app.',
    ],
    usedFor: 'Abaca note.',
  },
  {
    id: 'cherrett-sei-2005',
    shortName: 'Cotton, hemp and polyester study',
    organization: 'Cherrett, Barrett, Clemett, Chadwick & Chadwick (Stockholm Environment Institute)',
    title: 'Ecological Footprint and Water Analysis of Cotton, Hemp and Polyester',
    year: 2005,
    url: 'https://mediamanager.sei.org/documents/Publications/SEI-Report-EcologicalFootprintAndWaterAnalysisOfCottonHempAndPolyester-2005.pdf',
    gist: 'A 2005 footprint study of cotton, organic cotton, hemp and polyester.',
    says: [
      'It compared the energy, CO2 and ecological footprint of making one tonne of spun fiber.',
      'Organic cotton used less energy to grow than conventional cotton, because it leaves out synthetic fertilizer, herbicides and, in the USA case, energy-intensive irrigation.',
      'It found a marginal footprint reduction for organic cotton in most cases.',
      'It cites organic yields 20-50% lower, so growing all cotton organically would need more land.',
    ],
    caveats: [
      'Commissioned by BioRegional, with part of the funding from WWF-UK.',
      'A preliminary estimate from twelve case studies, using data from around 2005. The authors note large error margins.',
      'Covers CO2 only, not other emissions or pollution.',
      'Per tonne of spun fiber, not per garment.',
    ],
    usedFor: 'Organic cotton card (energy, yield and land).',
  },
  {
    id: 'shen-2010-pet',
    shortName: 'Recycled PET fiber study',
    organization: 'Shen, Worrell & Patel',
    title:
      'Open-loop recycling: A LCA case study of PET bottle-to-fibre recycling. Resources, Conservation and Recycling 55, 34-52',
    year: 2010,
    url: 'https://doi.org/10.1016/j.resconrec.2010.06.014',
    gist: 'A 2010 life-cycle study of turning used PET bottles into polyester fiber.',
    says: [
      'It compared recycled PET fiber with new PET fiber, per tonne of fiber.',
      'Recycled fiber saved 40-85% of non-renewable energy and 25-75% of global warming potential, depending on how the recycling impacts were shared out.',
      'Mechanical recycling had lower impacts than new PET in at least 8 of 9 categories.',
    ],
    caveats: [
      'Industry-funded: the acknowledgements say adidas AG, Lenzing AG and Wellman International funded and supported the study.',
      'Wellman, a recycler of PET bottles, supplied inventory data for the mechanical recycling case.',
      'Covers making the fiber only, not making clothes, wearing or disposal.',
      'Assumes recycled and new fiber work equally well. The authors say quality depends on clean, well-sorted bottles.',
      'Does not measure microfiber shedding.',
      'Covers PET bottles turned into fiber, not recycled clothing.',
    ],
    usedFor: 'Recycled polyester card (energy and greenhouse gases).',
  },
  {
    id: 'shen-cellulose-2010',
    shortName: 'Man-made cellulose fibers study',
    organization: 'Shen, Worrell & Patel',
    title:
      'Environmental impact assessment of man-made cellulose fibres. Resources, Conservation and Recycling 55(2), 260-274',
    year: 2010,
    url: 'https://doi.org/10.1016/j.resconrec.2010.10.001',
    gist: 'A 2010 life-cycle study of Lenzing viscose, modal and TENCEL fibers set against cotton, polyester and polypropylene.',
    says: [
      'It assessed viscose, modal and TENCEL fibers made by Lenzing AG, per tonne of staple fiber from raw materials to the factory gate.',
      'It compared them with cotton, polyester (PET) and polypropylene (PP).',
      'It found four modern man-made cellulose fibers, including TENCEL and viscose from Austria, had the lowest overall impact of all the fibers studied.',
      'It found viscose from Asia had a higher overall impact than the other cellulose fibers and was comparable to PET.',
      'It identified cotton as the least preferred choice because of its ecotoxicity, eutrophication, water use and land use impacts.',
      'It says the ranking of the fibers does not change with the allocation method.',
    ],
    caveats: [
      'Only the abstract could be read, not the full text or the funding statement.',
      'The fiber data came from Lenzing AG, which makes TENCEL. The lead author\'s 2010 PET-bottle study lists Lenzing among its funders.',
      'Covers fiber production up to the factory gate, not spinning, dyeing, wearing or disposal.',
      'Data are from the 2000s.',
    ],
    usedFor: 'TENCEL / lyocell cards and the viscose note.',
  },
  {
    id: 'wendin-2016-recycled-cotton',
    shortName: 'Recycled cotton report',
    organization: 'Miljögiraff (Wendin), report for H&M',
    title: 'Life Cycle Assessment on Recycling cotton (mechanically), Report 75',
    year: 2016,
    url: 'https://esu-services.ch/fileadmin/download/publicLCI/wendin-2016-LCA%20on%20Rec%20Cotton%20Miljogiraff%2075%20report%20for%20HM.pdf',
    gist: 'A 2016 life-cycle report on mechanically recycling collected cotton clothes, written for H&M.',
    says: [
      'It compared one tonne of mechanically recycled cotton fiber, ready for spinning, with virgin cotton from two reference datasets (Cotton Incorporated and PE International 2012, and ecoinvent).',
      'It concludes that collecting clothes and recycling cotton mechanically has a considerable potential to lower the overall environmental impact in the most important categories, though not in all.',
      'It says the result is limited to the aspects that could be compared.',
    ],
    caveats: [
      'Written for H&M, a clothing retailer with a take-back program. No independent review was confirmed.',
      'It says the physical allocation it used can be regarded as a worst case for recycling.',
      'Water scarcity, land use and toxicity could not be compared with the reference study.',
      'Per tonne of fiber ready for spinning, not per garment.',
    ],
    usedFor: 'Recycled cotton card.',
  },
  {
    id: 'bianco-2022-recycled-wool',
    shortName: 'Recycled wool fiber study',
    organization: 'Bianco, Gerboni, Picerno & Blengini',
    title: 'Life Cycle Assessment (LCA) of MWool Recycled Wool Fibers. Resources 11(5), 41',
    year: 2022,
    url: 'https://doi.org/10.3390/resources11050041',
    gist: 'A 2022 life-cycle study of recycled wool fiber from one Italian producer, set against virgin wool fiber.',
    says: [
      'It assessed recycled wool fiber made by Manteco SpA from pre- and post-consumer textiles, mostly with primary data.',
      'It compared this with a separate assessment of virgin wool fiber that was mostly based on literature data.',
      'It reports a carbon footprint of 0.1-0.9 kg CO2e per kg of recycled wool fiber, against 10-103 kg CO2e for virgin wool fiber.',
      'It reports that recycled wool fiber can save about 60% of the impacts of virgin fiber when a formula for quality loss is applied.',
      'It says recycled wool fibers had significantly lower impacts than virgin fibers even in the most unfavorable scenarios it tested.',
    ],
    caveats: [
      'Only the abstract could be read. Funding and conflict-of-interest statements were not read.',
      'The recycled data come from one company\'s process.',
      'The virgin wool range is very wide and comes mostly from literature data.',
      'The abstract names climate change only, so other impact categories are not confirmed.',
    ],
    usedFor: 'Recycled wool card.',
  },
  {
    id: 'wiedemann-2022-recycled-wool-sweater',
    shortName: 'Recycled wool sweater study',
    organization: 'Wiedemann, Biggs, Clarke & Russell',
    title:
      'Reducing the Environmental Impacts of Garments through Industrially Scalable Closed-Loop Recycling: Life Cycle Assessment of a Recycled Wool Blend Sweater. Sustainability 14(3), 1081',
    year: 2022,
    url: 'https://doi.org/10.3390/su14031081',
    gist: 'A 2022 cradle-to-grave life-cycle study of a recycled wool blend sweater.',
    says: [
      'It reports 0.05 kg CO2e, 0.63 MJ fossil energy, 0.58 L water stress and 0.95 L freshwater use per wear of a recycled wool blend sweater.',
      'Most of the impact came from making the garment and from how it is used and cared for.',
      'A recycled wool blend sweater kept with best-practice use and care had 66-90% lower impacts than a virgin pure wool sweater with standard maintenance.',
    ],
    caveats: [
      'Only the abstract could be read.',
      'Funded by Australian Wool Innovation, a wool industry body, according to Crossref funder data.',
      'The 66-90% figure combines recycled content with better garment care, so it is not the effect of recycled fiber alone.',
      'Covers climate change, fossil energy, water stress and freshwater use only.',
    ],
    usedFor: 'Recycled wool card (Basis sheet only).',
  },
  {
    id: 'aquafil-lca-2024',
    shortName: 'ECONYL polymer summary',
    organization: 'Aquafil S.p.A.',
    title: 'Life Cycle Assessment data for ECONYL polymer (one-page summary)',
    year: null,
    url: 'https://www.aquafil.com/assets/uploads/LCA_Grafica_ECONYL%C2%AE_POLYMER.pdf',
    gist: "The maker's one-page summary of its life-cycle study of ECONYL nylon 6 polymer.",
    says: [
      'Aquafil reports a carbon footprint of 1.69 kg CO2e per kg of ECONYL nylon 6 polymer.',
      "Aquafil reports 74% lower CO2 emissions than its own standard nylon.",
      'It says the results come from an ISO 14040/44 study verified by a third party (Studio Fieschi & soci Srl, Turin).',
      'The boundary is cradle to gate, using 2023-2024 data.',
    ],
    caveats: [
      'Comes from the maker. A consulting firm\'s verification is not the same as journal peer review.',
      "The comparison is with Aquafil's own standard nylon, not an industry average.",
      'Reports carbon dioxide only, with no water, toxicity or shedding results.',
      'Covers making the polymer only. Later steps are outside the study.',
      'Only this one-page summary was read, not the full study.',
      'The page has no date.',
    ],
    usedFor: 'Recycled nylon (ECONYL) card.',
  },
  {
    id: 'van-der-velden-2014',
    shortName: 'Fabric benchmarking study',
    organization: 'van der Velden, Patel & Vogtländer',
    title:
      'LCA benchmarking study on textiles made of cotton, polyester, nylon, acryl, or elastane. International Journal of Life Cycle Assessment 19(2), 331-356',
    year: 2014,
    url: 'https://doi.org/10.1007/s11367-013-0626-9',
    gist: 'A 2014 life-cycle comparison of fabrics made of cotton, polyester, nylon, acrylic and elastane.',
    says: [
      'It compared textiles from raw materials to the discarded textile, using four single indicators: eco-costs, carbon footprint, cumulative energy demand and ReCiPe.',
      'It found textiles made of acrylic and PET have the least impact, followed by elastane, nylon and cotton.',
      'It says impact depends on yarn thickness as well as on the base material.',
      'It says results are case dependent, especially when dyeing, finishing, use and end of life are included.',
    ],
    caveats: [
      'Only the abstract could be read. The funding statement was not read.',
      'Inventory data come from literature, databases and company contacts, not one measured supply chain.',
      'Does not cover wool, linen or recycled fibers.',
    ],
    usedFor: 'Acrylic and spandex notes.',
  },
  {
    id: 'williams-2022-reishi',
    shortName: 'Mycelium leather study',
    organization: 'Williams, Cenian, Golsteijn, Morris & Scullin',
    title:
      "Life cycle assessment of MycoWorks' Reishi: the first low-carbon and biodegradable alternative leather. Environmental Sciences Europe 34, 120",
    year: 2022,
    url: 'https://doi.org/10.1186/s12302-022-00689-x',
    gist: 'A 2022 company-funded life-cycle study of one mycelium leather compared with a modeled bovine leather.',
    says: [
      'It compared one square meter of MycoWorks\' Reishi (mycelium only) with a bovine leather benchmark that the authors modeled, from raw materials to the factory gate.',
      'It reports 6.20 kg CO2e per m2 for Reishi at pilot scale (an 81% reduction) against 32.97 kg CO2e per m2 for the modeled bovine leather.',
      'It reports a lower impact for Reishi in several categories, including eutrophication, ecotoxicity and human health effects.',
    ],
    caveats: [
      'Funded by MycoWorks Inc., which makes Reishi. MycoWorks also provided the data and co-wrote parts of the paper.',
      'The authors say the findings are specific to this case study and should not be extrapolated to all bovine leather.',
      'Covers making the material to the factory gate only, not durability or disposal.',
      'The bovine leather benchmark was modeled by the authors.',
    ],
    usedFor: 'Leather note.',
  },
  {
    id: 'azevedo-2025-elastane',
    shortName: 'Elastane removal study',
    organization: 'Azevedo, Silva, Chaves, Ribeiro, Fangueiro & Ferreira',
    title:
      'Selective Elastane Removal Using DMSO-DBN Under Moderate Temperatures: From Pure Filaments to Cotton/Polyester Blends. Polymers 17(24), 3247',
    year: 2025,
    url: 'https://doi.org/10.3390/polym17243247',
    gist: 'A 2025 laboratory study on removing elastane from cotton and polyester blends so they can be recycled.',
    says: [
      'It says even a low elastane content makes shredding less efficient, contaminates recycled streams and limits how well recovered fibers can be spun.',
      'Its introduction says elastane is typically in the range of 2-10% by weight for stretch fabrics, although higher contents may be used in specialized compression or shapewear applications.',
    ],
    caveats: [
      'A laboratory study of a removal method, not a comparison of fabrics.',
      'The full text was read on PubMed Central. The 2-10% range is a background statement in the introduction, not a result of the study.',
      'A correction was published in 2026 (Polymers 18(9), 1060).',
      'Funded by IAPMEI through the Lusitano project (Portugal). The authors declare no conflicts of interest.',
    ],
    usedFor: 'Spandex note.',
  },
  {
    id: 'emf-new-textiles-economy-2017',
    shortName: 'Textiles economy report',
    organization: 'Ellen MacArthur Foundation',
    title: "A new textiles economy: Redesigning fashion's future",
    year: 2017,
    url: 'https://www.ellenmacarthurfoundation.org/a-new-textiles-economy',
    gist: "A 2017 report on how clothes are made, worn and thrown away, with the foundation's own estimates.",
    says: [
      'In the 15 years before the report, clothing production roughly doubled. It links part of this to "fast fashion": quicker turnaround of styles, more collections a year and often lower prices.',
      'Worldwide, the average number of times a garment is worn before it is no longer used fell 36% compared with 15 years earlier.',
      'It estimates that more than half of fast fashion produced is thrown away in under a year.',
      'It says that if garments were worn twice as often on average, greenhouse gas emissions would be 44% lower. Its notes say this is its own calculation for the production phase, assuming second-hand handling uses ten times less energy than making clothes.',
      'It says services and support that help people keep clothes longer, such as repairing or restyling and adequate washing and storing, could help preserve clothes. It says large-scale clothing repair and restyle services could significantly increase how often clothes are worn.',
    ],
    caveats: [
      'Written by a foundation that promotes a circular economy, with business and government partners.',
      'The 44% figure is a model, not a measurement of any garment, and covers production only.',
      'The "under a year" figure is described as an estimate.',
      'Global figures from 2017. They are not specific to the Philippines.',
    ],
    usedFor: 'Fast fashion note (About screen) and the mending tip (care tips; practical suggestion).',
  },
  {
    id: 'peters-2021-fast-fashion',
    shortName: 'Fast fashion impact study',
    organization: 'Peters, Li & Lenzen',
    title:
      'The need to decelerate fast fashion in a hot climate - A global sustainability perspective on the garment industry. Journal of Cleaner Production 295, 126390',
    year: 2021,
    url: 'https://doi.org/10.1016/j.jclepro.2021.126390',
    gist: 'A 2021 peer-reviewed estimate of the climate and water impact of clothing and footwear.',
    says: [
      'It says the scale of fast fashion impacts is debated, and that peer-reviewed quantitative estimates of the total are rare.',
      'It estimates the climate impact of clothing and footwear consumption rose from 1.0 to 1.3 billion tonnes of CO2 equivalent over the 15 years to 2015.',
      'Impact per garment improved over that time. Textile production rose 75%, so the total still grew.',
      "It argues much larger cuts in the industry's carbon footprint are possible by ending fossil-fueled electricity and \"by eliminating fast fashion as a business model.\"",
    ],
    caveats: [
      'Only the abstract could be read. The funding statement was not read.',
      'A model of whole economies (Eora input-output data), not a measurement of one garment or purchase.',
      'Covers clothing and footwear together, through 2015.',
    ],
    usedFor: 'Fast fashion note (About screen).',
  },
  {
    id: 'napper-thompson-2016',
    shortName: 'Washing-machine fiber study (2016)',
    organization: 'Napper & Thompson',
    title:
      'Release of synthetic microplastic plastic fibres from domestic washing machines: Effects of fabric type and washing conditions. Marine Pollution Bulletin 112(1-2), 39-45',
    year: 2016,
    url: 'https://doi.org/10.1016/j.marpolbul.2016.09.025',
    gist: 'A lab study of how many fibers polyester, polyester-cotton and acrylic fabrics release in a household wash.',
    says: [
      'It tested polyester, a polyester-cotton blend and acrylic fabrics.',
      'The polyester-cotton blend shed significantly fewer fibers than the polyester and acrylic fabrics.',
      'The authors estimate that over 700,000 fibers could be released from an average 6 kg wash load of acrylic fabric.',
      'Temperature, detergent and conditioner were varied in the washes.',
    ],
    caveats: [
      'Only the abstract could be read.',
      "The abstract gives a fiber count only for acrylic, and it is the authors' estimate for a typical load, not a measurement of your garment.",
      'It did not test nylon or spandex.',
    ],
    usedFor: 'Shedding estimate wording (why this level).',
  },
  {
    id: 'de-falco-2019',
    shortName: 'Household wash study (2019)',
    organization: 'De Falco, Di Pace, Cocca & Avella',
    title:
      'The contribution of washing processes of synthetic clothes to microplastic pollution. Scientific Reports 9, 6633',
    year: 2019,
    url: 'https://doi.org/10.1038/s41598-019-43023-x',
    gist: 'Real-scale household washes of commercial synthetic clothes, measuring the fibers released.',
    says: [
      'Microfibers released ranged from 124 to 308 mg per kg of washed fabric.',
      'The type of fiber in the yarn and the yarn twist influenced how much was released.',
      'A great amount of cellulosic microfibers was also released when washing clothes made from a polyester/cellulose blend.',
    ],
    caveats: [
      'The full text was read on PubMed Central.',
      'The abstract also gives a fiber count of 640,000 to 1,500,000 but does not say what that count is per, so it is not used here.',
      'Commercial clothes in one type of machine. Not a measurement of your garment.',
    ],
    usedFor: 'Shedding estimate wording (why this level).',
  },
  {
    id: 'carney-almroth-2018',
    shortName: 'Knitted textile shedding study',
    organization: 'Carney Almroth, Åström, Roslund, Petersson, Johansson & Persson',
    title:
      'Quantifying shedding of synthetic fibers from textiles; a source of microplastics released into the environment. Environmental Science and Pollution Research 25(2), 1191-1199',
    year: 2018,
    url: 'https://doi.org/10.1007/s11356-017-0528-7',
    gist: 'A lab study of fiber shedding from synthetic textiles knitted with different gauges and techniques.',
    says: [
      'It tested acrylic, nylon and polyester textiles. All of the textiles shed.',
      'Polyester fleece fabrics shed the most.',
      'Loose constructions and worn fabrics shed more.',
    ],
    caveats: [
      'The full text was read on PubMed Central.',
      'The fabrics were knitted in a lab for the study, and "worn" fabrics were roughened by a lab method, so this is not wear in real use.',
      'Its fiber counts are in units specific to that method, so no counts are used here.',
    ],
    usedFor: 'Shedding estimate wording (why this level).',
  },
  {
    id: 'vassilenko-2021',
    shortName: 'Polyester vs nylon laundry study',
    organization: 'Vassilenko, Watkins, Chastain, Mertens, Posacka, Patankar & Ross',
    title:
      'Domestic laundry and microfiber pollution: Exploring fiber shedding from consumer apparel textiles. PLoS ONE 16(7), e0250346',
    year: 2021,
    url: 'https://doi.org/10.1371/journal.pone.0250346',
    gist: 'A study of 37 consumer apparel textiles washed five times in a home machine.',
    says: [
      'Mechanically treated polyester samples, mostly fleeces and jerseys, released 161 ± 173 mg per kg per wash.',
      'Nylon samples with woven construction and filament yarns released 27 ± 14 mg per kg per wash.',
      'Two marketed lint traps kept up to 90% of polyester fibers and 46% of nylon fibers.',
      'Fiber shedding rose with fabric thickness for nylon and polyester.',
      'The abstract says cotton and wool textiles also shed large amounts of microfibers (165 ± 44 mg per kg per wash). That group was four knit spun-staple textiles.',
    ],
    caveats: [
      'The full text was read on PubMed Central.',
      'The paper\'s sample table lists the four "natural" textiles as one cotton, one wool and two cotton-polyester blends, although the text calls them cotton and wool. So the 165 ± 44 figure is not a result for each fiber, and only one 100% wool fabric was tested.',
      'Apparel brands and agencies supplied materials and technical advice. The paper says they did not review the manuscript or the interpretation.',
      'The polyester and nylon samples differ in construction as well as fiber, so the gap is not caused by fiber alone.',
      'The polyester result varies widely (± 173). The trap figures are "up to" values from two traps.',
    ],
    usedFor: 'Shedding estimate wording (why this level).',
  },
  {
    id: 'karkkainen-2021',
    shortName: 'Washing and tumble-drying study',
    organization: 'Kärkkäinen & Sillanpää',
    title:
      'Quantification of different microplastic fibres discharged from textiles in machine wash and tumble drying. Environmental Science and Pollution Research 28(13), 16253-16263',
    year: 2021,
    url: 'https://doi.org/10.1007/s11356-020-11988-2',
    gist: 'Five washes and dryings of synthetic textiles, plus a test of two fiber traps.',
    says: [
      'The textiles were five types of polyester, one polyamide and one polyacryl.',
      'In the first wash, the number of fibers released ranged from 1.0 × 10⁵ to 6.3 × 10⁶ per kg.',
      'In the first drying, the mass of fibers ranged from 10 to 1,700 mg per kg.',
      'Two commercial fiber traps captured 39% and 10% of the polyester fibers discharged in washings.',
    ],
    caveats: [
      'The full text was read on PubMed Central.',
      'Washes were at 40 °C and tumble drying used a "low heat" setting of 45 °C, so heat was not varied and its effect was not tested.',
      'The wash range covers all the textiles tested and is wide because they differ a lot. It is not a figure for one fiber.',
      'The trap results are for polyester fibers.',
    ],
    usedFor: 'Shedding estimate wording (why this level).',
  },
  {
    id: 'rathinamoorthy-2023',
    shortName: 'Elastane blend study',
    organization: 'Rathinamoorthy, Raja Balasaraswathi, Madhubashini, Prakalya, Rakshana & Shathvika',
    title:
      'Investigation on microfiber release from elastane blended fabrics and its environmental significance. Science of the Total Environment 903, 166553',
    year: 2023,
    url: 'https://doi.org/10.1016/j.scitotenv.2023.166553',
    gist: 'A lab study of cotton and elastane knitted fabrics with 2%, 5% and 8% elastane.',
    says: [
      'All three fabrics released microfibers when laundered, and more elastane meant more total microfibers.',
      'Elastane made up 13.40% of the microfibers released from the fabric with 2% elastane and 19.60% from the fabric with 8%.',
      'The abstract identifies elastane microfibers among the released fibers and reports cotton microfibers separately, so not every released fiber was elastane. It does not give the polymer content of each released fiber.',
    ],
    caveats: [
      'Only the abstract could be read.',
      'Three mixes of one fabric type. It does not rank elastane against polyester, acrylic or nylon.',
    ],
    usedFor: 'Shedding estimate wording (why this level).',
  },
  {
    id: 'zhang-2025',
    shortName: 'Cotton/polyester blend study',
    organization: 'Zhang, Haque, Ranjbar, Tester & Naebe',
    title:
      'Decoding microplastic shedding from cotton/polyester blends: An analysis through fiber identification. Environmental Pollution 383, 126909',
    year: 2025,
    url: 'https://doi.org/10.1016/j.envpol.2025.126909',
    gist: 'A lab study that separates out the polyester released from cotton/polyester fabrics.',
    says: [
      'Polyester shedding was significantly higher from cotton/polyester blends than from polyester fabric alone.',
      'Weave structure and the share of polyester both affected how much was released.',
    ],
    caveats: [
      'Only the abstract could be read.',
      'It measures the polyester released, not total fibers. A different study (Napper & Thompson, 2016) found a polyester-cotton blend shed fewer fibers than polyester, so findings on blends differ.',
    ],
    usedFor: 'Shedding estimate wording (why this level).',
  },
  {
    id: 'de-falco-2020',
    shortName: 'Polyester garment study (2020)',
    organization: 'De Falco, Cocca, Avella & Thompson',
    title:
      'Microfiber Release to Water, Via Laundering, and to Air, via Everyday Use: A Comparison between Polyester Clothing with Differing Textile Parameters. Environmental Science & Technology 54(6), 3288-3296',
    year: 2020,
    url: 'https://doi.org/10.1021/acs.est.9b06892',
    gist: 'A comparison of polyester garments with different structures, measuring release to water and to air.',
    says: [
      'Release to air during wear was of a similar order of magnitude to release to water in laundering.',
      'The lowest releases to water and air came from a garment with a very compact woven structure and highly twisted continuous-filament yarns.',
      'Looser constructions (knitted, short-staple fibers, lower twist) released more.',
    ],
    caveats: [
      'Only the abstract could be read, and it gives no numbers.',
      'Only polyester garments are mentioned. It says nothing about nylon, acrylic or spandex.',
    ],
    usedFor: 'Shedding estimate wording (why this level).',
  },
  {
    id: 'kelly-2019',
    shortName: 'Wash water volume study',
    organization: 'Kelly, Lant, Kurr & Burgess',
    title:
      'Importance of Water-Volume on the Release of Microplastic Fibers from Laundry. Environmental Science & Technology 53(20), 11735-11744',
    year: 2019,
    url: 'https://doi.org/10.1021/acs.est.9b03022',
    gist: 'A study of how wash water volume, agitation, temperature and wash length change the microfibers released by polyester textiles.',
    says: [
      'It used a laboratory method and full-scale household washing machines with polyester textiles.',
      'It found a high water-to-fabric ratio, as in European "delicate" cycles, released the most microfibers, not agitation as previously thought.',
      'In the first wash, delicate cycles released 94 mg per kg more than a lower-water standard wash.',
      'It says people can reduce release by avoiding high-water-volume washes and using full wash loads.',
    ],
    caveats: [
      'Only the abstract could be read.',
      'Polyester textiles only.',
      'Funding and author affiliations were not read. One author (N. J. Lant) also wrote Lant et al. (2020), whose authors work for Procter & Gamble.',
    ],
    usedFor: 'Wash tips (care tips sheet).',
  },
  {
    id: 'lant-2020',
    shortName: 'Household wash study (2020)',
    organization: 'Lant, Hayward, Peththawadu, Sheridan & Dean',
    title:
      'Microfiber release from real soiled consumer laundry and the impact of fabric care products and washing conditions. PLoS ONE 15(6), e0233332',
    year: 2020,
    url: 'https://doi.org/10.1371/journal.pone.0233332',
    gist: 'Tests of household wash loads and washing conditions, and how much microfiber each released.',
    says: [
      'Soiled wash loads from UK households released a mean of 114 ± 66.8 mg of microfiber per kg of fabric, mainly natural fibers.',
      'Loads of 3.5 to 6.0 kg released 66.3 ± 27.0 mg per kg, against 132.4 ± 68.6 mg per kg for loads of 1.0 to 3.5 kg.',
      'A colder, quicker cycle (15 °C for 30 minutes) cut microfiber release by 30% compared with a 40 °C cycle of 85 minutes.',
      'Polyester fleece garments released a consistently low amount from the eighth wash on, in one test.',
      'The authors conclude people can use colder and quicker cycles and wash complete, but not overfilled, loads.',
    ],
    caveats: [
      'The full text was read on PubMed Central.',
      'Two authors are employed by Procter & Gamble, which makes laundry products. The paper declares this.',
      'Temperature and cycle length changed together, so it does not show the effect of temperature alone.',
      'Mostly UK household loads of mixed fabrics, not a test of one fiber.',
    ],
    usedFor: 'Wash tips (care tips sheet).',
  },
  {
    id: 'earthday-fashion-guide-2021',
    shortName: 'Earth-friendly fashion guide',
    organization: 'EARTHDAY.ORG',
    title: 'Earth-Friendly Fashion Guide: 14 Ways to Green Your Style',
    year: 2021,
    url: 'https://www.earthday.org/earth-friendly-fashion-guide-14-ways-to-green-your-style/',
    gist: 'A September 2021 consumer guide from an environmental nonprofit with 14 tips for greener clothing choices.',
    says: [
      'Tip 3, "Go natural", says to buy clothing made with natural fabric fibers instead of synthetic fabrics.',
      'It gives the reason as reducing the microplastics in water sources that come from synthetic fibers that shed during washes.',
      'Tip 8 says to wash clothing only when necessary, since many items can be worn several times before washing.',
    ],
    caveats: [
      'A consumer guide from an advocacy nonprofit, not a study and not peer reviewed.',
      'It does not say natural fibers never shed or are better in every way. The lab studies in this list found cotton and wool shed fibers too.',
    ],
    usedFor: 'Natural-fiber tip (care tips; practical suggestion).',
  },
  {
    id: 'earthday-care-toolkit',
    shortName: 'Clothing care toolkit',
    organization: 'EARTHDAY.ORG',
    title: 'Toolkit: How to Care for Your Clothes',
    year: null,
    url: 'https://www.earthday.org/toolkit-how-to-care-for-your-clothes/',
    gist: 'A consumer toolkit from an environmental nonprofit on washing, drying and caring for clothes.',
    says: [
      'It says each washing shortens the life of a garment, and advises washing less often.',
      'It says synthetic clothing sheds microplastics, so it should be washed less frequently.',
    ],
    caveats: [
      'A consumer guide from an advocacy nonprofit, not a study. The page shows no date or author.',
      'Its cold-water and shorter-cycle advice is about saving energy, not fiber shedding, so it is not used for the wash tip.',
      'It advises a delicate cycle for fragile fabrics. A lab study (Kelly et al. 2019) found delicate cycles released more microfibers, so that advice is not used.',
      'Its repair advice covers shoes only, not clothing.',
    ],
    usedFor: 'Worn-garment tip (care tips; practical suggestion).',
  },
  {
    id: 'zambrano-2019',
    shortName: 'Cotton, rayon and polyester laundering study',
    organization: 'Zambrano, Pawlak, Daystar, Ankeny, Cheng & Venditti',
    title:
      'Microfibers generated from the laundering of cotton, rayon and polyester based fabrics and their aquatic biodegradation. Marine Pollution Bulletin 142, 394-407',
    year: 2019,
    url: 'https://doi.org/10.1016/j.marpolbul.2019.02.062',
    gist: 'A lab and home-laundering study of microfibers released by knitted cotton, rayon and polyester fabrics, with aquatic biodegradation tests.',
    says: [
      'It studied how fiber type (cotton, polyester and rayon), water temperature and detergent changed the number of microfibers released from knitted fabrics.',
      'Polyester and cellulose-based fabrics all shed significant amounts of microfibers, and shedding increased with higher water temperature and detergent use.',
      'In accelerated laundering, cellulose-based fabrics released more microfibers by weight (0.2-4 mg per g of fabric) than polyester (0.1-1 mg per g).',
      'In aquatic biodegradation tests, cotton and rayon microfibers are expected to degrade in natural aerobic aquatic environments, whereas polyester microfibers are expected to persist for long periods.',
    ],
    caveats: [
      'Only the abstract could be read.',
      'Knitted fabrics, accelerated lab washing and home laundering. Not a measurement of your garment.',
      'Biodegradation was tested in the lab. A follow-up paper by the same group says such results show potential, not absolutes in nature.',
    ],
    usedFor: 'Cotton and rayon notes, and the cooler-wash tip (fiber profile and About).',
  },
  {
    id: 'zambrano-2020',
    shortName: 'Microfiber biodegradation study',
    organization: 'Zambrano, Pawlak, Daystar, Ankeny, Goller & Venditti',
    title:
      'Aerobic biodegradation in freshwater and marine environments of textile microfibers generated in clothes laundering: Effects of cellulose and polyester-based microfibers on the microbiome. Marine Pollution Bulletin 151, 110826',
    year: 2020,
    url: 'https://doi.org/10.1016/j.marpolbul.2019.110826',
    gist: 'Lab tests of how well microfibers from cotton, rayon and polyester break down in lake water, seawater and sludge.',
    says: [
      'Biodegradation potential ranked: microcrystalline cellulose > cotton > rayon > polyester/cotton >> polyester.',
      'Cotton and rayon yarns reached more than 70% biodegradation in activated sludge and lake water, and about 50% in seawater. Polyester did not appreciably degrade.',
    ],
    caveats: [
      'Only the abstract could be read.',
      'The authors say the results show potential, not absolutes in nature.',
      'It is about biodegradation, not how much a fabric sheds.',
    ],
    usedFor: 'Cotton and rayon notes (fiber profile and About).',
  },
  {
    id: 'fernandes-2024',
    shortName: 'Garment age study',
    organization: 'Fernandes, Lara, De Falco, Turner & Thompson',
    title:
      'Effect of the age of garments used under real-life conditions on microfibre release from polyester and cotton clothing. Environmental Pollution 348, 123806',
    year: 2024,
    url: 'https://doi.org/10.1016/j.envpol.2024.123806',
    gist: 'Laundering of 38 polyester and cotton garments that had been used for 1 to 31 years.',
    says: [
      'All garments released microfibers during washing.',
      'Garments aged 15-31 years released nearly twice as many fibers as garments aged 1-10 years.',
      'The mass of fibers released was greater in garments with more cotton than polyester (up to 1.774 mg per g in 2% polyester and 0.366 mg per g in 100% polyester), which the authors suggest means cotton may be released more readily.',
    ],
    caveats: [
      'Only the abstract could be read.',
      '38 garments of mixed types and use histories, so it shows a pattern, not a rule for every garment.',
      'It covers polyester and cotton only.',
    ],
    usedFor: 'Cotton note and the worn-garment statement (fiber profile and About).',
  },
  {
    id: 'lara-2025',
    shortName: 'Handwashing and wear study',
    organization: 'Lara, Gomes, Neto, Waldman & Fernandes',
    title:
      'Handwashing of cotton and polyester polo shirts: Unveiling the role of wear in microfibre emissions. Journal of Hazardous Materials 501, 140784',
    year: 2026,
    url: 'https://doi.org/10.1016/j.jhazmat.2025.140784',
    gist: 'Six 50% cotton / 50% polyester polo shirts, worn or unworn, then handwashed in 10 cycles.',
    says: [
      'Worn shirts released significantly more microfibers than unworn controls.',
      'Most of the fibers released from both groups were cellulosic.',
    ],
    caveats: [
      'Only the abstract could be read.',
      'Six shirts of one blend, washed by hand. Published online in 2025 and in the 2026 volume.',
    ],
    usedFor: 'Cotton note and the worn-garment statement (fiber profile and About).',
  },
  {
    id: 'cotton-2020',
    shortName: 'Colder and quicker wash study',
    organization: 'Cotton, Hayward, Lant & Blackburn',
    title:
      'Improved garment longevity and reduced microfibre release are important sustainability benefits of laundering in colder and quicker washing machine cycles. Dyes and Pigments 177, 108120',
    year: 2020,
    url: 'https://doi.org/10.1016/j.dyepig.2019.108120',
    gist: 'Retail clothing washed in a 40 °C, 85-minute cycle and a cold-quick (25 °C, 30-minute) cycle.',
    says: [
      'Microfibre release was significantly greater for the 40 °C, 85-minute cycle than for the cold-quick cycle, and the effect continued with further washes.',
      'The cold-quick cycle also caused less dye loss and dye transfer.',
    ],
    caveats: [
      'Only the abstract could be read.',
      'Temperature and wash time changed together, so it does not show the effect of either alone.',
      'Two authors (Hayward, Lant) also wrote Lant et al. (2020) and work for Procter & Gamble.',
    ],
    usedFor: 'Wash tips (About).',
  },
  {
    id: 'gundogdu-2026',
    shortName: 'Natural and synthetic garment study',
    organization: 'Gündoğdu, Özkan, Trunk & Urbancic',
    title:
      'Comparative microfiber shedding from natural, virgin and recycled synthetic textiles under standardised laundering conditions. Environmental Research Communications 8(8), 085016',
    year: 2026,
    url: 'https://doi.org/10.1088/2515-7620/ae9466',
    gist: '51 commercial garments of cotton, polyester and polyamide (virgin and recycled) washed under two standard laundering methods.',
    says: [
      'Cotton released a greater total fiber mass (1.85 mg per g), but its fibers were longer and fewer in number.',
      'Recycled polyester released the highest mean number of microfibers, but the difference from virgin polyester was not statistically significant.',
      'Shedding was largely driven by fiber type and material properties rather than brand.',
    ],
    caveats: [
      'Only the abstract could be read.',
      'A very recent paper that few others have cited yet.',
      'Garments from five brands, so it shows a pattern across these garments, not a rule for every garment.',
    ],
    usedFor: 'Cotton note (fiber profile and About).',
  },
  {
    id: 'collie-2024',
    shortName: 'Wool and fiber composting study',
    organization: 'Collie, Brorens, Hassan & Fowler',
    title:
      'Biodegradation behavior of wool and other textile fibers in aerobic composting conditions. International Journal of Environmental Science and Technology',
    year: 2024,
    url: 'https://doi.org/10.1007/s13762-024-05802-6',
    gist: 'A 181-day lab test of how much shredded wool, viscose rayon, polyester and nylon fabric turned into CO2 under industrial-composting conditions.',
    says: [
      'Test: ISO 14855-1 (2012), shredded fabric mixed into inoculated vermiculite at 58 °C for 181 days, three replicates.',
      'After 181 days the share of carbon converted to CO2 was about 83% for viscose rayon, 68% for machine-washable wool and 48% for untreated wool.',
      'Nylon (polyamide) reached about 2% and polyester about 0%, which the authors report as not biodegrading under these conditions.',
      'The authors found no sign that the machine-washable wool left microplastic fragments behind.',
    ],
    caveats: [
      'Full text read.',
      'A controlled industrial-composting test, not home compost, landfill or the natural environment. The authors say anaerobic landfill conditions are a gap.',
      'The authors describe it as a comparison for research, not product certification. Its positive control missed one of the standard\'s validity checks at 45 days (66.4% against 70%) but reached 88% by the end.',
      'One fabric of each fiber (knits, except a woven viscose), so it does not describe every wool, rayon or nylon fabric.',
      'Funded by Australian Wool Innovation, the wool industry body.',
    ],
    usedFor: 'Fiber profile, Eco tab: "What research says" for wool, rayon, nylon and polyester.',
  },
] as const satisfies readonly Source[];

export type SourceId = (typeof SOURCE_LIST)[number]['id'];

const SOURCES_BY_ID: Record<string, Source> = Object.fromEntries(
  SOURCE_LIST.map((source) => [source.id, source]),
);

export function getSource(id: string): Source | undefined {
  return SOURCES_BY_ID[id];
}

/** 1-based number shown next to a source on the Basis sheets and the About reference list. */
export function getSourceNumber(id: string): number | undefined {
  const index = SOURCE_LIST.findIndex((source) => source.id === id);
  return index === -1 ? undefined : index + 1;
}

/** Resolves ids in order, de-duplicated. Unknown ids are skipped; use `findUnknownSourceIds` to catch them. */
export function resolveSources(ids: readonly string[] | undefined): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const id of ids ?? []) {
    const source = SOURCES_BY_ID[id];
    if (source && !seen.has(id)) {
      seen.add(id);
      sources.push(source);
    }
  }
  return sources;
}

export function findUnknownSourceIds(ids: readonly string[] | undefined): string[] {
  return (ids ?? []).filter((id) => !(id in SOURCES_BY_ID));
}

export function sourceLabel(source: Source): string {
  return `${source.organization} (${source.year ?? 'n.d.'})`;
}

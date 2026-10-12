/**
 * Local registry of the sources cited by the eco-alternative and reuse guidance. Everything shown
 * in the "Basis" sheets and the About screen's reference list comes from here, so it works
 * offline; only opening a link needs a connection.
 *
 * Each entry is written for a quick read: a one-line `gist`, a few short `says` points (what the
 * source states, limited to the claims this app shows, attributed), and short `caveats` (scope,
 * funding, version or comparability limits). Add an id here before referencing it from a claim
 * (a test checks every reference resolves).
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
    usedFor: 'Shedding basis sheet.',
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
    usedFor: 'Sustainable choices sheet (Scan results).',
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
    usedFor: 'Fast fashion note (About screen), the Sustainable choices sheet (Scan results) and the Why synthetics shed page.',
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
    usedFor: 'Why synthetics shed page.',
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
    usedFor: 'Why synthetics shed page.',
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
    usedFor: 'Why synthetics shed page (sources).',
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
    usedFor: 'Why synthetics shed page (sources).',
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
    usedFor: 'Cotton and rayon notes (fiber profile and About) and the Why synthetics shed page.',
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

/** Sources behind a set of claims, in order of first use. */
export function getClaimSources(claims: readonly { sourceIds?: readonly string[] }[]): Source[] {
  return resolveSources(claims.flatMap((claim) => claim.sourceIds ?? []));
}

export function findUnknownSourceIds(ids: readonly string[] | undefined): string[] {
  return (ids ?? []).filter((id) => !(id in SOURCES_BY_ID));
}

export function sourceLabel(source: Source): string {
  return `${source.organization} (${source.year ?? 'n.d.'})`;
}

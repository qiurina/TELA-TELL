/**
 * Maintenance references for the educational About / Look / Care content only.
 * Kept separate from source-registry.ts, which supplies visible Basis sheets and
 * the About screen bibliography. These references are not rendered by the profile.
 * Checked during the content audit on 2026-10-13; this is not an automatic check.
 */
type ProfileSource = {
  title: string;
  publisher: string;
  url: string;
  checkedOn: string;
  access: 'page-text' | 'indexed-text';
  checkedSections: string;
  caveat?: string;
};

function source(
  title: string,
  publisher: string,
  url: string,
  access: ProfileSource['access'],
  checkedSections: string,
  caveat?: string,
): ProfileSource {
  return { title, publisher, url, checkedOn: '2026-10-13', access, checkedSections, caveat };
}

const MFA = 'Museum of Fine Arts, Boston — CAMEO';
const INDEXED_CAVEAT = 'Direct access was blocked; substantial indexed article text was checked.';

export const FIBER_PROFILE_SOURCES = {
  'cameo-cotton': source(
    'Cotton', MFA, 'https://cameo.mfa.org/wiki/Cotton', 'indexed-text',
    'Description: Gossypium seed hairs, cellulose composition and textile applications.', INDEXED_CAVEAT,
  ),
  'cameo-natural-fiber': source(
    'Natural fiber — Properties of Natural Fibers', MFA, 'https://cameo.mfa.org/wiki/Natural_fiber',
    'indexed-text', 'Cotton and flax rows: moisture absorption and limited elasticity; botanical sources.',
    'The table describes fibers, including microscopic features; it does not validate garment photo clues.',
  ),
  'cotton-inc-fibers': source(
    'Textile Fibers (2013)', 'Cotton Incorporated',
    'https://cottonworks.com/wp-content/uploads/2017/11/Fibers_Booklet_edited-1.pdf', 'indexed-text',
    'Cotton: Breaking tenacity. Dry and wet fiber strength, page 17.',
    'Industry technical reference; fiber strength does not establish finished-garment durability.',
  ),
  'cameo-mercerized-cotton': source(
    'Mercerized cotton', MFA, 'https://cameo.mfa.org/wiki/Mercerized_cotton', 'page-text',
    'Description: mercerization increases cotton luster, strength and dye uptake.',
  ),
  'uga-fibers': source(
    'Understand Your Fibers', 'University of Georgia Extension',
    'https://site.extension.uga.edu/textiles/textile-basics/understand-your-fibers/', 'page-text',
    'Cotton, wool, silk, linen, polyester, nylon, acrylic, spandex and rayon entries.',
    'A shared consumer-guidance table, not separate publications for each fiber. General care advice must remain conditional on the article.',
  ),
  'cameo-wool': source(
    'Wool', MFA, 'https://cameo.mfa.org/wiki/Wool', 'page-text',
    'Description: sheep fleece and keratin composition.',
    'The audited content does not adopt the entry\'s broad allergy statement.',
  ),
  'woolmark-fiber': source(
    'What is the Wool Fibre?', 'The Woolmark Company',
    'https://www.woolmark.com/fibre/what-is-the-wool-fibre/', 'indexed-text',
    'Wool fibre structure, crimp, elasticity, moisture vapor and fibre diameter.',
    'Industry explanation; fabric construction also matters. Broad promotional comfort claims are not adopted.',
  ),
  'woolmark-wash': source(
    'How to wash wool', 'The Woolmark Company', 'https://www.woolmark.com/care/how-to-wash-wool/',
    'page-text', 'Machine washing, hand washing, suitable detergent and drying, subject to the garment care claim.',
  ),
  'wool-diameter-review': source(
    'Debunking the Myth of Wool Allergy: Reviewing the Evidence for Immune and Non-immune Cutaneous Reactions (2017)',
    'Zallmann et al., Acta Dermato-Venereologica',
    'https://www.medicaljournals.se/acta/content/html/10.2340/00015555-2655', 'indexed-text',
    'Wool and irritancy: fiber diameter and protruding fibers contribute to mechanical prickle.',
    'Checked the retrieved discussion; individual underlying studies were not independently audited.',
  ),
  'cameo-worsted': source(
    'Worsted', MFA, 'https://cameo.mfa.org/wiki/Worsted', 'indexed-text',
    'Description: combed wool yarns can produce smooth fabrics.', INDEXED_CAVEAT,
  ),
  'cameo-silk': source(
    'Silk', MFA, 'https://cameo.mfa.org/wiki/Silk', 'indexed-text',
    'Description: silkworm cocoons, Bombyx mori, fibroin and filament production.', INDEXED_CAVEAT,
  ),
  'fao-silk': source(
    'Silk reeling and testing manual — Chapter 2: Characteristics of the cocoon',
    'Food and Agriculture Organization of the United Nations',
    'https://www.fao.org/4/x2099e/x2099e03.htm', 'page-text',
    'Filament length; cocoon composition; properties of silk, including light and water effects.',
  ),
  'cameo-satin': source(
    'Satin', MFA, 'https://cameo.mfa.org/wiki/Satin', 'indexed-text',
    'Description: satin weave is a fabric construction used with different fibers.', INDEXED_CAVEAT,
  ),
  'cameo-linen': source(
    'Linen', MFA, 'https://cameo.mfa.org/wiki/Linen', 'indexed-text',
    'Description and properties: flax-stem fibers, strength and limited elongation.',
    'The entry has a botanical-name typo; the correct name is taken from the Flax entry.',
  ),
  'cameo-flax': source(
    'Flax', MFA, 'https://cameo.mfa.org/wiki/Flax', 'indexed-text',
    'Description: Linum usitatissimum and extraction of fibers from stems.', INDEXED_CAVEAT,
  ),
  'cotton-inc-yarns': source(
    'Textile Yarns', 'Cotton Incorporated',
    'https://www.cottonworks.com/wp-content/uploads/2017/11/Textile_Yarns.pdf', 'indexed-text',
    'Fancy yarns, Figure 30: manufactured slub yarn structure.',
    'Supports the yarn-construction distinction, not slubs as a test for linen.',
  ),
  'cameo-polyester': source(
    'Polyester fiber', MFA, 'https://cameo.mfa.org/wiki/Polyester_fiber', 'indexed-text',
    'Description and properties: polyester polymers, PET, variable fiber forms, low moisture regain and oily substances.', INDEXED_CAVEAT,
  ),
  'cotton-inc-moisture': source(
    'TransDRY Technology', 'Cotton Incorporated',
    'https://cottonworks.com/product-innovation/product-technologies/transdry-technology/', 'indexed-text',
    'Engineered yarns, fabric construction and finishes change moisture movement, drying and ventilation.',
    'Manufacturer technology example in cotton; supports separating fiber absorption from fabric behavior, not a universal polyester-performance claim.',
  ),
  'cameo-nylon': source(
    'Nylon fiber', MFA, 'https://cameo.mfa.org/wiki/Nylon_fiber', 'indexed-text',
    'Description and properties: polyamides, strength, elasticity, delustering and moisture regain.', INDEXED_CAVEAT,
  ),
  'cameo-synthetic-fiber': source(
    'Synthetic fiber — Properties of Synthetic Fibers', MFA, 'https://cameo.mfa.org/wiki/Synthetic_fiber',
    'indexed-text', 'Typical moisture-regain ranges for nylon and polyester.',
    'Typical fiber values under reference conditions; not whole-fabric absorption or drying measurements.',
  ),
  'cameo-acrylic': source(
    'Acrylic fiber', MFA, 'https://cameo.mfa.org/wiki/Acrylic_fiber', 'page-text',
    'Description and properties: acrylonitrile composition, applications and low moisture regain.',
  ),
  'cameo-synthetic-applications': source(
    'Properties of Synthetic Fibers (page 2)', MFA,
    'https://cameo.mfa.org/images/4/4e/Download_file_52.pdf', 'indexed-text',
    'Acrylic applications: substitute for wool in sweaters, coats and blankets.',
  ),
  'cameo-spandex': source(
    'Spandex fiber', MFA, 'https://cameo.mfa.org/wiki/Spandex_fiber', 'indexed-text',
    'Description and properties: segmented polyurethane, stretch and recovery; chlorine degradation.',
    'Historical brand ownership information is not adopted; current brand terminology uses the LYCRA Company FAQ.',
  ),
  'lycra-terminology': source(
    'Quality (LYCRA) — Frequently asked questions', 'The LYCRA Company',
    'https://one.lycra.com/en/lycra-frequently-asked-questions/quality-lycra', 'indexed-text',
    'Spandex/elastane generic names, LYCRA brand distinction and manufacturer-led garment care.',
  ),
  'cotton-inc-knits': source(
    'Knit Basics', 'Cotton Incorporated', 'https://cottonworks.com/learning-hub/knitting/knit-basics/',
    'indexed-text', 'Intermeshing yarn loops allow construction-driven fabric stretch.',
  ),
  'cameo-rayon': source(
    'Rayon fiber', MFA, 'https://cameo.mfa.org/wiki/Rayon_fiber', 'page-text',
    'Regenerated cellulose, viscose, high-wet-modulus variants and dry/wet strength data.',
  ),
  'lenzing-technologies': source(
    'Fiber Technologies: Explore Lenzing\'s Production Processes', 'Lenzing AG',
    'https://www.lenzing.com/technology-production/technologies/', 'indexed-text',
    'Lyocell process; viscose and modal processes, including modal high wet strength.',
    'Manufacturer technical explanation; comparative superiority and environmental marketing claims are not adopted.',
  ),
  'cameo-collagen': source(
    'Collagen', MFA, 'https://cameo.mfa.org/wiki/Collagen', 'page-text',
    'Fibrous protein in skin/hide; tanning stabilizes collagen.',
  ),
  'cci-leather': source(
    'Caring for leather, skin and fur — Preventive conservation guidelines for collections',
    'Canadian Conservation Institute',
    'https://www.canada.ca/en/conservation-institute/services/preventive-conservation/guidelines-collections/caring-leather-skin-fur.html',
    'indexed-text', 'Skin structure and processing; grain modification; water, light, heat and humidity effects.',
    'Collections-conservation scope; quantitative museum storage prescriptions are not adopted for garments.',
  ),
  'cameo-imitation-leather': source(
    'Imitation leather', MFA, 'https://cameo.mfa.org/wiki/Imitation_leather', 'page-text',
    'Description: plastic-coated materials, polyurethane/vinyl and manufactured imitation surfaces.',
  ),
  'isu-leather-care': source(
    'Leather Care Tips (reviewed March 2024)', 'Iowa State University Extension and Outreach',
    'https://blogs.extension.iastate.edu/answerline/2015/03/23/leather-care-tips/', 'page-text',
    'Garment care: soft brushing of suede, air drying away from heat, ventilation and professional stain cleaning.',
    'General garment guidance; product finish and manufacturer instructions still govern.',
  ),
  'lrl-suede': source(
    'Suede and Nubuck Leather', 'Leather Research Laboratory', 'https://leatherusa.org/suede-nubuck-leather',
    'page-text', 'Suede definition: abrasive buffing, velvet-like nap and normal use of split leather; nubuck distinction.',
    'A material definition, not a suede-care reference.',
  ),
  'cameo-faux-suede': source(
    'Faux suede', MFA, 'https://cameo.mfa.org/wiki/Faux_suede', 'page-text',
    'Description: synthetic materials imitate suede appearance and feel.',
  ),
  'cameo-abaca': source(
    'Abaca', MFA, 'https://cameo.mfa.org/wiki/Abaca', 'indexed-text',
    'Description: Musa textilis, Philippine origin, composition, strength, applications and variable texture/color.',
    'Marine cordage use and resistance to swelling do not establish water repellency or finished-product washability.',
  ),
  'philfida-abaca-standard': source(
    'Philippine National Standards — Abaca Good Agricultural Practices',
    'Department of Agriculture / Bureau of Agriculture and Fisheries Standards; hosted by PhilFIDA',
    'https://philfida.da.gov.ph/images/Publications/PNS/pns-pub-template-non-food-crop-abaca-gap.pdf',
    'indexed-text', 'Definition 3.21: overlapping leaf sheaths form the pseudostem and contain the fiber.',
    'Checked the relevant indexed passage, not the complete document; agricultural scope.',
  ),
  'philfida-technoguide': source(
    'Abaca Technoguide, 2024 edition', 'Philippine Fiber Industry Development Authority',
    'https://philfida.da.gov.ph/images/Publications/Technoguides/abaca-technoguide-2024.pdf',
    'indexed-text', 'Principal uses; methods of fiber extraction from leaf sheaths.',
    'Checked accessible indexed passages; this is not a finished-product care guide.',
  ),
  'philfida-roadmap': source(
    'The Philippine Abaca Industry Roadmap 2021–2025', 'Philippine Fiber Industry Development Authority',
    'https://philfida.da.gov.ph/images/the-philippine-abaca-industry-roadmap/the-philippine-abaca-industy-roadmap-2021-2025.pdf',
    'indexed-text', 'Glossary, page 123: tinagak strands used in weaving sinamay; tuxy leaf-sheath extraction.',
    'Checked the relevant indexed passages, not the complete roadmap; no garment-care verification.',
  ),
  'abaca-water-study': source(
    'Effect of alkali treatment on water absorption of single cellulosic abaca fiber (2012)',
    'Punyamurthy et al., BioResources 7(3), 3515–3524',
    'https://bioresources.cnr.ncsu.edu/resources/effect-of-alkali-treatment-on-water-absorption-of-single-cellulosic-abaca-fiber/',
    'indexed-text', 'Abstract and water-absorption experiment: untreated fibers absorb water; treatment changes uptake.',
    'Single-fiber immersion study, not a finished-textile repellency or care test. Its inaccurate bast-fiber description is not adopted.',
  ),
  'ginetex-care': source(
    'Care symbols — ISO 3758:2023', 'GINETEX', 'https://www.ginetex.net/GB/labelling/care-symbols.asp',
    'page-text', 'Washing, bleaching, drying, ironing and professional-care guidance; the article care label governs.',
    'Checked public guidance, not the complete ISO standard. Fiber content alone does not determine permitted care.',
  ),
  'aatcc-tm20-scope': source(
    'AATCC TM20-2021 — Fiber Analysis: Qualitative, public purpose and scope', 'AATCC',
    'https://members.aatcc.org/store/tm20/485/', 'indexed-text',
    'Public scope describes physical, chemical and microscopic fiber-identification techniques.',
    'Only the public summary was checked, not the paid method. It does not evaluate TELA-TELL or prove photo identification is impossible.',
  ),
} as const;

export type FiberProfileSourceId = keyof typeof FIBER_PROFILE_SOURCES;

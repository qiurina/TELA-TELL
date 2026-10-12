import type { SupportedFabric } from '@/data/fabrics/fabrics';
import type { FiberProfileSourceId } from '@/data/fabrics/fiber-profile-sources';

/** Educational copy only. Never substitute these passages for operational FiberProfile fields. */
export type ProfileStatement = {
  text: string;
  verification: {
    status: 'supported' | 'qualified' | 'observation' | 'guidance';
    scope: 'fiber' | 'fabric' | 'material' | 'identification' | 'finished-product';
    sourceIds: FiberProfileSourceId[];
    /** Explains qualifications and distinguishes descriptive clues from validated tests. */
    note?: string;
  };
};

export type FiberProfileEducation = {
  displayName: string;
  classification: ProfileStatement;
  about: {
    origin: ProfileStatement;
    description: ProfileStatement;
    properties: ProfileStatement[];
  };
  look: {
    photos: ProfileStatement;
    handling: ProfileStatement;
    similarAppearances: ProfileStatement;
    limitations: ProfileStatement;
  };
  care: ProfileStatement[];
};

function statement(
  text: string,
  status: ProfileStatement['verification']['status'],
  scope: ProfileStatement['verification']['scope'],
  sourceIds: FiberProfileSourceId[],
  note?: string,
): ProfileStatement {
  return { text, verification: { status, scope, sourceIds, note } };
}

function observation(text: string, scope: 'fabric' | 'material' | 'identification'): ProfileStatement {
  return statement(text, 'observation', scope, [],
    'Educational observation or plausible comparison; not individually validated as an identification test.');
}

export const PROFILE_IDENTIFICATION_REMINDER = statement(
  'These are possible appearances, not proof of composition. Blends, dyes, finishes and fabric construction can change what you see. Check the material label when available.',
  'qualified', 'identification', ['aatcc-tm20-scope', 'cameo-mercerized-cotton', 'cameo-polyester'],
  'Practical limitation inferred from shared and variable appearances. The references do not measure app accuracy.',
);

export const PROFILE_CARE_REMINDER = statement(
  'Follow the item\'s care label or manufacturer\'s instructions. General material guidance does not replace them.',
  'guidance', 'finished-product', ['ginetex-care'],
);

export const PROFILE_PREDICTION_NOTICE = 'Predicted material — this scan does not confirm fiber composition.';
export const PROFILE_REFERENCE_CAPTION = 'Example reference swatch. Appearance varies.';

export const FIBER_PROFILE_EDUCATION: Record<SupportedFabric, FiberProfileEducation> = {
  Cotton: {
    displayName: 'Cotton',
    classification: statement('Natural plant fiber', 'supported', 'fiber', ['cameo-cotton']),
    about: {
      origin: statement('Cotton comes from the seed hairs of Gossypium plants.', 'supported', 'fiber', ['cameo-cotton']),
      description: statement('Cotton is made mainly of cellulose and is used in clothing and household textiles.', 'supported', 'fiber', ['cameo-cotton']),
      properties: [
        statement('Its fibers absorb moisture and have limited natural elasticity.', 'supported', 'fiber', ['cameo-natural-fiber']),
        statement('Cotton fibers generally become stronger when wet.', 'supported', 'fiber', ['cotton-inc-fibers']),
        observation('Finished cotton fabrics vary widely in thickness, softness and texture.', 'fabric'),
      ],
    },
    look: {
      photos: statement('Some fabrics show fine surface fuzz or visible yarn texture. Mercerized cotton may look shinier.', 'qualified', 'fabric', ['cameo-mercerized-cotton'], 'Mercerized luster is supported; fuzz and yarn texture are non-diagnostic observations.'),
      handling: observation('Some constructions crease readily. Softness and stretch vary.', 'fabric'),
      similarAppearances: observation('Linen, rayon and cotton-polyester blends.', 'identification'),
      limitations: observation('Fuzz, wrinkles and weave pattern do not establish cotton content.', 'identification'),
    },
    care: [
      statement('Use the permitted washing and drying methods. Check bleach permission; some garments shrink during laundering.', 'guidance', 'finished-product', ['ginetex-care', 'uga-fibers']),
    ],
  },
  Wool: {
    displayName: 'Wool',
    classification: statement('Natural animal fiber', 'supported', 'fiber', ['cameo-wool']),
    about: {
      origin: statement('This profile covers wool from sheep fleece.', 'supported', 'fiber', ['cameo-wool']),
      description: statement('Sheep wool is made mainly of keratin, a protein. Its natural waviness, called crimp, contributes to resilience.', 'supported', 'fiber', ['cameo-wool', 'woolmark-fiber']),
      properties: [
        statement('Wool absorbs moisture vapor. Fiber fineness influences how it feels.', 'supported', 'fiber', ['woolmark-fiber', 'wool-diameter-review']),
        statement('Some wool articles can felt or shrink during unsuitable washing.', 'qualified', 'finished-product', ['uga-fibers', 'woolmark-wash'], 'Treatments and permitted washing methods vary; not every wool article felts under any wet treatment.'),
      ],
    },
    look: {
      photos: statement('Wool textiles may look hairy, lofty, smooth or felted. Combed worsted fabrics can have little visible fuzz.', 'qualified', 'fabric', ['cameo-worsted'], 'Smooth worsted construction is supported; the appearance list is descriptive, not diagnostic.'),
      handling: statement('Some fabrics feel springy after gentle compression; coarser fibers may feel prickly.', 'qualified', 'fabric', ['woolmark-fiber', 'wool-diameter-review'], 'Handling is required. Fiber diameter affects prickle; it is not universal to wool or proof of composition.'),
      similarAppearances: observation('Acrylic, cashmere, alpaca and blends.', 'identification'),
      limitations: observation('Fuzziness or softness alone does not identify sheep wool.', 'identification'),
    },
    care: [
      statement('Wash only by the permitted method, using a suitable wool detergent. Follow drying instructions and avoid excessive agitation.', 'guidance', 'finished-product', ['woolmark-wash']),
    ],
  },
  Silk: {
    displayName: 'Silk',
    classification: statement('Natural animal fiber', 'supported', 'fiber', ['cameo-silk']),
    about: {
      origin: statement('Cultivated silk commonly comes from Bombyx mori silkworm cocoons.', 'supported', 'fiber', ['cameo-silk', 'fao-silk']),
      description: statement('Silk\'s main structural protein is fibroin. Silk can be reeled as long filaments.', 'supported', 'fiber', ['fao-silk']),
      properties: [
        statement('Wetting can reduce fiber strength, and prolonged light exposure can weaken silk.', 'supported', 'fiber', ['fao-silk']),
      ],
    },
    look: {
      photos: observation('Some fabrics show a smooth surface, sheen and flowing folds; other silk constructions look crisp or textured.', 'fabric'),
      handling: observation('Feel and flexibility vary. Changing the viewing angle may reveal differences in sheen.', 'fabric'),
      similarAppearances: observation('Polyester satin, rayon and acetate fabrics.', 'identification'),
      limitations: statement('Satin describes a weave, not a fiber. Shine does not confirm silk.', 'qualified', 'identification', ['cameo-satin'], 'Satin construction is supported; shine alone is not a validated silk test.'),
    },
    care: [
      statement('Use a silk-suitable, permitted cleaning method. Avoid chlorine bleach and prolonged direct sunlight.', 'guidance', 'finished-product', ['uga-fibers', 'fao-silk', 'ginetex-care']),
    ],
  },
  Linen: {
    displayName: 'Linen',
    classification: statement('Natural plant fiber', 'supported', 'fiber', ['cameo-flax']),
    about: {
      origin: statement('Linen is made from flax-stem fibers, from Linum usitatissimum.', 'supported', 'fiber', ['cameo-flax']),
      description: statement('Flax is a cellulose-based fiber used to make linen textiles.', 'supported', 'fiber', ['cameo-linen', 'cameo-natural-fiber']),
      properties: [
        statement('Flax fibers are strong, absorbent and have limited natural stretch.', 'supported', 'fiber', ['cameo-linen', 'cameo-natural-fiber']),
        observation('Finished linen fabrics vary in softness and flexibility.', 'fabric'),
      ],
    },
    look: {
      photos: statement('Some fabrics show thicker yarn sections, called slubs, and visible creases.', 'qualified', 'fabric', ['cotton-inc-yarns', 'uga-fibers'], 'Slub terminology and linen creasing are supported; their occurrence is not a composition test.'),
      handling: observation('Some feel crisp or crease readily; processed linen can feel softer.', 'fabric'),
      similarAppearances: observation('Cotton, ramie, hemp and linen-look synthetics.', 'identification'),
      limitations: statement('Slubs can be manufactured in other fibers. Wrinkles and plain weave do not prove linen.', 'qualified', 'identification', ['cotton-inc-yarns'], 'Manufactured slubs are documented yarn effects; the visual limitation is a practical inference.'),
    },
    care: [
      statement('Follow the permitted washing, drying and pressing methods, including any instructions for finishes or embellishments.', 'guidance', 'finished-product', ['ginetex-care']),
    ],
  },
  Polyester: {
    displayName: 'Polyester',
    classification: statement('Synthetic fiber', 'supported', 'fiber', ['cameo-polyester']),
    about: {
      origin: statement('Polyester is manufactured from synthetic polymers.', 'supported', 'fiber', ['cameo-polyester']),
      description: statement('Polyester is a family of manufactured fibers. PET is used in textile polyester; fiber forms and finishes vary.', 'supported', 'fiber', ['cameo-polyester']),
      properties: [
        statement('Polyester fibers generally absorb little moisture.', 'supported', 'fiber', ['cameo-polyester']),
        statement('Many polyester textiles resist creasing, but stretch, shrinkage and wrinkle behavior vary with yarns, construction, heat-setting and finishing.', 'qualified', 'fabric', ['cameo-polyester', 'uga-fibers'], 'General tendencies do not guarantee that a garment will keep its size, resist wrinkles or have a fixed amount of stretch.'),
        statement('Low fiber absorption does not by itself tell how a fabric wicks, dries or lets air through.', 'qualified', 'fabric', ['cameo-polyester', 'cotton-inc-moisture'], 'Separates fiber uptake from fabric performance; the technology example is not a test of all polyester textiles.'),
      ],
    },
    look: {
      photos: observation('Polyester fabrics can look shiny, matte, smooth, fuzzy or textured.', 'fabric'),
      handling: observation('Some resist creasing; feel depends on yarns and finishing.', 'fabric'),
      similarAppearances: observation('Nylon, silk, rayon and blends.', 'identification'),
      limitations: observation('Polyester has no single identifying surface. Shine or crease resistance does not confirm it.', 'identification'),
    },
    care: [
      statement('Observe permitted drying and ironing temperatures. Use an article-appropriate method for oily stains.', 'guidance', 'finished-product', ['cameo-polyester', 'ginetex-care']),
    ],
  },
  Nylon: {
    displayName: 'Nylon',
    classification: statement('Synthetic fiber', 'supported', 'fiber', ['cameo-nylon']),
    about: {
      origin: statement('Nylon is manufactured from polymers called polyamides.', 'supported', 'fiber', ['cameo-nylon']),
      description: statement('Nylon is a family of manufactured fibers used in clothing, hosiery and technical textiles.', 'supported', 'fiber', ['cameo-nylon']),
      properties: [
        statement('Many nylon fibers have good strength, abrasion resistance and elasticity.', 'qualified', 'fiber', ['cameo-nylon', 'uga-fibers'], 'A general fiber tendency, not a durability or stretch rating for every garment.'),
        statement('Typical nylon fibers absorb less moisture than cotton or wool, but more than common PET polyester.', 'qualified', 'fiber', ['cameo-nylon', 'cameo-synthetic-fiber', 'cameo-natural-fiber'], 'Comparison uses typical fiber moisture-regain values, not whole-fabric drying or wicking.'),
      ],
    },
    look: {
      photos: observation('Fabrics may look smooth, glossy, matte or textured.', 'fabric'),
      handling: observation('Flexibility and stretch vary with construction.', 'fabric'),
      similarAppearances: observation('Polyester and other synthetic or stretch fabrics.', 'identification'),
      limitations: observation('A smooth surface, grid pattern or stretchy construction does not establish nylon content.', 'identification'),
    },
    care: [
      statement('Observe permitted heat settings. Follow any special instructions for coatings or water-resistant finishes.', 'guidance', 'finished-product', ['cameo-nylon', 'ginetex-care']),
    ],
  },
  Acrylic: {
    displayName: 'Acrylic',
    classification: statement('Synthetic fiber', 'supported', 'fiber', ['cameo-acrylic']),
    about: {
      origin: statement('Acrylic is manufactured from polymers mainly containing acrylonitrile.', 'supported', 'fiber', ['cameo-acrylic']),
      description: statement('Acrylic is used in sweaters, blankets and wool-like textiles.', 'supported', 'fiber', ['cameo-synthetic-applications']),
      properties: [
        statement('Its fibers absorb little moisture.', 'supported', 'fiber', ['cameo-acrylic']),
        statement('Some fabrics develop static or pills.', 'qualified', 'fabric', ['uga-fibers'], 'Possible fabric behaviors, not inevitable.'),
        observation('Fabric structure influences bulk and feel.', 'fabric'),
      ],
    },
    look: {
      photos: observation('Some knits show fluffy yarns, surface hairs or pills.', 'fabric'),
      handling: observation('Softness and thickness vary.', 'fabric'),
      similarAppearances: observation('Wool, polyester fleece and blended sweater fabrics.', 'identification'),
      limitations: observation('Hairiness and pilling occur in other materials and do not prove acrylic content.', 'identification'),
    },
    care: [
      statement('Avoid excessive heat. Follow the item\'s drying instructions to preserve its shape.', 'guidance', 'finished-product', ['cameo-acrylic', 'ginetex-care']),
    ],
  },
  Spandex: {
    displayName: 'Spandex / Elastane',
    classification: statement('Synthetic elastic fiber', 'supported', 'fiber', ['cameo-spandex']),
    about: {
      origin: statement('Spandex, also called elastane, is made from segmented polyurethane.', 'supported', 'fiber', ['cameo-spandex', 'lycra-terminology']),
      description: statement('It is commonly combined with other fibers. LYCRA is a brand name.', 'supported', 'fiber', ['cameo-spandex', 'lycra-terminology']),
      properties: [
        statement('Spandex fibers can stretch substantially and recover toward their original shape.', 'supported', 'fiber', ['cameo-spandex']),
        observation('A finished garment\'s stretch and recovery also depend on its construction and condition.', 'fabric'),
      ],
    },
    look: {
      photos: observation('Appearance alone does not confirm spandex content.', 'identification'),
      handling: observation('A suitable fabric may stretch and recover, but construction also affects this response.', 'fabric'),
      similarAppearances: observation('Elastic knits and other stretch fabrics.', 'identification'),
      limitations: statement('Knitted loops can stretch without spandex. Check the composition label for spandex or elastane.', 'qualified', 'identification', ['cotton-inc-knits', 'lycra-terminology'], 'Construction-driven stretch is documented; stretch is not a unique composition test.'),
    },
    care: [
      statement('For items containing spandex, follow the finished product\'s care instructions, including those for its other fibers and finishes.', 'guidance', 'finished-product', ['lycra-terminology', 'ginetex-care']),
      statement('Heat and chlorine can damage elastic fibers. Use only the washing, drying and bleaching methods permitted for the item.', 'guidance', 'finished-product', ['cameo-spandex', 'uga-fibers', 'ginetex-care'], 'Elastic-fiber resistance varies; this is not a universal wash or bleach prescription.'),
    ],
  },
  Rayon: {
    displayName: 'Rayon / Viscose',
    classification: statement('Regenerated cellulosic fiber', 'supported', 'fiber', ['cameo-rayon']),
    about: {
      origin: statement('Rayon is made by processing cellulose and forming it into new fibers, often from wood pulp.', 'supported', 'fiber', ['cameo-rayon', 'lenzing-technologies']),
      description: statement('Viscose is a common type of rayon. Modal and lyocell are related regenerated-cellulose fibers with different processes and properties; use the specific fiber name when known.', 'qualified', 'fiber', ['cameo-rayon', 'lenzing-technologies'], 'The educational distinction does not change the app\'s existing Rayon aliases or imply the scanner distinguishes these subtypes.'),
      properties: [
        statement('Conventional viscose is absorbent and can lose strength when wet.', 'supported', 'fiber', ['cameo-rayon']),
        statement('Do not apply conventional viscose\'s wet-strength behavior to every modal or lyocell product.', 'qualified', 'finished-product', ['lenzing-technologies', 'cameo-rayon'], 'Production and fiber variants differ; this is not a universal care or wet-strength rating for modal or lyocell.'),
      ],
    },
    look: {
      photos: observation('Some fabrics show smooth surfaces, soft sheen or flowing folds.', 'fabric'),
      handling: observation('Feel and movement depend on construction.', 'fabric'),
      similarAppearances: observation('Silk, cotton, linen, polyester and other regenerated-cellulose fabrics.', 'identification'),
      limitations: observation('Drape and sheen do not establish rayon content or distinguish viscose, modal and lyocell.', 'identification'),
    },
    care: [
      statement('Check the specific fiber name and finished item\'s care instructions. Handle washable, delicate viscose gently when wet; avoid wringing and follow its drying instructions.', 'guidance', 'finished-product', ['cameo-rayon', 'ginetex-care'], 'Viscose-specific precaution; not a rule that every regenerated-cellulose article requires hand washing.'),
    ],
  },
  Leather: {
    displayName: 'Leather',
    classification: statement('Animal-hide material', 'supported', 'material', ['cameo-collagen', 'cci-leather']),
    about: {
      origin: statement('Leather is animal hide or skin stabilized through tanning.', 'supported', 'material', ['cameo-collagen', 'cci-leather']),
      description: statement('Leather contains a network of collagen fibers. It is processed hide rather than a single textile fiber.', 'supported', 'material', ['cameo-collagen', 'cci-leather']),
      properties: [
        statement('Thickness, flexibility, appearance and response to moisture vary with the hide, processing and finish.', 'supported', 'material', ['cci-leather']),
      ],
    },
    look: {
      photos: statement('Surfaces may show grain, pebbling, smooth coatings or creases.', 'qualified', 'material', ['cci-leather', 'isu-leather-care'], 'Documented possible surfaces, not authentication criteria.'),
      handling: observation('Flexibility and surface feel vary; neither authenticates the material.', 'identification'),
      similarAppearances: statement('PU- or PVC-coated imitation leather.', 'qualified', 'identification', ['cameo-imitation-leather'], 'Imitation materials are documented; no pairwise photo-authentication test was verified.'),
      limitations: statement('Grain may be embossed on genuine or imitation materials. Surface photographs alone do not authenticate leather.', 'qualified', 'identification', ['cci-leather', 'cameo-imitation-leather'], 'Shared manufactured grain supports a cautious limitation, not a measurement of scanner accuracy.'),
    },
    care: [
      statement('Follow the finished product\'s instructions for its particular leather finish. Use cleaners or conditioners only when approved for that item.', 'guidance', 'finished-product', ['cci-leather', 'isu-leather-care'], 'No universal cleaner, conditioner or washing method is recommended.'),
      statement('If it gets wet, follow its drying instructions; leather garments are generally air-dried away from heat. Store away from persistent dampness and direct heat.', 'guidance', 'finished-product', ['isu-leather-care'], 'Garment guidance; other leather products and specialized finishes may need different treatment.'),
    ],
  },
  Suede: {
    displayName: 'Suede',
    classification: statement('Animal-hide material; type of leather', 'supported', 'material', ['lrl-suede']),
    about: {
      origin: statement('Suede is leather with a buffed, raised surface, commonly made from split hide.', 'supported', 'material', ['lrl-suede']),
      description: statement('Its fine surface fibers form a velvet-like layer called nap.', 'supported', 'material', ['lrl-suede']),
      properties: [
        statement('Softness and flexibility vary with the material and finish.', 'qualified', 'material', ['cci-leather'], 'General leather variation, not a quantified comparison of every suede product.'),
      ],
    },
    look: {
      photos: statement('A fine, fuzzy nap may show areas of different shading.', 'qualified', 'material', ['lrl-suede'], 'The nap is documented; directional shading is a descriptive observation, not an authentication test.'),
      handling: observation('The surface may feel soft; changing the nap direction can change its appearance.', 'material'),
      similarAppearances: statement('Nubuck, synthetic microsuede and brushed textiles.', 'qualified', 'identification', ['lrl-suede', 'cameo-faux-suede'], 'Nubuck and faux suede are documented; the list is an educational comparison, not a validated discrimination method.'),
      limitations: statement('Synthetic materials can imitate suede\'s nap. Softness and directional shading do not confirm animal origin.', 'qualified', 'identification', ['cameo-faux-suede'], 'Documented imitation supports the limitation; softness requires touch.'),
    },
    care: [
      statement('Use the finished product\'s recommended cleaning method. Brush gently only when suitable for its finish; seek appropriate specialist cleaning for difficult stains.', 'guidance', 'finished-product', ['isu-leather-care'], 'General garment advice; do not apply a shoe-cleaning method to every suede article.'),
      statement('Follow its storage instructions. Suede garments generally benefit from ventilation, away from direct heat and persistent dampness.', 'guidance', 'finished-product', ['isu-leather-care']),
    ],
  },
  Abaca: {
    displayName: 'Abaca / Manila Hemp',
    classification: statement('Natural plant fiber', 'supported', 'fiber', ['cameo-abaca']),
    about: {
      origin: statement('Abaca comes from the overlapping leaf sheaths of Musa textilis, a Philippine-native plant.', 'supported', 'fiber', ['cameo-abaca', 'philfida-abaca-standard']),
      description: statement('Also called Manila hemp, it is not hemp. Abaca fibers are used in rope, paper, crafts and textiles.', 'supported', 'fiber', ['cameo-abaca', 'cameo-natural-fiber', 'philfida-technoguide']),
      properties: [
        statement('Its strong, cellulose-containing fibers vary in texture with grade and processing.', 'qualified', 'fiber', ['cameo-abaca', 'philfida-technoguide'], 'Strength and texture describe fibers; they do not establish a fixed feel or durability for every finished article.'),
        statement('Abaca fibers can absorb water.', 'supported', 'fiber', ['abaca-water-study'], 'Single-fiber evidence, not a finished-product washing or water-repellency test.'),
      ],
    },
    look: {
      photos: statement('Fibers may show luster and variable thickness. Finished textiles may have open or denser constructions.', 'qualified', 'fabric', ['cameo-abaca'], 'Fiber luster and variation are documented; construction examples are non-diagnostic observations.'),
      handling: statement('Texture can range from relatively fine to firm or coarse.', 'qualified', 'fabric', ['cameo-abaca'], 'Raw-fiber texture varies; finished-product feel also depends on processing.'),
      similarAppearances: observation('Raffia, hemp, jute and sisal textiles.', 'identification'),
      limitations: statement('Color, coarse texture and open weave do not confirm abaca. Sinamay names a fabric, not a fiber species.', 'qualified', 'identification', ['philfida-roadmap'], 'Sinamay weaving is documented; the visual limitation is an educational inference.'),
    },
    care: [
      statement('Follow instructions for the finished article. Check cleaning guidance for its dyes, coatings, stiffening and shape; do not assume every abaca product has the same washing requirements.', 'guidance', 'finished-product', [], 'Conservative product-led guidance. Agricultural and raw-fiber sources do not verify abaca-specific garment-care procedures.'),
    ],
  },
};

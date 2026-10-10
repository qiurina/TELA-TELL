import {
  getAllGuides,
  getClaimSources,
  getEcoAlternativeText,
  getEcoGuidance,
} from '@/data/fabrics/eco-alternatives';
import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import {
  SOURCE_LIST,
  findUnknownSourceIds,
  getSource,
  getSourceNumber,
  resolveSources,
} from '@/data/fabrics/source-registry';
import { FIBER_PROFILES } from '@/data/fabrics/fiber-profiles';
import { ONBOARDING_SLIDES } from '@/features/onboarding/lib/onboarding-slides';
import type { EcoAlternative, EcoClaim } from '@/data/scans/mock-data';

const GUIDES = getAllGuides();
const ALTERNATIVES: EcoAlternative[] = GUIDES.flatMap((guide) => guide.ecoAlternatives);
const ALL_CLAIMS: EcoClaim[] = [
  ...ALTERNATIVES.flatMap((alt) => alt.claims ?? []),
  ...GUIDES.flatMap((guide) => guide.reuseClaims),
];

/** Words that make an environmental statement. Allowed only inside benefit/tradeoff claims. */
const ENVIRONMENT_VOCABULARY =
  /energy|emission|greenhouse|carbon|co2|pollut|sustainab|eco-?friendly|greener|environment|footprint|biodegrad|microfib|\bshed|\bland\b|\bimpact/i;

describe('source registry', () => {
  it('has unique ids and complete, linkable entries', () => {
    const ids = SOURCE_LIST.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const source of SOURCE_LIST) {
      expect(source.organization.length).toBeGreaterThan(0);
      expect(source.title.length).toBeGreaterThan(0);
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.shortName.length).toBeGreaterThan(0);
      expect(source.gist.length).toBeGreaterThan(0);
      expect(source.says.length).toBeGreaterThan(0);
      expect(source.caveats.length).toBeGreaterThan(0);
      expect(source.usedFor.length).toBeGreaterThan(0);
      expect(getSourceNumber(source.id)).toBe(ids.indexOf(source.id) + 1);
    }
  });

  it('detects references to nonexistent source ids', () => {
    expect(findUnknownSourceIds(['persson-2026', 'not-a-real-source'])).toEqual(['not-a-real-source']);
    expect(findUnknownSourceIds(undefined)).toEqual([]);
    expect(getSource('not-a-real-source')).toBeUndefined();
    expect(resolveSources(['persson-2026', 'persson-2026', 'nope']).map((s) => s.id)).toEqual([
      'persson-2026',
    ]);
  });

  it('discloses funding and scope limits for the evidence sources', () => {
    const caveats = (id: string) => getSource(id)?.caveats.join(' ') ?? '';
    expect(caveats('textile-exchange-organic-cotton-lca-2014')).toMatch(/industry-funded/i);
    expect(caveats('textile-exchange-organic-cotton-lca-2014')).toMatch(/farming and ginning only/);
    expect(caveats('textile-exchange-organic-cotton-lca-2014')).toMatch(/global average/);
    expect(caveats('textile-exchange-organic-cotton-lca-2014')).toMatch(
      /has not been verified in the critical review/,
    );
    expect(caveats('textile-exchange-organic-cotton-lca-2014')).toMatch(/formal comparative claim/);
    expect(caveats('cherrett-sei-2005')).toMatch(/BioRegional/);
    expect(caveats('cherrett-sei-2005')).toMatch(/preliminary/);
    expect(caveats('shen-2010-pet')).toMatch(/adidas AG, Lenzing AG and Wellman International funded/);
    expect(caveats('shen-2010-pet')).toMatch(/not measure microfiber shedding/);
    expect(caveats('grs-manual-4-2')).toMatch(/Older version/);
    expect(caveats('grs-quick-guide-2020')).toMatch(/Older version/);
    expect(caveats('aquafil-epd-econyl-2018')).toMatch(/expired on April 10, 2020/);
    expect(caveats('philfida-abaca-manual')).toMatch(/old and are not shown/);
    expect(caveats('shen-cellulose-2010')).toMatch(/Only the abstract could be read/);
    expect(caveats('shen-cellulose-2010')).toMatch(/Lenzing AG, which makes TENCEL/);
    expect(caveats('wendin-2016-recycled-cotton')).toMatch(/Written for H&M/);
    expect(caveats('bianco-2022-recycled-wool')).toMatch(/one company/);
    expect(caveats('wiedemann-2022-recycled-wool-sweater')).toMatch(/Australian Wool Innovation/);
    expect(caveats('wiedemann-2022-recycled-wool-sweater')).toMatch(/combines recycled content with better garment care/);
    expect(caveats('aquafil-lca-2024')).toMatch(/Comes from the maker/);
    expect(caveats('aquafil-lca-2024')).toMatch(/own standard nylon/);
    expect(caveats('van-der-velden-2014')).toMatch(/Only the abstract could be read/);
    expect(caveats('williams-2022-reishi')).toMatch(/Funded by MycoWorks Inc\./);
    expect(caveats('williams-2022-reishi')).toMatch(/should not be extrapolated to all bovine leather/);
    expect(caveats('persson-2026')).toMatch(/declares no competing financial interest/);
    expect(caveats('oleksinska-2026-bio-leather')).not.toMatch(/funding|conflicts/i);
  });
});

describe('claim-to-source mappings', () => {
  it('only references source ids that exist in the registry', () => {
    for (const claim of ALL_CLAIMS) {
      expect({ text: claim.text, unknown: findUnknownSourceIds(claim.sourceIds) }).toEqual({
        text: claim.text,
        unknown: [],
      });
    }
  });

  it('gives every certification, benefit and tradeoff claim at least one source', () => {
    for (const claim of ALL_CLAIMS) {
      if (claim.kind !== 'fact') {
        expect({ text: claim.text, sources: claim.sourceIds?.length ?? 0 }).not.toEqual({
          text: claim.text,
          sources: 0,
        });
      }
    }
  });

  it('builds each card text from its claims and lists exactly their sources', () => {
    for (const alt of ALTERNATIVES) {
      const claims = alt.claims ?? [];
      expect({ name: alt.name, count: claims.length > 0 }).toEqual({ name: alt.name, count: true });
      expect(getEcoAlternativeText(alt)).toBe(
        claims
          .filter((claim) => !claim.basisOnly)
          .map((claim) => claim.text)
          .join(' '),
      );
      expect(alt.sourceIds ?? []).toEqual(getClaimSources(claims).map((source) => source.id));
    }
  });

  it('keeps environmental wording inside benefit and tradeoff claims in the rendered text', () => {
    for (const alt of ALTERNATIVES) {
      for (const claim of alt.claims ?? []) {
        if (claim.kind === 'fact' || claim.kind === 'certification') {
          expect({ card: alt.name, text: claim.text, hit: ENVIRONMENT_VOCABULARY.test(claim.text) }).toEqual({
            card: alt.name,
            text: claim.text,
            hit: false,
          });
        }
      }
    }
  });

  it('shows no environmental wording on a card without a sourced benefit or tradeoff claim', () => {
    for (const alt of ALTERNATIVES) {
      const hasEvidence = (alt.claims ?? []).some((c) => c.kind === 'benefit' || c.kind === 'tradeoff');
      if (!hasEvidence) {
        const text = getEcoAlternativeText(alt);
        expect({ card: alt.name, hit: ENVIRONMENT_VOCABULARY.test(text) }).toEqual({
          card: alt.name,
          hit: false,
        });
      }
    }
  });

  it('shows no comparative or superlative environmental wording outside evidence claims', () => {
    const comparative = /\b(better|greener|best|cleaner|safer|more sustainable|lower impact|eco-?friendly|sustainable)\b/i;
    for (const alt of ALTERNATIVES) {
      for (const claim of alt.claims ?? []) {
        if (claim.kind === 'fact' || claim.kind === 'certification') {
          expect({ text: claim.text, hit: comparative.test(claim.text) }).toEqual({
            text: claim.text,
            hit: false,
          });
        }
      }
    }
  });

  it('pairs a benefit with its known downside where the research conflicts', () => {
    const recycledPolyester = getEcoGuidance('Polyester').ecoAlternatives[0];
    const kinds = (recycledPolyester.claims ?? []).map((claim) => claim.kind);
    expect(kinds).toEqual(['fact', 'benefit', 'tradeoff']);
    expect(recycledPolyester.sourceIds).toEqual(['shen-2010-pet', 'persson-2026']);

    const organic = getEcoGuidance('Cotton').ecoAlternatives[0];
    expect((organic.claims ?? []).map((claim) => claim.kind)).toEqual([
      'fact',
      'benefit',
      'tradeoff',
      'certification',
      'benefit',
    ]);
    expect(organic.sourceIds).toEqual([
      'cherrett-sei-2005',
      'gots-8-0',
      'textile-exchange-organic-cotton-lca-2014',
    ]);

    // The industry-funded study appears on the Basis sheet with its caveat, never as card text, and
    // the card's own energy claim rests on SEI 2005 alone.
    const [energy] = (organic.claims ?? []).filter((claim) => claim.kind === 'benefit');
    expect(energy.sourceIds).toEqual(['cherrett-sei-2005']);
    const lcaClaim = (organic.claims ?? []).find((claim) =>
      claim.sourceIds?.includes('textile-exchange-organic-cotton-lca-2014'),
    );
    expect(lcaClaim?.basisOnly).toBe(true);
    expect(lcaClaim?.text).toMatch(/industry-funded/);
    expect(lcaClaim?.text).toMatch(/no formal comparison/);
    expect(getEcoAlternativeText(organic)).not.toMatch(/62%|Textile Exchange|industry-funded/);
    expect(getEcoAlternativeText(organic)).toMatch(/A 2005 study found/);
    expect(getEcoAlternativeText(organic)).toMatch(/20-50% lower/);

    // Making the fiber and washing clothes are different impacts, labeled as such.
    expect(
      (recycledPolyester.claims ?? []).filter((c) => c.aspect).map((c) => c.aspect),
    ).toEqual(['Making the fiber', 'Washing clothes']);
  });

  it('shows the organic cotton study on the Cotton cards only', () => {
    const lcaId = 'textile-exchange-organic-cotton-lca-2014';
    for (const fabric of SUPPORTED_FABRICS) {
      const ids = getEcoGuidance(fabric).ecoAlternatives.flatMap((alt) => alt.sourceIds ?? []);
      expect([fabric, ids.includes(lcaId)]).toEqual([fabric, fabric === 'Cotton']);
    }
  });

  it('has reuse evidence for resale and donate that cites the reuse review and its downside', () => {
    for (const guide of GUIDES) {
      expect(guide.reuseSourceIds).toEqual(['sandin-peters-2018']);
      expect(guide.reuseClaims.map((claim) => claim.kind)).toEqual(['benefit', 'tradeoff']);
    }
  });
});

describe('alternative cards after the audit', () => {
  it('suggests a swap only where a source we read supports it, and pads nothing', () => {
    const names = (fabric: (typeof SUPPORTED_FABRICS)[number]) =>
      getEcoGuidance(fabric).ecoAlternatives.map((alt) => alt.name);

    expect(names('Cotton')).toEqual(['Organic cotton', 'Recycled cotton (rCotton)', 'TENCEL / lyocell']);
    expect(names('Wool')).toEqual(['Recycled wool']);
    expect(names('Polyester')).toEqual(['Recycled polyester', 'TENCEL / lyocell blend']);
    expect(names('Nylon')).toEqual(['Recycled nylon (Econyl)']);
    for (const fabric of ['Silk', 'Linen', 'Acrylic', 'Spandex', 'Rayon', 'Leather', 'Suede', 'Abaca'] as const) {
      expect([fabric, names(fabric)]).toEqual([fabric, []]);
    }
  });

  it('has no peace silk and no abaca alternative for wool, silk, linen or rayon', () => {
    const text = ALTERNATIVES.map(getEcoAlternativeText).join('\n');
    expect(text).not.toMatch(/peace silk|ahimsa/i);
    for (const fabric of ['Wool', 'Silk', 'Linen', 'Rayon'] as const) {
      const names = getEcoGuidance(fabric).ecoAlternatives.map((alt) => alt.name.toLowerCase());
      expect(names).not.toContain('abaca');
    }
  });

  it('has no "(verified)" labels, hand-feel comparisons or local-market claims in any rendered text', () => {
    const rendered = [
      ...ALTERNATIVES.flatMap((alt) => [alt.name, getEcoAlternativeText(alt)]),
      ...GUIDES.flatMap((guide) => Object.values(guide.reuse)),
    ].join('\n');
    const banned = [
      /verified/i,
      /hand-?feel|crisper|crisp |comparable sheen|same hand/i,
      /ukay/i,
      /upcycler|popular with/i,
      /barangay textile drives|usually accept|welcome linen|limited acceptance/i,
      /sells well|steady demand|niche winter|market\b/i,
      /mindanao/i,
      /\bfibres?\b|labelling|reclaimed|certified entit/,
    ];
    for (const pattern of banned) {
      expect(rendered).not.toMatch(pattern);
    }
  });

  it('states the recycled polyester findings only under their study conditions', () => {
    const [recycled] = getEcoGuidance('Polyester').ecoAlternatives;
    const text = getEcoAlternativeText(recycled);
    expect(text).toMatch(/A 2010 life-cycle study of fiber made from recycled PET bottles found/);
    expect(text).toMatch(/40-85% less, depending on how the impacts were shared out/);
    expect(text).toMatch(/A 2026 laundering study of fabrics with 30% recycled polyester found/);
    expect(text).toMatch(/recycled once shed no clearly different amount/);
    expect(text).toMatch(/recycled two or three times shed about 4\.3 and 6\.2 times more/);
    expect(text).not.toMatch(/all recycled polyester|always|every/i);

    const shedCards = ALTERNATIVES.filter((alt) => /\bshed|microfib/i.test(getEcoAlternativeText(alt)));
    expect(shedCards.map((alt) => alt.name)).toEqual(['Recycled polyester']);
  });

  it('gives the TENCEL cards one study, with the maker-data limit next to the benefit', () => {
    const tencelCards = ALTERNATIVES.filter((alt) => /TENCEL/.test(alt.name));
    expect(tencelCards.map((card) => card.name)).toEqual(['TENCEL / lyocell', 'TENCEL / lyocell blend']);
    for (const card of tencelCards) {
      expect(card.sourceIds).toEqual(['shen-cellulose-2010']);
      const text = getEcoAlternativeText(card);
      expect(text).toMatch(/A 2010 life-cycle study using Lenzing data/);
      expect(text).toMatch(/fiber data came from Lenzing, which makes TENCEL/);
      expect(text).not.toMatch(/99\.[0-9]|solvent|less energy|lower energy/i);
    }
    const [cotton] = tencelCards;
    expect(getEcoAlternativeText(cotton)).toMatch(/cotton as the least preferred choice/);
  });

  it('attributes ECONYL claims to the maker and labels them manufacturer-reported', () => {
    const [econyl] = getEcoGuidance('Nylon').ecoAlternatives;
    const text = getEcoAlternativeText(econyl);
    expect(text).toMatch(/its maker, Aquafil, says/);
    expect(text).toMatch(/Aquafil, the maker, reports 74% lower CO2 emissions .* than for its own standard nylon/);
    expect(text).toMatch(/manufacturer-reported figure from a one-page summary/);
    expect(econyl.sourceIds).toEqual([
      'aquafil-epd-econyl-2018',
      'aquafil-sustainability-2023',
      'aquafil-lca-2024',
    ]);
    expect(text).not.toMatch(/same quality|90%|infinite|independently verified/i);
  });

  it('keeps recycled wool to the carbon-footprint finding and the industry-funded study off the card', () => {
    const [wool] = getEcoGuidance('Wool').ecoAlternatives;
    const text = getEcoAlternativeText(wool);
    expect(text).toMatch(/from one Italian producer found a carbon footprint of 0\.1-0\.9 kg CO2e per kg, against 10-103 kg CO2e per kg for virgin wool fiber/);
    expect(text).toMatch(/one company, and its virgin wool range comes mostly from literature/);
    expect(text).not.toMatch(/66-90|Australian|wool-industry/);
    const funded = (wool.claims ?? []).find((claim) =>
      claim.sourceIds?.includes('wiedemann-2022-recycled-wool-sweater'),
    );
    expect(funded?.basisOnly).toBe(true);
    expect(funded?.text).toMatch(/wool-industry-funded/);
    expect(funded?.text).toMatch(/combines recycled content with better care/);
  });

  it('keeps leather out of the suggestions and says what the evidence is', () => {
    const { ecoAlternatives, evidenceNotes } = getEcoGuidance('Leather');
    expect(ecoAlternatives).toEqual([]);
    expect(evidenceNotes.map((note) => note.kind)).toEqual(['benefit', 'tradeoff', 'fact']);
    const [reishi, coatings, none] = evidenceNotes;
    expect(reishi.sourceIds).toEqual(['williams-2022-reishi']);
    expect(reishi.text).toMatch(/funded by MycoWorks, which makes it/);
    expect(reishi.text).toMatch(/should not be extrapolated to all leather/);
    expect(coatings.sourceIds).toEqual(['oleksinska-2026-bio-leather']);
    expect(coatings.text).not.toMatch(/every |all /i);
    expect(none.sourceIds ?? []).toEqual([]);
    expect(none.text).toMatch(/no independent study/);
  });

  it('shows the 2014 benchmarking result against cotton for acrylic and spandex, not a swap', () => {
    for (const fabric of ['Acrylic', 'Spandex'] as const) {
      const { ecoAlternatives, evidenceNotes } = getEcoGuidance(fabric);
      expect(ecoAlternatives).toEqual([]);
      const vdv = evidenceNotes.find((note) => note.sourceIds?.includes('van-der-velden-2014'));
      expect(vdv?.kind).toBe('tradeoff');
      expect(vdv?.text).toMatch(/less environmental impact than fabric made of cotton/);
    }
  });

  it('describes GOTS and GRS by their scope, not as proof of a lower impact', () => {
    const gotsClaims = ALL_CLAIMS.filter((claim) => /GOTS/.test(claim.text));
    expect(gotsClaims.length).toBe(1);
    for (const claim of gotsClaims) {
      expect(claim.kind).toBe('certification');
      expect(claim.text).toMatch(/at least 70%/);
      expect(claim.sourceIds).toEqual(['gots-8-0']);
    }
    const grs = ALL_CLAIMS.find((claim) => /GRS/.test(claim.text));
    expect(grs?.kind).toBe('certification');
    expect(grs?.text).toMatch(/at least 50% recycled content/);
    expect(grs?.sourceIds).toEqual(['grs-manual-4-2', 'grs-quick-guide-2020']);
  });

  it('does not present old abaca production statistics as current', () => {
    expect(ALTERNATIVES.map(getEcoAlternativeText).join(' ')).not.toMatch(/87\.17|8\.48|Catanduanes/);
  });

  it('makes no environmental claim in the resale, donate or upcycle tips', () => {
    for (const guide of GUIDES) {
      for (const tip of Object.values(guide.reuse)) {
        expect(tip).not.toMatch(/environment|sustainab|eco-|landfill|waste|footprint|emission/i);
      }
    }
  });

  it('uses US spelling and plain words in registry text', () => {
    const registryText = SOURCE_LIST.flatMap((s) => [s.shortName, s.gist, ...s.says, ...s.caveats]).join('\n');
    expect(registryText).not.toMatch(/\bfibres?\b|labelling|reclaimed|certified entit/);
  });
});

describe('evidence behind every suggestion', () => {
  const NOTES = GUIDES.flatMap((guide) => guide.evidenceNotes);

  it('gives every suggested card a sourced benefit and a sourced limit or downside', () => {
    for (const alt of ALTERNATIVES) {
      const claims = alt.claims ?? [];
      const benefits = claims.filter((claim) => claim.kind === 'benefit');
      const limits = claims.filter((claim) => claim.kind === 'tradeoff');
      expect({ card: alt.name, benefits: benefits.length > 0, limits: limits.length > 0 }).toEqual({
        card: alt.name,
        benefits: true,
        limits: true,
      });
      for (const claim of [...benefits, ...limits]) {
        expect((claim.sourceIds ?? []).length).toBeGreaterThan(0);
      }
    }
  });

  it('shows an explanation, never a suggestion, for fibers with no supported swap', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      const guide = getEcoGuidance(fabric);
      if (guide.ecoAlternatives.length === 0) {
        const unsourcedFacts = guide.evidenceNotes.filter(
          (note) => note.kind === 'fact' && (note.sourceIds ?? []).length === 0,
        );
        expect([fabric, unsourcedFacts.length > 0]).toEqual([fabric, true]);
        expect(unsourcedFacts.map((note) => note.text).join(' ')).toMatch(/no (independent )?study|We found no/);
      }
    }
    const mixed = getEcoGuidance('not a real fabric xyz');
    expect(mixed.ecoAlternatives).toEqual([]);
    expect(mixed.context.kind).toBe('mixed');
  });

  it('gives every sourced note a registry source', () => {
    for (const note of NOTES) {
      expect(findUnknownSourceIds(note.sourceIds)).toEqual([]);
      if (note.kind !== 'fact') {
        expect((note.sourceIds ?? []).length).toBeGreaterThan(0);
      }
    }
  });

  it('only states numbers that appear in the cited source records', () => {
    const claims = [...ALL_CLAIMS, ...NOTES].filter((claim) => (claim.sourceIds ?? []).length > 0);
    for (const claim of claims) {
      const pool = (claim.sourceIds ?? [])
        .map((id) => getSource(id))
        .flatMap((source) => (source ? [source.title, source.gist, ...source.says] : []))
        .join(' ')
        .replace(/,/g, '');
      const numbers = (claim.text.match(/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?/g) ?? []).filter(
        (token) => !/^(19|20)\d\d$/.test(token),
      );
      for (const token of numbers) {
        expect({ text: claim.text, token, found: pool.includes(token) }).toEqual({
          text: claim.text,
          token,
          found: true,
        });
      }
    }
  });
});

describe('app wording', () => {
  it('keeps no sustainability score, rating or label on any fiber profile', () => {
    for (const profile of Object.values(FIBER_PROFILES)) {
      const keys = Object.keys(profile);
      expect(keys.filter((key) => /sustainab|breakdown/i.test(key))).toEqual([]);
    }
  });

  it('keeps the onboarding copy free of environmental-superiority claims', () => {
    const text = JSON.stringify(ONBOARDING_SLIDES);
    expect(text).not.toMatch(/greener|eco-friendly|how eco/i);
    expect(text).toMatch(/Other fabrics to consider/);
  });
});

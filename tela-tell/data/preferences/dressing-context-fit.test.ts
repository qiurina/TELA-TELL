import { getDressingContextFits } from '@/data/preferences/dressing-context-fit';
import { DRESSING_CONTEXT_OPTIONS } from '@/data/preferences/occasion-weather';
import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';

const ALL_CONTEXTS = DRESSING_CONTEXT_OPTIONS.map((option) => option.id);

describe('Insights weather and occasion sentences', () => {
  it('never shows prediction percentages or calls predictions a blend', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      for (const compositions of [
        [{ material: fabric, percentage: 85 }],
        [
          { material: fabric, percentage: 70 },
          { material: 'Polyester', percentage: 25 },
        ],
      ]) {
        for (const fit of getDressingContextFits(ALL_CONTEXTS, fabric, compositions)) {
          expect(fit.summary).not.toMatch(/\d|%|blend|mix has/i);
        }
      }
    }
  });

  it('names the top fiber as the most likely fiber in a strong match', () => {
    const [sunny] = getDressingContextFits(['sunny'], 'Linen', [{ material: 'Linen', percentage: 90 }]);
    expect(sunny.status).toBe('great');
    expect(sunny.summary).toBe('Linen, the most likely fiber, is a strong match.');
  });

  it('says a lower prediction "appears among the predictions" when it is the less ideal fiber', () => {
    const [sunny] = getDressingContextFits(['sunny'], 'Abaca', [
      { material: 'Abaca', percentage: 70 },
      { material: 'Polyester', percentage: 30 },
    ]);
    expect(sunny.summary).toMatch(/^The predictions include .+ and Polyester\. This item may work for some uses, but check the label/);
  });

  it('describes a less ideal top fiber with the reason from the guide', () => {
    const [sunny] = getDressingContextFits(['sunny'], 'Polyester', [{ material: 'Polyester', percentage: 90 }]);
    expect(sunny.status).toBe('poor');
    expect(sunny.summary).toBe('Polyester, the most likely fiber, is less ideal here. Traps heat and sweat in bright sun.');
  });
});

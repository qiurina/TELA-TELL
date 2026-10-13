import type { FiberProfile } from '@/data/fabrics/fiber-profiles';
import { FIBER_SHEDDING_INFO } from '@/data/fabrics/shedding-why';

export type EnvironmentalSummary = {
  microplasticShedding: string;
};

export function getEnvironmentalSummary(profile: FiberProfile): EnvironmentalSummary {
  const microplasticShedding = FIBER_SHEDDING_INFO[profile.fabric].value;

  return { microplasticShedding };
}

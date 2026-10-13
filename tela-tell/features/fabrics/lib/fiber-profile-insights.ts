import type { FiberProfile } from '@/data/fabrics/fiber-profiles';
import { FIBER_SHEDDING_INFO } from '@/data/fabrics/shedding-why';

export type EnvironmentalSummary = {
  microplasticShedding: string;
};

export function getEnvironmentalSummary(profile: FiberProfile): EnvironmentalSummary {
  // High / Moderate for the four synthetic fibers (the same levels as FIBER_RISK_LEVELS in
  // synthetic-health-risk.ts, which a test checks); "Not rated" for every other fiber, because the
  // shedding references do not support a level for them. This used to read "Low" for every natural
  // fiber, which the cotton and wool laundering studies contradict, and "Moderate" for Rayon only
  // because its fiber type contains the word "synthetic".
  const microplasticShedding = FIBER_SHEDDING_INFO[profile.fabric].value;

  return { microplasticShedding };
}

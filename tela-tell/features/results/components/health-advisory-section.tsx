import { useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';

import { SectionLabel } from '@/components/ui/section-label';
import { getAllergyAlert } from '@/data/fabrics/fabric-allergies';
import { HEALTH_ADVISORY_LABEL, getFiberStatusAdvisory } from '@/data/fabrics/health-advisory';
import type { SyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';
import type { FabricComposition } from '@/data/scans/mock-data';
import {
  getUserPreferencesSnapshot,
  subscribeUserPreferences,
} from '@/features/profile/lib/user-preferences';
import { AllergyAlertCard } from '@/features/results/components/allergy-alert-card';
import { FiberStatusCard } from '@/features/results/components/fiber-status-card';
import { SyntheticHealthRiskCard } from '@/features/results/components/synthetic-health-risk-card';

type HealthAdvisorySectionProps = {
  dominantFabric: string;
  compositions: FabricComposition[];
  isUnsure: boolean;
  /** The rated shedding level, for the four synthetic fibers; null otherwise. */
  healthRisk: SyntheticHealthRisk | null;
  /** Opens Eco tips. Omit on Eco tips itself. */
  onReduceShedding?: () => void;
  /** The sensitivity alert is shown on Scan results only. */
  showSensitivity?: boolean;
};

/**
 * Scan results' "Health risk advisory": the shedding card for every fiber the app can name (the
 * app's estimated level for synthetics, a fiber status for the rest), and a sensitivity reminder
 * when the scan's predictions include a fiber the person marked. Nothing for an Unsure scan.
 */
export function HealthAdvisorySection({
  dominantFabric,
  compositions,
  isUnsure,
  healthRisk,
  onReduceShedding,
  showSensitivity = true,
}: HealthAdvisorySectionProps) {
  const preferences = useSyncExternalStore(
    subscribeUserPreferences,
    getUserPreferencesSnapshot,
    getUserPreferencesSnapshot,
  );

  if (isUnsure) {
    return null;
  }

  const fiberStatus = healthRisk ? null : getFiberStatusAdvisory(dominantFabric, compositions, isUnsure);
  const allergy = getAllergyAlert(preferences.sensitiveFabrics, dominantFabric, compositions);
  const sensitivityMatch = showSensitivity && allergy?.conflictDetected ? allergy : null;

  if (!healthRisk && !fiberStatus && !sensitivityMatch) {
    return null;
  }

  return (
    <View style={styles.section}>
      <SectionLabel title={HEALTH_ADVISORY_LABEL} />
      {healthRisk ? (
        <SyntheticHealthRiskCard risk={healthRisk} onReduceShedding={onReduceShedding} />
      ) : null}
      {fiberStatus ? <FiberStatusCard advisory={fiberStatus} /> : null}
      {sensitivityMatch ? <AllergyAlertCard alert={sensitivityMatch} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
});

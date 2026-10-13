import { StyleSheet, View } from 'react-native';

import { EcoGuideSection } from '@/features/recommendations/components/eco-guide-section';
import { HealthAdvisorySection } from '@/features/results/components/health-advisory-section';
import { ECO_GUIDE } from '@/data/fabrics/eco-guide';
import { getFabricCategory, resolveFabricAlias } from '@/data/fabrics/fabrics';
import { getSyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';
import { assessScanReliability } from '@/data/scans/scan-confidence';
import { type FabricComposition } from '@/data/scans/mock-data';

type RecommendationsContentProps = {
  dominantFabric: string;
  detectedCompositions?: FabricComposition[];
};

export function RecommendationsContent({
  dominantFabric,
  detectedCompositions,
}: RecommendationsContentProps) {
  const compositions = detectedCompositions ?? [];
  const reliable = assessScanReliability(compositions).reliable;
  const fiber = reliable ? resolveFabricAlias(dominantFabric) : null;
  const healthRisk = reliable ? getSyntheticHealthRisk(dominantFabric, compositions) : null;

  return (
    <View style={styles.container}>
      <HealthAdvisorySection
        dominantFabric={dominantFabric}
        compositions={compositions}
        isUnsure={!reliable}
        healthRisk={healthRisk}
        showSensitivity={false}
      />
      {fiber ? (
        <EcoGuideSection fiber={fiber} guide={ECO_GUIDE[fiber]} isSynthetic={getFabricCategory(fiber) === 'Synthetic'} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
});

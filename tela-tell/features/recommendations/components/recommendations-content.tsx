import { StyleSheet, View } from 'react-native';

import { EcoGuideSection } from '@/features/recommendations/components/eco-guide-section';
import { SyntheticMicroplasticGuide } from '@/features/recommendations/components/synthetic-microplastic-guide';
import { ECO_GUIDE } from '@/data/fabrics/eco-guide';
import { getFabricCategory, resolveFabricAlias } from '@/data/fabrics/fabrics';
import { getSyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';
import { assessScanReliability } from '@/data/scans/scan-confidence';
import { type FabricComposition } from '@/data/scans/mock-data';

type RecommendationsContentProps = {
  dominantFabric: string;
  detectedCompositions?: FabricComposition[];
};

/**
 * Eco tips for a scan: the rated shedding card for the four synthetics, then the Microplastics & Sustainable Choices Guide for the predicted fiber. Neither
 * is shown for an Unsure scan, which names no reliable fiber.
 */
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
      {healthRisk ? <SyntheticMicroplasticGuide risk={healthRisk} /> : null}
      {fiber ? (
        <EcoGuideSection
          guide={ECO_GUIDE[fiber]}
          isSynthetic={getFabricCategory(fiber) === 'Synthetic'}
          showSummary={!healthRisk}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
});

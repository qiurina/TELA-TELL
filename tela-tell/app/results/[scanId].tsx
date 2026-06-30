import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CompositionCard } from '@/features/results/components/composition-card';
import { DualFabricResults } from '@/features/results/components/dual-fabric-results';
import { FabricPhotoPreview } from '@/features/results/components/fabric-photo-preview';
import { FabricReferenceComparison } from '@/features/results/components/fabric-reference-comparison';
import { ResultsExploreActions } from '@/features/results/components/results-explore-actions';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { ScanConfidenceBanner } from '@/features/results/components/scan-confidence-banner';
import { SellerComparisonCard } from '@/features/results/components/seller-comparison-card';
import { StatusBadges } from '@/features/results/components/status-badges';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getDualSwatchRegions } from '@/features/scan/lib/dual-swatch-results';
import { getScanResult, resolveScanId } from '@/data/scans/mock-data';
import { getFabricReference } from '@/data/fabrics/fabric-references';
import { getLastCaptureUri } from '@/features/scan/lib/last-capture';
import { getLastSellerLabel } from '@/features/scan/lib/last-seller-label';
import { clearRegionSelection } from '@/features/scan/lib/region-selection';
import { requestFreshScan } from '@/features/scan/lib/scan-fresh';

export default function ResultsScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string | string[] }>();
  const router = useRouter();
  const resolvedScanId = resolveScanId(scanId);
  const isDualDemo = resolvedScanId === 'dual';
  const result = getScanResult(resolvedScanId);
  const dualRegions = isDualDemo ? getDualSwatchRegions() : [];
  const capturedPhotoUri = getLastCaptureUri();
  const [sellerLabel, setSellerLabel] = useState<string | null>(() => getLastSellerLabel());

  useFocusEffect(
    useCallback(() => {
      setSellerLabel(getLastSellerLabel());
    }, []),
  );

  const hasSellerLabel = Boolean(sellerLabel?.trim());

  if (!result) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Scan not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.fallbackLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleViewProfile = () => {
    router.push(`/results/profile/${resolvedScanId}` as Href);
  };

  const handleEcoTips = () => {
    router.push(`/results/recommendations/${resolvedScanId}` as Href);
  };

  const handlePersonalizedInsights = () => {
    router.push(`/results/insights/${resolvedScanId}` as Href);
  };

  const handleScanAnother = () => {
    clearRegionSelection();
    requestFreshScan();
    router.push('/(tabs)/scan' as Href);
  };

  const handleAddLabel = () => {
    router.push('/modal');
  };

  const primaryReference = !isDualDemo
    ? getFabricReference(result.dominantFabric, result.compositions)
    : null;

  return (
    <View style={styles.root}>
      <ResultsScreenHeader title="Scan Results" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <FabricPhotoPreview
          imageUri={capturedPhotoUri}
          detectedFabric={
            isDualDemo ? 'Linen + Cotton swatches' : result.dominantFabric
          }
          confidence={
            isDualDemo
              ? Math.round(
                  dualRegions.reduce((sum, region) => sum + region.confidence, 0) /
                    Math.max(dualRegions.length, 1),
                )
              : result.confidence
          }
          markedRegions={
            isDualDemo
              ? dualRegions
                  .map((region) => region.region)
                  .filter((region): region is NonNullable<typeof region> => Boolean(region))
              : undefined
          }
        />

        {primaryReference ? (
          <FabricReferenceComparison
            scanImageUri={capturedPhotoUri}
            reference={primaryReference}
            detectedLabel={result.dominantFabric}
            confidence={result.confidence}
          />
        ) : null}

        {isDualDemo ? (
          <DualFabricResults regions={dualRegions} />
        ) : (
          <>
            <ScanConfidenceBanner
              confidence={result.confidence}
              dominantFabric={result.dominantFabric}
              compact
            />

            <CompositionCard compositions={result.compositions ?? []} confidence={result.confidence} />
          </>
        )}

        <StatusBadges sustainability={result.sustainability} />

        {!isDualDemo ? (
          <SellerComparisonCard
            sellerLabel={sellerLabel}
            detectedDominant={result.dominantFabric}
            compositions={result.compositions ?? []}
            mislabelingDetected={hasSellerLabel && result.mislabeling.detected}
            onAddLabel={handleAddLabel}
          />
        ) : null}

        <ResultsExploreActions
          onProfile={handleViewProfile}
          onEcoTips={handleEcoTips}
          onPersonalizedInsights={handlePersonalizedInsights}
          onScanAgain={handleScanAnother}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
    flexGrow: 1,
  },
  pressed: {
    opacity: 0.88,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: BrandColors.white,
  },
  fallbackText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: BrandColors.text,
  },
  fallbackLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primary,
  },
});

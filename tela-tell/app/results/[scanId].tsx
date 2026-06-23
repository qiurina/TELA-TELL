import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CompositionCard } from '@/components/results/composition-card';
import { FabricPhotoPreview } from '@/components/results/fabric-photo-preview';
import { ResultsExploreActions } from '@/components/results/results-explore-actions';
import { ResultsScreenHeader } from '@/components/results/results-screen-header';
import { ScanConfidenceBanner } from '@/components/results/scan-confidence-banner';
import { SellerComparisonCard } from '@/components/results/seller-comparison-card';
import { StatusBadges } from '@/components/results/status-badges';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getScanResult, resolveScanId } from '@/constants/mock-data';
import { getLastCaptureUri } from '@/lib/last-capture';
import { getLastSellerLabel } from '@/lib/last-seller-label';
import { requestFreshScan } from '@/lib/scan-fresh';

export default function ResultsScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string | string[] }>();
  const router = useRouter();
  const resolvedScanId = resolveScanId(scanId);
  const result = getScanResult(resolvedScanId);
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

  const handleRecommendations = () => {
    router.push(`/results/recommendations/${resolvedScanId}` as Href);
  };

  const handleScanAnother = () => {
    requestFreshScan();
    router.push('/(tabs)/scan' as Href);
  };

  const handleAddLabel = () => {
    router.push('/modal');
  };

  return (
    <View style={styles.root}>
      <ResultsScreenHeader title="Scan Results" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <FabricPhotoPreview imageUri={capturedPhotoUri} />

        <ScanConfidenceBanner confidence={result.confidence} dominantFabric={result.dominantFabric} />

        <CompositionCard compositions={result.compositions ?? []} confidence={result.confidence} />

        <SellerComparisonCard
          sellerLabel={sellerLabel}
          detectedDominant={result.dominantFabric}
          compositions={result.compositions ?? []}
          confidence={result.confidence}
          mislabelingDetected={hasSellerLabel && result.mislabeling.detected}
          onAddLabel={handleAddLabel}
        />

        <StatusBadges
          hasSellerLabel={hasSellerLabel}
          sustainability={result.sustainability}
          mislabeling={result.mislabeling}
        />

        <ResultsExploreActions
          onProfile={handleViewProfile}
          onEcoTips={handleRecommendations}
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

import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CompositionCard } from '@/features/results/components/composition-card';
import { DualFabricResults } from '@/features/results/components/dual-fabric-results';
import { FabricPhotoPreview } from '@/features/results/components/fabric-photo-preview';
import { ResultsExploreActions } from '@/features/results/components/results-explore-actions';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { ScanConfidenceBanner } from '@/features/results/components/scan-confidence-banner';
import { SellerComparisonCard } from '@/features/results/components/seller-comparison-card';
import { StatusBadges } from '@/features/results/components/status-badges';
import { SyntheticHealthRiskCard } from '@/features/results/components/synthetic-health-risk-card';
import { useAuth } from '@/features/auth/context/auth-provider';
import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getDualSwatchRegions } from '@/features/scan/lib/dual-swatch-results';
import { getScanResult, resolveScanId } from '@/data/scans/mock-data';
import { getSyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';
import { getFabricReference } from '@/data/fabrics/fabric-references';
import { getLastCaptureUri } from '@/features/scan/lib/last-capture';
import { getLastSellerLabel } from '@/features/scan/lib/last-seller-label';
import { clearRegionSelection } from '@/features/scan/lib/region-selection';
import { requestFreshScan } from '@/features/scan/lib/scan-fresh';

export default function ResultsScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string | string[] }>();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [showInsightsLocked, setShowInsightsLocked] = useState(false);
  const resolvedScanId = resolveScanId(scanId);
  const isDualDemo = resolvedScanId === 'dual';
  const result = getScanResult(resolvedScanId);
  const dualRegions = isDualDemo ? getDualSwatchRegions() : [];
  const capturedPhotoUri = getLastCaptureUri();
  const [sessionSellerLabel, setSessionSellerLabel] = useState<string | null>(() => getLastSellerLabel());

  useFocusEffect(
    useCallback(() => {
      setSessionSellerLabel(getLastSellerLabel());
    }, []),
  );

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

  const sellerLabel = sessionSellerLabel?.trim() || result.sellerLabel?.trim() || null;
  const hasSellerLabel = Boolean(sellerLabel);

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

  const healthRisk = !isDualDemo
    ? getSyntheticHealthRisk(result.dominantFabric, result.compositions ?? [])
    : null;

  return (
    <View style={styles.root}>
      <ScanConfirmSheet
        visible={showInsightsLocked}
        variant="info"
        title="Personalized insights locked"
        message="Sign in to see color, fit, and allergy tips tailored to your preferences."
        confirmLabel="Log in"
        cancelLabel="Not now"
        onConfirm={() => {
          setShowInsightsLocked(false);
          router.push('/login' as Href);
        }}
        onCancel={() => setShowInsightsLocked(false)}
      />

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
          referenceImage={primaryReference?.image}
          referenceTitle={primaryReference?.title}
        />

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

        {healthRisk ? <SyntheticHealthRiskCard risk={healthRisk} /> : null}

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
          personalizedInsightsLocked={!isSignedIn}
          onLockedPersonalizedInsights={() => setShowInsightsLocked(true)}
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

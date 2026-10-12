import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { NotFoundFallback } from '@/components/ui/not-found-fallback';


import { showAlert } from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CompositionCard } from '@/features/results/components/composition-card';
import { FabricPhotoPreview } from '@/features/results/components/fabric-photo-preview';
import { ResultsExploreActions } from '@/features/results/components/results-explore-actions';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { ScanConfidenceBanner } from '@/features/results/components/scan-confidence-banner';
import { SellerComparisonCard } from '@/features/results/components/seller-comparison-card';
import { SustainableChoicesCard } from '@/features/results/components/sustainable-choices-card';
import { SyntheticHealthRiskCard } from '@/features/results/components/synthetic-health-risk-card';
import { BrandColors } from '@/constants/brand';
import { deleteScan, isScanFavorite, setScanFavorite } from '@/db/scans';
import { useScanResult } from '@/features/results/hooks/use-scan-result';
import { getSyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';
import { getFiberBadge } from '@/features/results/lib/fiber-badge';
import { getFabricReference } from '@/data/fabrics/fabric-references';
import { assessScanReliability } from '@/data/scans/scan-confidence';
import {
  getScanResultHeadline,
  getUnsureHeadline,
} from '@/features/results/lib/scan-result-headline';
import { evaluateDeclaredLabel } from '@/features/scan/lib/declared-label';
import { requestFreshScan } from '@/features/scan/lib/scan-fresh';

export default function ResultsScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string | string[] }>();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isActionBusy, setIsActionBusy] = useState(false);
  const { scanId: resolvedScanId, result, isLoading, reload } = useScanResult(scanId);
  // Always this scan's own saved photo. (A module-level "last capture" used to take priority here,
  // which showed the most recent scan's photo on every older scan opened afterwards.)
  const capturedPhotoUri = result?.imageUri ?? null;

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    let active = true;
    if (!resolvedScanId) {
      setIsFavorite(false);
      return;
    }

    void (async () => {
      const favorite = await isScanFavorite(resolvedScanId);
      if (active) {
        setIsFavorite(favorite);
      }
    })();

    return () => {
      active = false;
    };
  }, [resolvedScanId]);

  const handleToggleFavorite = () => {
    if (isActionBusy || !resolvedScanId) {
      return;
    }

    const next = !isFavorite;
    setIsFavorite(next);
    setIsActionBusy(true);
    void (async () => {
      try {
        await setScanFavorite(resolvedScanId, next);
      } catch {
        setIsFavorite(!next);
        showAlert('Could not update favorite', 'Please try again.');
      } finally {
        setIsActionBusy(false);
      }
    })();
  };

  const handleConfirmDelete = () => {
    if (isActionBusy || !resolvedScanId) {
      return;
    }

    setShowDeleteConfirm(false);
    setIsActionBusy(true);
    void (async () => {
      try {
        await deleteScan(resolvedScanId);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/history' as Href);
        }
      } catch {
        showAlert('Could not delete scan', 'Please try again.');
      } finally {
        setIsActionBusy(false);
      }
    })();
  };

  if (isLoading) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (!result) {
    return (
      <NotFoundFallback message="Scan not found." />
    );
  }

  const sellerLabel = result.sellerLabel?.trim() || null;
  const labelCheck = evaluateDeclaredLabel(
    result.dominantFabric,
    sellerLabel,
    result.compositions ?? [],
  );

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
    requestFreshScan();
    router.push('/(tabs)/scan' as Href);
  };

  const handleAddLabel = () => {
    router.push({
      pathname: '/modal',
      params: { scanId: resolvedScanId },
    });
  };

  // An unsure scan names no fiber, so nothing derived from "the" fiber (reference photo, synthetic
  // badge, shedding estimate, fiber details, sustainable-choices card) is shown for it, and neither
  // is the stated-label comparison, which has no reliable fiber to compare against.
  const reliability = assessScanReliability(result.compositions);
  const isUnsure = !reliability.reliable;

  const primaryReference = isUnsure
    ? undefined
    : getFabricReference(result.dominantFabric, result.compositions);

  const healthRisk = isUnsure
    ? null
    : getSyntheticHealthRisk(
        result.dominantFabric,
        result.compositions ?? [],
        result.garmentCondition,
      );

  // "Detected" only when the most likely fiber itself is synthetic (that is when the shedding card
  // shows); a synthetic that only appears further down the top 3 is a possibility, not a finding.
  // The unrated "Fiber information" card for other fibers lives only in Eco tips.

  // Names the fiber and only ever says what the model predicted; null (no badge) for an Unsure
  // scan or when no synthetic prediction has a clear share.
  const fiberBadge = getFiberBadge(result.dominantFabric, result.compositions, isUnsure);

  const headline = isUnsure
    ? getUnsureHeadline(result.compositions ?? [])
    : getScanResultHeadline(result.dominantFabric, result.compositions ?? []);

  return (
    <View style={styles.root}>
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete this scan?"
        message="This moves the scan to Recently Deleted for 30 days. You can restore it from Settings."
        confirmLabel="Move to trash"
        cancelLabel="Keep scan"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ResultsScreenHeader
        title="Scan Results"
        onBack={() => router.back()}
        onToggleFavorite={handleToggleFavorite}
        onDelete={() => setShowDeleteConfirm(true)}
        isFavorite={isFavorite}
        actionsDisabled={isActionBusy}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <FabricPhotoPreview
          imageUri={capturedPhotoUri}
          scanCaption="Your scan"
          detectedFabric={headline.title}
          detectedSubtitle={headline.subtitle}
          referenceImage={primaryReference?.image}
          referenceTitle={primaryReference?.title}
          fiberBadge={fiberBadge}
        />

        <ScanConfidenceBanner
          confidence={result.confidence}
          dominantFabric={headline.title}
          compact
          reliability={reliability}
        />

        <CompositionCard compositions={result.compositions ?? []} />

        {healthRisk ? <SyntheticHealthRiskCard risk={healthRisk} /> : null}

        {isUnsure ? null : (
          <>
            <SustainableChoicesCard onEcoTips={handleEcoTips} />
            <SellerComparisonCard
              sellerLabel={sellerLabel}
              detectedLabel={headline.title}
              check={labelCheck}
              onAddLabel={handleAddLabel}
            />
          </>
        )}

        <ResultsExploreActions
          onProfile={handleViewProfile}
          onEcoTips={handleEcoTips}
          onPersonalizedInsights={handlePersonalizedInsights}
          onScanAgain={handleScanAnother}
          showFiberDetails={!isUnsure}
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
});

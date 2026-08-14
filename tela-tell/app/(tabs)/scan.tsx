import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CameraGuide,
  type CameraGuideHandle,
} from '@/features/scan/components/camera-guide';
import {
  FloatingCaptureBar,
  ScanDetailsPanel,
} from '@/features/scan/components/scan-actions';
import { FabricPhotoPreview } from '@/features/results/components/fabric-photo-preview';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { ScanLine } from '@/components/ui/lucide-icons';
import { primaryButtonShadow } from '@/constants/shadows';
import { DEFAULT_GARMENT_CONDITION, type GarmentCondition } from '@/data/scans/garment-condition';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { useFabricCapture } from '@/features/scan/hooks/use-fabric-capture';
import { clearLastCaptureUri, setLastCaptureUri } from '@/features/scan/lib/last-capture';
import { optimizeScanImage } from '@/features/scan/lib/crop-to-guide';
import { getLastSellerLabel } from '@/features/scan/lib/last-seller-label';
import { clearRegionSelection } from '@/features/scan/lib/region-selection';
import {
  clearLastGarmentCondition,
  getLastGarmentCondition,
  setLastGarmentCondition,
} from '@/features/scan/lib/garment-condition';
import { consumeFreshScan } from '@/features/scan/lib/scan-fresh';
import { getScanMode } from '@/features/scan/lib/scan-session';
import { useAuth } from '@/features/auth/context/auth-provider';
import { saveScan } from '@/db/scans';
import { createScanRecord } from '@/features/scan/lib/create-scan-record';

export default function ScanScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const cameraGuideRef = useRef<CameraGuideHandle>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [guideVisible, setGuideVisible] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [savedSellerLabel, setSavedSellerLabel] = useState<string | null>(null);
  const [garmentCondition, setGarmentCondition] = useState<GarmentCondition>(
    () => getLastGarmentCondition(),
  );
  const { captureFromCamera, captureFromGallery } = useFabricCapture();
  const hasPreview = Boolean(previewUri);
  const busy = isAnalyzing || isCapturing;

  useFocusEffect(
    useCallback(() => {
      if (consumeFreshScan()) {
        setPreviewUri(null);
        clearLastCaptureUri();
        clearRegionSelection();
        clearLastGarmentCondition();
        setGarmentCondition(DEFAULT_GARMENT_CONDITION);
        setDetailsExpanded(true);
      }
      setGuideVisible(true);
      setSavedSellerLabel(getLastSellerLabel());
    }, []),
  );

  const commitPreviewUri = (photoUri: string) => {
    setLastCaptureUri(photoUri);
    setPreviewUri(photoUri);
    setDetailsExpanded(true);
  };

  const runAnalysis = (photoUri?: string | null) => {
    if (photoUri) {
      setLastCaptureUri(photoUri);
    } else {
      clearLastCaptureUri();
    }

    const ANALYSIS_MS = 1500;

    if (getScanMode() === 'dual') {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        router.push('/results/dual' as Href);
      }, ANALYSIS_MS);
      return;
    }

    setIsAnalyzing(true);

    void (async () => {
      const startedAt = Date.now();
      try {
        const optimizedUri = photoUri ? await optimizeScanImage(photoUri) : null;
        if (optimizedUri) {
          setLastCaptureUri(optimizedUri);
        }

        const result = await createScanRecord({
          sellerLabel: getLastSellerLabel(),
          imageUri: optimizedUri,
        });

        await saveScan(result, {
          userId: session?.userId ?? null,
          garmentCondition,
          imageUri: optimizedUri,
        });

        const remaining = Math.max(0, ANALYSIS_MS - (Date.now() - startedAt));
        await new Promise((resolve) => setTimeout(resolve, remaining));

        setIsAnalyzing(false);
        router.push(`/results/${result.id}` as Href);
      } catch (error) {
        setIsAnalyzing(false);
        Alert.alert(
          'Could not save scan',
          error instanceof Error ? error.message : 'Please try again.',
        );
      }
    })();
  };

  const guideAspect = () => cameraGuideRef.current?.getGuideAspect() ?? 1;

  const handleTakePhoto = async () => {
    if (busy) {
      return;
    }

    setIsCapturing(true);
    try {
      let photoUri: string | null = null;

      if (cameraGuideRef.current?.hasLiveCamera()) {
        photoUri = await cameraGuideRef.current.captureAndCrop();
      }

      if (!photoUri) {
        photoUri = await captureFromCamera(guideAspect());
      }

      if (photoUri) {
        commitPreviewUri(photoUri);
      }
    } catch (error) {
      Alert.alert(
        'Could not capture photo',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleUpload = async () => {
    if (busy) {
      return;
    }

    setIsCapturing(true);
    try {
      const photoUri = await captureFromGallery(guideAspect());
      if (photoUri) {
        commitPreviewUri(photoUri);
      }
    } catch (error) {
      Alert.alert(
        'Could not upload photo',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleAnalyze = () => {
    if (busy || !previewUri) {
      return;
    }

    setLastGarmentCondition(garmentCondition);

    if (getScanMode() === 'dual') {
      setLastCaptureUri(previewUri);
      clearRegionSelection();
      router.push('/region-select' as Href);
      return;
    }

    runAnalysis(previewUri);
  };

  const handleTryAnother = () => {
    if (busy) {
      return;
    }

    setPreviewUri(null);
    clearLastCaptureUri();
    setDetailsExpanded(true);
    clearRegionSelection();
    clearLastGarmentCondition();
    setGarmentCondition(DEFAULT_GARMENT_CONDITION);
  };

  const handleGarmentConditionChange = (condition: GarmentCondition) => {
    setGarmentCondition(condition);
    setLastGarmentCondition(condition);
  };

  const handleAddLabel = () => {
    router.push('/modal');
  };

  const handleOpenPreferences = () => {
    router.push('/user-preferences');
  };

  const handleBack = () => {
    if (hasPreview) {
      handleTryAnother();
      return;
    }
    router.replace('/(tabs)' as Href);
  };

  if (hasPreview && previewUri) {
    return (
      <View style={styles.reviewRoot}>
        <ResultsScreenHeader title="Scan Fabric" onBack={handleBack} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.reviewContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
          keyboardShouldPersistTaps="handled">
          <FabricPhotoPreview imageUri={previewUri} scanCaption="Your scan" />

          <ScanDetailsPanel
            savedSellerLabel={savedSellerLabel}
            garmentCondition={garmentCondition}
            onGarmentConditionChange={handleGarmentConditionChange}
            onAddLabel={handleAddLabel}
            onOpenPreferences={handleOpenPreferences}
            isAnalyzing={busy}
            expanded={detailsExpanded}
            onExpandedChange={setDetailsExpanded}
            variant="sheet"
          />

          <Pressable
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={handleAnalyze}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Analyze fabric">
            <LinearGradient
              colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.analyzeButton, primaryButtonShadow()]}>
              {isAnalyzing ? (
                <ActivityIndicator color={BrandColors.white} />
              ) : (
                <ScanLine size={18} color={BrandColors.white} strokeWidth={2.5} />
              )}
              <Text style={styles.analyzeText}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Fabric'}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.tryAgainLink, pressed && styles.pressed]}
            onPress={handleTryAnother}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Try again">
            <Text style={styles.tryAgainLinkText}>Try again</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraGuide
        ref={cameraGuideRef}
        previewUri={null}
        isAnalyzing={false}
        guideVisible={guideVisible}
        onDismissGuide={() => setGuideVisible(false)}
        onShowGuide={() => setGuideVisible(true)}
        contentTopInset={insets.top + 10}
        bottomReserve={200}
        onBack={handleBack}
      />

      <View
        style={[
          styles.captureOverlay,
          { paddingBottom: Math.max(insets.bottom, 12) + 52 },
        ]}
        pointerEvents="box-none">
        <FloatingCaptureBar
          hasPreview={false}
          onTakePhoto={handleTakePhoto}
          onUpload={handleUpload}
          onTryAnother={handleTryAnother}
          isAnalyzing={busy}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#101820',
  },
  reviewRoot: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  reviewContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
    flexGrow: 1,
  },
  captureOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 999,
  },
  analyzeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
  tryAgainLink: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 2,
  },
  tryAgainLinkText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
});

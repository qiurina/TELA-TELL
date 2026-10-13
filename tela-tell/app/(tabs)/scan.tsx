import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showAlert } from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
import type { CaptureType, SharpnessCheckStatus } from '@/data/scans/mock-data';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { useFabricCapture } from '@/features/scan/hooks/use-fabric-capture';
import { saveCapturedScan } from '@/features/scan/lib/save-captured-scan';
import { setActiveScanImageUris } from '@/features/scan/lib/scan-image-storage';
import { checkCapture, judgeCapture } from '@/features/scan/lib/ml/measure-sharpness';
import type { SnapshotMeasurement } from '@/features/scan/lib/preview-snapshot';
import { sharpestIndex } from '@/features/scan/lib/ml/sharpness';
import type { LightingAssessment } from '@/features/scan/lib/ml/lighting';
import { LightingNoticeCard } from '@/features/scan/components/lighting-notice-card';
import { AnalyzingModal } from '@/features/scan/components/analyzing-modal';
import type { AnalysisProgress } from '@/features/scan/lib/analysis-progress';
import { clearLastSellerLabel, getLastSellerLabel } from '@/features/scan/lib/last-seller-label';
import { consumeFreshScan } from '@/features/scan/lib/scan-fresh';
import { createScanRecord } from '@/features/scan/lib/create-scan-record';

/** What is known about the photo(s) on screen, saved with the scan. */
type CaptureInfo = {
  captureType: CaptureType;
  sharpness: number | null;
  sharpnessPerPhoto: (number | null)[];
  sharpnessCheck: SharpnessCheckStatus;
  lighting: LightingAssessment;
};

/** A capture the blur check flagged, waiting for the person to choose "Retake" or "Use anyway". */
type BlurPrompt = {
  uris: string[];
  /** Which photo of `uris` to show and save if the person uses the capture anyway. */
  previewIndex: number;
  captureType: CaptureType;
  sharpness: number | null;
  sharpnessPerPhoto: (number | null)[];
  lighting: LightingAssessment;
};

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraGuideRef = useRef<CameraGuideHandle>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [burstUris, setBurstUris] = useState<string[]>([]);
  const [captureInfo, setCaptureInfo] = useState<CaptureInfo | null>(null);
  const [blurPrompt, setBlurPrompt] = useState<BlurPrompt | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [guideVisible, setGuideVisible] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [savedSellerLabel, setSavedSellerLabel] = useState<string | null>(null);
  const { captureFromCamera, captureFromGallery } = useFabricCapture();
  const hasPreview = Boolean(previewUri);
  const busy = isAnalyzing || isCapturing;

  useEffect(() => {
    setActiveScanImageUris([...burstUris, ...(previewUri ? [previewUri] : []), ...(blurPrompt?.uris ?? [])]);
    return () => setActiveScanImageUris([]);
  }, [burstUris, previewUri, blurPrompt]);

  useFocusEffect(
    useCallback(() => {
      if (consumeFreshScan()) {
        setPreviewUri(null);
        setBurstUris([]);
        setCaptureInfo(null);
        setBlurPrompt(null);
        setDetailsExpanded(true);
      }
      setGuideVisible(true);
      setSavedSellerLabel(getLastSellerLabel());
    }, []),
  );

  const commitPreviewUri = (allUris: string[], info: CaptureInfo, previewIndex = 0) => {
    setPreviewUri(allUris[previewIndex] ?? allUris[0]);
    setBurstUris(allUris);
    setCaptureInfo(info);
    setDetailsExpanded(true);
  };

  /**
   * Runs the blur check on a fresh capture. A photo flagged as blurry is held back and the person
   * chooses to retake or use it anyway; a check that cannot run never blocks the scan.
   *
   * With `showSharpest`, the sharpest photo of the burst is the one shown and saved (all of them
   * are still classified); otherwise the first one is, as before.
   */
  const acceptCapture = async (
    uris: string[],
    captureType: CaptureType,
    {
      showSharpest = false,
      measurements,
    }: { showSharpest?: boolean; measurements?: SnapshotMeasurement[] } = {},
  ) => {
    // Readings already taken from the snapshots in memory are judged directly; otherwise one pass
    // over the files gives the blur verdict and the lighting readings. Either way the same
    // judgeCapture rules decide.
    const { verdict, lighting } =
      measurements && measurements.length === uris.length
        ? judgeCapture(
            measurements.map((reading) => reading.sharpness),
            measurements.map((reading) => reading.lighting),
          )
        : await checkCapture(uris);
    const previewIndex = showSharpest ? sharpestIndex(verdict.readings) : 0;
    if (verdict.blurry) {
      setBlurPrompt({
        uris,
        previewIndex,
        captureType,
        sharpness: verdict.sharpest,
        sharpnessPerPhoto: verdict.readings,
        lighting,
      });
      return;
    }
    commitPreviewUri(
      uris,
      {
        captureType,
        sharpness: verdict.sharpest,
        sharpnessPerPhoto: verdict.readings,
        sharpnessCheck: verdict.measured ? 'passed' : 'unchecked',
        lighting,
      },
      previewIndex,
    );
  };

  const handleUseBlurryAnyway = () => {
    const pending = blurPrompt;
    setBlurPrompt(null);
    if (pending) {
      commitPreviewUri(
        pending.uris,
        {
          captureType: pending.captureType,
          sharpness: pending.sharpness,
          sharpnessPerPhoto: pending.sharpnessPerPhoto,
          sharpnessCheck: 'overridden',
          lighting: pending.lighting,
        },
        pending.previewIndex,
      );
    }
  };

  const runAnalysis = (photoUri?: string | null, photoUris: string[] = photoUri ? [photoUri] : []) => {
    setAnalysisProgress(null);
    setIsAnalyzing(true);

    void (async () => {
      let step: 'analyze' | 'save' = 'analyze';
      try {
        const result = await createScanRecord({
          sellerLabel: getLastSellerLabel(),
          imageUris: photoUris,
          capture: {
            captureType: captureInfo?.captureType ?? 'gallery',
            sharpness: captureInfo?.sharpness ?? null,
            sharpnessPerPhoto: captureInfo?.sharpnessPerPhoto,
            lighting: captureInfo?.lighting,
            sharpnessCheck: captureInfo?.sharpnessCheck ?? 'unchecked',
          },
          onProgress: setAnalysisProgress,
        });

        step = 'save';
        setAnalysisProgress({ stage: 'saving' });
        if (!photoUri) throw new Error('No photo to save.');
        await saveCapturedScan(result, photoUri);

        // The stated label belongs to the garment just scanned; the next scan starts without one.
        clearLastSellerLabel();

        setIsAnalyzing(false);
        router.push(`/results/${result.id}` as Href);
      } catch (error) {
        setIsAnalyzing(false);
        showAlert(
          step === 'analyze' ? 'Could not analyze photo' : 'Could not save scan',
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
      let photoUris: string[] | null = null;
      let captureType: CaptureType = 'live_camera';
      let showSharpest = false;
      let measurements: SnapshotMeasurement[] | undefined;

      if (cameraGuideRef.current?.hasLiveCamera()) {
        const liveCapture = await cameraGuideRef.current.captureAndCrop();
        photoUris = liveCapture?.uris ?? null;
        // Only the Android preview snapshots show their sharpest frame; the iOS photo burst keeps
        // showing its first photo.
        showSharpest = liveCapture?.method === 'snapshot';
        measurements = liveCapture?.measurements;
      }

      if (!photoUris || photoUris.length === 0) {
        const singleUri = await captureFromCamera(guideAspect());
        photoUris = singleUri ? [singleUri] : null;
        // On web the "camera" fallback is the photo library picker.
        captureType = Platform.OS === 'web' ? 'gallery' : 'system_camera';
      }

      if (photoUris && photoUris.length > 0) {
        await acceptCapture(photoUris, captureType, { showSharpest, measurements });
      }
    } catch (error) {
      showAlert(
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
        await acceptCapture([photoUri], 'gallery');
      }
    } catch (error) {
      showAlert(
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

    runAnalysis(previewUri, burstUris);
  };

  const handleTryAnother = () => {
    if (busy) {
      return;
    }

    setPreviewUri(null);
    setBurstUris([]);
    setCaptureInfo(null);
    setDetailsExpanded(true);
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
        <AnalyzingModal visible={isAnalyzing} progress={analysisProgress} />
        <ResultsScreenHeader title="Scan Fabric" onBack={handleBack} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.reviewContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
          keyboardShouldPersistTaps="handled">
          <FabricPhotoPreview imageUri={previewUri} scanCaption="Your scan" />

          {/* Advisory only: the photo can still be analyzed whatever this says. */}
          <LightingNoticeCard warnings={captureInfo?.lighting.warnings ?? []} />

          <ScanDetailsPanel
            savedSellerLabel={savedSellerLabel}
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
      <ConfirmDialog
        visible={blurPrompt !== null}
        title="This photo looks blurry"
        message={
          blurPrompt?.captureType === 'gallery'
            ? 'A blurry photo can give a wrong or unsure result. Choose a sharper photo, or use this one anyway.'
            : 'A blurry photo can give a wrong or unsure result. Retake it closer to the fabric and hold the phone steady, or use it anyway.'
        }
        confirmLabel="Use anyway"
        cancelLabel={blurPrompt?.captureType === 'gallery' ? 'Choose another' : 'Retake'}
        onConfirm={handleUseBlurryAnyway}
        onCancel={() => setBlurPrompt(null)}
      />

      <CameraGuide
        ref={cameraGuideRef}
        previewUri={null}
        isAnalyzing={false}
        isProcessing={Platform.OS === 'android' && isCapturing}
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

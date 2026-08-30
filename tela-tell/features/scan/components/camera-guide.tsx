import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useIsFocused } from '@react-navigation/native';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameOutput,
  usePhotoOutput,
  type CameraRef,
} from 'react-native-vision-camera';

import { ScanGuideFloat } from '@/features/scan/components/scan-guide-float';
import { ScanLineAnimation } from '@/features/scan/components/scan-line-animation';
import { ChevronLeft, ScanLine, Zap, ZapOff } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import {
  GUIDE_ASPECT,
  computeCenteredGuideRect,
  cropUriToCenteredGuideAspect,
  cropUriToGuideWithSize,
  getImageSize,
  type Size,
  type ViewRect,
} from '@/features/scan/lib/crop-to-guide';
import {
  computeGuideRegionInFrame,
  computeSharpnessSignals,
  getChannelLayout,
} from '@/features/scan/lib/ml/live/frame-signals';

type LiveReadiness = 'unknown' | 'good' | 'adjust';

const FILL_FRACTION_THRESHOLD = 0.18;
const BLUR_VARIANCE_THRESHOLD = 60;
const HINT_DEBOUNCE_READS = 3;

export type CameraGuideHandle = {
  captureAndCrop: () => Promise<string[] | null>;
  getGuideLayout: () => { view: Size; guide: ViewRect } | null;
  getGuideAspect: () => number;
  hasLiveCamera: () => boolean;
};

const LIVE_FRAME_TARGET_RESOLUTION = { width: 480, height: 480 };

const BURST_SHOT_COUNT = 3;

type CameraGuideProps = {
  previewUri?: string | null;
  isAnalyzing?: boolean;
  guideVisible: boolean;
  onDismissGuide: () => void;
  onShowGuide: () => void;
  contentTopInset?: number;
  bottomReserve?: number;
  onBack?: () => void;
};

function ViewfinderFrame({ readiness }: { readiness: LiveReadiness }) {
  const colorStyle =
    readiness === 'good'
      ? styles.cornerGood
      : readiness === 'adjust'
        ? styles.cornerAdjust
        : null;
  return (
    <>
      <View style={[styles.corner, styles.topLeft, colorStyle]} />
      <View style={[styles.corner, styles.topRight, colorStyle]} />
      <View style={[styles.corner, styles.bottomLeft, colorStyle]} />
      <View style={[styles.corner, styles.bottomRight, colorStyle]} />
    </>
  );
}

export const CameraGuide = forwardRef<CameraGuideHandle, CameraGuideProps>(function CameraGuide(
  {
    previewUri,
    isAnalyzing = false,
    guideVisible,
    onDismissGuide,
    onShowGuide,
    contentTopInset = 12,
    bottomReserve = 140,
    onBack,
  },
  ref,
) {
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraRef>(null);
  const viewSizeRef = useRef<Size>({ width: 0, height: 0 });
  const guideRef = useRef<ViewRect | null>(null);
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [viewSize, setViewSize] = useState<Size>({ width: 0, height: 0 });
  const guide =
    viewSize.width > 0
      ? computeCenteredGuideRect(viewSize, contentTopInset + 48, bottomReserve)
      : null;
  const window = useWindowDimensions();
  const photoTargetResolution = useMemo(() => {
    const aspect = window.width / window.height;
    const height = 1600;
    return { width: Math.round(height * aspect), height };
  }, [window.width, window.height]);
  const photoOutput = usePhotoOutput({ targetResolution: photoTargetResolution });
  const [isCapturing, setIsCapturing] = useState(false);
  const [fillLightOn, setFillLightOn] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const zoomShared = useSharedValue(0);
  const baseZoom = useSharedValue(0);
  const lastAnalysisAt = useSharedValue(0);
  const [readiness, setReadiness] = useState<LiveReadiness>('unknown');
  const consecutiveReadinessRef = useRef<{ state: LiveReadiness; count: number }>({
    state: 'unknown',
    count: 0,
  });
  const handleSignalUpdate = useCallback((variance: number, texturedFraction: number) => {
    const isReady = texturedFraction >= FILL_FRACTION_THRESHOLD && variance >= BLUR_VARIANCE_THRESHOLD;
    const nextState: LiveReadiness = isReady ? 'good' : 'adjust';

    if (consecutiveReadinessRef.current.state === nextState) {
      consecutiveReadinessRef.current.count += 1;
    } else {
      consecutiveReadinessRef.current = { state: nextState, count: 1 };
    }

    if (consecutiveReadinessRef.current.count >= HINT_DEBOUNCE_READS) {
      setReadiness((prev) => (prev === nextState ? prev : nextState));
    }
  }, []);
  const frameOutput = useFrameOutput({
    targetResolution: LIVE_FRAME_TARGET_RESOLUTION,
    pixelFormat: 'rgb',
    enablePreviewSizedOutputBuffers: true,
    onFrame: (frame) => {
      'worklet';
      if (frame.timestamp - lastAnalysisAt.value <= 0.7) {
        frame.dispose();
        return;
      }
      lastAnalysisAt.value = frame.timestamp;

      if (!frame.hasPixelBuffer || frame.isPlanar) {
        frame.dispose();
        return;
      }
      const layout = getChannelLayout(frame.pixelFormat);
      if (!layout || !guide) {
        frame.dispose();
        return;
      }

      const region = computeGuideRegionInFrame(
        viewSize.width,
        viewSize.height,
        frame.width,
        frame.height,
        guide.x,
        guide.y,
        guide.width,
        guide.height,
      );

      const buffer = frame.getPixelBuffer();
      const signals = computeSharpnessSignals(buffer, frame.bytesPerRow, layout, region);
      frame.dispose();

      runOnJS(handleSignalUpdate)(signals.variance, signals.texturedFraction);
    },
  });

  const cameraOutputs = useMemo(() => [photoOutput, frameOutput], [photoOutput, frameOutput]);
  const handleCameraError = useCallback((error: Error) => {
    if (error.message.includes('OperationCanceledException')) {
      console.warn('[live-camera] benign cancellation (newer value superseded it):', error.message);
      return;
    }
    console.error(error);
  }, []);
  const hasPreview = Boolean(previewUri);
  const neutralZoom = 1;
  const maxZoom = device?.maxZoom ?? 1;
  const deviceZoom = useDerivedValue(() => {
    return neutralZoom + zoomShared.value * (maxZoom - neutralZoom);
  }, [maxZoom]);
  const canUseLiveCamera =
    Platform.OS !== 'web' && hasPermission && device != null && !hasPreview && isFocused;

  useEffect(() => {
    if (!isFocused || Platform.OS === 'web') {
      return;
    }
    if (!hasPermission && canRequestPermission) {
      void requestPermission();
    }
  }, [isFocused, hasPermission, canRequestPermission, requestPermission]);

  useEffect(() => {
    if (!canUseLiveCamera) {
      setFillLightOn(false);
      zoomShared.value = 0;
      setSessionStarted(false);
      consecutiveReadinessRef.current = { state: 'unknown', count: 0 };
      setReadiness('unknown');
    }
  }, [canUseLiveCamera, zoomShared]);

  const pinchGesture = Gesture.Pinch()
    .enabled(canUseLiveCamera)
    .onStart(() => {
      baseZoom.value = zoomShared.value;
    })
    .onUpdate((event) => {
      const next = Math.min(1, Math.max(0, baseZoom.value + (event.scale - 1) * 0.6));
      zoomShared.value = next;
    });

  guideRef.current = guide;
  viewSizeRef.current = viewSize;

  const handleViewLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewSize((prev) =>
      prev.width === Math.round(width) && prev.height === Math.round(height)
        ? prev
        : { width: Math.round(width), height: Math.round(height) },
    );
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      hasLiveCamera: () => canUseLiveCamera && cameraRef.current != null,
      getGuideLayout: () => {
        const currentGuide = guideRef.current;
        const currentView = viewSizeRef.current;
        if (!currentGuide || currentView.width <= 0) {
          return null;
        }
        return { view: currentView, guide: currentGuide };
      },
      getGuideAspect: () => {
        const currentGuide = guideRef.current;
        if (!currentGuide || currentGuide.height <= 0) {
          return GUIDE_ASPECT;
        }
        return currentGuide.width / currentGuide.height;
      },
      captureAndCrop: async () => {
        if (!cameraRef.current) {
          return null;
        }

        setIsCapturing(true);
        try {
          const captured: string[] = [];

          for (let shot = 0; shot < BURST_SHOT_COUNT; shot += 1) {
            try {
              const photoFile = await photoOutput.capturePhotoToFile(
                { flashMode: 'off', enableShutterSound: false },
                {},
              );
              const uri = photoFile.filePath.startsWith('file://')
                ? photoFile.filePath
                : `file://${photoFile.filePath}`;

              const bitmap = await getImageSize(uri);
              const currentView = viewSizeRef.current;
              const currentGuide = guideRef.current;

              const cropped =
                bitmap.width > 0 && bitmap.height > 0 && currentView.width > 0 && currentGuide
                  ? await cropUriToGuideWithSize(uri, bitmap, currentView, currentGuide)
                  : await cropUriToCenteredGuideAspect(
                      uri,
                      GUIDE_ASPECT,
                      bitmap.width > 0 ? bitmap : undefined,
                    );

              if (cropped) {
                captured.push(cropped);
              }
            } catch {
              // Skip a failed shot in the burst; still return whatever succeeded.
            }
          }

          return captured.length > 0 ? captured : null;
        } finally {
          setIsCapturing(false);
        }
      },
    }),
    [canUseLiveCamera],
  );

  const instructionText = isAnalyzing
    ? 'Analyzing fabric image...'
    : isCapturing
      ? 'Capturing...'
      : hasPreview
        ? 'Photo ready'
        : readiness === 'adjust'
          ? 'Adjust framing'
          : readiness === 'good'
            ? 'Looking good — ready to scan'
            : 'Position fabric inside the frame';
  const showsAdjustHint =
    !hasPreview && readiness === 'adjust' && !isAnalyzing && !isCapturing;
  const showsGoodReadiness =
    !hasPreview && readiness === 'good' && !isAnalyzing && !isCapturing;

  return (
    <View style={styles.viewfinder} onLayout={handleViewLayout}>
      {/* Full-bleed live camera, or true-aspect captured preview */}
      {hasPreview && previewUri ? (
        <View
          style={[
            styles.previewWrap,
            { bottom: Math.max(bottomReserve, 0) },
          ]}>
          {/* Review: show the guide crop edge-to-edge above the sheet */}
          <Image source={{ uri: previewUri }} style={styles.previewImage} contentFit="cover" />
          <ScanLineAnimation active={isAnalyzing} />
        </View>
      ) : canUseLiveCamera && device ? (
        <GestureDetector gesture={pinchGesture}>
          <Camera
            ref={cameraRef}
            style={styles.feed}
            device={device}
            isActive={canUseLiveCamera}
            outputs={cameraOutputs}
            onStarted={() => setSessionStarted(true)}
            onError={handleCameraError}
            torchMode={sessionStarted ? (fillLightOn ? 'on' : 'off') : undefined}
            zoom={sessionStarted ? deviceZoom : undefined}
          />
        </GestureDetector>
      ) : !hasPermission ? (
        <View style={[styles.placeholder, { paddingTop: contentTopInset }]}>
          <ScanLine size={48} color="rgba(255,255,255,0.85)" strokeWidth={1.75} />
          <Text style={styles.placeholderTitle}>Camera access needed</Text>
          <Text style={styles.placeholderText}>
            Allow camera access for a live preview, or upload from gallery.
          </Text>
          <Pressable onPress={() => void requestPermission()}>
            <Text style={styles.permissionHint}>Allow camera</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.placeholder, { paddingTop: contentTopInset }]}>
          <ScanLine size={48} color="rgba(255,255,255,0.85)" strokeWidth={1.75} />
          <Text style={styles.placeholderTitle}>Take a close-up photo of the fabric</Text>
          <Text style={styles.placeholderText}>
            Get close enough to see individual threads - a clip-on macro lens is
            recommended for accurate results.
          </Text>
        </View>
      )}

      {/* Soft vignette + outside-guide dim — live only, keeps focus on the frame */}
      {!hasPreview ? (
        <View style={styles.vignetteLayer} pointerEvents="none">
          <LinearGradient
            colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0.12)', 'transparent']}
            locations={[0, 0.45, 1]}
            style={styles.vignetteTop}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.5)']}
            locations={[0, 0.4, 1]}
            style={styles.vignetteBottom}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.28)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.vignetteLeft}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.28)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.vignetteRight}
          />
        </View>
      ) : null}

      {guide && !hasPreview ? (
        <View style={styles.focusMask} pointerEvents="none">
          <View style={[styles.focusBand, { height: guide.y }]} />
          <View style={{ flexDirection: 'row', height: guide.height }}>
            <View style={[styles.focusBand, { width: guide.x }]} />
            <View style={{ width: guide.width, height: guide.height }} />
            <View style={styles.focusBandFlex} />
          </View>
          <View style={styles.focusBandFlex} />
        </View>
      ) : null}

      {onBack ? (
        <Pressable
          style={[styles.backButton, { top: contentTopInset }]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft size={22} color={BrandColors.white} strokeWidth={2.5} />
        </Pressable>
      ) : null}

      {!hasPreview ? (
        <Pressable
          style={[
            styles.flashButton,
            { top: contentTopInset },
            fillLightOn && styles.flashButtonActive,
          ]}
          onPress={() => setFillLightOn((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={
            fillLightOn ? 'Fill light on. Tap to turn off' : 'Fill light off. Tap to turn on'
          }>
          {fillLightOn ? (
            <Zap size={18} color="#FFE566" strokeWidth={2.25} fill="#FFE566" />
          ) : (
            <ZapOff size={18} color={BrandColors.white} strokeWidth={2.25} />
          )}
        </Pressable>
      ) : null}

      <View style={[styles.titleWrap, { top: contentTopInset }]} pointerEvents="none">
        <View style={styles.titlePill}>
          <Text style={styles.titleText}>Scan Fabric</Text>
        </View>
      </View>

      {/* Centered guide overlay — live capture only; camera stays full-bleed */}
      {guide && !hasPreview ? (
        <View
          style={[
            styles.frameLayer,
            {
              top: guide.y,
              left: guide.x,
              width: guide.width,
              height: guide.height,
            },
          ]}
          pointerEvents="none">
          <ViewfinderFrame readiness={readiness} />
        </View>
      ) : null}

      {!hasPreview ? (
        <View style={[styles.instructionWrap, { top: contentTopInset + 40 }]}>
          <View
            style={[
              styles.instructionBar,
              (isAnalyzing || isCapturing) && styles.instructionBarActive,
              showsAdjustHint && styles.instructionBarHint,
              showsGoodReadiness && styles.instructionBarGood,
            ]}>
            <Text style={styles.instruction} numberOfLines={1}>
              {instructionText}
            </Text>
          </View>
        </View>
      ) : null}

      {!hasPreview ? (
        <ScanGuideFloat
          visible={guideVisible}
          onDismiss={onDismissGuide}
          onShow={onShowGuide}
          topOffset={contentTopInset + 48}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  viewfinder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#101820',
  },
  feed: {
    ...StyleSheet.absoluteFillObject,
  },
  vignetteLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '28%',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '32%',
  },
  vignetteLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '14%',
  },
  vignetteRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '14%',
  },
  focusMask: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  focusBand: {
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  focusBandFlex: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  previewWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: '#101820',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    left: 14,
    zIndex: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  flashButton: {
    position: 'absolute',
    right: 14,
    zIndex: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  flashButtonActive: {
    backgroundColor: 'rgba(74, 143, 168, 0.75)',
    borderColor: 'rgba(255,255,255,0.28)',
  },
  titleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 6,
    alignItems: 'center',
  },
  titlePill: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  titleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.white,
    letterSpacing: -0.2,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 10,
    backgroundColor: '#101820',
  },
  placeholderTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: BrandColors.white,
    textAlign: 'center',
  },
  placeholderText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  permissionHint: {
    marginTop: 6,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.gradientStart,
    textAlign: 'center',
  },
  frameLayer: {
    position: 'absolute',
    zIndex: 3,
  },
  instructionWrap: {
    position: 'absolute',
    left: 56,
    right: 56,
    zIndex: 4,
    alignItems: 'center',
  },
  instructionBar: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxWidth: '100%',
  },
  instructionBarActive: {
    backgroundColor: 'rgba(74, 143, 168, 0.85)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  instructionBarHint: {
    backgroundColor: 'rgba(202, 138, 4, 0.85)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  instructionBarGood: {
    backgroundColor: 'rgba(22, 163, 74, 0.85)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  instruction: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.white,
    textAlign: 'center',
    lineHeight: 15,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  cornerGood: {
    borderColor: '#4ADE80',
  },
  cornerAdjust: {
    borderColor: '#FBBF24',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: 6,
  },
});

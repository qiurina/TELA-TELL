import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useIsFocused } from '@react-navigation/native';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { ScanGuideFloat } from '@/features/scan/components/scan-guide-float';
import { ScanLineAnimation } from '@/features/scan/components/scan-line-animation';
import { ChevronLeft, ScanLine } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import {
  GUIDE_ASPECT,
  computeCenteredGuideRect,
  cropUriToCenteredGuideAspect,
  cropUriToGuideWithSize,
  type Size,
  type ViewRect,
} from '@/features/scan/lib/crop-to-guide';

export type CameraGuideHandle = {
  captureAndCrop: () => Promise<string | null>;
  getGuideLayout: () => { view: Size; guide: ViewRect } | null;
  getGuideAspect: () => number;
  hasLiveCamera: () => boolean;
};

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

function ViewfinderFrame() {
  return (
    <>
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
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
  const cameraRef = useRef<CameraView>(null);
  const viewSizeRef = useRef<Size>({ width: 0, height: 0 });
  const guideRef = useRef<ViewRect | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [viewSize, setViewSize] = useState<Size>({ width: 0, height: 0 });
  const [isCapturing, setIsCapturing] = useState(false);
  const hasPreview = Boolean(previewUri);
  const canUseLiveCamera =
    Platform.OS !== 'web' && Boolean(permission?.granted) && !hasPreview && isFocused;

  useEffect(() => {
    if (!isFocused || Platform.OS === 'web') {
      return;
    }
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [isFocused, permission, requestPermission]);

  const guide =
    viewSize.width > 0
      ? computeCenteredGuideRect(viewSize, contentTopInset + 48, bottomReserve)
      : null;

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
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.9,
            skipProcessing: false,
            exif: false,
            shutterSound: false,
          });
          if (!photo?.uri) {
            return null;
          }

          const bitmap: Size = {
            width: photo.width || 0,
            height: photo.height || 0,
          };
          const currentView = viewSizeRef.current;
          const currentGuide = guideRef.current;

          // Crop exactly the guide rect (same region as post-capture preview).
          if (bitmap.width > 0 && bitmap.height > 0 && currentView.width > 0 && currentGuide) {
            return await cropUriToGuideWithSize(photo.uri, bitmap, currentView, currentGuide);
          }

          return await cropUriToCenteredGuideAspect(
            photo.uri,
            GUIDE_ASPECT,
            bitmap.width > 0 ? bitmap : undefined,
          );
        } catch {
          return null;
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
        : 'Position fabric inside the frame';

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
      ) : canUseLiveCamera ? (
        <CameraView
          ref={cameraRef}
          style={styles.feed}
          facing="back"
          mode="picture"
          animateShutter={false}
        />
      ) : permission && !permission.granted ? (
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
      ) : !permission ? (
        <View style={styles.placeholder}>
          <ActivityIndicator color={BrandColors.white} />
        </View>
      ) : (
        <View style={[styles.placeholder, { paddingTop: contentTopInset }]}>
          <ScanLine size={48} color="rgba(255,255,255,0.85)" strokeWidth={1.75} />
          <Text style={styles.placeholderTitle}>Take a close-up photo of the fabric</Text>
          <Text style={styles.placeholderText}>
            Fill the frame with a flat swatch in even lighting.
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
          <ViewfinderFrame />
        </View>
      ) : null}

      {!hasPreview ? (
        <View style={[styles.instructionWrap, { top: contentTopInset + 40 }]}>
          <View
            style={[
              styles.instructionBar,
              (isAnalyzing || isCapturing) && styles.instructionBarActive,
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
          topOffset={contentTopInset}
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

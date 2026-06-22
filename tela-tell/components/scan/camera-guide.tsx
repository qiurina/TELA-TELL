import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ScanGuideFloat } from '@/components/scan/scan-guide-float';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';

const SCAN_FRAME_HEIGHT = 200;

function ScanLineOverlay() {
  const reducedMotion = useReducedMotion();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      offset.value = SCAN_FRAME_HEIGHT / 2;
      return;
    }

    offset.value = withRepeat(
      withTiming(SCAN_FRAME_HEIGHT - 4, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [offset, reducedMotion]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <View style={styles.scanLineFrame}>
      <Animated.View style={[styles.scanLine, lineStyle]} />
    </View>
  );
}

type CameraGuideProps = {
  previewUri?: string | null;
  onCapture: (uri: string) => void;
  guideVisible: boolean;
  onDismissGuide: () => void;
  onShowGuide: () => void;
};

export function CameraGuide({
  previewUri,
  onCapture,
  guideVisible,
  onDismissGuide,
  onShowGuide,
}: CameraGuideProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const hasPreview = Boolean(previewUri);
  const canUseLiveCamera = Platform.OS !== 'web';

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing || hasPreview) {
      return;
    }

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [hasPreview, isCapturing, onCapture]);

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        {hasPreview && previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.previewImage} contentFit="cover" />
        ) : canUseLiveCamera && permission?.granted ? (
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>
              {canUseLiveCamera ? 'Camera access needed' : 'Live camera preview'}
            </Text>
            <Text style={styles.placeholderText}>
              {canUseLiveCamera
                ? 'Allow camera access to scan fabric with your phone.'
                : 'Use the capture button below or upload from gallery on web.'}
            </Text>
            {canUseLiveCamera && !permission?.granted ? (
              <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
                <Text style={styles.permissionButtonText}>Allow Camera</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        <View style={styles.dimOverlay} />

        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        {!hasPreview && permission?.granted && canUseLiveCamera ? (
          <>
            <Text style={styles.instruction}>Position fabric inside the frame</Text>
            <ScanLineOverlay />
          </>
        ) : null}

        {!hasPreview ? (
          <ScanGuideFloat visible={guideVisible} onDismiss={onDismissGuide} onShow={onShowGuide} />
        ) : null}

        {hasPreview ? (
          <View style={styles.captureCard}>
            <Image source={{ uri: previewUri! }} style={styles.captureThumb} contentFit="cover" />
            <View style={styles.captureTextBlock}>
              <Text style={styles.captureTitle}>Fabric captured</Text>
              <Text style={styles.captureSubtitle}>Ready to analyze</Text>
            </View>
          </View>
        ) : null}

        {!hasPreview && permission?.granted && canUseLiveCamera ? (
          <View style={styles.shutterWrap}>
            <Pressable
              style={({ pressed }) => [
                styles.shutter,
                primaryButtonShadow(),
                pressed && styles.shutterPressed,
                isCapturing && styles.shutterDisabled,
              ]}
              onPress={handleCapture}
              disabled={isCapturing}
              accessibilityRole="button"
              accessibilityLabel="Capture fabric photo">
              <View style={styles.shutterInner} />
            </Pressable>
          </View>
        ) : null}
      </View>

      {hasPreview ? (
        <Text style={styles.previewHint}>
          Review your fabric photo. Tap Analyze when you are ready.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  viewfinder: {
    height: 320,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  placeholderTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
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
  permissionButton: {
    marginTop: 8,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  permissionButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.white,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  scanLineFrame: {
    position: 'absolute',
    top: 48,
    left: 40,
    right: 40,
    height: SCAN_FRAME_HEIGHT,
    overflow: 'hidden',
    zIndex: 3,
    pointerEvents: 'none',
  },
  scanLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(134, 239, 172, 0.95)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 6px rgba(134, 239, 172, 0.9)' }
      : null),
  },
  instruction: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 4,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: BrandColors.white,
    zIndex: 2,
  },
  topLeft: {
    top: 40,
    left: 32,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 40,
    right: 32,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 88,
    left: 32,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 88,
    right: 32,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  captureCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  captureThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  captureTextBlock: {
    flex: 1,
    gap: 2,
  },
  captureTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  captureSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  shutterWrap: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 6,
  },
  shutter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: BrandColors.white,
  },
  shutterPressed: {
    opacity: 0.88,
  },
  shutterDisabled: {
    opacity: 0.6,
  },
  shutterInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.white,
  },
  previewHint: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
});

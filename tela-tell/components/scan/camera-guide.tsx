import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScanGuideFloat } from '@/components/scan/scan-guide-float';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';
import { DEVICE_MOCK_CAPTURE } from '@/lib/device-mock-capture';

export type ViewfinderSource = 'iot' | 'phone';

const FRAME_INSET = {
  top: 34,
  bottom: 34,
  horizontal: 22,
};

type CameraGuideProps = {
  previewUri?: string | null;
  source?: ViewfinderSource;
  isDeviceScanning?: boolean;
  onCapture: (uri: string) => void;
  guideVisible: boolean;
  onDismissGuide: () => void;
  onShowGuide: () => void;
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

export function CameraGuide({
  previewUri,
  source = 'iot',
  isDeviceScanning = false,
  onCapture,
  guideVisible,
  onDismissGuide,
  onShowGuide,
}: CameraGuideProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const hasPreview = Boolean(previewUri);
  const usePhoneCamera = source === 'phone' && Platform.OS !== 'web';
  const showIoTFeed = !hasPreview && !usePhoneCamera;
  const showPhoneCamera = !hasPreview && usePhoneCamera && permission?.granted;
  const showPhonePermission = !hasPreview && usePhoneCamera && !permission?.granted;
  const phoneFrameBottom = 96;

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

  const instructionText = (() => {
    if (isDeviceScanning) {
      return 'Capturing fabric image...';
    }

    if (showPhoneCamera || showPhonePermission) {
      return 'Position fabric inside the frame';
    }

    return 'Align fabric in frame';
  })();

  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        {hasPreview && previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.feedImage} contentFit="cover" />
        ) : showPhoneCamera ? (
          <CameraView ref={cameraRef} style={styles.feedImage} facing="back" />
        ) : showIoTFeed ? (
          <Image source={DEVICE_MOCK_CAPTURE} style={styles.feedImage} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>Phone camera</Text>
            <Text style={styles.placeholderText}>
              Allow camera access to capture fabric with your phone.
            </Text>
            {showPhonePermission ? (
              <Pressable style={styles.permissionButton} onPress={() => requestPermission()}>
                <Text style={styles.permissionButtonText}>Allow Camera</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {showPhoneCamera ? <View style={styles.dimOverlay} /> : null}

        <View
          style={[
            styles.frameLayer,
            showPhoneCamera && { bottom: phoneFrameBottom },
          ]}>
          <ViewfinderFrame />
        </View>

        {!hasPreview && (showIoTFeed || showPhoneCamera || showPhonePermission) ? (
          <View style={styles.instructionWrap}>
            <View style={[styles.instructionBar, isDeviceScanning && styles.instructionBarActive]}>
              <Text style={styles.instruction} numberOfLines={1}>
                {instructionText}
              </Text>
            </View>
          </View>
        ) : null}

        {!hasPreview ? (
          <ScanGuideFloat
            visible={guideVisible}
            source={source}
            onDismiss={onDismissGuide}
            onShow={onShowGuide}
          />
        ) : null}

        {hasPreview ? (
          <View style={styles.captureCard}>
            <Image source={{ uri: previewUri! }} style={styles.captureThumb} contentFit="cover" />
            <View style={styles.captureTextBlock}>
              <Text style={styles.captureTitle}>Fabric captured</Text>
            </View>
          </View>
        ) : null}

        {showPhoneCamera ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  viewfinder: {
    height: 320,
    borderRadius: 20,
    backgroundColor: '#101820',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  feedImage: {
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
    backgroundColor: 'rgba(0,0,0,0.22)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  frameLayer: {
    position: 'absolute',
    top: FRAME_INSET.top,
    left: FRAME_INSET.horizontal,
    right: FRAME_INSET.horizontal,
    bottom: FRAME_INSET.bottom,
    zIndex: 2,
    pointerEvents: 'none',
  },
  instructionWrap: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 4,
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  instructionBar: {
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxWidth: '100%',
  },
  instructionBarActive: {
    backgroundColor: 'rgba(74, 143, 168, 0.8)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  instruction: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: BrandColors.white,
    textAlign: 'center',
    lineHeight: 14,
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
});

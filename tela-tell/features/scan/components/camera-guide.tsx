import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ScanGuideFloat } from '@/features/scan/components/scan-guide-float';
import { ScanLine } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const FRAME_INSET = {
  top: 34,
  bottom: 34,
  horizontal: 22,
};

type CameraGuideProps = {
  previewUri?: string | null;
  isAnalyzing?: boolean;
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
  isAnalyzing = false,
  guideVisible,
  onDismissGuide,
  onShowGuide,
}: CameraGuideProps) {
  const hasPreview = Boolean(previewUri);
  const instructionText = isAnalyzing
    ? 'Analyzing fabric image...'
    : 'Position fabric inside the frame';

  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        {hasPreview && previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.feedImage} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <ScanLine size={48} color="rgba(255,255,255,0.85)" strokeWidth={1.75} />
            <Text style={styles.placeholderTitle}>Take a close-up photo of the fabric</Text>
            <Text style={styles.placeholderText}>
              Fill the frame with a flat swatch in even lighting.
            </Text>
          </View>
        )}

        <View style={styles.frameLayer}>
          <ViewfinderFrame />
        </View>

        {!hasPreview ? (
          <View style={styles.instructionWrap}>
            <View style={[styles.instructionBar, isAnalyzing && styles.instructionBarActive]}>
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
          />
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
});

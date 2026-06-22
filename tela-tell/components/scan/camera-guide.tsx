import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ScanLine } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const SCAN_TIPS = [
  'Place the IoT scanner face-down over the fabric',
  'Keep the fabric flat on a neutral mat',
  'Ensure the LED ring is on for even lighting',
  'Hold steady until the capture completes',
];

type CameraGuideProps = {
  previewUri?: string | null;
};

export function CameraGuide({ previewUri }: CameraGuideProps) {
  const hasPreview = Boolean(previewUri);

  return (
    <View style={styles.container}>
      <View style={[styles.viewfinder, hasPreview && styles.viewfinderWithImage]}>
        {hasPreview && previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.previewImage} contentFit="cover" />
        ) : (
          <>
            <ScanLine size={32} color="rgba(255,255,255,0.5)" strokeWidth={2} />
            <Text style={styles.viewfinderText}>IoT scanner capture zone</Text>
          </>
        )}

        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {hasPreview ? (
        <Text style={styles.previewHint}>
          Review your fabric photo. Tap Analyze when you are ready.
        </Text>
      ) : (
        <>
          <Text style={styles.title}>Device Scanning Guide</Text>
          {SCAN_TIPS.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.bullet} />
              <Text style={styles.tip}>{tip}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  viewfinder: {
    height: 220,
    borderRadius: 20,
    backgroundColor: '#2D2650',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  viewfinderWithImage: {
    backgroundColor: BrandColors.lavenderCard,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  viewfinderText: {
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  previewHint: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: BrandColors.gradientStart,
    zIndex: 1,
  },
  topLeft: {
    top: 16,
    left: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 16,
    right: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: BrandColors.text,
    marginTop: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingRight: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.primary,
    marginTop: 7,
  },
  tip: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.textMuted,
  },
});

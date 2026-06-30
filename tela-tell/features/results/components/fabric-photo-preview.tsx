import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { ScanLine } from '@/components/ui/lucide-icons';
import { RegionBoxOverlay } from '@/features/results/components/region-box-overlay';
import { formatDetectedLabel } from '@/data/fabrics/eco-alternatives';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getConfidenceLabel } from '@/data/scans/analysis';
import type { NormalizedRect } from '@/features/scan/lib/region-selection';

type FabricPhotoPreviewProps = {
  imageUri?: string | null;
  detectedFabric?: string;
  confidence?: number;
  markedRegions?: NormalizedRect[];
};

export function FabricPhotoPreview({
  imageUri,
  detectedFabric,
  confidence,
  markedRegions,
}: FabricPhotoPreviewProps) {
  const showDetection = Boolean(detectedFabric?.trim());
  const detectedLabel = detectedFabric ? formatDetectedLabel(detectedFabric) : '';
  const confidenceLabel =
    confidence !== undefined ? getConfidenceLabel(confidence) : undefined;

  return (
    <View style={styles.container}>
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
          {markedRegions && markedRegions.length > 0 ? (
            <RegionBoxOverlay regions={markedRegions} />
          ) : null}
        </>
      ) : (
        <View style={styles.placeholder}>
          <ScanLine size={52} color={BrandColors.textMuted} strokeWidth={1.5} />
          <Text style={styles.placeholderText}>Scanned fabric photo</Text>
          <Text style={styles.placeholderHint}>Close-up capture from IoT scanner or phone</Text>
        </View>
      )}

      {showDetection ? (
        <>
          {confidence !== undefined ? (
            <View style={styles.confidenceBadge} accessibilityLabel={`${confidence}% confidence`}>
              <Text style={styles.confidenceValue}>{confidence}%</Text>
              {confidenceLabel ? (
                <Text style={styles.confidenceCaption}>{confidenceLabel}</Text>
              ) : null}
            </View>
          ) : null}

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.footerGradient}>
            <Text style={styles.detectedLabel}>{detectedLabel}</Text>
          </LinearGradient>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
    minHeight: 320,
    position: 'relative',
  },
  image: {
    width: '100%',
    minHeight: 320,
  },
  placeholder: {
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  placeholderHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  confidenceBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    minWidth: 64,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
    gap: 2,
  },
  confidenceValue: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: BrandColors.primaryDark,
    lineHeight: 20,
  },
  confidenceCaption: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: BrandColors.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
  footerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  detectedLabel: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.white,
    lineHeight: 24,
  },
});

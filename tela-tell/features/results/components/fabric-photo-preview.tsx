import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type LayoutChangeEvent,
} from 'react-native';

import { ScanLine } from '@/components/ui/lucide-icons';
import { RegionBoxOverlay } from '@/features/results/components/region-box-overlay';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getConfidenceLabel } from '@/data/scans/analysis';
import type { NormalizedRect } from '@/features/scan/lib/region-selection';

const SLIDE_HEIGHT = 320;

type FabricPhotoPreviewProps = {
  imageUri?: string | null;
  detectedFabric?: string;
  detectedSubtitle?: string;
  confidence?: number;
  markedRegions?: NormalizedRect[];
  referenceImage?: ImageSourcePropType | null;
  referenceTitle?: string;
  scanCaption?: string;
};

export function FabricPhotoPreview({
  imageUri,
  detectedFabric,
  detectedSubtitle,
  confidence,
  markedRegions,
  referenceImage,
  referenceTitle,
  scanCaption,
}: FabricPhotoPreviewProps) {
  const [slideWidth, setSlideWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const showDetection = Boolean(detectedFabric?.trim());
  const detectedLabel = detectedFabric?.trim() ?? '';
  const subtitle = detectedSubtitle?.trim() ?? '';
  const confidenceLabel =
    confidence !== undefined ? getConfidenceLabel(confidence) : undefined;
  const hasReference = Boolean(referenceImage);
  const canSwipe = hasReference && slideWidth > 0;
  const referenceLabel = referenceTitle
    ? `Reference: ${referenceTitle}`
    : 'Reference';
  const footerCaption = scanCaption?.trim() || (hasReference ? 'Your scan' : '');
  const showFooter = Boolean(footerCaption || showDetection);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== slideWidth) {
      setSlideWidth(nextWidth);
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (slideWidth <= 0) {
      return;
    }
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setActiveIndex(nextIndex);
  };

  const scanSlide = (
    <View style={[styles.slide, slideWidth > 0 ? { width: slideWidth } : styles.slideFill]}>
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="contain" />
          {markedRegions && markedRegions.length > 0 ? (
            <RegionBoxOverlay regions={markedRegions} />
          ) : null}
        </>
      ) : (
        <View style={styles.placeholder}>
          <ScanLine size={52} color={BrandColors.textMuted} strokeWidth={1.5} />
          <Text style={styles.placeholderText}>Scanned fabric photo</Text>
          <Text style={styles.placeholderHint}>Close-up capture from your phone camera</Text>
        </View>
      )}

      {showFooter ? (
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.78)']} style={styles.footerGradient}>
          {footerCaption ? <Text style={styles.slideCaption}>{footerCaption}</Text> : null}
          {showDetection ? <Text style={styles.detectedLabel}>{detectedLabel}</Text> : null}
          {showDetection && subtitle ? (
            <Text style={styles.detectedSubtitle}>{subtitle}</Text>
          ) : null}
        </LinearGradient>
      ) : null}
    </View>
  );

  const referenceSlide = (
    <View style={[styles.slide, { width: slideWidth }]}>
      {referenceImage ? (
        <Image source={referenceImage} style={styles.image} contentFit="cover" />
      ) : null}

      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.78)']} style={styles.footerGradient}>
        <Text style={styles.slideCaption}>{referenceLabel}</Text>
        {showDetection ? <Text style={styles.detectedLabel}>{detectedLabel}</Text> : null}
        {showDetection && subtitle ? (
          <Text style={styles.detectedSubtitle}>{subtitle}</Text>
        ) : null}
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {canSwipe ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          decelerationRate="fast"
          style={styles.pager}>
          {scanSlide}
          {referenceSlide}
        </ScrollView>
      ) : (
        scanSlide
      )}

      {showDetection && confidence !== undefined ? (
        <View style={styles.confidenceBadge} accessibilityLabel={`${confidence}% confidence`}>
          <Text style={styles.confidenceValue}>{confidence}%</Text>
          {confidenceLabel ? (
            <Text style={styles.confidenceCaption}>{confidenceLabel}</Text>
          ) : null}
        </View>
      ) : null}

      {hasReference ? (
        <View style={styles.dots} pointerEvents="none">
          <View style={[styles.dot, activeIndex === 0 && styles.dotActive]} />
          <View style={[styles.dot, activeIndex === 1 && styles.dotActive]} />
        </View>
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
    minHeight: SLIDE_HEIGHT,
    position: 'relative',
  },
  pager: {
    minHeight: SLIDE_HEIGHT,
  },
  slide: {
    minHeight: SLIDE_HEIGHT,
    height: SLIDE_HEIGHT,
    position: 'relative',
    backgroundColor: '#101820',
    overflow: 'hidden',
  },
  slideFill: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: SLIDE_HEIGHT,
  },
  placeholder: {
    flex: 1,
    minHeight: SLIDE_HEIGHT,
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
    paddingTop: 52,
    paddingBottom: 30,
  },
  slideCaption: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.78)',
    marginBottom: 4,
  },
  detectedLabel: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.white,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  detectedSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 18,
    marginTop: 3,
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: BrandColors.white,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

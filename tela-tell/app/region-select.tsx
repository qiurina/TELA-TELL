import { useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FabricRegionSelector } from '@/features/scan/components/fabric-region-selector';
import { ChevronLeft } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';
import { getLastCaptureUri, setLastCaptureUri } from '@/features/scan/lib/last-capture';
import { analyzeMarkedRegions } from '@/features/scan/lib/region-analysis';
import {
  getDefaultRegionBoxes,
  getMarkedRegions,
  hasCompleteRegionSelection,
  setMarkedRegions,
  setRegionAnalysisResults,
  type NormalizedRect,
} from '@/features/scan/lib/region-selection';

export default function RegionSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const imageUri = getLastCaptureUri();
  const [regions, setRegions] = useState<NormalizedRect[]>(() => {
    const existing = getMarkedRegions();
    return existing.length > 0 ? existing : getDefaultRegionBoxes();
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRegionsChange = useCallback((nextRegions: NormalizedRect[]) => {
    setRegions(nextRegions);
    setMarkedRegions(nextRegions);
  }, []);

  const handleAnalyze = () => {
    if (!imageUri || !hasCompleteRegionSelection() || isAnalyzing) {
      return;
    }

    setMarkedRegions(regions);
    setIsAnalyzing(true);

    setTimeout(() => {
      const results = analyzeMarkedRegions(regions);
      setRegionAnalysisResults(results);
      setLastCaptureUri(imageUri);
      setIsAnalyzing(false);
      router.replace('/results/dual' as Href);
    }, 1200);
  };

  if (!imageUri) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.fallbackText}>No fabric photo to mark.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.fallbackLink}>Back to scan</Text>
        </Pressable>
      </View>
    );
  }

  const canAnalyze = regions.length >= 2;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <ChevronLeft size={22} color={BrandColors.text} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mark Fabric Regions</Text>
          <Text style={styles.subtitle}>Step 2 — box each swatch on the photo</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Two fabrics in one photo</Text>
          <Text style={styles.bannerBody}>
            Draw a box around each fabric area. The prototype classifies each region separately
            (demo: Fabric 1 → linen, Fabric 2 → cotton).
          </Text>
        </View>

        <FabricRegionSelector
          imageUri={imageUri}
          regions={regions}
          onChange={handleRegionsChange}
        />

        <Pressable
          style={({ pressed }) => [
            styles.analyzeButton,
            primaryButtonShadow(),
            pressed && styles.pressed,
            (!canAnalyze || isAnalyzing) && styles.analyzeButtonDisabled,
          ]}
          onPress={handleAnalyze}
          disabled={!canAnalyze || isAnalyzing}>
          {isAnalyzing ? (
            <ActivityIndicator color={BrandColors.white} />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Both Regions</Text>
          )}
        </Pressable>

        {!canAnalyze ? (
          <Text style={styles.hint}>Mark 2 fabric regions to continue.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  banner: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  bannerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  bannerBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  analyzeButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
  hint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: BrandColors.white,
    paddingHorizontal: 24,
  },
  fallbackText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: BrandColors.text,
    textAlign: 'center',
  },
  fallbackLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primary,
  },
});

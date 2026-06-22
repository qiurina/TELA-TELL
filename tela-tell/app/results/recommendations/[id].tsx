import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { RecommendationsContent } from '@/components/recommendations/recommendations-content';
import { ResultsScreenHeader } from '@/components/results/results-screen-header';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getScanResult } from '@/constants/mock-data';

export default function RecommendationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const result = getScanResult(id ?? '1');

  if (!result) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Recommendations not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.fallbackLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const detectedLabel = `${result.compositions[0].material} (${result.compositions[0].percentage}%)`;

  const handleScanAnother = () => {
    router.push('/(tabs)/scan' as Href);
  };

  return (
    <View style={styles.root}>
      <ResultsScreenHeader title="Recommendations" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <RecommendationsContent
          detectedLabel={detectedLabel}
          recommendations={result.recommendations}
          onScanAnother={handleScanAnother}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: BrandColors.white,
  },
  fallbackText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: BrandColors.text,
  },
  fallbackLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primary,
  },
});

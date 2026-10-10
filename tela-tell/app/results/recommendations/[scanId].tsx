import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { NotFoundFallback } from '@/components/ui/not-found-fallback';


import { RecommendationsContent } from '@/features/recommendations/components/recommendations-content';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { BrandColors } from '@/constants/brand';
import { useScanResult } from '@/features/results/hooks/use-scan-result';

export default function RecommendationsScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string | string[] }>();
  const { result, isLoading } = useScanResult(scanId);
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (!result) {
    return (
      <NotFoundFallback message="Recommendations not found." />
    );
  }

  return (
    <View style={styles.root}>
      <ResultsScreenHeader title="Eco and Health Tips" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <RecommendationsContent
          dominantFabric={result.dominantFabric}
          detectedCompositions={result.compositions ?? []}
          garmentCondition={result.garmentCondition}
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
});

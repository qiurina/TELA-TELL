import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native';

import { PersonalizedInsightsContent } from '@/features/recommendations/components/personalized-insights-content';
import { ProfilePreferencesGate } from '@/features/profile/components/profile-preferences-gate';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { useScanResult } from '@/features/results/hooks/use-scan-result';

export default function PersonalizedInsightsScreen() {
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
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Insights not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.fallbackLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ResultsScreenHeader title="Personalized Insights" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <ProfilePreferencesGate>
          <PersonalizedInsightsContent
            dominantFabric={result.dominantFabric}
            detectedCompositions={result.compositions ?? []}
          />
        </ProfilePreferencesGate>
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

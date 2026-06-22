import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CompositionCard } from '@/components/results/composition-card';
import { FabricPhotoPreview } from '@/components/results/fabric-photo-preview';
import { ResultsScreenHeader } from '@/components/results/results-screen-header';
import { StatusBadges } from '@/components/results/status-badges';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getScanResult } from '@/constants/mock-data';
import { getLastCaptureUri } from '@/lib/last-capture';

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const result = getScanResult(id ?? '1');
  const capturedPhotoUri = getLastCaptureUri();

  if (!result) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Scan not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.fallbackLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleViewProfile = () => {
    router.push(`/results/profile/${id ?? '1'}` as Href);
  };

  const handleRecommendations = () => {
    router.push(`/results/recommendations/${id ?? '1'}` as Href);
  };

  return (
    <View style={styles.root}>
      <ResultsScreenHeader title="Scan Results" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <FabricPhotoPreview imageUri={capturedPhotoUri} />

        <CompositionCard compositions={result.compositions} />

        <StatusBadges sustainability={result.sustainability} mislabeling={result.mislabeling} />

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            onPress={handleViewProfile}>
            <Text style={styles.primaryActionText}>View Profile</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.outlineAction, pressed && styles.pressed]}
            onPress={handleRecommendations}>
            <Text style={styles.outlineActionText}>Recommendations</Text>
          </Pressable>
        </View>
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
    gap: 20,
    flexGrow: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  outlineAction: {
    flex: 1,
    backgroundColor: BrandColors.white,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BrandColors.border,
  },
  primaryActionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.white,
  },
  outlineActionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  pressed: {
    opacity: 0.88,
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

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FiberProfileContent } from '@/features/fabrics/components/fiber-profile-content';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getFiberProfile, resolveFiberFromSlug } from '@/data/fabrics/fiber-profiles';

export default function FiberProfileScreen() {
  const { fabricId } = useLocalSearchParams<{ fabricId: string | string[] }>();
  const router = useRouter();
  const slug = Array.isArray(fabricId) ? fabricId[0] : fabricId;
  const fabric = slug ? resolveFiberFromSlug(slug) : null;

  if (!fabric) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Fiber not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.fallbackLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const profile = getFiberProfile(fabric);

  return (
    <View style={styles.root}>
      <ResultsScreenHeader title="Fiber Profile" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <FiberProfileContent profile={profile} />
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

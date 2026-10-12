import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NotFoundFallback } from '@/components/ui/not-found-fallback';

import { FiberProfileContent } from '@/features/fabrics/components/fiber-profile-content';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { BrandColors } from '@/constants/brand';
import { getFiberProfile, resolveFiberFromSlug } from '@/data/fabrics/fiber-profiles';

export default function FiberProfileScreen() {
  const { fabricId } = useLocalSearchParams<{ fabricId: string | string[] }>();
  const router = useRouter();
  const [identityHidden, setIdentityHidden] = useState(false);
  const slug = Array.isArray(fabricId) ? fabricId[0] : fabricId;
  const fabric = slug ? resolveFiberFromSlug(slug) : null;

  if (!fabric) {
    return (
      <NotFoundFallback message="Fiber not found." />
    );
  }

  const profile = getFiberProfile(fabric);

  return (
    <View style={styles.root}>
      <ResultsScreenHeader title={identityHidden ? fabric : 'Fiber Profile'} onBack={() => router.back()} />
      <FiberProfileContent key={fabric} profile={profile} onIdentityHiddenChange={setIdentityHidden} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
});

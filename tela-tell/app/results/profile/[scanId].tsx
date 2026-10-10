import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NotFoundFallback } from '@/components/ui/not-found-fallback';


import { FiberProfileContent } from '@/features/fabrics/components/fiber-profile-content';
import { FabricReferenceComparison } from '@/features/results/components/fabric-reference-comparison';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { useScanResult } from '@/features/results/hooks/use-scan-result';
import {
  getFabricReference,
  resolveSupportedFabric,
} from '@/data/fabrics/fabric-references';
import { getFiberProfile } from '@/data/fabrics/fiber-profiles';
import { getScanResultHeadline } from '@/features/results/lib/scan-result-headline';

export default function FabricProfileScreen() {
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
      <NotFoundFallback message="Profile not found." />
    );
  }

  const compositions = result.compositions ?? [];
  const supportedFabric = resolveSupportedFabric(result.dominantFabric, compositions);
  const fabricReference = getFabricReference(result.dominantFabric, compositions);
  const capturedPhotoUri = result.imageUri ?? null;
  const fiberProfile = supportedFabric ? getFiberProfile(supportedFabric) : null;
  const headline = getScanResultHeadline(result.dominantFabric, compositions);

  return (
    <View style={styles.root}>
      <ResultsScreenHeader title="Fabric Profile" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {fabricReference ? (
          <FabricReferenceComparison
            scanImageUri={capturedPhotoUri}
            reference={fabricReference}
            detectedLabel={headline.title}
            confidence={result.confidence}
            compact
          />
        ) : null}

        {fiberProfile ? (
          <FiberProfileContent profile={fiberProfile} showHero={false} />
        ) : (
          <View style={styles.missingCard}>
            <Text style={styles.missingTitle}>Detailed profile unavailable</Text>
            <Text style={styles.missingBody}>
              We could not match this scan to a known fiber profile yet.
            </Text>
          </View>
        )}
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
    paddingTop: 20,
    paddingBottom: 40,
    gap: 18,
    flexGrow: 1,
  },
  missingCard: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.lavenderCard,
  },
  missingTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  missingBody: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.textMuted,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: BrandColors.white,
  },
});

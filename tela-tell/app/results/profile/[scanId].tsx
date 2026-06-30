import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FabricProfileCard } from '@/features/profile/components/fabric-profile-card';
import { FabricReferenceComparison } from '@/features/results/components/fabric-reference-comparison';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { ScanAnotherButton } from '@/features/results/components/scan-another-button';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { getScanResult, resolveScanId } from '@/data/scans/mock-data';
import { getFabricReference } from '@/data/fabrics/fabric-references';
import { getLastCaptureUri } from '@/features/scan/lib/last-capture';
import { requestFreshScan } from '@/features/scan/lib/scan-fresh';

export default function FabricProfileScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string | string[] }>();
  const router = useRouter();
  const result = getScanResult(resolveScanId(scanId));

  if (!result) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Profile not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.fallbackLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleScanAnother = () => {
    requestFreshScan();
    router.push('/(tabs)/scan' as Href);
  };

  const fabricReference = getFabricReference(result.dominantFabric, result.compositions);
  const capturedPhotoUri = getLastCaptureUri();

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
            detectedLabel={result.dominantFabric}
            confidence={result.confidence}
          />
        ) : null}

        <FabricProfileCard
          profile={result.profile}
          sustainabilityScore={result.sustainability.score}
          sustainabilityRating={result.sustainability.rating}
        />
        <ScanAnotherButton onPress={handleScanAnother} />
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

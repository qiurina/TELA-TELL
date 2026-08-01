import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors, FabricBarFallback, FabricBarStyles } from '@/constants/brand';
import { formatDetectedLabel } from '@/data/fabrics/eco-alternatives';
import { getFabricReference } from '@/data/fabrics/fabric-references';
import { Fonts } from '@/constants/fonts';
import { type DualSwatchRegion } from '@/data/scans/mock-data';
import { faintCardShadow } from '@/constants/shadows';
import { FabricReferenceComparison } from '@/features/results/components/fabric-reference-comparison';
import { getLastCaptureUri } from '@/features/scan/lib/last-capture';

type DualFabricResultsProps = {
  regions: DualSwatchRegion[];
  scanImageUri?: string | null;
};

function getBarStyle(material: string, index: number) {
  return FabricBarStyles[material] ?? FabricBarFallback[index % FabricBarFallback.length];
}

function CompositionBars({ region }: { region: DualSwatchRegion }) {
  return (
    <View style={styles.bars}>
      {region.compositions.map((item, index) => {
        const barStyle = getBarStyle(item.material, index);

        return (
          <View key={`${item.material}-${item.percentage}`} style={styles.barRow}>
            <Text style={styles.barLabel}>{item.material}</Text>
            <View style={[styles.barTrack, { backgroundColor: barStyle.track }]}>
              <LinearGradient
                colors={barStyle.gradient as [string, string, ...string[]]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.barFill, { width: `${item.percentage}%` }]}
              />
            </View>
            <Text style={styles.barPercent}>{item.percentage}%</Text>
          </View>
        );
      })}
    </View>
  );
}

function FabricRegionCard({
  region,
  scanImageUri,
}: {
  region: DualSwatchRegion;
  scanImageUri?: string | null;
}) {
  const reference = getFabricReference(region.dominantFabric, region.compositions);
  const photoUri = scanImageUri ?? getLastCaptureUri();

  return (
    <View style={[styles.card, faintCardShadow()]}>
      <View style={styles.cardHeader}>
        <Text style={styles.regionLabel}>{region.label}</Text>
        <View style={styles.confidencePill}>
          <Text style={styles.confidenceText}>{region.confidence}%</Text>
        </View>
      </View>
      <Text style={styles.detected}>{formatDetectedLabel(region.dominantFabric)}</Text>

      {reference ? (
        <FabricReferenceComparison
          scanImageUri={photoUri}
          reference={reference}
          detectedLabel={region.dominantFabric}
          confidence={region.confidence}
          compact
        />
      ) : null}

      <CompositionBars region={region} />
    </View>
  );
}

export function DualFabricResults({ regions, scanImageUri }: DualFabricResultsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>MULTI-FABRIC DETECTION</Text>
      <Text style={styles.sectionHint}>
        Each boxed region was classified separately. Prototype demo: Fabric 1 is linen, Fabric 2 is
        cotton.
      </Text>
      {regions.map((region) => (
        <FabricRegionCard key={region.label} region={region} scanImageUri={scanImageUri} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  sectionHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
    marginTop: -6,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regionLabel: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: BrandColors.primaryDark,
  },
  confidencePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  confidenceText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: BrandColors.primaryDark,
  },
  detected: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  bars: {
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 72,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.text,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  barPercent: {
    width: 36,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.textMuted,
    textAlign: 'right',
  },
});

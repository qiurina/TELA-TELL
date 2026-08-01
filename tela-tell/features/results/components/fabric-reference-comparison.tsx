import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ScanLine } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import type { FabricReference } from '@/data/fabrics/fabric-references';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type FabricReferenceComparisonProps = {
  scanImageUri?: string | null;
  reference: FabricReference;
  detectedLabel: string;
  detectedSubtitle?: string;
  confidence?: number;
  compact?: boolean;
};

function ReferenceSwatch({ reference }: { reference: FabricReference }) {
  return <Image source={reference.image} style={styles.swatchImage} contentFit="cover" />;
}

function ScanThumb({ uri }: { uri?: string | null }) {
  if (uri) {
    return <Image source={{ uri }} style={styles.swatchImage} contentFit="cover" />;
  }

  return (
    <View style={styles.scanPlaceholder}>
      <ScanLine size={28} color={BrandColors.textMuted} strokeWidth={1.5} />
    </View>
  );
}

export function FabricReferenceComparison({
  scanImageUri,
  reference,
  detectedLabel,
  detectedSubtitle,
  confidence,
  compact = false,
}: FabricReferenceComparisonProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact, faintCardShadow()]}>
      <View style={styles.compareRow}>
        <View style={styles.compareColumn}>
          <ScanThumb uri={scanImageUri} />
          <Text style={styles.columnCaption}>Your scan</Text>
        </View>

        <View style={styles.compareColumn}>
          <ReferenceSwatch reference={reference} />
          <Text style={styles.columnCaption}>{reference.title}</Text>
        </View>
      </View>

      <View style={styles.metaBlock}>
        <Text style={styles.detectedLine}>{detectedLabel}</Text>
        {detectedSubtitle ? <Text style={styles.detectedSub}>{detectedSubtitle}</Text> : null}
        {confidence !== undefined ? (
          <Text style={styles.confidenceLine}>{confidence}% confidence</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
    padding: 14,
  },
  containerCompact: {
    padding: 12,
    gap: 10,
  },
  compareRow: {
    flexDirection: 'row',
    gap: 10,
  },
  compareColumn: {
    flex: 1,
    gap: 6,
  },
  swatchImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.lavenderCard,
  },
  scanPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.lavenderCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnCaption: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  metaBlock: {
    gap: 2,
  },
  detectedLine: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: BrandColors.text,
    lineHeight: 22,
  },
  detectedSub: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.primaryDark,
    lineHeight: 18,
  },
  confidenceLine: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
});
